import * as Koa from 'koa';
import { UserSession } from '../functions/checkLogin';
import * as ws from 'ws';

interface WsStatus {
    lastTimestamp?: number;
    user?: UserSession
}

declare module 'koa' {
    interface DefaultContext {
        websocket?: ws
        wsStatus?: WsStatus
    }
}