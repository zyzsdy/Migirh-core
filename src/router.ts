import * as Koa from 'koa';
import * as Router from 'koa-router';
import { taskAdd, taskStop } from './controllers/TaskController';

import { userList } from './controllers/UserController';
import { systemInit, getSystemConfig, updateSystemConfig } from './controllers/SystemController';

// User
let user = new Router();
user.post('/list', userList);

// Task
let task = new Router();
task.post('/add', taskAdd);
task.post('/stop', taskStop);

// System
let system = new Router();
system.post('/init', systemInit);
system.post('/get_config', getSystemConfig);
system.post('/update_config', updateSystemConfig);

// Integrate all sub routers
let router = new Router();
router.use('/task', task.routes(), task.allowedMethods());
router.use('/user', user.routes(), user.allowedMethods());
router.use('/system', system.routes(), system.allowedMethods());

let rootRouter = new Router();
rootRouter.use('/api', router.routes(), router.allowedMethods());

export default rootRouter;