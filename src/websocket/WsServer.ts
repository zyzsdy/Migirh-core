import { DefaultContext } from "koa";
import sleep from "../utils/sleep";

class WsServer {
    ctxs: DefaultContext[];

    constructor() {
        this.ctxs = [];
    }

    async sendJson(ctx: DefaultContext, jsonObject: any) {
        ctx.websocket.send(JSON.stringify(jsonObject));
    }

    async sendAll(jsonObject: any) {
        let now = Date.now();
        for (let ctx of this.ctxs) {
            if (ctx.wsStatus === undefined || ctx.wsStatus.lastTimestamp === undefined) {
                ctx.websocket.close();
                cleanwsctx(ctx);
                continue;
            }

            if (now - ctx.wsStatus.lastTimestamp > 120 * 1000) {
                ctx.websocket.close();
                cleanwsctx(ctx);
                continue;
            }

            this.sendJson(ctx, jsonObject);
        }
    }
}

function cleanwsctx(ctx: DefaultContext) {
    let tempIdx = tempCtxs.indexOf(ctx);
    if (tempIdx != -1) {
        tempCtxs.splice(tempIdx, 1);
    }

    if (ctx.wsStatus !== undefined){
        if (wsServer.ctxs) {
            let cIdx = wsServer.ctxs.indexOf(ctx);
            if (cIdx != -1) {
                wsServer.ctxs.splice(cIdx, 1);
            }
        }
    }
}

async function cleanOnTime() {
    while (true) {
        await sleep(60 * 1000);
        let now = Date.now();
        for (let ctx of tempCtxs) {
            if (now - ctx.wsStatus.lastTimestamp > 120 * 1000) {
                ctx.websocket.close();
                cleanwsctx(ctx);
                continue;
            }
        }

        for (let ctx of wsServer.ctxs) {
            if (now - ctx.wsStatus.lastTimestamp > 120 * 1000) {
                ctx.websocket.close();
                cleanwsctx(ctx);
                continue;
            }
        }
    }
}

export async function wsEntry(ctx: DefaultContext) {
    tempCtxs.push(ctx);

    ctx.wsStatus = {
        lastTimestamp: Date.now()
    };

    ctx.websocket.on("message", async (msg: any) => {
        let message = JSON.parse(msg);
        if (message.cmd === undefined) {

        }
    });

    ctx.websocket.on("close", async (msg: any) => {
        cleanwsctx(ctx);
    });
}

export let wsServer = new WsServer();
let tempCtxs: DefaultContext[] = [];
cleanOnTime();
