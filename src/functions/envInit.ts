import config from '../config';
import * as os from 'os';
import { getManager } from 'typeorm';
import SystemConfig from '../models/SystemConfig';

export default function envInit() {
    initEnvTmpDir();
}

async function initEnvTmpDir() {
    const systemConfigDb = getManager().getRepository(SystemConfig);
    let tmpPath = await systemConfigDb.findOne("minyami_tmp_path");

    if (tmpPath && tmpPath.config_value) {
        let platform = os.platform();
        if (platform === "win32") {
            console.log("SET TEMP=" + tmpPath.config_value);
            process.env["TEMP"] = tmpPath.config_value;
        } else if (platform === "darwin") {
            console.log("SET TMPDIR=" + tmpPath.config_value);
            process.env["TMPDIR"] = tmpPath.config_value;
        } else {
            console.log("SET TMP=" + tmpPath.config_value);
            process.env["TMP"] = tmpPath.config_value;
        }
    }
}

export async function getEnvObj() {
    const systemConfigDb = getManager().getRepository(SystemConfig);
    let tmpPath = await systemConfigDb.findOne("minyami_tmp_path");

    if (tmpPath && tmpPath.config_value) {
        let platform = os.platform();
        if (platform === "win32") {
            return {
                TEMP: tmpPath.config_value
            }
        } else if (platform === "darwin") {
            return {
                TMPDIR: tmpPath.config_value
            }
        } else {
            return {
                TMP: tmpPath.config_value
            }
        }
    }

    return {};
}