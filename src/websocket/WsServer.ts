import * as Koa from "koa";
import { getSession } from "../functions/checkLogin";
import sleep from "../utils/sleep";
import { WsClientMessage, WsServerReply } from "./WsMessage";

class WsServer {
    ctxs: Koa.ParameterizedContext[];

    constructor() {
        this.ctxs = [];
    }

    async sendJson(ctx: Koa.ParameterizedContext, jsonObject: WsServerReply) {
        ctx.websocket.send(JSON.stringify(jsonObject));
    }

    async sendAll(jsonObject: WsServerReply) {
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

function cleanwsctx(ctx: Koa.ParameterizedContext) {
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

export async function wsEntry(ctx: Koa.ParameterizedContext) {
    tempCtxs.push(ctx);

    ctx.wsStatus = {
        lastTimestamp: Date.now()
    };

    ctx.websocket.on("message", async (msg: string) => {
        let message = JSON.parse(msg) as WsClientMessage;
        if (message.cmd === undefined) {
            wsServer.sendJson(ctx, {
                cmd: 1,
                error: 1,
                info: "invalidToken"
            });
            ctx.websocket.close();
            cleanwsctx(ctx);
            return;
        }

        switch (message.cmd) {
            case 1:
                {
                    //auth
                    let user = await getSession(ctx, message.token);

                    if (user === null) {
                        wsServer.sendJson(ctx, {
                            cmd: 1,
                            error: 1,
                            info: "invalidToken"
                        });
                        ctx.websocket.close();
                        cleanwsctx(ctx);
                        return;
                    }

                    //save
                    wsServer.ctxs.push(ctx);

                    //clean temp
                    let tempIdx = tempCtxs.indexOf(ctx);
                    if (tempIdx !== -1) {
                        tempCtxs.splice(tempIdx, 1);
                    }

                    wsServer.sendJson(ctx, {
                        cmd: 1,
                        error: 0
                    });
                    return;
                }
            case 2:
                {
                    wsServer.sendJson(ctx, {
                        cmd: 2
                    });
                    return;
                }
            default:
                return;
        }
    });

    ctx.websocket.on("close", async () => {
        cleanwsctx(ctx);
    });
}

export let wsServer = new WsServer();
let tempCtxs: Koa.ParameterizedContext[] = [];
cleanOnTime();
