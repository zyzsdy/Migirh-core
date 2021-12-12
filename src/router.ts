import * as Koa from 'koa';
import * as Router from 'koa-router';
import { taskAdd } from './controllers/TaskController';

import { userList, userLoggedCheck } from './controllers/UserController';

// User
let user = new Router();
user.post('/list', userList);
user.post('/checkStatus', userLoggedCheck);

// Task
let task = new Router();
task.post('/add', taskAdd);

// Integrate all sub routers
let router = new Router();
router.use('/task', task.routes(), task.allowedMethods());
router.use('/user', user.routes(), user.allowedMethods());

let rootRouter = new Router();
rootRouter.use('/api', router.routes(), router.allowedMethods());

export default rootRouter;