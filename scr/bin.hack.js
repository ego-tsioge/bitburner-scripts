const argsSchema = [
	['target', ''],
	['threads', 1],
	['loops', 1],
	['delay', undefined],
	['help', false],
];
/* ----------------------------------------------------------------------- *//**
 * bin.hack.js
 *
 * bekommt spielintern einen parameter als string übergeben und führt den befehl
 * ns.hack() aus
 * @todo eingangsparameter prüfen?
 *
 * @param {ns} ns
 * -------------------------------------------------------------------------- */
export async function main(ns) {
	const opt = ns.flags(argsSchema);
	if (opt.help) {
		let info = "INFO: Führt den befehl *ns.hack()* aus. Parameter sind:\n"
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
		ns.print(`Starting operation: hack on ${target} in ${threads} threads.`);
		await ns.hack(target, { threads: threads, });
		loops--;
	}
}

export function autocomplete(data, args) {
	const f = data.flags(argsSchema);
	return [...data.servers];
}
