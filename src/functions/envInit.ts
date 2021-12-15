import config from '../config';
import * as os from 'os';

export default function envInit() {
    initEnvTmpDir();
}

function initEnvTmpDir() {
    if (config.tempDir) {
        let platform = os.platform();
        if (platform === "win32") {
            console.log("SET TEMP=" + config.tempDir);
            process.env["TEMP"] = config.tempDir;
        } else if (platform === "darwin") {
            console.log("SET TMPDIR=" + config.tempDir);
            process.env["TMPDIR"] = config.tempDir;
        } else {
            console.log("SET TMP=" + config.tempDir);
            process.env["TMP"] = config.tempDir;
        }
    }
}