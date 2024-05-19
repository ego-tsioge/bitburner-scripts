const argsSchema = [
	['target', ''],
	['threads', 1],
	['loops', 1],
	['delay', undefined],
	['help', false],
];
/* ----------------------------------------------------------------------- *//**
 * bin.grow.js
 *
 * bekommt spielintern einen parameter als string übergeben und führt den befehl
 * ns.grow() aus
 * @todo eingangsparameter prüfen?
 *
 * @param {ns} ns
 * -------------------------------------------------------------------------- */
export async function main(ns) {
	const opt = ns.flags(argsSchema);
	if (opt.help) {
		let info = "INFO: Führt den befehl *ns.grow()* aus. Parameter sind:\n"
		info += " * target: das ziel zum schröpfen\n * loop: wiederholungen (incl. infinity)\n"
		info += " * delay: wenn der angriff verzögert werden soll (nur im ersten loop)\n";
		info += " * threads: anzahl der threads für den befehl ";
		ns.tprint(info);
		return 0
	}

	let target = opt.target;
	let threads = opt.threads;
	let loops = opt.loops;
	let delay = opt.delay;
	ns.print('loops ' + loops)
	if (opt._.length > 0) { target = opt._[0] }
	if (opt._.length > 1) { threads = opt._[1] }
	if (opt._.length > 2) { loops = opt._[2] }
	if (opt._.length > 3) { delay = opt._[3] }

	if (opt._.length === 0 || target === undefined) {
		ns.tprint("ERROR: es wird mindestebs der erste Parameter für das Ziel benötigt.");
		ns.tprint(info);
		return -1;
	}

	if (delay && delay > 0) { ns.sleep(delay) }
	while (loops > 0) {
		ns.print(`Starting operation: grow on ${target} in ${threads} threads.`);
		await ns.grow(target, { threads: threads, });
		loops--;
	}
}

export function autocomplete(data, args) {
	const f = data.flags(argsSchema);
	return [...data.servers];
}

/** @param {NS} ns 
 * Wait until an appointed time and then execute a grow. 
 * https://github.com/alainbryden/bitburner-scripts/blob/main/Remote/grow-target.js
export async function G_main(ns) {
	//args[0: target, 1: desired start time, 2: expected end, 3: expected duration, 4: description, 5: manipulate stock, 6: loop]
	const sleepDuration = ns.args.length > 1 ? ns.args[1] - Date.now() : 0;
	const expectedDuration = ns.args.length > 3 ? ns.args[3] : 0;
	const manipulateStock = ns.args.length > 5 && ns.args[5] ? true : false;
	const loop = ns.args.length > 6 ? ns.args[6] : false;
	const cycleTime = expectedDuration / 3.2 * 4;
	if (sleepDuration > 0)
		await ns.sleep(sleepDuration);
	do {
		await ns.grow(ns.args[0], { stock: manipulateStock });
		if (loop) await ns.sleep(cycleTime - expectedDuration);
	} while (loop);
}
*/