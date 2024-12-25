import { Logger } from '/scripts/lib.log.js';
import { STORAGE_KEYS, SETTINGS } from '/scripts/lib.config.js';
import { loadData, saveData } from '/scripts/lib.storage.js';

/**
 * Hauptmanager des Hacking-Systems 
 * Koordiniert alle anderen Manager und verwaltet den Systemstatus
 * 
 * @param {NS} ns - Bitburner Netscript API
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const flags = ns.flags([
		['debug', SETTINGS.DEBUG],     // Debug-Modus
		['target', null],              // Ziel-Server überschreiben
		['help', false]                // Hilfe anzeigen
	]);
	
	// Hilfetext als Funktion für Wiederverwendbarkeit
	const showHelp = () => {
		ns.tprint(`
Verwendung: run ${ns.getScriptName()}
Flags:
  --debug          Debug-Modus aktivieren
  --target <name>  Ziel-Server überschreiben
  --help           Diese Hilfe anzeigen
		`);
	};
	
	// Hilfe anzeigen wenn angefordert
	if (flags.help) {
		showHelp();
		return;
	}
	
	// Prüfen ob Script auf home läuft
	if (ns.getHostname() !== 'home') {
		ns.tprint('ERROR: Dieses Skript sollte nur von home gestartet werden');
		ns.tprint('\nHier sind die verfügbaren Optionen:');
		showHelp();
		return -1;
	}

	// Logger initialisieren
	const log = new Logger(ns, ns.getScriptName(), { showDebug: flags.debug });
	
	// Hauptlogik
	try {
		// Erst aufräumen
		await cleanupOldFiles(ns);

		// Status prüfen/setzen
		const status = loadData(STORAGE_KEYS.STATUS);
		if (!status) {
			initializeStatus(ns, flags.target);
		} else if (flags.target) {
			status.target = flags.target;
			saveData(STORAGE_KEYS.STATUS, status);
		}
		
		// Prüfen ob Hacknet-Update nötig
		const timeSinceLastHacknetUpdate = Date.now() - (status?.lastHacknetUpdate || 0);
		if (timeSinceLastHacknetUpdate > SETTINGS.HACKNET.UPDATE_INTERVAL) {
			await executeModule(ns, {
				script: 'mod.hacknet.js',
				nextAction: 'scan',
				timestamp: { lastHacknetUpdate: Date.now() }
			});
			return;
		}
		
		// Nächste Aktion ausführen
		switch(status?.nextAction) {
			case 'scan':
				await executeModule(ns, {
					script: 'mod.spider.js',
					nextAction: 'schedule',
					timestamp: { lastScan: Date.now() }
				});
				break;
				
			case 'schedule':
				await executeModule(ns, {
					script: 'mod.scheduler.js',
					nextAction: 'scan',
					timestamp: { lastSchedule: Date.now() }
				});
				break;
				
			case 'hacknet':
				await executeModule(ns, {
					script: 'mod.hacknet.js',
					nextAction: 'scan',
					timestamp: { lastHacknetUpdate: Date.now() }
				});
				break;
				
			default:
				initializeStatus(ns, flags.target);
				ns.spawn(ns.getScriptName(), 1);
		}
	} catch (error) {
		log.handleError(error, true);
	}
}

/**
 * Initialisiert den System-Status mit Standardwerten
 * 
 * @param {NS} ns - Bitburner Netscript API
 * @param {string} [target] - Optionaler Ziel-Server
 * @returns {void}
 */
function initializeStatus(ns, target) {
	saveData(STORAGE_KEYS.STATUS, {
		nextAction: 'scan',
		lastScan: 0,
		target: target || SETTINGS.DEFAULT_TARGET,
		hackLevel: ns.getHackingLevel(),
		lastUpdate: Date.now()
	});
}

/**
 * Räumt alte Tutorial- und Test-Scripts auf
 * Beendet laufende Prozesse und löscht alte Dateien
 * 
 * @param {NS} ns - Bitburner Netscript API
 * @returns {Promise<void>}
 */
async function cleanupOldFiles(ns) {
	for (const file of SETTINGS.OLD_FILES) {
		if (ns.scriptRunning(file, 'home')) {
			ns.kill(file, 'home');
			ns.tprint(`Beende altes Script: ${file}`);
			await ns.sleep(100);
		}
		if (ns.fileExists(file, 'home')) {
			ns.rm(file, 'home');
			ns.tprint(`Lösche alte Datei: ${file}`);
		}
	}
}

// Generische Ausführungsfunktion
async function executeModule(ns, { script, nextAction, timestamp }) {
	saveData(STORAGE_KEYS.STATUS, { 
		nextAction,
		...timestamp
	});
	ns.spawn(script, 1);
}