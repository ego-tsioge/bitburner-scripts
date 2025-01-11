/** @param {NS} ns */
export async function main(ns) {
    // Logging minimieren um RAM zu sparen
    ns.disableLog('getServerMoneyAvailable');
    ns.disableLog('sleep');

    // Konfiguration
    const config = {
        targetLevel: 100,        // Für Netburner-Qualifikation
        moneyThreshold: 0.1,     // Nur 10% des verfügbaren Geldes ausgeben
        waitTime: 1000,          // 1 Sekunde Wartezeit zwischen Checks
    };

    while (true) {
        const nodes = ns.hacknet.numNodes();
        const playerMoney = ns.getServerMoneyAvailable('home');

        // Erst neuen Node kaufen wenn mindestens einer existiert und Level 10 hat
        if (nodes === 0 || (nodes < 3 && ns.hacknet.getNodeStats(0).level >= 10)) {
            const cost = ns.hacknet.getPurchaseNodeCost();
            if (cost <= playerMoney * config.moneyThreshold) {
                ns.hacknet.purchaseNode();
                ns.print('INFO: Neuer Hacknet-Node gekauft');
            }
        }

        // Bestehende Nodes upgraden
        for (let i = 0; i < nodes; i++) {
            const stats = ns.hacknet.getNodeStats(i);

            // Stoppen wenn Ziel-Level erreicht
            if (stats.level >= config.targetLevel) continue;

            // Level upgraden wenn möglich
            const levelCost = ns.hacknet.getLevelUpgradeCost(i, 1);
            if (levelCost <= playerMoney * config.moneyThreshold) {
                ns.hacknet.upgradeLevel(i, 1);
                ns.print(`INFO: Node ${i} auf Level ${stats.level + 1} verbessert`);
            }
        }

        await ns.sleep(config.waitTime);
    }
}
