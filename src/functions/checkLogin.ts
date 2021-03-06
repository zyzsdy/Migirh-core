import * as Koa from 'koa';
import { hmacSha1 } from '../utils/crypt';
import config from '../config';
import localAdminToken from './localAdminToken';

export interface UserSession {
    token: string;
    sk: string;
    username?: string;
    role?: string;
    isLocalAdmin: boolean;
}

export async function checkLogin(ctx: Koa.ParameterizedContext) {
    let userToken = ctx.request.header['user-token'] as string;

    //check login
    let userSession: UserSession = {
        token: null,
        sk: null,
        isLocalAdmin: false
    };

    if (config.allowLocalTokenAuth && localAdminToken.token === userToken) {
        userSession.username = "SYSTEM";
        userSession.token = localAdminToken.token;
        userSession.sk = localAdminToken.sk;
        userSession.isLocalAdmin = true;
    }

    if (userSession.token === null) {
        ctx.status = 401;
        ctx.body = {
            error: 1,
            info: "user-token invaild"
        }
        return null;
    }

    //check sign
    let authToken = ctx.request.header['x-auth-token'] as string;

    let authInfo = authToken.split(' ');
    if (authInfo.length !== 3) {
        ctx.status = 401;
        ctx.body = {
            error: 1,
            info: "bad auth-token format"
        }
        return null;
    }

    let [magicPhrase, ts, sign] = authInfo;
    if (magicPhrase !== "Migirh-Auth") {
        ctx.status = 401;
        ctx.body = {
            error: 1,
            info: "bad auth-token magic phrase"
        }
        return null;
    }

    var nowTs = new Date().getTime();
    var signTs = parseInt(ts);
    if (Math.abs(nowTs - signTs) > 120000) {
        ctx.status = 401;
        ctx.body = {
            error: 1,
            info: "bad auth-token clock difference is too big"
        }
        return null;
    }

    let signOriginalString = ctx.bodyString + "&ts=" + ts;
    let vSign = hmacSha1(signOriginalString, userSession.sk);
    if (sign !== vSign) {
        ctx.status = 401;
        ctx.body = {
            error: 1,
            info: "bad sign"
        }
        return null;
    }

    return userSession;
}

export async function getSession(token: string) {
    if (config.allowLocalTokenAuth && localAdminToken.token === token) {
        let user: UserSession = {
            token,
            username: "SYSTEM",
            sk: localAdminToken.sk,
            isLocalAdmin: true
        }
        return user;
    }

    return null;
}