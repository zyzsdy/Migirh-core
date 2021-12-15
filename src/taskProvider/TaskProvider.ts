import Task from "../models/Task";
import { DownloadTask } from "./DownloadTask";

export class TaskProvider {
    tasks: DownloadTask[];
    constructor() {
        this.tasks = [];
    }

    async startTask(task: Task) {
        let taskIndex = this.tasks.findIndex(t => t.taskId === task.task_id);
        if (taskIndex === -1) {
            let downloadTask = new DownloadTask(task, this);
            this.tasks.push(downloadTask);
            downloadTask.start();

            return downloadTask;
        }

        return this.tasks[taskIndex];
    }
    async stopTask(taskId: string) {
        let taskIndex = this.tasks.findIndex(t => t.taskId === taskId);
        if (taskIndex === -1) return false;

        let task = this.tasks[taskIndex];
        await task.stop();
    }

    clean(taskId: string) {
        let taskIndex = this.tasks.findIndex(t => t.taskId === taskId);
        if (taskIndex === -1) return false;

        this.tasks.splice(taskIndex, 1);
    }

    getActiveTask(taskId: string) {
        let taskIndex = this.tasks.findIndex(t => t.taskId === taskId);
        if (taskIndex === -1) return null;

        return this.tasks[taskIndex];
    }
}

const taskProvider = new TaskProvider();
export default taskProvider;