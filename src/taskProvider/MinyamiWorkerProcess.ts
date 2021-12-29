import { ArchiveDownloader, LiveDownloader } from "minyami";
import { ChunkDownloadedArgs, TaskAction, TaskInitOptions } from "./MinyamiWorkerMessage";

class Minyami {
    downloader?: ArchiveDownloader | LiveDownloader;
    isLive: boolean;

    constructor() {
        this.isLive = false;
        this.downloader = null;
    }

    async init(options: TaskInitOptions, resume: boolean = false) {
        this.isLive = options.isLive;

        if (options.isLive) {
            this.downloader = new LiveDownloader(options.sourceUrl, {
                ...options.options,
                output: options.output,
                cliMode: false
            });
        } else {
            console.log({
                ...options.options,
                output: options.output,
                cliMode: false
            });

            if (resume) {
                this.downloader = new ArchiveDownloader(undefined, {
                    ...options.options,
                    cliMode: false
                });
            } else {
                this.downloader = new ArchiveDownloader(options.sourceUrl, {
                    ...options.options,
                    output: options.output,
                    cliMode: false
                });
            }
        }

        this.downloader.on("chunk-downloaded", (currentChunkInfo: ChunkDownloadedArgs) => {
            process.send({
                action: "chunkDownloaded",
                param: currentChunkInfo
            });
        });

        this.downloader.on("chunk-error", (error: Error) => {
            process.send({
                action: "chunkError",
                param: {
                    error,
                    taskname: ""
                }
            });
        });

        this.downloader.on("downloaded", () => {
            process.send({
                action: "downloaded"
            });
        });

        this.downloader.on("finished", () => {
            process.send({
                action: "finished"
            });
        });

        this.downloader.on("merge-error", async (error?: Error) => {
            process.send({
                action: "mergeError",
                param: error
            });
        });
        this.downloader.on("critical-error", async (error?: Error) => {
            process.send({
                action: "criticalError",
                param: error
            });
        });

        if (resume) {
            (<ArchiveDownloader>this.downloader).resume(options.sourceUrl);
        } else {
            if (!options.isLive) {
                await this.downloader.init();
            }
            this.downloader.download();
        }
    }

    async stop() {
        if (this.downloader) {
            if (this.isLive) {
                (<LiveDownloader>this.downloader).stopDownload();
            } else {
                await (<ArchiveDownloader>this.downloader).clean();
                process.send({
                    action: "paused"
                });
            }
        }
    }
}

function main() {
    let minyami = new Minyami();
    console.log(`[MinyamiWorker ${process.pid}] Worker 已建立`);

    process.on("message", (taskAction: TaskAction) => {
        if (taskAction.action === "taskInit") {
            console.log(`[MinyamiWorker ${process.pid}] 收到初始化任务指令`);
            minyami.init(taskAction.param);
        } else if (taskAction.action === "taskStop") {
            console.log(`[MinyamiWorker ${process.pid}] 收到停止任务指令`);
            minyami.stop();
        } else if (taskAction.action === "taskResume") {
            console.log(`[MinyamiWorker ${process.pid}] 收到恢复任务指令`);
            minyami.init(taskAction.param, true);
        }
    });
}

main();