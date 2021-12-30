import * as Koa from 'koa';
import Category from '../../models/Category';
import { getManager } from 'typeorm';
import { checkLogin } from '../../functions/checkLogin';
import Task from '../../models/Task';
import { TaskBasicInfo } from './taskNowController';
import { MinyamiOptions } from '../../taskProvider/MinyamiWorkerMessage';

interface TaskListRequest {
    category?: string; //cate_id
    page_num?: number;
    page_size?: number
}

export async function taskList(ctx: Koa.ParameterizedContext) {
    let user = await checkLogin(ctx);
    if (user == null) return;

    let jsonRequest = ctx.jsonRequest as TaskListRequest;

    const cateDb = getManager().getRepository(Category);
    const cateList = await cateDb.find();
    const cateNameMap = new Map(cateList.map(c => [c.cate_id, c.cate_name]));

    const taskDb = getManager().getRepository(Task);

    let page = jsonRequest.page_num ?? 1;
    let size = jsonRequest.page_size ?? 50;
    let offset = (page - 1) * size;

    let taskQueryBuilder = taskDb.createQueryBuilder("task");
    if (jsonRequest.category) {
        taskQueryBuilder = taskQueryBuilder.where("task.category = :cate", {cate: jsonRequest.category});
    }
    
    //orderby, skip and offset
    taskQueryBuilder = taskQueryBuilder.orderBy("task.task_id", "DESC").skip(offset).take(size);

    const [taskList, taskListCount] = await taskQueryBuilder.getManyAndCount();

    const result = taskList.map(t => {
        let tbi: TaskBasicInfo = {
            task_id: t.task_id,
            status: t.status,
            is_live: t.is_live === 1,
            filename: t.filename,
            output_path: t.output_path,
            source_url: t.source_url,
            category: t.category,
            date_create: t.date_create,
            date_update: t.date_update,
            description: t.description,
            minyami_options: JSON.parse(t.download_options) as MinyamiOptions || {}
        }

        if (cateNameMap.has(tbi.category)){
            tbi.category_name = cateNameMap.get(tbi.category);
        }

        return tbi;
    });

    ctx.basicResponse.OK({
        data: result,
        sum_rows: taskListCount
    });
}