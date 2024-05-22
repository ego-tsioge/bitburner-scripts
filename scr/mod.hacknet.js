import { debugMSG, settings } from "./lib.helpers.js";

const argsSchema = [
	['help', false], //
	['nodes', 1], // 
	['level', 100], // 
	['ram', 8], // 
	['cores', 4], // 
	['mode', 'order'],
	['spend', 200000],
	['n', undefined], // 
	['l', undefined], // 
	['r', undefined], // 
	['c', undefined], //  
];

const wait4Money = 1000; // 1000 = 1sec
const maxLevel = 200;
const maxRam   = 64;
const maxCore  = 16;

export async function main(ns) {
	settings.setItem('debug', false);
	ns.disableLog('ALL')

	const opt = ns.flags(argsSchema);
	let info = "INFO: dieses script soll Hacknet-Server kaufen. in der Grundeinstellung";
	info += " kauft es bis zur Einladungsvoraussetzung für die Faction:Netburners";
	info += "\nParameter:\n  --help :: diese anzeige";
	info += "\n  --nodes [1] :: mininimale Anzahl an Nodes die zu kaufen sind ";
	info += "\n  --level [100]  :: die mininimale Summe an Level über alle server/Nodes";
	info += "\n  --ram   [8]  :: mininimale Summe an RAM das zu kaufen ist";
	info += "\n  --cores [4] :: mininimale Summe an Cores die zu kaufen sind";
	info += "\n  --mode  [order|free|freeOverOrder] :: im order-modus wird nur die angegebene Menge gekauft,";
	info += "\n          im free-mode nach bester Option (gewinn pro kosten) gekauft; freeOverOrder kombiniert beides";
	info += "\n  --spend [200000] :: geldmenge für Free-Mode zum ausgeben";
	if (opt.help) {
		ns.tprint(info);
		return 0;
	}
	if (opt.mode !== 'order' && opt.mode !== 'freeOverOrder' && opt.mode !== 'free') { opt.mode = 'order' };
	if (opt.n && opt.n > 0) { opt.nodes = opt.n };
	if (opt.l && opt.l > 0) { opt.level = opt.l };
	if (opt.r && opt.r > 0) { opt.ram = opt.r };
	if (opt.c && opt.c > 0) { opt.cores = opt.c };

	let hn = ns.hacknet;
	let budget = Math.max(opt.spend, 0);

	// die erste node sofort kaufen ohne zu schauen, in der hoffnung später weniger prüfen zu müssen
	if (hn.numNodes() === 0) { hn.purchaseNode() }

	if (opt.mode === 'order' || opt.mode === 'freeOverOrder') {
		await debugMSG(ns, 'mode order', 5);
		// irgendwo müssen wir anfangen, nodes sind am leichtesten abzuschätzen
		while (hn.numNodes() <= opt.nodes) {
			await debugMSG(ns, 'order: nodes kaufen', 5);
			let cost = hn.getPurchaseNodeCost()
			if (hn.purchaseNode() !== -1) {
				budget -= cost;
			} else {
				await ns.sleep(wait4Money);
			}
		}

		//nodes sind fertig, jetzt bestandsaufnahme für die anderen 3 machen
		let sumLevel = 0, sumRam = 0, sumCores = 0;
		for (let i = 0; i < hn.numNodes(); i++) {
			sumLevel += hn.getNodeStats(i).level;
			sumRam += hn.getNodeStats(i).ram;
			sumCores += hn.getNodeStats(i).cores;
		}
		let divLevel = Math.max(opt.level - sumLevel, 0);
		let divRam = Math.max(opt.ram - sumRam, 0);
		let divCores = Math.max(opt.cores - sumCores, 0);


		await debugMSG(ns, 'order: bestandsaufnahme: L' + divLevel + ', R' + divRam + ' und C' + divCores, 5);

		// weiter mit ram und cores kaufen, 
		while (divRam > 0 || divCores > 0) {
			await debugMSG(ns, 'order: Ram & cores kaufen', 5);
			// prüfen was die günstigste option ist: ram kaufen, cores kaufen oder ne node kaufen
			// (die node bringt ja wieder +1 ram, +1 cores und +1 level)
			let wasKleinstePreis = hn.getPurchaseNodeCost();
			let category = 'node', node;

			for (let i = 0; i < hn.numNodes(); i++) {
				if (divRam > 0 && hn.getNodeStats(i).ram < 64) {
					await debugMSG(ns, 'order: ram kaufen?', 5);
					// ram verdoppelt sich bei jedem kauf, da ist die gewichtung anders
					if (hn.getRamUpgradeCost(i) / Math.min(divRam, hn.getNodeStats(i).ram) < wasKleinstePreis) {
						category = 'ram';
						node = i;
						wasKleinstePreis = hn.getRamUpgradeCost(i)
					}
				}
				if (divCores > 0) {
					await debugMSG(ns, 'order: cores kaufen?', 5);
					if (hn.getCoreUpgradeCost(i) < wasKleinstePreis) {
						category = 'ram';
						node = i;
						wasKleinstePreis = hn.getCoreUpgradeCost(i)
					}
				}
			}

			// ab hier wissen wir was wir kaufen wollen: node, ram oder cores (category)
			switch (category) {
				case 'node':
					await debugMSG(ns, 'order: node kaufen', 5);
					if (hn.purchaseNode() !== -1) {
						divRam--; divCores--; divLevel--;
						budget -= wasKleinstePreis;
					} else {
						// geld reicht nicht --> etwas warten
						await ns.sleep(wait4Money)
					}
					break;
				case 'ram':
					await debugMSG(ns, 'order: ram kaufen', 5);
					if (hn.upgradeRam(node)) {
						divRam -= hn.getNodeStats(node).ram;
						budget -= wasKleinstePreis;
					} else {
						// geld reicht nicht --> etwas warten
						await ns.sleep(wait4Money)
					}
					break;
				case 'cores':
					await debugMSG(ns, 'order: core kaufen', 5);
					if (hn.upgradeCore(node)) {
						divCores--;
						budget -= wasKleinstePreis;
					} else {
						// geld reicht nicht --> etwas warten
						await ns.sleep(wait4Money)
					}
					break;
			}
		} // end:: while (divRam > 0 || divCores > 0)

		// zum abschluss die level
		while (divLevel > 0) {
			await debugMSG(ns, 'order: level kaufen (noch ' + divLevel + ')', 5);
			// hier prüfen auf welcher node das level am günstigsten ist
			let wasKleinstePreis = Number.MAX_SAFE_INTEGER;
			let node;
			for (let i = 0; i < hn.numNodes(); i++) {
				await debugMSG(ns, 'order: level kaufen1 i=' + i + ' cost:' + hn.getLevelUpgradeCost(i));
				if (hn.getLevelUpgradeCost(i) < wasKleinstePreis) {
					node = i;
					wasKleinstePreis = hn.getLevelUpgradeCost(i)
					await debugMSG(ns, 'order: level kaufen2 i=' + node);
				}
			}
			// und kaufen

			await debugMSG(ns, 'order: level kurz vorm kaufen node=' + node, 5);
			if (hn.upgradeLevel(node)) {
				divLevel--;
				budget -= wasKleinstePreis;
			} else {
				// geld reicht nicht --> etwas warten
				await ns.sleep(wait4Money)
			}
		}
	} // end:: if (opt.mode === 'order')

	if (opt.mode === 'free' || opt.mode === 'freeOverOrder') {
		await debugMSG(ns, 'mode: free', 1);
		// nur wenn noch geld da ist, mit der prüfung *allein* wird es unscharf und mehr geld ausgegeben als geplant
		while (budget > 0) {
			await debugMSG(ns, 'free: ###### budget: ' + budget, 0.1);
			let wasBesteOption = hn.getPurchaseNodeCost() / 1.5;
			let category = 'node', node;

			for (let i = 0; i < hn.numNodes(); i++) {
				let levelAnteil = hn.getNodeStats(i)['level'] * 1.5;
				let ramAnteil = 1.035 ** (hn.getNodeStats(i)['ram'] - 1);
				let coreAnteil = (hn.getNodeStats(i)['cores'] + 5) / 6;

				if (hn.getNodeStats(i).level < maxLevel && hn.getLevelUpgradeCost(i) / (1.5 * ramAnteil * coreAnteil) < wasBesteOption) {
					wasBesteOption = hn.getLevelUpgradeCost(i) / (1.5 * ramAnteil * coreAnteil);
					category = 'level';
					node = i;
				}
				if (hn.getNodeStats(i).ram < maxRam && hn.getRamUpgradeCost(i) / (levelAnteil * (1.035 ** (2 * hn.getNodeStats(i)['ram'] - 1) - ramAnteil) * coreAnteil) < wasBesteOption) {
					wasBesteOption = hn.getRamUpgradeCost(i) / (levelAnteil * (1.035 ** (2 * hn.getNodeStats(i)['ram'] - 1) - ramAnteil) * coreAnteil);
					category = 'ram';
					node = i;
				}
				if (hn.getNodeStats(i).cores < maxCore && hn.getCoreUpgradeCost(i) / (levelAnteil * ramAnteil * (1 / 6)) < wasBesteOption) {
					wasBesteOption = hn.getCoreUpgradeCost(i) / (levelAnteil * ramAnteil * (1 / 6));
					category = 'cores';
					node = i;
				}
			}

			await debugMSG(ns, 'free: best option ' + category + (node ? ' at ' + node : ''), 0.1);
			let cost, msg, wait;
			switch (category) {
				case 'node':
					cost = hn.getPurchaseNodeCost();
					msg = ': buy node for ' + cost
					if (hn.purchaseNode() !== -1) {
						msg = 'SUCCESS' + msg;
						wait = false;
					} else {
						// geld reicht nicht --> etwas warten
						msg = 'ERROR' + msg;
						wait = true;
					}
					break;
				case 'ram':
					cost = hn.getRamUpgradeCost(node);
					msg = ': buy ram at '+node+' for ' + cost
					if (hn.upgradeRam(node)) {
						msg = 'SUCCESS' + msg;
						wait = false;
					} else {
						// geld reicht nicht --> etwas warten
						msg = 'ERROR' + msg;
						wait = true;
					}
					break;
				case 'cores':
					cost = hn.getCoreUpgradeCost(node);
					msg = ': buy cores at '+node+' for ' + cost
					if (hn.upgradeCore(node)) {
						msg = 'SUCCESS' + msg;
						wait = false;
					} else {
						// geld reicht nicht --> etwas warten
						msg = 'ERROR' + msg;
						wait = true;
					}
					break;
				case 'level':
					cost = hn.getLevelUpgradeCost(node);
					msg = ': buy level at '+node+' for ' + cost
					if (hn.upgradeLevel(node)) {
						msg = 'SUCCESS' + msg;
						wait = false;
					} else {
						// geld reicht nicht --> etwas warten
						msg = 'ERROR' + msg;
						wait = true;
					}
					break;
			}
			await debugMSG(ns, msg, 0.1);
			if (wait) await ns.sleep(wait4Money)
			budget -= cost;
			// fertsch, geld sollteverbarucht sein, oder zielsetzung erreicht
			await debugMSG(ns, 'free: ###### last budget: ' + budget, 0.1);
		}
	}
	// formeln zum annähern:
	// Produktion_gesamt = RUNDEN((currentLevel*1,5)*(1,035^(currentRam-1))*((currentCores+5)/6);3)
	// oder levelAnteil = (currentLevel*1,5)      ==> beim Update: 1,5
	//      ramAnteil   = (1,035^(currentRam-1))  ==> beim Update: ((1,035^(2*currentRam-1))-(1,035^(currentRam-1)))
	//      coreAnteil  = ((currentCores+5)/6)    ==> beim Update: 1/6

}

