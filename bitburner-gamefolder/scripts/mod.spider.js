import { STORAGE_KEYS, SETTINGS, HACKING_TOOLS } from 'lib.config.js';
import { saveData, loadData } from 'lib.storage.js';
import { Logger } from 'lib.log.js';

/**
 * Netzwerk-Scanner und Analysetool
 * Sammelt Informationen über alle erreichbaren Server
 * @param {NS} ns - Bitburner Netscript API
 */
export async function main(ns) {
	const flags = ns.flags([
		['debug', SETTINGS.DEBUG],    // Debug-Modus
		['nextScript', ''],           // Nächstes Script
		['test', false],             // Test-Modus
		['help', false]              // Hilfe anzeigen
	]);
	
	if (flags.help) {
		ns.tprint(`
Verwendung: run ${ns.getScriptName()}
Flags:
  --debug         Debug-Modus aktivieren
  --nextScript    Nächstes auszuführendes Script
  --test          Test-Modus (ignoriert nextScript)
  --help          Diese Hilfe anzeigen
		`);
		return;
	}

	const log = new Logger(ns, ns.getScriptName(), { showDebug: flags.debug });
	
	try {
		// Verfügbare Hacking-Tools prüfen
		let toolCount = 0;
		for (const [func, file] of HACKING_TOOLS) {
			if (ns.fileExists(file, 'home')) {
				toolCount++;
			}
		}
		
		// Alle erreichbaren Server scannen und verarbeiten
		const servers = scanNetwork(ns);
		for (const hostname of servers) {
			// Server analysieren und Daten speichern
			const serverData = analyzeAndUpdateServer(ns, hostname);
			
			// Versuchen den Server zu hacken falls möglich
			if (!serverData.admin && hostname !== 'home' && 
				serverData.ports.required <= toolCount && 
				serverData.level <= ns.getHackingLevel()) {
				
				try {
					// Ports öffnen
					for (const [func, file] of HACKING_TOOLS) {
						if (ns.fileExists(file, 'home')) {
							ns[func](hostname);
						}
					}
					
					// Root-Zugriff erlangen
					ns.nuke(hostname);
					
					// Server-Daten aktualisieren	
					serverData.admin = true;
					saveData(STORAGE_KEYS.NETWORK, { 
						servers: { 
							[hostname]: serverData 
						} 
					});
					
					log.success(`Root-Zugriff auf ${hostname} erlangt!`);
				} catch (error) {
					log.warn(`Konnte ${hostname} nicht hacken: ${error.message}`);
				}
			}
		}
		
		// Zum nächsten Script, außer im Test-Modus
		if (flags.nextScript && !flags.test) {
			ns.spawn(flags.nextScript, 1);
		}
		
	} catch (error) {
		log.handleError(error, flags.nextScript && !flags.test);
	}
}

/**
 * Scannt das gesamte Netzwerk iterativ
 * @param {NS} ns - Bitburner Netscript API
 * @returns {string[]} Liste aller gefundenen Server
 */
function scanNetwork(ns) {
	const seen = new Set(['home']);
	const toScan = ['home'];
	
	while (toScan.length > 0) {
		const host = toScan.shift();
		const connections = ns.scan(host);
		
		for (const server of connections) {
			if (!seen.has(server)) {
				seen.add(server);
				toScan.push(server);
			}
		}
	}
	
	return Array.from(seen);
}

/**
 * Analysiert einen Server und speichert die Daten
 * @param {NS} ns 
 * @param {string} hostname 
 * @returns {Object} Die aktualisierten Server-Daten
 */
function analyzeAndUpdateServer(ns, hostname) {
	// Server-Daten aus dem Speicher laden
	const networkData = loadData(STORAGE_KEYS.NETWORK, { servers: {} });
	const server = ns.getServer(hostname);  // Einmal alle Daten holen
	
	// Server-Daten in unser Modell überführen
	const serverData = {
		// Basis Informationen
		id: hostname,
		hostname: hostname,
		admin: server.hasAdminRights,
		level: server.requiredHackingSkill,
		purchased: server.purchasedByPlayer,
		backdoored: server.backdoorInstalled,
		cores: server.cpuCores,
		
		// RAM Details
		ram: {
			used: server.ramUsed,
			max: hostname === 'home' ? server.maxRam - SETTINGS.RESERVED_RAM : server.maxRam,
			free: hostname === 'home' ? 
				  server.maxRam - SETTINGS.RESERVED_RAM - server.ramUsed :
				  server.maxRam - server.ramUsed,
			trueMax: server.maxRam
		},
		
		// Berechnete Werte
		power: Math.max(0, Math.log2(server.maxRam)),
		
		// Server Details
		organization: server.organizationName,
		isHome: hostname === 'home',
		
		// Port Status
		ports: {
			required: server.numOpenPortsRequired,
			openPortCount: server.openPortCount,
			ftp: server.ftpPortOpen,
			http: server.httpPortOpen,
			smtp: server.smtpPortOpen,
			sql: server.sqlPortOpen,
			ssh: server.sshPortOpen
		},
		
		// Sicherheit
		security: {
			level: server.hackDifficulty,
			min: server.minDifficulty
		},
		
		// Finanzen
		money: {
			available: server.moneyAvailable,
			max: server.moneyMax,
			growth: server.serverGrowth
		},
		
		// Metadaten
		updated_at: Date.now()
	};
	
	// Daten speichern und zurückgeben
	networkData.servers[hostname] = serverData;
	saveData(STORAGE_KEYS.NETWORK, networkData);
	
	return serverData;
}
