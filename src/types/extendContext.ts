import type { SessionCache } from '../sessionCache';
import type { BasicResponse } from '../utils/basicResponse';

export type ExtendKoaContext = {
    bodyString: string;
    jsonRequest: any;
    sessionCache: SessionCache,
    basicResponse: BasicResponse
}