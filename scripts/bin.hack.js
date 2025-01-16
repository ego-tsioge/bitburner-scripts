/**
 * HACK Operation für einen Server.
 * @param {NS} ns
 * @param {string} args[0] - Zielserver
 * @param {number} [args[1]] - Verzögerung in ms
 * @param {number} [args[2]] - Anzahl Wiederholungen (default: 1)
 */
export async function main(ns) {
    const [target, delay = 0, loops = 1] = ns.args;
    if (!target) throw new Error('Zielserver fehlt');

    if (delay > 0) await ns.sleep(delay);

    for (let i = 0; i < loops; i++) {
        await ns.hack(target);
    }
}
