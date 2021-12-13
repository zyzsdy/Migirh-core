import { ArchiveDownloader, LiveDownloader } from "minyami";
import { getConnection } from "typeorm";
import * as path from 'path';
import Task from "../models/Task";
import TaskLogger from "./taskLogger";

export interface MinyamiOptions {
    threads?: number;
    retries?: number;
    key?: string;
    cookies?: string;
    headers?: string;
    format?: string;
    slice?: string;
    proxy?: string;
    nomerge?: boolean;
    verbose?: boolean;
}

interface ChunkDownloadedArgs {
    finishedChunksCount: number;
    totalChunksCount: number;
    chunkSpeed: string;
    ratioSpeed: string;
    eta: string;
}

export class DownloadTask {
    
    taskId: string;

    /**
     * 0-Default 1-Downloading 2-Paused 3-Merging 4-Completed 5-Error
     */
    status: number;
    isLive: boolean;
    filename: string;
    outputPath: string;
    sourceUrl: string;
    category: string;
    options: MinyamiOptions;
    description: string;

    downloader: ArchiveDownloader | LiveDownloader;
    finishedChunksCount: number;
    totalChunksCount: number;
    chunkSpeed: string;
    ratioSpeed: string;
    eta: string;

    logger: TaskLogger;

    constructor(task: Task) {
        this.taskId = task.task_id;
        this.status = task.status;
        this.isLive = task.is_live === 1;
        this.filename = task.filename;
        this.outputPath = task.output_path;
        this.sourceUrl = task.source_url;
        this.category = task.category;
        this.description = task.description;
        this.options = JSON.parse(task.download_options) as MinyamiOptions;

        this.downloader = null;
        this.finishedChunksCount = 0;
        this.totalChunksCount = NaN;
        this.chunkSpeed = null;
        this.ratioSpeed = null;
        this.eta = null;
        
        this.logger = new TaskLogger(this.options.verbose);
    }
    async start() {
        if (this.status !== 0) {
            this.logger.error("The task can't be started due to current status.");
            throw new Error("The task can't be started due to current status.");
        }

        this.status = 1;

        //update db
        await getConnection().createQueryBuilder()
            .update(Task).set({ status: 1, date_update: new Date()}).where("task_id=:id", {id: this.taskId}).execute();

        if (this.isLive) {
            this.downloader = new LiveDownloader(this.sourceUrl, {
                ...this.options,
                output: this.outputPath,
                cliMode: false
            });
        } else {
            this.downloader = new ArchiveDownloader(this.sourceUrl, {
                ...this.options,
                output: this.outputPath,
                cliMode: false
            });
        }

        this.downloader.on("chunk-downloaded", (currentChunkInfo: ChunkDownloadedArgs) => {
            this.finishedChunksCount = currentChunkInfo.finishedChunksCount;
            this.totalChunksCount = currentChunkInfo.totalChunksCount;
            this.chunkSpeed = currentChunkInfo.chunkSpeed;
            this.ratioSpeed = currentChunkInfo.ratioSpeed;
            this.eta = currentChunkInfo.eta;

            if (this.isLive) {
                this.logger.info(
                    `Processing ${this.filename} finished. (${currentChunkInfo.finishedChunksCount} chunks downloaded | Avg Speed: ${currentChunkInfo.chunkSpeed} chunks/s or ${currentChunkInfo.ratioSpeed}x)`
                );
            } else {
                this.logger.info(
                    `Processing ${this.filename} finished. (${currentChunkInfo.finishedChunksCount} / ${
                        this.totalChunksCount
                    } or ${(
                        (currentChunkInfo.finishedChunksCount / currentChunkInfo.totalChunksCount) *
                        100
                    ).toFixed(2)}% | Avg Speed: ${currentChunkInfo.chunkSpeed} chunks/s or ${
                        currentChunkInfo.ratioSpeed
                    }x | ETA: ${currentChunkInfo.eta})`
                );
            }
        });
        this.downloader.on("chunk-error", (error: Error) => {
            this.logger.warning(`Processing ${this.filename} failed: ${error.message}`);
        });
        this.downloader.on("downloaded", async () => {
            this.status = 3;

            if (this.options.nomerge) {
                this.logger.info("Skip merging. Please merge video chunks manually.");
            } else {
                this.logger.info(`${this.finishedChunksCount} chunks downloaded. Start merging chunks.`);
            }

            //update db
            await getConnection().createQueryBuilder()
                .update(Task).set({ status: 3, date_update: new Date()}).where("task_id=:id", {id: this.taskId}).execute();
        });
        this.downloader.on("finished", async () => {
            this.status = 4;

            this.logger.info(`All finished. Check your file at [${path.resolve(this.outputPath)}] .`);

            //update db
            await getConnection().createQueryBuilder()
                .update(Task).set({ status: 4, date_update: new Date()}).where("task_id=:id", {id: this.taskId}).execute();

            delete this.downloader;
        });
        this.downloader.on("merge-error", async (error: Error) => {
            this.status = 5;

            this.logger.error("Fail to merge video. Please merge video chunks manually. " + error.message);

            //update db
            await getConnection().createQueryBuilder()
                .update(Task).set({ status: 5, date_update: new Date()}).where("task_id=:id", {id: this.taskId}).execute();

            delete this.downloader;
        });
        this.downloader.on("critical-error", async (error: Error) => {
            this.status = 5;

            this.logger.error("Aborted due to critical error. " + error.message);

            //update db
            await getConnection().createQueryBuilder()
                .update(Task).set({ status: 5, date_update: new Date()}).where("task_id=:id", {id: this.taskId}).execute();

            delete this.downloader;
        });

        if (this.isLive) {
            await this.downloader.init();
        }

        this.downloader.download();
    }
}