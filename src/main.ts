import "reflect-metadata";
import * as Koa from 'koa';
import * as websockify from 'koa-websocket';
import * as serve from 'koa-static';
import dbConn from './loadDbModels';
import parseJson from "./parseJson";
import router from './router'
import config from './config';
import sessionCache from "./sessionCache";
import basicResponse from './utils/basicResponse';

import { wsEntry } from './websocket/WsServer'
import envInit from "./functions/envInit";
import errorHandler from "./utils/errorHandler";


async function startApp() {
    await dbConn;
    envInit();
    const app = websockify(new Koa());

    const port: number = config.httpPort;

    const home = serve(config.frontendStaticServeDir);

    app.use(home); //serve static files
    app.use(errorHandler); //add error handler
    app.use(basicResponse); //add ctx simple response methods
    app.use(sessionCache); //add simple session local cache
    app.use(parseJson); //add body parser
    app.use(router.routes()).use(router.allowedMethods()); //add router
    app.ws.use(wsEntry); //add websocket
    app.listen(port, () => {
        console.log(`HTTP Server is running at port ${port}.`);
    });

    process.on("unhandledRejection", (error: any) => {
        console.log(`Migirh-Core [ERROR] ${error.message} ` + error.toString());
    });

    process.on("uncaughtException", (error: any) => {
        console.log(`Migirh-Core [ERROR] ${error.message} ` + error.toString());
    });

    return port;
}

startApp();