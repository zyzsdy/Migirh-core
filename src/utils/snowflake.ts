import sleep from "./sleep";
import config from "../config";

class Snowflake {
    seq: number;
    nodeId: number;
    offset: number;
    lastTime: number;

    constructor(options: { offset: number, nodeId: number } = { offset: 0, nodeId: 1 }) {
        this.seq = 0;
        this.nodeId = options.nodeId % 1023;
        this.offset = options.offset;
        this.lastTime = 0;
    }

    async next() {
        const time = Date.now();
        const bTime = (time - this.offset).toString(2);

        if (time < this.lastTime) {
            throw new Error(`Clock backwards, offset: ${this.lastTime - time} ms.`);
        }

        if (time === this.lastTime) {
            this.seq = (this.seq + 1) & 4095;

            if (this.seq === 0) {
                await sleep(1);
            }
        } else {
            this.seq = 0;
        }

        this.lastTime = time;

        let bSeq = this.seq.toString(2).padStart(12, '0');
        let bNid = this.nodeId.toString(2).padStart(10, '0');

        const bId = bTime + bNid + bSeq;
        let id: string = "";

        for (let i = bId.length; i > 0; i -= 4) {
            id = parseInt(bId.substring(i - 4, i), 2).toString(16) + id;
        }

        return hexToDec(id);
    }
}

function hexToDec(hexStr: string) {
    if (hexStr.substring(0, 2) === "0x") {
        hexStr = hexStr.substring(2);
    }

    return convertBase(hexStr, 16, 10);
}

function convertBase(str: string, fromBase: number, toBase: number) {
    let digits = parseToDigitsArray(str, fromBase);
    if (digits === null) return null;

    let outArray: number[] = [];
    let power: number[] = [1];
    for (let i = 0; i < digits.length; i++) {
        // invariant: at this point, fromBase^i = power
        if (digits[i]) {
            outArray = add(
                outArray,
                multiplyByNumber(digits[i], power, toBase),
                toBase
            );
        }
        power = multiplyByNumber(fromBase, power, toBase);
    }

    var out = "";
    for (var i = outArray.length - 1; i >= 0; i--) {
        out += outArray[i].toString(toBase);
    }
    return out;
}

function add(x: number[], y: number[], base: number) {
    let z: number[] = [];
    let n = Math.max(x.length, y.length);
    let carry = 0;
    let i = 0;
    while (i < n || carry) {
        let xi = i < x.length ? x[i] : 0;
        let yi = i < y.length ? y[i] : 0;
        let zi = carry + xi + yi;
        z.push(zi % base);
        carry = Math.floor(zi / base);
        i++;
    }
    return z;
}

function multiplyByNumber(num: number, x: number[], base: number) {
    if (num < 0) return null;
    if (num == 0) return [];

    let result: number[] = [];
    let power: number[] = x;
    while (true) {
        if (num & 1) {
            result = add(result, power, base);
        }
        num = num >> 1;
        if (num === 0) break;
        power = add(power, power, base);
    }

    return result;
}

function parseToDigitsArray(str: string, base: number) {
    let digits = str.split("");
    let ary: number[] = [];
    for (let i = digits.length - 1; i >= 0; i--) {
        let n = parseInt(digits[i], base);
        if (isNaN(n)) return null;
        ary.push(n);
    }
    return ary;
}

const snowflake = new Snowflake({
    offset: 1638806400000,
    nodeId: config.snowflakeNodeId
});

export default snowflake;