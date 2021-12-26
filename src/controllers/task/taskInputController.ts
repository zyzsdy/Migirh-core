import * as Koa from 'koa';
import * as path from 'path';
import { CheckAuthGlobal } from '../../functions/checkAuth';
import { checkLogin } from '../../functions/checkLogin';
import checkRequest from '../../functions/checkRequest';
import { minyamiCommandParser } from '../../functions/minyamiCommandParser';
import { getNewTaskPreaddParams } from './taskPreController';

interface TaskInputRequest {
    content: string;
}

export async function taskInput(ctx: Koa.ParameterizedContext) {
    let user = await checkLogin(ctx);
    if (user == null) return;

    if (checkRequest(ctx, {
        "content": "Content",
    })) return;

    let jsonRequest = ctx.jsonRequest as TaskInputRequest;
    let auth = await CheckAuthGlobal(user, "TaskInput");

    if (!auth) {
        ctx.basicResponse.Forbidden();
        return;
    }

    // 判断是否为m3u8链接，若是，直接返回
    try {
        var url = new URL(jsonRequest.content);
        if (url.pathname.endsWith(".m3u8")) {
            let preaddParams = await getNewTaskPreaddParams(user.username);

            ctx.basicResponse.OK({
                result: [{
                    label: "m3u8",
                    info: {
                        ...preaddParams,
                        url: jsonRequest.content
                    }
                }]
            });
            return;
        }
    } catch (err: any) {

    }

    // 判断是否为minyami命令，minyami命令必须由 "minyami " 或 "npx minyami " 开头
    if (jsonRequest.content.startsWith("minyami ") || jsonRequest.content.startsWith("npx minyami ")) {
        let preaddParams = await getNewTaskPreaddParams(user.username);
        let minyamiParams = minyamiCommandParser(jsonRequest.content);

        let output = minyamiParams.output;
        if (preaddParams.output) {
            output = path.join(preaddParams.output, minyamiParams.output);
        }

        ctx.basicResponse.OK({
            result: [{
                label: "minyami command",
                info: {
                    ...preaddParams,
                    ...minyamiParams,
                    output,
                    live: minyamiParams.live
                }
            }]
        });
        return;
    }

    // 判断是否为插件可处理的网址，若是，则交由插件自主处理

    // 返回前端无法处理
    ctx.basicResponse.BadRequest({
        info: "CannotProcess"
    });
}