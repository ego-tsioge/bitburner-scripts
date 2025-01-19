import { PRESETS } from "config.js";

/** Zentraler Handler für Error-Handling und Logging */
export class Handler {
    /** @param {NS} ns */
    constructor(ns) {
        this.ns = ns;
        this.moduleName = ns.getScriptName();
    }

    // TODO: Kritische Fehler implementieren
    // - Korrupter State:
    //   - JSON.parse Fehler erkennen
    //   - State-Validierung durchführen
    //   - State-Reset implementieren
    // - RAM-Limitierung:
    //   - RAM-Fehler erkennen
    //   - State auf Inkonsistenzen prüfen
    //   - Recovery durchführen

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

    /**
     * Fehler-Details sammeln
     * @param {Error} error - Der aufgetretene Fehler
     * @returns {Object} Fehler-Details
     */
    collectErrorDetails(error) {
        return {
            timestamp: new Date().toISOString(),
            message: error.message || error,
            source: this.moduleName,
            ram: this.ns.getScriptRam(this.moduleName),
            host: this.ns.getHostname(),
            money: this.ns.getServerMoneyAvailable(this.ns.getHostname())
        };
    }

    /**
     * Fehler formatieren
     * @param {Object} details - Gesammelte Fehler-Details
     * @returns {string} Formatierte Fehlermeldung
     */
    formatError(details) {
        return `[${details.timestamp}]
            Host: ${details.host}
            Source: ${details.source}
            RAM Used: ${details.ram}GB
            Money: ${this.ns.formatNumber(details.money)}
            Error: ${details.message}`;
    }

    /**
     * Fehler mit Kontext loggen
     * @param {Error} error - Der aufgetretene Fehler
     * @param {string} [context] - Zusätzlicher Kontext
     */
    logError(error, context = '') {
        const details = this.collectErrorDetails(error);
        const formattedError = this.formatError(details);

        if (PRESETS.LOGGING.TO_TERMINAL) {
            this.ns.print(formattedError);
            if (context) this.ns.print(`Context: ${context}`);
        }

        if (PRESETS.LOGGING.TO_FILE) {
            this.ns.write(PRESETS.LOGGING.PATH, formattedError + '\n', 'a');
            if (context) {
                this.ns.write(PRESETS.LOGGING.PATH, `Context: ${context}\n`, 'a');
            }
        }

        if (PRESETS.LOGGING.TOAST_ON_ERROR) {
            this.ns.toast(`Error in ${this.moduleName}`, 'error');
        }
    }

    /**
     * Zentrale Fehlerbehandlung
     * @param {Error} error - Der aufgetretene Fehler
     */
    handleError(error) {
        this.logError(error);
    }
}
