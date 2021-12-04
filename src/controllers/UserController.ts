import * as Koa from 'koa'

export default class UserController {
    static async userList(ctx: Koa.ParameterizedContext) {
        ctx.status = 200;
        ctx.body = {
            error: 0,
            info: "Test API is live.",
            end: ctx.jsonRequest
        }
    }
}