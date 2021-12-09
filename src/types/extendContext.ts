import type { SessionCache } from '../sessionCache';
import type { LocalAdminToken } from '../functions/localAdminToken';
import type { BasicResponse } from '../utils/basicResponse';

export type ExtendKoaContext = {
    bodyString: string;
    jsonRequest: any;
    sessionCache: SessionCache,
    localAdminToken: LocalAdminToken
    basicResponse: BasicResponse
}