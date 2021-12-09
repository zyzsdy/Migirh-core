import "reflect-metadata";
import * as Koa from 'koa';
import * as websockify from 'koa-websocket';
import * as serve from 'koa-static';
import dbConn from './loadDbModels';
import parseJson from "./parseJson";
import router from './router'
import config from './config';
import sessionCache from "./sessionCache";
import localAdminToken from "./functions/localAdminToken";
import basicResponse from './utils/basicResponse';

import { wsEntry } from './websocket/WsServer'


async function startApp() {
    await dbConn;
    const app = websockify(new Koa());

    const port: number = config.httpPort;

    const home = serve(config.frontendStaticServeDir);

    app.use(home); //serve static files
    app.use(basicResponse); //add ctx simple response methods
    app.use(sessionCache); //add simple session local cache
    app.use(localAdminToken); //add localAdminToken save token and sk
    app.use(parseJson); //add body parser
    app.use(router.routes()).use(router.allowedMethods()); //add router
    app.ws.use(wsEntry); //add websocket
    app.listen(port, () => {
        console.log(`HTTP Server is running at port ${port}.`);
    });

    return port;
}

startApp();