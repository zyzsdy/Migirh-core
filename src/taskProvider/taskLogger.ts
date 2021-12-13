interface Log {
    type: "debug" | "info" | "warning" | "error";
    message: string;
}

export default class TaskLogger {
    logger: Log[];
    isDebugMode: boolean;
    constructor(isDebugMode: boolean = false) {
        this.isDebugMode = isDebugMode;
    }

    debug(message: string) {
        this.isDebugMode && this.logger.push({type: "debug", message});
    }

    info(message: string) {
        this.logger.push({type: "info", message});
    }

    warning(message: string) {
        this.logger.push({type: "warning", message});
    }

    error(message: string) {
        this.logger.push({type: "error", message});
    }

    enableDebugMode() {
        this.isDebugMode = true;
    }
}