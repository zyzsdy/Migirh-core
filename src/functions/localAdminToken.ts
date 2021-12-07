import * as Koa from 'koa';
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { getRandomToken } from "../utils/crypt";
import { dirname } from 'path';

export interface LocalAdminToken {
    token: string;
    sk: string;
}

function generateNewLocalToken(): LocalAdminToken  {
    const token: LocalAdminToken = {
        token: getRandomToken(),
        sk: getRandomToken()
    }

    let tokenJson = JSON.stringify(token);

    console.log("[AdminToken] 写入本地Token。");

    const basePath = ".migirh/localAdminToken.json";
    let baseDirName = dirname(basePath);
    if (!existsSync(baseDirName)){
        mkdirSync(baseDirName);
    }
    writeFileSync(basePath, tokenJson, {
        encoding: "utf8",
        flag: "w"
    });

    return token;
}

const localAdminToken = generateNewLocalToken();
export default async function (ctx: Koa.ParameterizedContext, next: Koa.Next) {
    ctx.localAdminToken = localAdminToken
    await next();
};