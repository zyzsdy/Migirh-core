import * as Koa from 'koa';

export default async function (ctx: Koa.ParameterizedContext, next: Koa.Next) {
    try {
        await next();
    } catch (e: any) {
        ctx.status = e.status || 500;
        ctx.body = {
            error: 5,
            info: e.message
        };
        console.log("koa [ERROR]" + e.toString());
    }
}