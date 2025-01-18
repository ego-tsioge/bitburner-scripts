/**
 * Zentrale Konfiguration für das gesamte Projekt.
 */
export const PRESETS = {
    // Version
    VERSION: "1.0.0",

    // Storage Keys
    STORAGE: {
        GLOBAL: 'BB_GLOBAL',
        PLAYER: 'BB_PLAYER',
        NETWORK: 'BB_NETWORK'
    },

    // Logging Konfiguration
    LOGGING: {
        TO_TERMINAL: true,     // Ausgabe im Terminal
        TO_FILE: true,         // In Datei schreiben
        MAX_SIZE_BYTES: 1024 * 1024,  // 1 MB
        TOAST_ON_ERROR: true,  // Toast-Benachrichtigung bei Fehlern
        PATHS: {
            ERROR: 'logs/errors.txt',
            SYSTEM: 'logs/system.txt'
        }
    },

    // RAM Limits
    RAM: {
        RESERVE: 8,  // GB RAM die auf home reserviert bleiben
    },

    // Script Paths
    PATHS: {
        BINS: {
            HACK: 'scripts/bin.hack.js',
            GROW: 'scripts/bin.grow.js',
            WEAKEN: 'scripts/bin.weaken.js'
        },
        LOGS: 'logs/system.txt'  // Zentraler Log-Pfad
    },

    // Error Handling
    ERROR: {
        MAX_RETRIES: 3,
        TIMEOUT: 5 * 60 * 1000,  // 5 Minuten Timeout
        WAIT_BETWEEN_RETRIES: 1000
    }
};
