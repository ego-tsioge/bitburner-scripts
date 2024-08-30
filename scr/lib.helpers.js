/* ----------------------------------------------------------------------- *//**
 * eine Klasse um die konfiguration zu verwalten. 
 * 
 * in data werden die defaultwerte gesetzt
 * @todo erstmal nur ein anonymer getter in setItem 
 * -------------------------------------------------------------------------- */
export class settings {
	/**
	 * defaultwerte
	 */
	static #data = {
		debug: false,
		reservedHomeRam: 8,
		target: 'n00dles',
		botnetName: 'botnet',
		files: {
			'basis': 'basis.js',
			'growing': 'scr/bin.grow.js',
			'hacking': 'scr/bin.hack.js',
			'weaking': 'scr/bin.weak.js',
			'do': 'doProcess.js',
			'git-init': 'git-init.js',
			'lib.helpers': 'scr/lib.helpers.js',
			'lib.server': 'scr/lib.server.js',
			'lib.starter': 'scr/lib.starter.js',
			'aufklaeren': 'scr/mod.spider.js',
			'vorbereiten': 'scr/mod.prepareTarget.js'
			'mon': 'scr/mon.js',
			'orig.lib.helpers': 'scr/orig.lib.helpers.js'
		},
		spawnDelay: 50,
		pref: 'ego_',
	}

	static get reservedHomeRam() {
		if (JSON.parse(localStorage.getItem(this.#data.pref + "keys")).indexOf("reservedHomeRam") == -1) {
			return this.#data.reservedHomeRam;
		}
		else {
			return JSON.parse(localStorage.getItem(this.#data.pref + "reservedHomeRam"));
		}
	}

	static get target() {
		if (JSON.parse(localStorage.getItem(this.#data.pref + "keys")).indexOf("target") == -1) {
			return this.#data.target;
		}
		else {
			return JSON.parse(localStorage.getItem(this.#data.pref + "target"));
		}
	}

	static get botnet() {
		if (JSON.parse(localStorage.getItem(this.#data.pref + "keys")).indexOf("botnet") == -1) {
			return this.#data.botnet;
		}
		else {
			return JSON.parse(localStorage.getItem(this.#data.pref + "botnet"));
		}
	}
	static get files() { return this.#data.files; }
	static get spawnDelay() {
		if (JSON.parse(localStorage.getItem(this.#data.pref + "keys")).indexOf("spawnDelay") == -1) {
			return this.#data.spawnDelay;
		}
		else {
			return JSON.parse(localStorage.getItem(this.#data.pref + "spawnDelay"));
		}
	}


	/**
	 * ruft einen wert gemäß **key** aus *localStorage* ab -> gibts den nicht 
	 * wird ein defaultwert (*data*) oder undefined geliefert 
	 * 
	 * @param {string} key schlüsselwort für KV-Speicher
	 */
	static getItem(key) {
		let item = localStorage.getItem(this.#data.pref + key);

		try {
			item = JSON.parse(item)
		} catch (e) {
			item = this.#data[key]
		}

		return item ? item : undefined
	}

	/**
	 * setzt den wert (**value**) gemäß **key** im *localStorage*
	 * 
	 * @param {string} key schlüsselwort für KV-Speicher
	 * @param {object} value wert für KV-Speicher
	 */
	static setItem(key, value) {
		localStorage.setItem(this.#data.pref + key, JSON.stringify(value));
		this.#setMyKeys(key);

		// anonymer getter, ich bin gespannt auf die fehler die dadurch entstehen
		// zumindest die beschreibung mit jsdoc wird darunter leiden
		if (!this.hasOwnProperty(key)) {
			Object.defineProperty(this, key, {
				get() {
					return JSON.parse(localStorage.getItem(this.#data.pref + key));
				}
			});
		}
	}

	/**
	 * löscht **key** aus *localStorage*
	 * 
	 * @param {string} key schlüsselwort für KV-Speicher
	 */
	static resetItem(key) {
		localStorage.removeItem(key);
		this.#setMyKeys(key, true);
	}

	static #setMyKeys(key, remove = false) {
		let newKeys = new Set(JSON.parse(localStorage.getItem(this.#data.pref + "keys")));
		if (remove == true) {
			newKeys.delete(key);
			localStorage.removeItem(this.#data.pref + key);
		} else {
			newKeys.add(key)
		}
		newKeys = Array.from(newKeys);
		localStorage.setItem(this.#data.pref + "keys", JSON.stringify(newKeys));
	}
}

export function timeStamp(time = 0) {
	if (!time) {
		time = new Date();
	} else {
		time = new Date(time);
	}

	return time.toLocaleTimeString() + "," + time.getMilliseconds();
}

export async function debugMSG(ns, msg, delay = 0) {
	if (settings.debug) {
		let text = 'INFO: ' + msg;
		if (delay > 0) text += '; wartet noch ' + delay + ' sec.'
		ns.tprint(text);
		if (delay > 0) await ns.sleep(delay * 1000)
	}

}

export function terminal(ns, command) {
	const doc = globalThis["document"];
	// Acquire a reference to the terminal text field
	const terminalInput = doc.getElementById("terminal-input");

	// Set the value to the command you want to run.
	terminalInput.value = command;

	// Get a reference to the React event handler.
	const handler = Object.keys(terminalInput)[1];

	// Perform an onChange event to set some internal values.
	terminalInput[handler].onChange({ target: terminalInput });

	// Simulate an enter press
	terminalInput[handler].onKeyDown({ key: 'Enter', preventDefault: () => null });
}

/* ********************************************************************************
 * ** hier folgt das minimum um doProcess.js nutzen zu können, 
 * ** danach folgt nur noch main. 
 * ** Alias:: alias do="run doProcess.js"
 * ** Quelle: https://github.com/jenheilemann/bitburner-scripts/blob/main/README.md
 * ******************************************************************************** */
/** Evaluate an arbitrary ns command by writing it to a new script and then running or executing it.
 * @param {NS} ns - The nestcript instance passed to your script's main entry point
 * @param {string} command - The ns command that should be invoked to get the desired data (e.g. "ns.getServer('home')" )
 * @param {string=} fileName - (default "/Temp/{commandhash}-data.txt") The name of the file to which data will be written to disk by a temporary process
 * @param {args=} args - args to be passed in as arguments to command being run as a new script.
 * @param {bool=} verbose - (default false) If set to true, the evaluation result of the command is printed to the terminal
 */
export async function runCommand(ns, command, fileName, args = [], verbose = false, maxRetries = 5, retryDelayMs = 50) {
	ns.tprint(args);
	checkNsInstance(ns, '"runCommand"');
	if (!verbose) disableLogs(ns, ['run']);
	return await runCommand_Custom(ns, ns.run, command, fileName, args, verbose, maxRetries, retryDelayMs);
}
/** @param {NS} ns 
 * Returns a helpful error message if we forgot to pass the ns instance to a function */
export function checkNsInstance(ns, fnName = "this function") {
	if (ns === undefined || !ns.print) throw new Error(`The first argument to ${fnName} should be a 'ns' instance.`);
	return ns;
}
/** @param {NS} ns **/
export function disableLogs(ns, listOfLogs) { ['disableLog'].concat(...listOfLogs).forEach(log => checkNsInstance(ns, '"disableLogs"').disableLog(log)); }
/**
 * An advanced version of runCommand that lets you pass your own "isAlive" test to reduce RAM requirements (e.g. to avoid referencing ns.isRunning)
 * Importing incurs 0 GB RAM (assuming fnRun, fnWrite are implemented using another ns function you already reference elsewhere like ns.exec)
 * @param {NS} ns - The nestcript instance passed to your script's main entry point
 * @param {function} fnRun - A single-argument function used to start the new sript, e.g. `ns.run` or `(f,...args) => ns.exec(f, "home", ...args)`
 * @param {string} command - The ns command that should be invoked to get the desired data (e.g. "ns.getServer('home')" )
 * @param {string=} fileName - (default "/Temp/{commandhash}-data.txt") The name of the file to which data will be written to disk by a temporary process
 * @param {args=} args - args to be passed in as arguments to command being run as a new script.
 **/
export async function runCommand_Custom(ns, fnRun, command, fileName, args = [], verbose = false, maxRetries = 5, retryDelayMs = 50) {
	checkNsInstance(ns, '"runCommand_Custom"');
	if (!Array.isArray(args)) throw new Error(`args specified were a ${typeof args}, but an array is required.`);
	if (!verbose) disableLogs(ns, ['sleep']);
	// Auto-import any helpers that the temp script attempts to use
	const required = getExports(ns).filter(e => command.includes(`${e}(`));
	let script = (required.length > 0 ? `import { ${required.join(", ")} } from 'helpers.js'\n` : '') +
		`export async function main(ns) { ${command} }`;
	fileName = fileName || `/Temp/${hashCode(command)}-command.js`;
	if (verbose)
		log(ns, `INFO: Using a temporary script (${fileName}) to execute the command:` +
			`\n  ${command}\nWith the following arguments:    ${JSON.stringify(args)}`);
	// It's possible for the file to be deleted while we're trying to execute it, so even wrap writing the file in a retry
	return await autoRetry(ns, async () => {
		// To improve performance, don't re-write the temp script if it's already in place with the correct contents.
		const oldContents = ns.read(fileName);
		if (oldContents != script) {
			if (oldContents) // Create some noise if temp scripts are being created with the same name but different contents
				ns.tprint(`WARNING: Had to overwrite temp script ${fileName}\nOld Contents:\n${oldContents}\nNew Contents:\n${script}` +
					`\nThis warning is generated as part of an effort to switch over to using only 'immutable' temp scripts. ` +
					`Please paste a screenshot in Discord at https://discord.com/channels/415207508303544321/935667531111342200`);
			ns.write(fileName, script, "w");
			// Wait for the script to appear and be readable (game can be finicky on actually completing the write)
			await autoRetry(ns, () => ns.read(fileName), c => c == script, () => `Temporary script ${fileName} is not available, ` +
				`despite having written it. (Did a competing process delete or overwrite it?)`, maxRetries, retryDelayMs, undefined, verbose, verbose);
		}
		// Run the script, now that we're sure it is in place
		return fnRun(fileName, 1 /* Always 1 thread */, ...args);
	}, pid => pid !== 0,
		() => `The temp script was not run (likely due to insufficient RAM).` +
			`\n  Script:  ${fileName}\n  Args:    ${JSON.stringify(args)}\n  Command: ${command}` +
			`\nThe script that ran this will likely recover and try again later once you have more free ram.`,
		maxRetries, retryDelayMs, undefined, verbose, verbose);
}
const _cachedExports = [];
/** @param {NS} ns - The nestcript instance passed to your script's main entry point
 * @returns {string[]} The set of all funciton names exported by this file. */
function getExports(ns) {
	if (_cachedExports.length > 0) return _cachedExports;
	const scriptHelpersRows = ns.read(getFilePath('helpers.js')).split("\n");
	for (const row of scriptHelpersRows) {
		if (!row.startsWith("export")) continue;
		const funcNameStart = row.indexOf("function") + "function".length + 1;
		const funcNameEnd = row.indexOf("(", funcNameStart);
		_cachedExports.push(row.substring(funcNameStart, funcNameEnd));
	}
	return _cachedExports;
}
/** Gets the path for the given local file, taking into account optional subfolder relocation via git-pull.js **/
export function getFilePath(file) {
	const subfolder = '';  // git-pull.js optionally modifies this when downloading
	return pathJoin(subfolder, file);
}
/** Joins all arguments as components in a path, e.g. pathJoin("foo", "bar", "/baz") = "foo/bar/baz" **/
export function pathJoin(...args) {
	return args.filter(s => !!s).join('/').replace(/\/\/+/g, '/');
}
/** Helper to log a message, and optionally also tprint it and toast it
 * @param {NS} ns - The nestcript instance passed to your script's main entry point */
export function log(ns, message = "", alsoPrintToTerminal = false, toastStyle = "", maxToastLength = Number.MAX_SAFE_INTEGER) {
	checkNsInstance(ns, '"log"');
	ns.print(message);
	if (toastStyle) ns.toast(message.length <= maxToastLength ? message : message.substring(0, maxToastLength - 3) + "...", toastStyle);
	if (alsoPrintToTerminal) {
		ns.tprint(message);
		// TODO: Find a way write things logged to the terminal to a "permanent" terminal log file, preferably without this becoming an async function.
		//       Perhaps we copy logs to a port so that a separate script can optionally pop and append them to a file.
		//ns.write("log.terminal.txt", message + '\n', 'a'); // Note: we should get away with not awaiting this promise since it's not a script file
	}
	return message;
}
/** If the argument is an Error instance, returns it as is, otherwise, returns a new Error instance. */
function asError(error) {
	return error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error));
}
/** Helper to retry something that failed temporarily (can happen when e.g. we temporarily don't have enough RAM to run)
 * @param {NS} ns - The nestcript instance passed to your script's main entry point */
export async function autoRetry(ns, fnFunctionThatMayFail, fnSuccessCondition, errorContext = "Success condition not met",
	maxRetries = 5, initialRetryDelayMs = 50, backoffRate = 3, verbose = false, tprintFatalErrors = true) {
	checkNsInstance(ns, '"autoRetry"');
	let retryDelayMs = initialRetryDelayMs, attempts = 0;
	while (attempts++ <= maxRetries) {
		try {
			const result = await fnFunctionThatMayFail()
			const error = typeof errorContext === 'string' ? errorContext : errorContext();
			if (!fnSuccessCondition(result))
				throw asError(error);
			return result;
		}
		catch (error) {
			const fatal = attempts >= maxRetries;
			log(ns, `${fatal ? 'FAIL' : 'INFO'}: Attempt ${attempts} of ${maxRetries} failed` +
				(fatal ? `: ${typeof error === 'string' ? error : error.message || JSON.stringify(error)}` : `. Trying again in ${retryDelayMs}ms...`),
				tprintFatalErrors && fatal, !verbose ? undefined : (fatal ? 'error' : 'info'))
			if (fatal) throw asError(error);
			await ns.sleep(retryDelayMs);
			retryDelayMs *= backoffRate;
		}
	}
}



/**
 * nur zum ausprobieren der funktionen
 */
export function main(ns) {
	ns.ui.clearTerminal()
	ns.tail();
	ns.print("_".repeat(20));
	//ns.print("KEYS: " + settings.getItem("keys"));
	//ns.print("get_before: " + settings.test);
	//settings.setItem('test', 12);
	//ns.print("get_after: " + settings.test)
	ns.print(settings.getItem('nextAction'));
	ns.print(settings.getItem('lastAction'));

	settings.resetItem('lastAction');
	//settings.resetItem('reservedHomeRam');


	/** @todo aliasse realisieren
		// connect to any server by name
		alias find="run find.js"

		// get server data about what the best server to hack might be right now
		alias best="run bestHack.js"

		// manipulate localStorage
		alias get="run lsGet.js"
		alias set="run lsSet.js"

		// force crime.js/workForFactions.js to stop, so you can play in-game
		alias working="run lsSet.js working"
		alias done="run lsClear.js working"

		// set a reserve amount manually, above reseved money for buying programs
		alias reserve="run lsSet.js reserve"
	 */
}