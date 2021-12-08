import type { SessionCache } from '../sessionCache';
import type { LocalAdminToken } from '../functions/localAdminToken';

export type ExtendKoaContext = {
    bodyString: string;
    jsonRequest: any;
    sessionCache: SessionCache,
    localAdminToken: LocalAdminToken
}