import { Log } from "../taskProvider/taskLogger";

/**
 * Ws Protocal
 * 
 * Client command
 * cmd: 1-Enter ws 2-Heartbeat
 * 
 * Enter ws
 * {
 *     "token": "ddddddddddddddddd=",
 *     "cmd": 1
 * }
 */
interface EnterWsClientMessage {
    cmd: 1,
    token: string
}

/**
 * 
 * Heartbeat
 * {
 *     "cmd": 2
 * }
 */
interface HeartbeatClientMessage {
    cmd: 2
}

export type WsClientMessage = EnterWsClientMessage | HeartbeatClientMessage;

/**
 * Server command
 * cmd: 1-Enter reply 2-Heartbeat 3-Refresh all 4-Refresh part
 * 
 * Enter reply
 * {
 *     "cmd": 1,
 *     "error": 0,
 *     "info": "ok",
 *     "info_args": {}
 * }
 */
interface EnterWsServerReply {
    cmd: 1,
    error: number,
    info?: string,
    info_args?: { [t: string]: string }
}

/**
 * Heartbeat
 * {
 *     "cmd": 2
 * }
 */
interface HeartbeatServerReply {
    cmd: 2
}

/**
 * 
 * Refresh all
 * {
 *     "cmd": 3
 * }
 */
interface RefreshAllServerMessage {
    cmd: 3
}

/**
 * Refresh part
 * subCmd: 0-newLog 1-chunkUpdate 2-statusChange
 * 
 * newLog
 * {
 *     "cmd": 4,
 *     "subCmd": 0,
 *     "task_id": "300000000000000",
 *     "log": {
 *         "type": "error",
 *         "message": "Chunk error"
 *     }
 * }
 */
interface RefreshPartServerMessageBase {
    cmd: 4
    task_id: string,
    log?: Log
}

interface NewLogServerMessage extends RefreshPartServerMessageBase {
    subCmd: 0
}

/**
 * chunkUpdate
 * {
 *     "cmd": 4,
 *     "subCmd": 1,
 *     "task_id": "300000000000000",
 *     "data": {
 *         "finishedChunksCount": 5,
 *         "totalChunksCount": 500,
 *         "chunkSpeed": "6.12",
 *         "ratioSpeed": "1.01",
 *         "eta": "04:12:30"
 *     },
 *     "log": {
 *         "type": "info",
 *         "message": "Processing 122.ts finished. (5 chunks downloaded | Avg Speed: 6.12 chunks/s or 1.01x)"
 *     }
 * }
 */
interface ChunkUpdateEventArgs {
    finishedChunksCount?: number,
    totalChunksCount?: number,
    chunkSpeed?: string,
    ratioSpeed?: string,
    eta?: string
}

interface ChunkUpdateServerMessage extends RefreshPartServerMessageBase {
    subCmd: 1,
    data: ChunkUpdateEventArgs
}

/**
 * statusChange
 * {
 *     "cmd": 4,
 *     "subCmd": 2
 *     "task_id": "300000000000000",
 *     "newStatus": 3,
 *     "log": {
 *         "type": "warning",
 *         "message": "Start Merging..."
 *     }
 * }
 */
interface StatusUpdateServerMessage extends RefreshPartServerMessageBase {
    subCmd: 2,
    newStatus: number
}

export type WsServerReply = EnterWsServerReply | HeartbeatServerReply | RefreshAllServerMessage | NewLogServerMessage | ChunkUpdateServerMessage | StatusUpdateServerMessage;