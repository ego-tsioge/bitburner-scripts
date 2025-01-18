/** Zentraler Handler für Error-Handling und Logging */
export class Handler {
    /** @param {NS} ns */
    constructor(ns) {
        this.ns = ns;
        this.moduleName = ns.getScriptName();
    }

    /** Zentrale Error-Behandlung */
    handleError(error) {
        const context = {
            // Basis-Info (0.05 GB)
            module: this.moduleName,
            host: this.ns.getHostname(),
            pid: this.ns.pid,
            args: this.ns.args,

            // Performance (+0.3 GB)
            scriptRam: this.ns.getScriptRam(this.moduleName),
            serverRam: {
                max: this.ns.getServerMaxRam(this.ns.getHostname()),
                used: this.ns.getServerUsedRam(this.ns.getHostname())
            },
            money: this.ns.getServerMoneyAvailable('home'),

            // Player (0.05 GB)
            hackLevel: this.ns.getHackingLevel(),

            // Error
            type: error.name || 'Error',
            message: error.message,
            stack: error.stack
        };

        // Toast-Benachrichtigung (0 GB)
        if (PRESETS.LOGGING.TOAST_ON_ERROR) {
            this.ns.toast(`Error in ${this.moduleName}: ${error.message}`, 'error');
        }

        this.log('ERROR', error.message, context);
    }

    /** Logging mit Datei-Output */
    async log(level, message, data = {}) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${level}][${timestamp}] ${message}\n`;

        await this.ns.write(PRESETS.PATHS.LOGS, logMessage, 'a');
        if (Object.keys(data).length > 0) {
            await this.ns.write(PRESETS.PATHS.LOGS, JSON.stringify(data, null, 2) + '\n', 'a');
        }
    }

    /**
     * Modul-Logik wrappen
     * @param {Function} moduleLogic - Zu wrappende Funktion
     * @param {...any} args - Argumente für die Modul-Logik
     */
    async wrapModule(moduleLogic, ...args) {
        try {
            return await moduleLogic(...args);
        } catch (error) {
            return this.handleError(error);
        }
    }
}
