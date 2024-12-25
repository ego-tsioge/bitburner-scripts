import {SETTINGS} from '/scripts/lib.config.js';

/** 
 * Test-Script für localStorage Inhalte
 * @param {NS} ns - Bitburner Netscript API
 */
export async function main(ns) {
    const flags = ns.flags([
        ['key', 'network'],      // Welchen Storage-Key anzeigen
        ['server', ''],          // Optional: Welchen Server anzeigen
        ['field', ''],          // Optional: Welches Feld anzeigen
        ['all', false]          // Alle Keys anzeigen
    ]);

    // Alle localStorage Einträge mit unserem Prefix finden
    const prefix = SETTINGS.STORAGE_PREFIX;
    const allKeys = Object.keys(localStorage).filter(key => key.startsWith(prefix));
    
    if (flags.all) {
        // Alle Keys anzeigen
        ns.tprint('\nAlle gespeicherten Daten:');
        for (const key of allKeys) {
            const rawData = localStorage.getItem(key);
            const data = JSON.parse(rawData);
            ns.tprint(`\nKey: ${key}`);
            ns.tprint('Daten:', JSON.stringify(data, null, 2));
        }
    } else {
        // Spezifischen Key laden
        const key = prefix + flags.key;
        const rawData = localStorage.getItem(key);
        
        if (!rawData) {
            ns.tprint(`Keine Daten für Key ${key} gefunden!`);
            return;
        }

        const data = JSON.parse(rawData);
        
        // Wenn ein Server angegeben wurde
        if (flags.server) {
            if (!data.servers || !data.servers[flags.server]) {
                ns.tprint(`Server ${flags.server} nicht gefunden!`);
                return;
            }
            
            const serverData = data.servers[flags.server];
            
            // Wenn ein spezifisches Feld angefordert wurde
            if (flags.field) {
                const value = flags.field.split('.').reduce((obj, field) => obj && obj[field], serverData);
                if (value === undefined) {
                    ns.tprint(`Feld ${flags.field} nicht gefunden für Server ${flags.server}!`);
                } else {
                    ns.tprint(`\n${flags.server}.${flags.field}:`, value);
                }
            } else {
                // Ganzen Server anzeigen
                ns.tprint(`\nDaten für Server ${flags.server}:`);
                ns.tprint(JSON.stringify(serverData, null, 2));
            }
        } else {
            // Kompletten Key anzeigen
            ns.tprint(`\nDaten für ${key}:`);
            ns.tprint(JSON.stringify(data, null, 2));
        }
    }
} 