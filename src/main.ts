import "reflect-metadata";
import * as Koa from 'koa';
import * as websockify from 'koa-websocket';
import * as serve from 'koa-static';
import dbConn from './loadDbModels';
import parseJson from "./parseJson";
import router from './router'
import config from './config';

import { wsEntry } from './websocket/WsServer'


async function startApp() {
    const conn = await dbConn;
    const app = websockify(new Koa());

    const port: number = config.httpPort;

    const home = serve(config.frontendStaticServeDir);

    app.use(home);
    app.use(parseJson);
    app.use(router.routes()).use(router.allowedMethods());
    app.ws.use(wsEntry);
    app.listen(port, () => {
        console.log(`HTTP Server is running at port ${port}.`);
    });

    return port;
}

startApp();