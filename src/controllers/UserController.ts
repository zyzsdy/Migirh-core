import * as Koa from 'koa';

export async function userList(ctx: Koa.ParameterizedContext) {
    ctx.basicResponse.OK({
        info: "Test API is live",
        end: ctx.jsonRequest
    });
}
