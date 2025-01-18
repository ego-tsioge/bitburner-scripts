/**
 * Lädt alle .js Dateien aus dem bitburner-home Verzeichnis des Repos
 * und setzt Test-Aliase
 * @param {NS} ns - Netscript API
 * @param {string} [branch] - Optional: Spezifischer Branch
 */
export async function main(ns) {
	ns.disableLog('ALL');
	terminal('clear');

	// GitHub Basis-Konfiguration
	const GITHUB_USER = 'ego-tsioge';
	const GITHUB_REPO = 'bitburner-scripts';

	// Optionale Konfiguration
	const FILTER = {
		baseDir: 'bitburner-home/',  // Optional: Nur Dateien aus diesem Verzeichnis
		extension: ['.js']           // Optional: Nur Dateien mit diesen Endungen
	};
	const ALIASES = {
		'update': 'run git-init.js',           // Update aus Default-Branch
		'test': 'run scripts/test.hacknet.js'  // Test-Script
	};

	try {
		// Branch bestimmen
		let branch = ns.args[0];
		if (!branch) {
			branch = await findDefaultBranch(ns, GITHUB_USER, GITHUB_REPO);
			ns.tprint(`Nutze Default-Branch: ${branch}`);
		}

		// Dateien herunterladen
		await downloadFiles(ns, GITHUB_USER, GITHUB_REPO, branch, FILTER);

		// Prüfe und entferne n00dles script
		ns.tprint('Bereinige Dateien...');
		if (ns.fileExists('n00dles.js')) {
			ns.killall('home', true); // Stoppe alle Skripte
			ns.rm('n00dles.js');
			ns.tprint('✓ n00dles.js gestoppt und gelöscht');
		}

		// Setze Aliase
		ns.tprint('************* Setze Aliase...');
		try {
			for (const [alias, command] of Object.entries(ALIASES)) {
				terminal(`alias ${alias}="${command}"`);
			}
			ns.tprint('✓ Aliase gesetzt');
		} catch (error) {
			ns.tprint(`✗ Fehler beim Setzen eines Aliases`);
		}

		ns.tprint('Initialisierung abgeschlossen!');
		ns.tprint('Starte main.js um das System zu aktivieren.');

	} catch (error) {
		ns.tprint(`✗ Fehler in ${error.stack?.split('\n')[1]?.trim() || 'unbekannt'}: ${error}`);
		return;
	}
}

/**
 * Ermittelt den Default-Branch des Repositories
 * @param {NS} ns - Netscript API
 * @param {string} user - GitHub Username
 * @param {string} repo - Repository Name
 * @returns {Promise<string>} Default Branch Name
 */
async function findDefaultBranch(ns, user, repo) {
	const repoApiUrl = `https://api.github.com/repos/${user}/${repo}`;
	const repoResponse = await ns.wget(repoApiUrl, 'repo.txt');
	if (!repoResponse) {
		throw new Error('Repository nicht gefunden oder nicht zugreifbar');
	}

	const repoInfo = JSON.parse(ns.read('repo.txt'));
	ns.rm('repo.txt');
	return repoInfo.default_branch;
}

/**
 * Lädt Dateien aus dem Repository herunter
 * @param {NS} ns - Netscript API
 * @param {string} user - GitHub Username
 * @param {string} repo - Repository Name
 * @param {string} branch - Branch Name
 * @param {Object} [filter] - Optionale Filter-Konfiguration
 */
async function downloadFiles(ns, user, repo, branch, filter = {}) {
	// GitHub API URLs
	const apiUrl = `https://api.github.com/repos/${user}/${repo}/git/trees/${branch}?recursive=1`;
	const rawBaseUrl = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/`;

	ns.tprint(`Lade Dateiliste vom Repository (Branch: ${branch})...`);

	try {
		// Hole Dateiliste via GitHub API
		const response = await ns.wget(apiUrl, 'files.txt');
		if (!response) {
			throw new Error(`Branch '${branch}' nicht gefunden oder nicht zugreifbar`);
		}

		const files = JSON.parse(ns.read('files.txt')).tree;
		const currentScript = ns.getScriptName();

		// Filtere Dateien nach Konfiguration
		const filteredFiles = files
			.filter(f => !filter.baseDir || f.path.startsWith(filter.baseDir))
			.filter(f => !filter.extension || filter.extension.some(ext => f.path.endsWith(ext)))
			.filter(f => !f.path.endsWith(currentScript))  // Eigenes Script nicht überschreiben
			.map(f => ({
				path: filter.baseDir ? f.path.replace(filter.baseDir, '') : f.path,
				url: rawBaseUrl + f.path
			}));

		// Lade jede Datei herunter
		for (const file of filteredFiles) {
			try {
				await ns.wget(file.url, file.path);
				ns.tprint(`✓ ${file.path} heruntergeladen`);
			} catch (error) {
				ns.tprint(`✗ Fehler beim Download von ${file.path}: ${error}`);
			}
		}
	} finally {
		// Cleanup
		if (ns.fileExists('files.txt')) {
			ns.rm('files.txt');
		}
	}
}

/**
 * Führt Terminal-Befehle aus
 * @param {string} command - Auszuführender Befehl
 */
function terminal(command) {
	const doc = globalThis["document"];
	const terminalInput = doc.getElementById("terminal-input");
	terminalInput.value = command;
	const handler = Object.keys(terminalInput)[1];
	terminalInput[handler].onChange({ target: terminalInput });
	terminalInput[handler].onKeyDown({ key: 'Enter', preventDefault: () => null });
}

