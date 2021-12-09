import * as Koa from 'koa';

export class BasicResponse {
    ctx: Koa.ParameterizedContext;
    constructor(ctx: Koa.ParameterizedContext) {
        this.ctx = ctx;
    }
    SimpleResponse(status: number, data: object) {
        this.ctx.status = status;
        this.ctx.body = data;
    }
    OK(data: object = {}) {
        let res = {
            error: 0,
            info: "ok"
        };

        this.SimpleResponse(200, Object.assign(res, data));
    }
    Accepted(data: object = {}) {
        let res = {
            error: 0,
            info: "ok"
        };

        this.SimpleResponse(202, Object.assign(res, data));
    }
    BadRequest(data: object = {}) {
        let res = {
            error: 3,
            info: "Bad Request"
        };

        this.SimpleResponse(400, Object.assign(res, data));
    }
    Unauthorized(data: object = {}) {
        let res = {
            error: 1,
            info: "Auth error"
        };

        this.SimpleResponse(401, Object.assign(res, data));
    }
}

export default async function (ctx: Koa.ParameterizedContext, next: Koa.Next) {
    ctx.basicResponse = new BasicResponse(ctx);
    await next();
}