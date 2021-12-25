import { ArchiveDownloader, LiveDownloader } from "minyami";
import { getConnection } from "typeorm";
import * as path from 'path';
import Task from "../models/Task";
import TaskLogger from "./taskLogger";
import type { TaskProvider } from "./TaskProvider";
import taskProvider from "./TaskProvider";
import { wsServer } from "../websocket/WsServer";

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
    dateCreate: Date;

    downloader: ArchiveDownloader | LiveDownloader;
    finishedChunksCount: number;
    totalChunksCount: number;
    chunkSpeed: string;
    ratioSpeed: string;
    eta: string;

    logger: TaskLogger;

    taskProvider: TaskProvider;

    constructor(task: Task, taskProvider: TaskProvider) {
        this.taskId = task.task_id;
        this.status = task.status;
        this.isLive = task.is_live === 1;
        this.filename = task.filename;
        this.outputPath = task.output_path;
        this.sourceUrl = task.source_url;
        this.category = task.category;
        this.description = task.description;
        this.dateCreate = task.date_create;
        this.options = JSON.parse(task.download_options) as MinyamiOptions || {};

        this.downloader = null;
        this.finishedChunksCount = 0;
        this.totalChunksCount = NaN;
        this.chunkSpeed = null;
        this.ratioSpeed = null;
        this.eta = null;
        
        this.logger = new TaskLogger(this.options.verbose);
        this.taskProvider = taskProvider;
    }
    async start() {
        try {
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
                console.log({
                    ...this.options,
                    output: this.outputPath,
                    cliMode: false
                });
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

                let loggerLine: string;
                if (this.isLive) {
                    loggerLine = `Processing ${this.filename} finished. (${currentChunkInfo.finishedChunksCount} chunks downloaded | Avg Speed: ${currentChunkInfo.chunkSpeed} chunks/s or ${currentChunkInfo.ratioSpeed}x)`;
                } else {
                    loggerLine = 
                        `Processing ${this.filename} finished. (${currentChunkInfo.finishedChunksCount} / ${
                            this.totalChunksCount
                        } or ${(
                            (currentChunkInfo.finishedChunksCount / currentChunkInfo.totalChunksCount) *
                            100
                        ).toFixed(2)}% | Avg Speed: ${currentChunkInfo.chunkSpeed} chunks/s or ${
                            currentChunkInfo.ratioSpeed
                        }x | ETA: ${currentChunkInfo.eta})`;
                }
                if (loggerLine) this.logger.info(loggerLine);

                wsServer.sendAll({
                    cmd: 4,
                    subCmd: 1,
                    task_id: this.taskId,
                    log: {
                        type: "info",
                        message: loggerLine
                    },
                    data: {
                        finishedChunksCount: currentChunkInfo.finishedChunksCount,
                        totalChunksCount: currentChunkInfo.totalChunksCount,
                        chunkSpeed: currentChunkInfo.chunkSpeed,
                        ratioSpeed: currentChunkInfo.ratioSpeed,
                        eta: currentChunkInfo.eta
                    }
                });
            });
            this.downloader.on("chunk-error", (error: Error) => {
                let loggerLine = `Processing ${this.filename} failed: ${error.message}`;
                this.logger.warning(loggerLine);
                wsServer.sendAll({
                    cmd: 4,
                    subCmd: 0,
                    task_id: this.taskId,
                    log: {
                        type: "warning",
                        message: loggerLine
                    }
                });
            });
            this.downloader.on("downloaded", async () => {
                this.status = 3;

                let loggerLine: string;
                if (this.options.nomerge) {
                    loggerLine ="Skip merging. Please merge video chunks manually.";
                } else {
                    loggerLine = `${this.finishedChunksCount} chunks downloaded. Start merging chunks.`;
                }
                if (loggerLine) this.logger.info(loggerLine);

                //update db
                await getConnection().createQueryBuilder()
                    .update(Task).set({ status: 3, date_update: new Date()}).where("task_id=:id", {id: this.taskId}).execute();

                wsServer.sendAll({
                    cmd: 4,
                    subCmd: 2,
                    task_id: this.taskId,
                    newStatus: 3,
                    log: {
                        type: "info",
                        message: loggerLine
                    }
                });
            });
            this.downloader.on("finished", async () => {
                this.status = 4;

                let loggerLine = `All finished. Check your file at [${path.resolve(this.outputPath)}] .`;

                this.logger.info(loggerLine);

                //update db
                await getConnection().createQueryBuilder()
                    .update(Task).set({ status: 4, date_update: new Date()}).where("task_id=:id", {id: this.taskId}).execute();

                this.clean();

                wsServer.sendAll({
                    cmd: 4,
                    subCmd: 2,
                    task_id: this.taskId,
                    newStatus: 4,
                    log: {
                        type: "info",
                        message: loggerLine
                    }
                });
            });
            this.downloader.on("merge-error", async (error?: Error) => {
                this.status = 5;

                let loggerLine = "Fail to merge video. Please merge video chunks manually. " + error?.message ?? "";
                this.logger.error(loggerLine);

                //update db
                await getConnection().createQueryBuilder()
                    .update(Task).set({ status: 5, date_update: new Date()}).where("task_id=:id", {id: this.taskId}).execute();

                this.clean();

                wsServer.sendAll({
                    cmd: 4,
                    subCmd: 2,
                    task_id: this.taskId,
                    newStatus: 5,
                    log: {
                        type: "error",
                        message: loggerLine
                    }
                });
            });
            this.downloader.on("critical-error", async (error?: Error) => {
                this.status = 5;

                let loggerLine = "Aborted due to critical error. " + error?.message ?? "";
                this.logger.error(loggerLine);

                //update db
                await getConnection().createQueryBuilder()
                    .update(Task).set({ status: 5, date_update: new Date()}).where("task_id=:id", {id: this.taskId}).execute();

                this.clean();

                wsServer.sendAll({
                    cmd: 4,
                    subCmd: 2,
                    task_id: this.taskId,
                    newStatus: 5,
                    log: {
                        type: "error",
                        message: loggerLine
                    }
                });
            });

            if (!this.isLive) {
                await this.downloader.init();
            }

            this.downloader.download();
        } catch (error) {
            await this.error(error);
        }
    }

    async stop() {
        if (this.downloader) {
            if (this.isLive) {
                (<LiveDownloader>this.downloader).stopDownload();
            } else {
                (<ArchiveDownloader>this.downloader).clean();

                this.status = 2;
                //update db
                await getConnection().createQueryBuilder()
                    .update(Task).set({ status: 2, date_update: new Date()}).where("task_id=:id", {id: this.taskId}).execute();

                this.clean();

                wsServer.sendAll({
                    cmd: 4,
                    subCmd: 2,
                    task_id: this.taskId,
                    newStatus: 2
                });
            }
        }
    }

    async error(error?: Error) {
        this.status = 5;

        let loggerLine = "Minyami stopped " + error?.message ?? ""
        this.logger.error(loggerLine);

        //update db
        await getConnection().createQueryBuilder()
            .update(Task).set({ status: 5, date_update: new Date()}).where("task_id=:id", {id: this.taskId}).execute();

        this.clean();

        wsServer.sendAll({
            cmd: 4,
            subCmd: 2,
            task_id: this.taskId,
            newStatus: 5,
            log: {
                type: "error",
                message: loggerLine
            }
        });
    }

    clean() {
        delete this.downloader;
        taskProvider.clean(this.taskId);
    }
}