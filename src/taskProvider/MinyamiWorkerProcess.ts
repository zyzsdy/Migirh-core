import { ArchiveDownloader, LiveDownloader } from "minyami";
import { ChunkDownloadedArgs, TaskAction, TaskInitOptions } from "./MinyamiWorkerMessage";

class Minyami {
    downloader?: ArchiveDownloader | LiveDownloader;
    isLive: boolean;

    constructor() {
        this.isLive = false;
        this.downloader = null;
    }

    async init(options: TaskInitOptions) {
        this.isLive = options.isLive;

        if (options.isLive) {
            this.downloader = new LiveDownloader(options.sourceUrl, {
                ...options.options,
                output: options.outputPath,
                cliMode: false
            });
        } else {
            console.log({
                ...options.options,
                output: options.outputPath,
                cliMode: false
            });
            this.downloader = new ArchiveDownloader(options.sourceUrl, {
                ...options.options,
                output: options.outputPath,
                cliMode: false
            });
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

        if (!options.isLive) {
            await this.downloader.init();
        }

        this.downloader.download();
    }

    async stop() {
        if (this.downloader) {
            if (this.isLive) {
                (<LiveDownloader>this.downloader).stopDownload();
            } else {
                await (<ArchiveDownloader>this.downloader).clean();
                process.send({
                    action: "finished"
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
        } else if (taskAction.action === "taskStop"){
            console.log(`[MinyamiWorker ${process.pid}] 收到停止任务指令`);
            minyami.stop();
        }
    });
}

main();