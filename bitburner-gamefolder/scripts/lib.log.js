/** 
 * Zentrale Logging- und Fehlerbehandlungs-Bibliothek
 */

import { SETTINGS } from 'lib.config.js';

/**
 * Logger-Klasse für einheitliches Logging
 */
export class Logger {
	/**
	 * @param {NS} ns - Netscript-Handle
	 * @param {string} scriptName - Name des aufrufenden Scripts
	 * @param {Object} options - Optionale Einstellungen
	 */
	constructor(ns, scriptName, options = {}) {
		this.ns = ns;
		this.scriptName = scriptName;
		this.options = {
			showDebug: SETTINGS.DEBUG,
			useLog: true,      // Log-Fenster verwenden
			logToTerminal: false,
			...options
		};

		if (this.options.useLog) {
			this.ns.tail();
			this.ns.clearLog();
		}
		
		this.ns.disableLog('ALL');
	}

	/**
	 * Info-Nachricht ausgeben
	 */
	info(...args) {
		this.log('INFO', ...args);
	}

	/**
	 * Debug-Nachricht ausgeben
	 */
	debug(...args) {
		if (this.options.showDebug) {
			this.log('DEBUG', ...args);
		}
	}

	/**
	 * Warnung ausgeben
	 */
	warn(...args) {
		this.log('WARN', ...args);
	}

	/**
	 * Fehler ausgeben
	 */
	error(...args) {
		this.log('ERROR', ...args);
	}

	/**
	 * Erfolg ausgeben
	 */
	success(...args) {
		this.log('SUCCESS', ...args);
	}

	/**
	 * Basis-Logging Funktion
	 */
	log(level, ...args) {
		const timestamp = new Date().toLocaleTimeString();
		const message = `[${timestamp}] [${level}] ${args.join(' ')}`;
		
		if (this.options.useLog) {
			this.ns.print(message);
		}
		if (this.options.logToTerminal) {
			this.ns.tprint(message);
		}
	}

	/**
	 * Fehler behandeln
	 */
	handleError(error, fatal = false) {
		this.error(`Fehler in ${this.scriptName}:`, error.toString());
		if (this.options.showDebug) {
			this.debug('Stack:', error.stack);
		}
		
		if (fatal) {
			this.error('Fataler Fehler - Starte basis.js');
			this.ns.spawn('basis.js', 1);
		}
	}
} 