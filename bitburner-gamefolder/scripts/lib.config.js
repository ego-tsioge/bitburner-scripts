/** 
 * Zentrale Konfiguration für alle Scripts
 * @module lib.config
 */

/**
 * Storage Keys für localStorage
 * @constant {Object}
 */
export const STORAGE_KEYS = {
	NETWORK: 'network',      // Netzwerk-Scan Daten
	STATUS: 'status',       // System-Status
	TARGETS: 'targets',      // Hack-Ziele
	SCHEDULER: 'scheduler',  // Scheduler-Status
	HACKNET: 'hacknet',     // Hacknet-Daten
	SETTINGS: 'settings'     // Benutzereinstellungen
};

/**
 * Globale Einstellungen für das Hacking-System
 * @constant {Object}
 */
export const SETTINGS = {
	STORAGE_PREFIX: 'ego_',  // Prefix für localStorage Keys
	
	// Scan-Intervalle
	NETWORK_SCAN_INTERVAL: 5 * 60 * 1000,  // 5 Minuten
	TARGET_UPDATE_INTERVAL: 60 * 1000,      // 1 Minute
	
	// Server-Einstellungen
	RESERVED_RAM: 8,  // GB RAM die auf home reserviert bleiben
	
	// Hack-Einstellungen
	DEFAULT_TARGET: 'n00dles',
	
	// Debug
	DEBUG: false,
	
	// Alte Dateien die gelöscht werden sollen
	OLD_FILES: [
		// Alte Tutorial Scripts
		'n00dles.js',
		// Alte Test Scripts
		//'test.check.js',
		// Alte Manager Versionen
		'mgr.hacknet.js',
		'mgr.spider.js',
		'mgr.scheduler.js',
		// Alte Binary Versionen
		'hack.js',
		'grow.js',
		'weak.js'
	],
	
	// Hacknet Einstellungen
	HACKNET: {
		UPDATE_INTERVAL: 5 * 60 * 1000,  // 5 Minuten
		NODES: 1,                   // Mindestanzahl für Netburners-Faction
		LEVEL: 100,                 // Mindestlevel für Netburners-Faction
		RAM: 8,                     // MindestRAM für Netburners-Faction
		CORES: 4,                   // MindestAnzahl Kerne für Netburners-Faction
		MODE: 'order',              // order|free|freeOverOrder
		BUDGET: 200000,             // Budget für Free-Mode
		WAIT_TIME: 1000            // Wartezeit wenn nicht genug Geld (1 Sekunde)
	}
};

/**
 * Server Datenmodell
 * Alle Daten werden vom Spider aktualisiert und im localStorage zwischengespeichert
 * @typedef {Object} ServerModel
 */
export const SERVER_MODEL = {
	// Basis Informationen
	id: String,
	hostname: String,
	admin: Boolean,
	level: Number,
	purchased: Boolean,
	backdoored: Boolean,
	cores: Number,
	
	// RAM Details
	ram: {
		used: Number,
		max: Number,
		free: Number,
		trueMax: Number
	},
	
	// Berechnete Werte
	power: Number,  // Math.max(0, Math.log2(server.data.maxRam))
	
	// Server Details
	organization: String,
	isHome: Boolean,
	
	// Port Status
	ports: {
		required: Number,
		openPortCount: Number,
		ftp: Boolean,
		http: Boolean,
		smtp: Boolean,
		sql: Boolean,
		ssh: Boolean
	},
	
	// Sicherheit
	security: {
		level: Number,
		min: Number
	},
	
	// Finanzen
	money: {
		available: Number,
		max: Number,
		growth: Number
	},
	
	// Metadaten
	updated_at: Number
};

/**
 * Datei-Präfixe für verschiedene Script-Typen
 * @constant {Object}
 */
export const FILE_PREFIXES = {
	MODULE: 'mod.',     // Funktionsmodule
	BINARY: 'bin.',     // Ausführbare Scripts
	LIBRARY: 'lib.'     // Bibliotheken
};

/**
 * Hacking Tools Konfiguration, erleichtert das Hinzufügen neuer Tools (falls das mal kommt)
 * @constant {Array<[string, string]>} [Funktion, Dateiname]
 */
export const HACKING_TOOLS = [
	['brutessh', 'BruteSSH.exe'],
	['ftpcrack', 'FTPCrack.exe'],
	['relaysmtp', 'relaySMTP.exe'],
	['httpworm', 'HTTPWorm.exe'],
	['sqlinject', 'SQLInject.exe']
]; 