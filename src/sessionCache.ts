import * as Koa from 'koa';
import * as LRU from 'lru-cache';
import type { UserSession } from './functions/checkLogin';
import sleep from './utils/sleep';

class SessionCache {
    lruCache: LRU<string, UserSession>;
    constructor() {
        this.lruCache = new LRU({
            maxAge: 1000 * 60 * 60 * 24
        });
        this.autoClean();
    }
    get(key: string) {
        return this.lruCache.get(key);
    }
    set(key: string, value: UserSession) {
        this.lruCache.set(key, value);
    }
    del(key: string) {
        this.lruCache.del(key);
    }
    async autoClean(){
        while(true) {
            await sleep(1000 * 60 * 60)
            console.log("[AutoClean] 清理session缓存");
            this.lruCache.prune();
        }
    }
}

const sessionCache = new SessionCache();

export type { SessionCache };

export default async function (ctx: Koa.ParameterizedContext, next: Koa.Next) {
    ctx.sessionCache = sessionCache;
    await next();
}