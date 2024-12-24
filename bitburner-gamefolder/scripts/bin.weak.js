/**
 * Minimales Weaken-Script für Server-Operationen
 * @param {NS} ns - Bitburner Netscript API
 * @param {string} ns.args[0] - Ziel-Server
 * @param {number} [ns.args[1]] - Optionale Verzögerung in ms
 * @throws {Error} Wenn kein Ziel-Server angegeben wurde
 * @ram 1.7GB - Basis + weaken Operation
 */
export async function main(ns) {
	const [target, delay = 0] = ns.args;
	if (!target) {
		throw new Error("Kein Ziel-Server angegeben!");
	}
	
	if (delay > 0) {
		await ns.sleep(delay);
	}
	
	await ns.weaken(target);
} 