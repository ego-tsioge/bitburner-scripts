/**
 * Automatisiert den Aufbau des Hacknet-Netzwerks für die Netburner Faction.
 * Kauft und upgraded Nodes auf kostengünstigste Weise, um die Mindestanforderungen zu erreichen.
 *
 * Netburner Hardware-Anforderungen (Summe aller Nodes):
 * - Level: 100 gesamt
 * - RAM: 8 GB gesamt
 * - Cores: 4 gesamt
 *
 * Hinweis: Hacking-Level (80) wird nicht durch dieses Skript erreicht.
 *
 * @param {NS} ns - Netscript API
 */
export async function main(ns) {
    // Netburner Hardware-Anforderungen
    const NETBURNER_REQS = {
        totalLevel: 100,    // Summe aller Node-Level
        totalRam: 8,        // Summe des RAMs aller Nodes
        totalCores: 4       // Summe aller Cores
    };

    // Berechnet den Ertrag einer Node basierend auf Level, RAM und Cores
    function calculateNodeProduction(level, ram, cores) {
        const levelFactor = level * 1.5;
        const ramFactor = Math.pow(1.035, ram - 1);
        const coreFactor = (cores + 5) / 6;
        return levelFactor * ramFactor * coreFactor;
    }

    // Prüft die aktuellen Gesamtwerte aller Nodes
    function getCurrentTotals() {
        const nodes = ns.hacknet.numNodes();
        let totals = {
            nodes: nodes,
            level: 0,
            ram: 0,
            cores: 0
        };

        for (let i = 0; i < nodes; i++) {
            const stats = ns.hacknet.getNodeStats(i);
            totals.level += stats.level;
            totals.ram += stats.ram;
            totals.cores += stats.cores;
        }

        return totals;
    }

    function getBestUpgrade(currentTotals) {
        let bestUpgrade = null;

        // Neue Node prüfen
        const nodeCost = ns.hacknet.getPurchaseNodeCost();
        const newNodeProduction = calculateNodeProduction(1, 1, 1);
        const nodeROI = newNodeProduction / nodeCost;
        bestUpgrade = {
            type: 'node',
            index: -1,
            cost: nodeCost,
            roi: nodeROI
        };

        // Existierende Nodes prüfen
        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
            const stats = ns.hacknet.getNodeStats(i);
            const currentProduction = calculateNodeProduction(stats.level, stats.ram, stats.cores);

            // Level Upgrade (nur wenn noch Level benötigt)
            if (currentTotals.level < NETBURNER_REQS.totalLevel) {
                const levelCost = ns.hacknet.getLevelUpgradeCost(i, 1);
                const levelProduction = calculateNodeProduction(stats.level + 1, stats.ram, stats.cores);
                const levelROI = (levelProduction - currentProduction) / levelCost;
                if (levelROI > bestUpgrade.roi || (levelROI === bestUpgrade.roi && levelCost < bestUpgrade.cost)) {
                    bestUpgrade = {
                        type: 'level',
                        index: i,
                        cost: levelCost,
                        roi: levelROI
                    };
                }
            }

            // RAM Upgrade (nur wenn noch RAM benötigt)
            if (currentTotals.ram < NETBURNER_REQS.totalRam) {
                const ramCost = ns.hacknet.getRamUpgradeCost(i, 1);
                const ramProduction = calculateNodeProduction(stats.level, stats.ram * 2, stats.cores);
                const ramROI = (ramProduction - currentProduction) / ramCost;
                if (ramROI > bestUpgrade.roi || (ramROI === bestUpgrade.roi && ramCost < bestUpgrade.cost)) {
                    bestUpgrade = {
                        type: 'ram',
                        index: i,
                        cost: ramCost,
                        roi: ramROI
                    };
                }
            }

            // Core Upgrade (nur wenn noch Cores benötigt)
            if (currentTotals.cores < NETBURNER_REQS.totalCores) {
                const coreCost = ns.hacknet.getCoreUpgradeCost(i, 1);
                const coreProduction = calculateNodeProduction(stats.level, stats.ram, stats.cores + 1);
                const coreROI = (coreProduction - currentProduction) / coreCost;
                if (coreROI > bestUpgrade.roi || (coreROI === bestUpgrade.roi && coreCost < bestUpgrade.cost)) {
                    bestUpgrade = {
                        type: 'core',
                        index: i,
                        cost: coreCost,
                        roi: coreROI
                    };
                }
            }
        }

        return bestUpgrade;
    }

    // Erste Node kaufen wenn nötig
    if (ns.hacknet.numNodes() === 0) {
        const nodeIndex = ns.hacknet.purchaseNode();
        if (nodeIndex === -1) {
            ns.tprint('ERROR: Kauf der ersten Hacknet Node fehlgeschlagen (nicht genug Geld?)');
            return;
        }
        ns.print('INFO: Erste Hacknet Node gekauft');
    }

    // Hauptschleife
    while (true) {
        const totals = getCurrentTotals();

        // Prüfen ob Ziele erreicht
        if (totals.level >= NETBURNER_REQS.totalLevel &&
            totals.ram >= NETBURNER_REQS.totalRam &&
            totals.cores >= NETBURNER_REQS.totalCores) {
            ns.print('ERFOLG: Alle Hardware-Anforderungen erfüllt!');
            break;
        }

        // Beste Upgrade-Option finden und ausführen wenn genug Geld da ist
        const upgrade = getBestUpgrade(totals);
        let success = false;

        if (ns.getServerMoneyAvailable('home') >= upgrade.cost) {
            switch (upgrade.type) {
                case 'node':
                    success = ns.hacknet.purchaseNode() !== -1;
                    break;
                case 'level':
                    success = ns.hacknet.upgradeLevel(upgrade.index, 1);
                    break;
                case 'ram':
                    success = ns.hacknet.upgradeRam(upgrade.index, 1);
                    break;
                case 'core':
                    success = ns.hacknet.upgradeCore(upgrade.index, 1);
                    break;
            }
        }

        // Status ausgeben
        ns.clearLog();
        ns.print(`Nodes: ${totals.nodes}`);
        ns.print(`Total Level: ${totals.level}/${NETBURNER_REQS.totalLevel}`);
        ns.print(`Total RAM: ${totals.ram}/${NETBURNER_REQS.totalRam}`);
        ns.print(`Total Cores: ${totals.cores}/${NETBURNER_REQS.totalCores}`);
        ns.print('---');
        ns.print(`Nächstes Upgrade: ${upgrade.type}${upgrade.index !== -1 ? ' (Node ' + upgrade.index + ')' : ''}`);
        ns.print(`Kosten: ${ns.formatNumber(upgrade.cost)}${success ? ' - Upgrade erfolgreich!' : ''}`);

        await ns.sleep(1000);
    }
}
