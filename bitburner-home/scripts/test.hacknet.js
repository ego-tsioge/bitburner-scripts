/**
 * Test-Skript für Hacknet-Automatisierung. Zeigt beste Upgrades an ohne zu kaufen.
 * Kopiert von mod.hacknet.js mit zusätzlicher ROI-Anzeige.
 *
 * @param {NS} ns - Netscript API
 */
export async function main(ns) {
    ns.disableLog('ALL');  // Disable default logging
    ns.tail();             // Open log window

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

        // Phase 1: Nodes, RAM und Cores
        if (currentTotals.ram < NETBURNER_REQS.totalRam ||
            currentTotals.cores < NETBURNER_REQS.totalCores) {

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

                // RAM Upgrade
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

                // Core Upgrade
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
        }
        // Phase 2: Level auffüllen
        else if (currentTotals.level < NETBURNER_REQS.totalLevel) {
            // Erste Node als Basis
            const stats = ns.hacknet.getNodeStats(0);
            const currentProduction = calculateNodeProduction(stats.level, stats.ram, stats.cores);
            const levelCost = ns.hacknet.getLevelUpgradeCost(0, 1);
            const levelProduction = calculateNodeProduction(stats.level + 1, stats.ram, stats.cores);
            const levelROI = (levelProduction - currentProduction) / levelCost;
            bestUpgrade = {
                type: 'level',
                index: 0,
                cost: levelCost,
                roi: levelROI
            };

            // Restliche Nodes prüfen
            for (let i = 1; i < ns.hacknet.numNodes(); i++) {
                const stats = ns.hacknet.getNodeStats(i);
                const currentProduction = calculateNodeProduction(stats.level, stats.ram, stats.cores);
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
        }

        return bestUpgrade;
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

        // Status ausgeben
        ns.clearLog();
        ns.print(`Nodes: ${totals.nodes} | Level: ${totals.level}/${NETBURNER_REQS.totalLevel} | RAM: ${totals.ram}/${NETBURNER_REQS.totalRam} | Cores: ${totals.cores}/${NETBURNER_REQS.totalCores}`);

        // Phase und neue Node ROI
        const phase = (totals.ram < NETBURNER_REQS.totalRam || totals.cores < NETBURNER_REQS.totalCores) ? '1' : '2';
        const nodeCost = ns.hacknet.getPurchaseNodeCost();
        const newNodeROI = calculateNodeProduction(1, 1, 1) / nodeCost;
        ns.print(`Phase ${phase} | Neue Node ROI: ${newNodeROI.toExponential(2)}`);

        // ROIs für jede Node
        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
            const stats = ns.hacknet.getNodeStats(i);
            const currentProduction = calculateNodeProduction(stats.level, stats.ram, stats.cores);

            const levelROI = (calculateNodeProduction(stats.level + 1, stats.ram, stats.cores) - currentProduction) / ns.hacknet.getLevelUpgradeCost(i, 1);
            const ramROI = (calculateNodeProduction(stats.level, stats.ram * 2, stats.cores) - currentProduction) / ns.hacknet.getRamUpgradeCost(i, 1);
            const coreROI = (calculateNodeProduction(stats.level, stats.ram, stats.cores + 1) - currentProduction) / ns.hacknet.getCoreUpgradeCost(i, 1);

            ns.print(`Node ${i}: L:${levelROI.toExponential(2)} R:${ramROI.toExponential(2)} C:${coreROI.toExponential(2)}`);
        }

        // Beste Option
        const upgrade = getBestUpgrade(totals);
        if (upgrade) {
            ns.print(`Beste Option: ${upgrade.type}${upgrade.index !== -1 ? ' (Node ' + upgrade.index + ')' : ''} | Kosten: ${ns.formatNumber(upgrade.cost)} | ROI: ${upgrade.roi.toExponential(2)}`);
        } else {
            ns.print('Kein Upgrade verfügbar');
        }

        // Aktuelle Gesamtproduktion berechnen
        let totalProduction = 0;
        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
            const stats = ns.hacknet.getNodeStats(i);
            totalProduction += calculateNodeProduction(stats.level, stats.ram, stats.cores);
        }

        // Lebenszeichen und Wartezeit
        const signals = ['-', '\\', '|', '/'];
        const currentMoney = ns.getServerMoneyAvailable('home');
        const waitTime = upgrade ? Math.max(0, (upgrade.cost - currentMoney) / totalProduction) : 0;
        const minutes = Math.floor(waitTime / 60);
        const seconds = Math.floor(waitTime % 60);
        ns.print(`${signals[Math.floor(Date.now() / 1000) % signals.length]} | Wartezeit: ${minutes}m ${seconds}s`);

        await ns.sleep(1000);
    }
}
