import * as Koa from 'koa'
import { checkLogin } from '../functions/checkLogin';
import { CheckAuthScope } from '../functions/checkAuth';
import { getManager } from 'typeorm';
import Task from '../models/Task';
import * as path from 'path';
import { url } from 'koa-router';
import { json } from 'stream/consumers';

interface TaskAddRequest {
    url: string;
    live: boolean;
    output: string;
    category?: string;
    description?: string;
    options?: MinyamiOptions
}

interface MinyamiOptions {
    threads: number;
    retries?: number;
    key?: string;
    cookies?: string;
    headers?: string;
    format?: string;
    slice?: string;
    nomerge: boolean
}

export async function taskAdd(ctx: Koa.ParameterizedContext) {
    let user = await checkLogin(ctx);
    if (user == null) return;

    let jsonRequest = ctx.jsonRequest as TaskAddRequest;
    let auth = await CheckAuthScope(user, "TaskAdd", jsonRequest.output);

    if (!auth) {
        ctx.basicResponse.Forbidden();
        return;
    }

    let outputFileName = path.basename(jsonRequest.output);
    let now = new Date();

    //save task to db
    const taskDb = getManager().getRepository(Task);
    const taskItem = taskDb.create({
        task_id: "d", //TODO: get new snowflake id to fill it.
        status: 0,
        is_live: jsonRequest.live ? 1 : 0,
        filename: outputFileName,
        output_path: jsonRequest.output,
        source_url: jsonRequest.url,
        category: jsonRequest.category,
        date_create: now,
        date_update: now,
        download_options: JSON.stringify(jsonRequest.options),
        description: jsonRequest.description
    });

    await taskDb.save(taskItem);

    ctx.basicResponse.OK();
}