import * as Koa from 'koa';
import * as Router from 'koa-router';

import { userList } from './controllers/UserController';
import { systemInit, getSystemConfig, updateSystemConfig, getAboutVersion } from './controllers/SystemController';
import { taskPre } from './controllers/task/taskPreController';
import { taskAdd, taskDelete, taskResume, taskStop } from './controllers/task/taskAddController';
import { taskNow, taskNowLog } from './controllers/task/taskNowController';
import { taskInput } from './controllers/task/taskInputController';
import { addCategory, deleteCategory, editCategory, getCategory } from './controllers/CategoryController';
import { taskList } from './controllers/task/taskListController';

// User
let user = new Router();
user.post('/list', userList);

// Category
let category = new Router();
category.post('/add', addCategory);
category.post('/get', getCategory);
category.post('/edit', editCategory);
category.post('/delete', deleteCategory);

// Task
let task = new Router();
task.post('/add', taskAdd);
task.post('/stop', taskStop);
task.post('/resume', taskResume);
task.post('/delete', taskDelete);
task.post('/preadd', taskPre);
task.post('/now', taskNow);
task.post('/input', taskInput);
task.post('/list', taskList);
task.post('/nowlog', taskNowLog);

// System
let system = new Router();
system.post('/init', systemInit);
system.post('/get_config', getSystemConfig);
system.post('/update_config', updateSystemConfig);
system.post('/about', getAboutVersion);

// Integrate all sub routers
let router = new Router();
router.use('/user', user.routes(), user.allowedMethods());
router.use('/category', category.routes(), category.allowedMethods());
router.use('/task', task.routes(), task.allowedMethods());
router.use('/system', system.routes(), system.allowedMethods());

let rootRouter = new Router();
rootRouter.use('/api', router.routes(), router.allowedMethods());

export default rootRouter;