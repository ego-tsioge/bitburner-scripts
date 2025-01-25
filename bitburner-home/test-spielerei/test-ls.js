/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();

    const currentScript = ns.getScriptName();
    ns.print(`Teste Cleanup (schütze ${currentScript})`);

    // Alle Dateien auflisten
    const files = ns.ls('home');
    ns.print(`\nGefundene Dateien: ${files.length}`);

    // Dateien löschen
    for (const file of files) {
        if (file !== currentScript) {
            try {
                ns.rm(file);
                ns.print(`✓ Gelöscht: ${file}`);
            } catch (error) {
                ns.print(`✗ Fehler beim Löschen von ${file}: ${error}`);
            }
        } else {
            ns.print(`⚡ Überspringe ${file} (current script)`);
        }
    }

    // Ergebnis prüfen
    const remainingFiles = ns.ls('home');
    ns.print(`\nVerbleibende Dateien: ${remainingFiles.length}`);
    for (const file of remainingFiles) {
        ns.print(`  ${file}`);
    }
}
