import * as Koa from 'koa';
import * as parseUrl from 'parseurl';
import * as fs from 'fs';
const resolvePath = require('resolve-path');

export default function rewrite(root: string) {
    return (ctx: Koa.ParameterizedContext, next: Koa.Next) => {
        const orig = ctx.request.url;
        
        if (orig.startsWith("/api")) {
            return next();
        } else {
            let pathname = decodeURIComponent(parseUrl(ctx.request.req).pathname);

            if (pathname) {
                let filename = pathname.substring(1);
                let fullpath = resolvePath(root, filename);

                if (fs.existsSync(fullpath)) {
                    return next();
                }
            }
            ctx.request.url = "/index.html";
            return next();
        }
    }
}