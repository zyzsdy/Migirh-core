import * as Koa from 'koa';

function checkNullOrEmpty(obj: {[k: string]: any}, prop: string) {
    if (obj[prop]) return false;
    return true;
}

export default function checkRequest(ctx: Koa.ParameterizedContext, options: {[prop: string]: string}) {
    for (let pName in options) {
        if (checkNullOrEmpty(ctx.jsonRequest, pName)) {
            ctx.basicResponse.BadRequest({
                info: options[pName]
            });
            return true;
        }
    }
    return false;
}
