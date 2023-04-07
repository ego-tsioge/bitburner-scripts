//ego_hack.js
export async function main(ns) {
    // Definiert den "Zielserver"
    var target = ns.args[0];

    // Definiert wie viel Geld ein Server haben sollte bevor wir ihn Hacken
    // In unserem Fall also auf 75% von dem maximalen Geld des Servers
    var moneyThresh = ns.getServerMaxMoney(target) * 0.75;

    // Definiert die maximale Sicherheitsstufe, die dieser Server erreichen kann
    // Wenn diese Stufe zu hoch ist werden wir ihn 
    // "weaken" also schwächen, bevor wir loshacken
    var securityThresh = ns.getServerMinSecurityLevel(target) + 5;

    // Das ist eine Endlose Schleife die den Zielserver kontinuierlich schwächt
    while(true) {
        if (ns.getServerSecurityLevel(target) > securityThresh) {
            // Wenn die Sichherheitsstufe über unserem Schwellenwert liegt, dann schwächen wir diese ab
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            // Wenn das Geld vom anvisierten Server unter unserem Schwellenwert liegt, dannn vergrößern wir es
            await ns.grow(target);
        } else {
            // Otherwise, hack it
            await ns.hack(target);
        }
    }

}