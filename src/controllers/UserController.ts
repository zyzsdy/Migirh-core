import * as Koa from 'koa'
import { checkLogin } from '../functions/checkLogin';

export async function userList(ctx: Koa.ParameterizedContext) {
    ctx.basicResponse.OK({
        info: "Test API is live",
        end: ctx.jsonRequest
    });
}

export async function userLoggedCheck(ctx: Koa.ParameterizedContext) {
    let user = await checkLogin(ctx);
    if (!user) {
        ctx.basicResponse.Unauthorized({info: "Not logged in"});
        return;
    }

    ctx.basicResponse.OK();
}