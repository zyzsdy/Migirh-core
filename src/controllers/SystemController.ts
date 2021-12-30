import * as Koa from 'koa';
import { checkLogin } from '../functions/checkLogin';
import { getManager } from 'typeorm';
import SystemConfig from '../models/SystemConfig';
import config from '../config';
import checkRequest from '../functions/checkRequest';
import { CheckAuthGlobal } from '../functions/checkAuth';

export async function systemInit(ctx: Koa.ParameterizedContext) {
    const systemConfigDb = getManager().getRepository(SystemConfig);
    let lang = await systemConfigDb.findOne("lang");

    let langValue = config.defaultLang;
    if (lang) {
        langValue = lang.config_value;
    }

    let user = await checkLogin(ctx);
    if (!user) {
        ctx.basicResponse.Unauthorized({info: "NotLoggedIn", lang: langValue});
        return;
    }

    ctx.basicResponse.OK({lang: langValue});
}

interface SystemConfigQueryRequest {
    config_key: string[];
}

export async function getSystemConfig(ctx: Koa.ParameterizedContext) {
    let user = await checkLogin(ctx);
    if (user == null) return;

    let jsonRequest = ctx.jsonRequest as SystemConfigQueryRequest;

    const systemConfigDb = getManager().getRepository(SystemConfig);

    let result: SystemConfig[];
    if (jsonRequest.config_key) {
        result = await systemConfigDb.findByIds(jsonRequest.config_key);
    } else {
        result = await systemConfigDb.find();
    }
    
    ctx.basicResponse.OK({data: result});
}

interface SystemConfigUpdateRequest {
    data: SystemConfig[];
}

export async function updateSystemConfig(ctx: Koa.ParameterizedContext) {
    let user = await checkLogin(ctx);
    if (user == null) return;

    let jsonRequest = ctx.jsonRequest as SystemConfigUpdateRequest;
    let auth = await CheckAuthGlobal(user, "GlobalOption");

    if (!auth) {
        ctx.basicResponse.Forbidden();
        return;
    }

    if (jsonRequest.data) {
        const systemConfigDb = getManager().getRepository(SystemConfig);
        systemConfigDb.save(jsonRequest.data);
    }

    ctx.basicResponse.OK();
}

export async function getAboutVersion(ctx: Koa.ParameterizedContext) {
    const packageJson = require('../../package.json');
    const minyamiPackageJson = require('../../node_modules/minyami/package.json');

    ctx.basicResponse.OK({
        data: {
            minyami_version: minyamiPackageJson.version,
            core_version: packageJson.version
        }
    });
}