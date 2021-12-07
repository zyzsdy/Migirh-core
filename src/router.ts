import * as Koa from 'koa';
import * as Router from 'koa-router';

import { userList } from './controllers/UserController';

//用户
let user = new Router();
user.post('/list', userList);

//整合所有子路由
let router = new Router();
router.use('/user', user.routes(), user.allowedMethods());

let rootRouter = new Router();
rootRouter.use('/api', router.routes(), router.allowedMethods());

export default rootRouter;