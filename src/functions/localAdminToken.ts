import * as Koa from 'koa';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { getRandomToken } from "../utils/crypt";
import { dirname } from 'path';
import config from '../config';

export interface LocalAdminToken {
    token: string;
    sk: string;
}

function generateNewLocalToken(): LocalAdminToken  {
    let token: LocalAdminToken = {
        token: null,
        sk: null
    };

    if (!config.allowLocalTokenAuth) {
        return token;
    }
    const basePath = ".migirh/localAdminToken.json";
    let baseDirName = dirname(basePath);
    if (!existsSync(baseDirName)){
        mkdirSync(baseDirName);
    }

    if (existsSync(basePath)) {
        console.log("[AdminToken] 已从文件中读入本地Token。");
        let localTokenJsonStr = readFileSync(basePath, "utf-8");
        token = JSON.parse(localTokenJsonStr);
    } else {
        console.log("[AdminToken] 生成本地Token并写入。");
        token = {
            token: getRandomToken(),
            sk: getRandomToken()
        }
        let tokenJson = JSON.stringify(token);
        writeFileSync(basePath, tokenJson, {
            encoding: "utf8",
            flag: "w"
        });
    }

    return token;
}

const localAdminToken = generateNewLocalToken();
export default async function (ctx: Koa.ParameterizedContext, next: Koa.Next) {
    ctx.localAdminToken = localAdminToken
    await next();
};