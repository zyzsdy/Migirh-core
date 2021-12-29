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

interface TaskInitAction {
    action: "taskInit",
    param: TaskInitOptions
}

export interface TaskInitOptions {
    isLive: boolean;
    sourceUrl: string;
    output: string;
    options: MinyamiOptions
}

interface TaskStopAction {
    action: "taskStop"
}

interface TaskResumeAction {
    action: "taskResume",
    param: TaskInitOptions
}

export type TaskAction = TaskInitAction | TaskStopAction | TaskResumeAction;

export interface ChunkDownloadedArgs {
    taskname: string;
    finishedChunksCount: number;
    totalChunksCount: number;
    chunkSpeed: string;
    ratioSpeed: string;
    eta: string;
}

interface ChunkDownloadedTaskReply {
    action: "chunkDownloaded",
    param: ChunkDownloadedArgs
}

interface ChunkErrorTaskReply {
    action: "chunkError",
    param: {
        error: Error,
        taskname: string
    }
}

interface DownloadedTaskReply {
    action: "downloaded"
}

interface FinishedTaskReply {
    action: "finished"
}

interface MergeErrorTaskReply {
    action: "mergeError",
    param: Error
}

interface CriticalErrorTaskReply {
    action: "criticalError",
    param: Error;
}

interface PausedTaskReply {
    action: "paused"
}

export type TaskReply = ChunkDownloadedTaskReply | ChunkErrorTaskReply | DownloadedTaskReply | 
                        FinishedTaskReply | MergeErrorTaskReply | CriticalErrorTaskReply | PausedTaskReply;