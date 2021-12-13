import Task from "../models/Task";
import { DownloadTask } from "./DownloadTask";

class TaskProvider {
    tasks: DownloadTask[];
    constructor() {
        this.tasks = [];
    }

    startTask(task: Task) {
        let taskIndex = this.tasks.findIndex(t => t.taskId == task.task_id);
        if (taskIndex != -1) {
            let downloadTask = new DownloadTask(task);
            this.tasks.push(downloadTask);
            downloadTask.start();

            return downloadTask;
        }

        return this.tasks[taskIndex];
    }
}

const taskProvider = new TaskProvider();
export default taskProvider;