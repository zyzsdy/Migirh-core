import * as Koa from 'koa';
import { checkLogin } from '../../functions/checkLogin';
import { CheckAuthGlobal } from '../../functions/checkAuth';
import { getManager } from 'typeorm';
import SystemConfig from '../../models/SystemConfig';
import UserCache from '../../models/UserCache';

export interface NewTaskParams {
    url?: string;
    live?: boolean;
    output?: string;
    category?: string;
    description?: string;
    threads?: number;
    retries?: number;
    key?: string;
    cookies?: string;
    headers?: string;
    format?: string;
    slice?: string;
    nomerge?: boolean;
    proxy?: string;
    verbose?: boolean
}

interface MinyamiOptions {
    threads?: number;
    retries?: number;
    headers?: string;
    format?: string;
    nomerge?: boolean;
    verbose?: boolean;
}

interface ProxyOptions {
    proxy: "noproxy" | "http" | "https" | "socks5",
    host: string;
    port: number;
}

interface UserCacheOptions {
    live?: boolean;
    output?: string;
    category?: string;
}

export async function getNewTaskPreaddParams(username: string) : Promise<NewTaskParams> {
    let result: NewTaskParams = {};

    //read minyamioptions and proxy
    const systemConfigDb = getManager().getRepository(SystemConfig);
    let systemConfigs = await systemConfigDb.findByIds(["minyami_options", "proxy_options"]);
    if (systemConfigs) {
        for (let sc of systemConfigs) {
            if (sc.config_key === "proxy_options") {
                let proxyOptions = JSON.parse(sc.config_value) as ProxyOptions;
                if (proxyOptions.proxy !== "noproxy") {
                    if (proxyOptions.host && proxyOptions.port) {
                        result.proxy = `${proxyOptions.proxy}://${proxyOptions.host}:${proxyOptions.port}`;
                    }
                }
            } else if (sc.config_key === "minyami_options") {
                let minyamiOptions = JSON.parse(sc.config_value) as MinyamiOptions;
                if (minyamiOptions.threads) result.threads = minyamiOptions.threads;
                if (minyamiOptions.retries) result.retries = minyamiOptions.retries;
                if (minyamiOptions.headers) result.headers = minyamiOptions.headers;
                if (minyamiOptions.format) result.format = minyamiOptions.format;
                if (minyamiOptions.nomerge) result.nomerge = minyamiOptions.nomerge;
                if (minyamiOptions.verbose) result.verbose = minyamiOptions.verbose;
            }
        }
    }

    //read usercache
    const userCacheDb = getManager().getRepository(UserCache);
    let userCacheOptionsItem = await userCacheDb.findOne({"username": username, "config_key": "task_options"});
    if (userCacheOptionsItem) {
        let userCacheOptions = JSON.parse(userCacheOptionsItem.config_value) as UserCacheOptions
        if (userCacheOptions.live) result.live = userCacheOptions.live;
        if (userCacheOptions.output) result.output = userCacheOptions.output;
        if (userCacheOptions.category) result.category = userCacheOptions.category;
    }

    return result;
}

export async function taskPre(ctx: Koa.ParameterizedContext) {
    let user = await checkLogin(ctx);
    if (user == null) return;

    let auth = await CheckAuthGlobal(user, "TaskInput");

    if (!auth) {
        ctx.basicResponse.Forbidden();
        return;
    }

    let result = await getNewTaskPreaddParams(user.username);

    ctx.basicResponse.OK({
        cache: result
    });
}