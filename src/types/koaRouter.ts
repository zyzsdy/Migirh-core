import * as Router from 'koa-router'
import type { ExtendKoaContext } from './extendContext';

declare module 'koa-router' {
    interface IRouterParamContext extends ExtendKoaContext{
        
    }
}