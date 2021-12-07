import type { SessionCache } from '../sessionCache';
import type { LocalAdminToken } from '../functions/localAdminToken';

export type ExtendKoaContext = {
    jsonRequest: any;
    sessionCache: SessionCache,
    localAdminToken: LocalAdminToken
}