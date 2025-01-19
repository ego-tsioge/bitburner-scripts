/** @param {NS} ns */
export async function main(ns) {
    // Logging ausschalten für Übersichtlichkeit
    ns.disableLog('sleep');
    // Tail öffnen
    ns.tail();

    // Terminal Helper aus git-init.js
    const terminal = command => {
        const doc = globalThis["document"];
        const terminalInput = doc.getElementById("terminal-input");
        terminalInput.value = command;
        const handler = Object.keys(terminalInput)[1];
        terminalInput[handler].onChange({ target: terminalInput });
        terminalInput[handler].onKeyDown({ key: 'Enter', preventDefault: () => null });
    };

    // Terminal Output lesen
    const getTerminalOutput = () => {
        const doc = globalThis["document"];
        const terminal = doc.getElementById("terminal");
        return terminal.innerText;
    };

    // Terminal Output lesen und letzte Antwort extrahieren
    const getLastResponse = (command) => {
        const doc = globalThis["document"];
        const terminal = doc.getElementById("terminal");
        const lines = terminal.innerText.split('\n').reverse();
        const commandIndex = lines.findIndex(line => line.includes(`> ${command}`));
        if (commandIndex === -1) return "Befehl nicht gefunden";

        const response = [];
        for (let i = commandIndex - 1; i >= 0; i--) {
            const line = lines[i];
            if (line.includes('>')) break;
            response.unshift(line);
        }
        return response.join('\n');
    };

    // Warte bis Befehlsantwort stabil ist
    const waitForStableResponse = async (command) => {
        let lastResponse = "";
        let stableCount = 0;

        while (stableCount < 9) {
            const currentResponse = getLastResponse(command);
            if (currentResponse === lastResponse) {
                stableCount++;
            } else {
                stableCount = 0;
                lastResponse = currentResponse;
            }
            await ns.sleep(100);
        }
    };

    // Zu n00dles navigieren
    ns.print('\n=== Navigation ===');
    terminal('home');
    await ns.sleep(500);
    terminal('connect n00dles');
    await ns.sleep(500);
    ns.print('Verbunden mit:', getLastResponse('connect n00dles'));

    // Test 1: Weaken
    ns.print('\n=== Test 1: Weaken ===');
    ns.print('Befehl: weaken');
    terminal('weaken');
    await waitForStableResponse('weaken');
    ns.print('Weaken Response:');
    ns.print(getLastResponse('weaken'));

    // Test 2: Grow
    ns.print('\n=== Test 2: Grow ===');
    ns.print('Befehl: grow');
    terminal('grow');
    await waitForStableResponse('grow');
    ns.print('Grow Response:');
    ns.print(getLastResponse('grow'));

    // Test 3: Hack
    ns.print('\n=== Test 3: Hack ===');
    ns.print('Befehl: hack');
    terminal('hack');
    await waitForStableResponse('hack');
    ns.print('Hack Response:');
    ns.print(getLastResponse('hack'));

    // Bonus: Server-Status nach allen Operationen
    ns.print('\n=== Server Status ===');
    ns.print('Befehl: analyze');
    terminal('analyze');
    await waitForStableResponse('analyze');
    ns.print('Final Server Info:');
    ns.print(getLastResponse('analyze'));
}
