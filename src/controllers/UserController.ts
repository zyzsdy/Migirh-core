import * as Koa from 'koa'

export async function userList(ctx: Koa.ParameterizedContext) {
    ctx.status = 200;
    ctx.body = {
        error: 0,
        info: "Test API is live.",
        end: ctx.jsonRequest
    }
}
