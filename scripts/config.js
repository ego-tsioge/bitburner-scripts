/**
 * Zentrale Konfiguration für das gesamte Projekt.
 */
export const PRESETS = {
    // Storage Keys
    STORAGE: {
        STATE: 'BB_STATE',
        BACKUP: 'BB_BACKUP'
    },

    // RAM Limits
    RAM: {
        RESERVE: 8,  // GB RAM die auf home reserviert bleiben
        MIN_FREE: 4  // Minimum freier RAM für neue Prozesse
    },

    // Script Paths
    PATHS: {
        BINS: {
            HACK: 'scripts/bin.hack.js',
            GROW: 'scripts/bin.grow.js',
            WEAKEN: 'scripts/bin.weaken.js'
        }
    },

    // Error Handling
    ERROR: {
        MAX_RETRIES: 3,
        TIMEOUT: 5 * 60 * 1000,  // 5 Minuten Timeout
        WAIT_BETWEEN_RETRIES: 1000
    }
};
