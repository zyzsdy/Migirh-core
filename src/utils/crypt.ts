import { createHash, createHmac } from 'crypto';
import config from '../config';

export function getRandomToken() {
    return createHash('sha1')
        .update(Date.now().toString() + (1e14 + 2e14 * Math.random()).toString())
        .digest()
        .toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_');
}

export function hmacSha1(text: string, pass: string) {
    return createHmac('sha1', pass)
        .update(text)
        .digest()
        .toString('base64');
}

export function passHash(pass: string) {
    let hashPass = config.sk.substring(0, 16) + "MSi1997_*";
    return createHmac('sha1', hashPass)
        .update(pass + config.sk)
        .digest()
        .toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_');
}