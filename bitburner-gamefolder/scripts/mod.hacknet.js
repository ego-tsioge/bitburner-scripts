import { SETTINGS } from '/scripts/lib.config.js';
import { Logger } from '/scripts/lib.log.js';

/**
 * Hacknet Server Manager
 * Kauft und verwaltet Hacknet Server nach verschiedenen Strategien. In der Grundeinstellung 
 * kauft es bis zur Einladungsvoraussetzung für die Faction:Netburners
 * 
 * @param {NS} ns - Bitburner Netscript API
 */
export async function main(ns) {
	const flags = ns.flags([
		['debug', SETTINGS.DEBUG],           // Debug-Modus
		['mode', SETTINGS.HACKNET.MODE],     // Betriebsmodus
		['budget', SETTINGS.HACKNET.BUDGET], // Budget überschreiben
		['help', false],                     // Hilfe anzeigen
		['nodes', SETTINGS.HACKNET.NODES],   // Anzahl der Nodes
		['level', SETTINGS.HACKNET.LEVEL],   // Minimale Summe an Level
		['ram', SETTINGS.HACKNET.RAM],       // Minimale Summe an RAM
		['cores', SETTINGS.HACKNET.CORES]    // Minimale Summe an Cores
	]);
	
	if (flags.help) {
		ns.tprint(`
Verwendung: run ${ns.getScriptName()} [flags] 
Flags:
  --debug           Debug-Modus aktivieren
  --mode <mode>     Betriebsmodus (order|free|freeOverOrder)
  --budget <money>  Budget für Free-Mode
  --help            Diese Hilfe anzeigen
  
  diese gesamtzahl der elemente erreichen:
  --nodes <number>  Anzahl der Nodes
  --level <number>  Minimale Summe an Level
  --ram <number>    Minimale Summe an RAM
  --cores <number>  Minimale Summe an Cores
		`);
		return;
	}

	const log = new Logger(ns, ns.getScriptName(), { showDebug: flags.debug });

	// noch funktionslos
}