import * as Koa from 'koa';
import type { ExtendKoaContext } from './extendContext';

declare module 'koa' {
    interface DefaultContext extends ExtendKoaContext {
        
    }
}