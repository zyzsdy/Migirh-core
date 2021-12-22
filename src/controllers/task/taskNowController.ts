import * as Koa from 'koa';
import { checkLogin } from '../../functions/checkLogin';
import taskProvider from '../../taskProvider/TaskProvider';

interface TaskBasicInfo {
    task_id: string;
    status?: number;
    is_live?: boolean;
    filename?: string;
    output_path?: string;
    source_url?: string;
    category?: string;
    date_create?: Date;
    date_update?: Date;
    description?: string;
    finished_chunk_count?: number;
    total_chunk_count?: number;
    chunk_speed?: string;
    ratio_speed?: string;
    eta?: string;
}

export async function taskNow(ctx: Koa.ParameterizedContext) {
    let user = await checkLogin(ctx);
    if (user == null) return;

    let result = taskProvider.tasks.map(t => {
        let taskBasicInfo: TaskBasicInfo = {
            task_id: t.taskId,
            status: t.status,
            is_live: t.isLive,
            filename: t.filename,
            output_path: t.outputPath,
            source_url: t.sourceUrl,
            category: t.category,
            date_create: t.dateCreate,
            description: t.description,
            finished_chunk_count: t.finishedChunksCount,
            total_chunk_count: t.totalChunksCount,
            chunk_speed: t.chunkSpeed,
            ratio_speed: t.ratioSpeed,
            eta: t.eta
        }
        return taskBasicInfo;
    });

    ctx.basicResponse.OK({
        data: result
    });
}