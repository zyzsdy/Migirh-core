import * as Koa from 'koa';
import { checkLogin } from '../../functions/checkLogin';
import { CheckAuthScope } from '../../functions/checkAuth';
import { getConnection, getManager } from 'typeorm';
import Task from '../../models/Task';
import * as fs from 'fs';
import snowflake from '../../utils/snowflake';
import taskProvider from '../../taskProvider/TaskProvider';
import checkRequest from '../../functions/checkRequest';
import UserCache from '../../models/UserCache';
import { MinyamiOptions } from '../../taskProvider/MinyamiWorkerMessage';

interface TaskAddRequest {
    url: string;
    live: boolean;
    output: string;
    filename: string;
    category: string;
    description?: string;
    options?: MinyamiOptions
}

export async function taskAdd(ctx: Koa.ParameterizedContext) {
    let user = await checkLogin(ctx);
    if (user == null) return;

    if (checkRequest(ctx, {
        "url": "M3U8 Url",
        "output": "output",
        "category": "category"
    })) return;

    let jsonRequest = ctx.jsonRequest as TaskAddRequest;
    let auth = await CheckAuthScope(user, "TaskAdd", jsonRequest.output);

    if (!auth) {
        ctx.basicResponse.Forbidden();
        return;
    }

    let now = new Date();
    let taskId = await snowflake.next();

    //save usercache
    let userCache = {
        output: jsonRequest.output,
        live: jsonRequest.live,
        category: jsonRequest.category
    };
    const userCacheDb = getManager().getRepository(UserCache);
    const userCacheItem = userCacheDb.create({
        username: user.username,
        config_key: "task_options",
        config_value: JSON.stringify(userCache)
    });
    await userCacheDb.save(userCacheItem);

    //save task to db
    const taskDb = getManager().getRepository(Task);
    const taskItem = taskDb.create({
        task_id: taskId,
        status: 0,
        is_live: jsonRequest.live ? 1 : 0,
        filename: jsonRequest.filename,
        output_path: jsonRequest.output,
        source_url: jsonRequest.url,
        category: jsonRequest.category,
        date_create: now,
        date_update: now,
        download_options: JSON.stringify(jsonRequest.options),
        description: jsonRequest.description
    });

    await taskDb.save(taskItem);

    await taskProvider.startTask(taskItem);

    ctx.basicResponse.OK();
}

interface TaskIdRequest {
    task_id: string;
}

export async function taskStop(ctx: Koa.ParameterizedContext) {
    let user = await checkLogin(ctx);
    if (user == null) return;

    if (checkRequest(ctx, {
        "task_id": "task_id cannot be null",
    })) return;

    let jsonRequest = ctx.jsonRequest as TaskIdRequest;
    let task = taskProvider.getActiveTask(jsonRequest.task_id);

    if (!task) {
        ctx.basicResponse.BadRequest({
            info: `TaskNotActive`,
            info_args: {
                task_id: jsonRequest.task_id
            }
        });
        return;
    }

    let taskScopeOutput = task.outputPath;
    let auth = await CheckAuthScope(user, "TaskAdd", taskScopeOutput);

    if (!auth) {
        ctx.basicResponse.Forbidden();
        return;
    }

    await task.stop();
    ctx.basicResponse.OK();
}

export async function taskResume(ctx: Koa.ParameterizedContext) {
    let user = await checkLogin(ctx);
    if (user == null) return;

    if (checkRequest(ctx, {
        "task_id": "task_id cannot be null",
    })) return;

    let jsonRequest = ctx.jsonRequest as TaskIdRequest;

    let taskDb = getManager().getRepository(Task);
    let task = await taskDb.findOne(jsonRequest.task_id);

    if (!task) {
        ctx.basicResponse.BadRequest({
            info: "NoThisTask",
            info_args: {
                task_id: jsonRequest.task_id
            }
        });
        return;
    }

    await taskProvider.resumeTask(task);

    ctx.basicResponse.OK();
}

interface TaskDeleteRequest {
    task_id: string;
    delete_file: string;
}

export async function taskDelete(ctx: Koa.ParameterizedContext) {
    let user = await checkLogin(ctx);
    if (user == null) return;

    if (checkRequest(ctx, {
        "task_id": "task_id cannot be null",
    })) return;

    let jsonRequest = ctx.jsonRequest as TaskDeleteRequest;

    const taskDb = getManager().getRepository(Task);
    const task = await taskDb.findOne(jsonRequest.task_id);

    if (!task) {
        ctx.basicResponse.BadRequest({
            info: "NoThisTask",
            info_args: {
                task_id: jsonRequest.task_id
            }
        });
        return;
    }

    //删除磁盘上的文件
    if (jsonRequest.delete_file) {
        try {
            fs.rmSync(task.output_path);
        } catch (error) {
            //这里报错说明不存在文件，不予理会即可
        }
    }

    //删除数据库
    await getConnection().createQueryBuilder().delete().from(Task).where("task_id = :task_id", {task_id: jsonRequest.task_id}).execute();

    ctx.basicResponse.OK();
}