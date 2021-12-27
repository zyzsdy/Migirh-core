import * as yargs from 'yargs-parser';

interface MinyamiOptions {
    url?: string;
    live?: boolean;
    output?: string;
    threads?: number;
    retries?: number;
    key?: string;
    cookies?: string;
    headers?: string;
    format?: string;
    slice?: string;
    nomerge?: boolean;
    proxy?: string;
    verbose?: boolean
}

export function minyamiCommandParser(command: string): MinyamiOptions {
    let result: MinyamiOptions = {};

    if (command) {
        let args = yargs(command);

        if (args['d']) result.url = args['d'];
        if (args['download']) result.url = args['download'];
        if (args['threads']) result.threads = args['threads'];
        if (args['retries']) result.retries = args['retries'];
        if (args['o']) result.output = args['o'];
        if (args['output']) result.output = args['output'];
        if (args['cookies']) result.cookies = args['cookies'];
        if (args['H']) result.headers = args['H'];
        if (args['headers']) result.headers = args['headers'];
        if (args['proxy']) result.proxy = args['proxy'];
        if (args['slice']) result.slice = args['slice'];

        if (args['keep']) {
            let b = args['keep'];
            if (b.toString() === "false") result.nomerge = false;
            result.nomerge = !!b;
        }
        if (args['nomerge']) {
            let b = args['nomerge'];
            if (b.toString() === "false") result.nomerge = false;
            result.nomerge = !!b;
        }

        if (args['live']) {
            let b = args['live'];
            if (b.toString() === "false") result.live = false;
            result.live = !!b;
        } else {
            result.live = false;
        }

        if (args['key']) {
            result.key = args['key'];
        } else {
            result.key = null;
        }
    }

    return result;
}