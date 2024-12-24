import { SETTINGS } from 'lib.config.js';
import { Logger } from 'lib.log.js';

/**
 * Hacknet Node Manager
 * @param {NS} ns - Bitburner Netscript API
 */
export async function main(ns) {
	const flags = ns.flags([
		['debug', SETTINGS.DEBUG],      // Debug-Modus
		['mode', SETTINGS.HACKNET.MODE], // Betriebsmodus
		['budget', SETTINGS.HACKNET.BUDGET], // Budget überschreiben
		['help', false]                 // Hilfe anzeigen
	]);
	
	if (flags.help) {
		ns.tprint(`
Verwendung: run ${ns.getScriptName()}
Flags:
  --debug           Debug-Modus aktivieren
  --mode <mode>     Betriebsmodus (order|free|freeOverOrder)
  --budget <money>  Budget für Free-Mode
  --help            Diese Hilfe anzeigen
		`);
		return;
	}

	const log = new Logger(ns, ns.getScriptName(), { showDebug: flags.debug });
	
	try {
		const manager = new HacknetManager(ns, log, {
			mode: flags.mode,
			budget: flags.budget
		});
		await manager.run();
		
		// Zurück zu basis.js
		ns.spawn('basis.js', 1);
	} catch (error) {
		log.handleError(error, true);
	}
}

class HacknetManager {
	constructor(ns, log, options = {}) {
		this.ns = ns;
		this.log = log;
		this.hn = ns.hacknet;
		this.config = {
			...SETTINGS.HACKNET,
			...options
		};
		this.budget = Math.max(this.config.budget, 0);
	}

	async run() {
		// Erste Node kaufen falls keine vorhanden
		if (this.hn.numNodes() === 0) {
			this.hn.purchaseNode();
		}

		// Order Mode
		if (this.config.mode === 'order' || this.config.mode === 'freeOverOrder') {
			await this.runOrderMode();
		}

		// Free Mode
		if (this.config.mode === 'free' || this.config.mode === 'freeOverOrder') {
			await this.runFreeMode();
		}
	}

	async runOrderMode() {
		this.log.info('Starte Order Mode');
		
		// Nodes kaufen
		while (this.hn.numNodes() < this.config.NODES) {
			await this.purchaseOrWait(() => {
				return this.hn.purchaseNode() !== -1;
			}, this.hn.getPurchaseNodeCost());
		}

		// Bestandsaufnahme
		const stats = this.calculateCurrentStats();
		await this.upgradeToMinimumRequirements(stats);
	}

	calculateCurrentStats() {
		let sumLevel = 0, sumRam = 0, sumCores = 0;
		
		for (let i = 0; i < this.hn.numNodes(); i++) {
			const stats = this.hn.getNodeStats(i);
			sumLevel += stats.level;
			sumRam += stats.ram;
			sumCores += stats.cores;
		}

		return {
			neededLevel: Math.max(this.config.LEVEL - sumLevel, 0),
			neededRam: Math.max(this.config.RAM - sumRam, 0),
			neededCores: Math.max(this.config.CORES - sumCores, 0)
		};
	}

	async purchaseOrWait(buyFunction, cost) {
		if (buyFunction()) {
			this.budget -= cost;
			return true;
		}
		await this.ns.sleep(this.config.WAIT_TIME);
		return false;
	}

	async upgradeToMinimumRequirements(stats) {
		this.log.info('Upgrade auf Mindestanforderungen');
		
		for (let i = 0; i < this.hn.numNodes(); i++) {
			// Level upgraden
			while (stats.neededLevel > 0) {
				const cost = this.hn.getLevelUpgradeCost(i, 1);
				if (await this.purchaseOrWait(() => {
					return this.hn.upgradeLevel(i, 1);
				}, cost)) {
					stats.neededLevel--;
				}
			}
			
			// RAM upgraden
			while (stats.neededRam > 0) {
				const cost = this.hn.getRamUpgradeCost(i, 1);
				if (await this.purchaseOrWait(() => {
					return this.hn.upgradeRam(i, 1);
				}, cost)) {
					stats.neededRam--;
				}
			}
			
			// Cores upgraden
			while (stats.neededCores > 0) {
				const cost = this.hn.getCoreUpgradeCost(i, 1);
				if (await this.purchaseOrWait(() => {
					return this.hn.upgradeCore(i, 1);
				}, cost)) {
					stats.neededCores--;
				}
			}
		}
	}
} 