/** Zentraler Handler für Logging und Error-Handling */
export class Handler {
    /** @param {NS} ns */
    constructor(ns) {
        this.ns = ns;
        this.LOG_LEVELS = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3
        };
        this.currentLogLevel = this.LOG_LEVELS.INFO; // Default
    }

    /** Logging mit Levels und Formatierung */
    log(level, message, data = {}) {
        if (this.LOG_LEVELS[level] >= this.currentLogLevel) {
            const timestamp = new Date().toISOString();
            const logMessage = `[${level}][${timestamp}] ${message}`;

            this.ns.print(logMessage);
            if (Object.keys(data).length > 0) {
                this.ns.print(JSON.stringify(data, null, 2));
            }
        }
    }

    /** Modul-Ausführung mit Error Handling */
    async runModule(moduleName, moduleFunction) {
        try {
            this.log('INFO', `Starting ${moduleName}`);
            await moduleFunction(this.ns);
            this.log('INFO', `${moduleName} completed successfully`);
            return true;
        } catch (error) {
            this.log('ERROR', `Error in ${moduleName}`, {
                error: error.message,
                stack: error.stack,
                type: error.name
            });

            // Basic recovery: Retry once
            try {
                this.log('WARN', `Retrying ${moduleName}`);
                await moduleFunction(this.ns);
                this.log('INFO', `${moduleName} retry successful`);
                return true;
            } catch (retryError) {
                this.log('ERROR', `${moduleName} retry failed`, {
                    error: retryError.message
                });
                return false;
            }
        }
    }

    /** Debug-Level setzen */
    setLogLevel(level) {
        if (this.LOG_LEVELS[level] !== undefined) {
            this.currentLogLevel = this.LOG_LEVELS[level];
            this.log('INFO', `Log level set to ${level}`);
        }
    }
}
