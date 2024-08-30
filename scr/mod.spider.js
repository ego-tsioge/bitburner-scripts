import { settings, timeStamp } from "./lib.helpers.js";

/** 
 * dieses script soll idealerweise alle verfügbaren server finden und in den **"settings"** merken
 * @param {NS} ns */
export async function main(ns) {
	const options = ns.flags([
		['botnetName', settings.botnetName],	// default botnetName
		['help', false],			// a default boolean means this flag is a boolean
		['nextScript', undefined]
	]);
	if (options.help) {
		let info = "INFO: dieses script erfasst die server die sich als Bots eignen und sammelt daten über sie. Gleichzeitig werden schon mal weaken, grow und hack verteilt.";
		ns.tprint(info);
		return 0
	}

	// wirklicher start ***************************************************************
	ns.tprint(`[${timeStamp()}] Starte Skript '${ns.getScriptName()}'`)

	// Plan:: erstmal feststellen wieviele Cracks zur verfügung stehen, wichtig um
	// später auszusortieren ob der Server als Bot benutzt werden kann 
	const cracks = new Map([  // alle cracks im spiel
		["BruteSSH.exe", ns.brutessh],
		["FTPCrack.exe", ns.ftpcrack],
		["relaySMTP.exe", ns.relaysmtp],
		["HTTPWorm.exe", ns.httpworm],
		["SQLInject.exe", ns.sqlinject]]);
	let numCracks = 0;		// verfügbare (erspielte) cracks
	for (let crack of cracks) {
		if (ns.fileExists(crack[0], 'home')) numCracks++;
	}

	// Plan:: dann alle server durchgehen und bots rekrutieren und daten über sie sammeln
	const botNet = { bots: {}, lastUpdate: new Date().getTime() }
	{
		let visited = [];
		let speicher = new Map().set('home', []);

		//solange noch was im speicher liegt
		while (speicher.size > 0) {
			// ermittle das erste element im speicher
			let [node] = speicher.keys();
			let [parent] = speicher.values();
			// entferne das element aus dem Speicher
			speicher.delete(node);

			//prüfe ob wir es noch NICHT angeschaut haben
			if (!visited.includes(node)) {
				//wenn ja, merke es als angeschaut
				visited.push(node);
				// und alle nachbarn in den speicher legen
				let children = ns.scan(node);
				if (children[0] === parent) { children.shift(); } // aber parent-teil auslassen
				for (let child of children) {
					speicher.set(child, node);
				}

				// prüfe ab wir Node zum hacken nutzen können
				// kriterien:
				// - wir können die notwendigen ports öffnen um nuke.exe zu starten
				// - home ausschließen
				if (numCracks >= ns.getServerNumPortsRequired(node) && node !== "home") {
					// prüfe auch ob wir schon rootRechte haben
					if (!ns.hasRootAccess(node)) {
						// wenn nicht, gehe unsere cracks duch und führe sie aus
						for (let crack of cracks) {
							if (ns.fileExists(crack[0], 'home')) {
								crack[1](node);
							}
						}
						// anschliesend führe NUKE aus
						ns.nuke(node);
					}

					// sicherheitshalber die Scripte kopieren (überschreibt die alten)
					await ns.scp(["bin.grow.js", "bin.hack.js", "bin.weak.js"], node, "home");

					// !!noch ein paar mehr daten sammeln?
					let needGrows = ns.getServerMaxMoney(node) !== ns.getServerMoneyAvailable(node);
					let growCount = (ns.getServerMaxMoney(node) === ns.getServerMoneyAvailable(node)) ? 0 : Math.ceil(ns.growthAnalyze(node, ns.getServerMaxMoney(node) / ns.getServerMoneyAvailable(node)) * 100) / 100;
					let weakCount = Math.ceil((ns.getServerSecurityLevel(node) - ns.getServerMinSecurityLevel(node)) * 20 * 100) / 100;
					let needWeakens = weakCount > 0;
					let isReady = !needGrows && !needWeakens;

					// und dann in unserem botnet aufnehmen
					botNet.bots[node] = {
						name: node,
						ports: ns.getServerNumPortsRequired(node),
						hackingLevel: ns.getServerRequiredHackingLevel(node),
						maxMoney: ns.getServerMaxMoney(node),
						growth: ns.getServerGrowth(node),
						growCount: growCount,
						weakCount: weakCount,
						isReady: isReady,
						needGrows: needGrows,
						needWeakens: needWeakens,
						minSecurityLevel: ns.getServerMinSecurityLevel(node),
						baseSecurityLevel: ns.getServerBaseSecurityLevel(node),
						maxRam: ns.getServerMaxRam(node),
						files: ns.ls(node),
						children: children,
						parent: parent,
					}

				} // end if (hackable?)
			}
		} // end while (spider)
	}
	// Plan:: botnet in settings ablegen und ggf. nächstes script starten
	settings.setItem(options.botnetName, botNet);

	if (options._[0]) { options.nextScript = options._[0] }
	if (options.nextScript) {
		ns.tprint(`[${timeStamp()}] Übergebe an Skript '${options.nextScript}'`)
		ns.spawn(options.nextScript, { threads: 1, spawnDelay: settings.spawnDelay })
	} else {
		ns.tprint(`[${timeStamp()}] Beende Skript '${ns.getScriptName()}. Stop.'`)
	}
}


