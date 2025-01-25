/** @typedef {import("/types/NetscriptDefinitions").NS} NS */



/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('sleep');
    ns.tail();

    // Terminal Helper
    const terminal = command => {
        const doc = globalThis["document"];
        const terminalInput = /** @type {HTMLInputElement} */ (doc.getElementById("terminal-input"));
        terminalInput.value = command;
        const handler = Object.keys(terminalInput)[1];
        terminalInput[handler].onChange({ target: terminalInput });
        terminalInput[handler].onKeyDown({ key: 'Enter', preventDefault: () => null });
    };

    // Letzte Antwort extrahieren
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

    // Warte auf stabile Antwort
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

    // Security auf Minimum bringen
    const optimizeSecurity = async (currentSecurity, minSecurity) => {
        while (currentSecurity > minSecurity) {  // Exakt auf Minimum
            ns.print('⚔️ Weakening...');
            terminal('weaken');
            await waitForStableResponse('weaken');
            const result = getLastResponse('weaken');
            const securityMatch = result.match(/Security decreased .* from ([\d.]+) to ([\d.]+)/);
            if (securityMatch) {
                currentSecurity = parseFloat(securityMatch[2]);
            }
            ns.print(`Security jetzt: ${currentSecurity}`);
        }
        return currentSecurity;
    };

    // Maximales Geld ermitteln
    const findMaxMoney = async (currentSecurity, minSecurity) => {
        let lastGrowth = 100;
        let maxMoney = 0;
        let currentMoney = 0;

        while (lastGrowth > 1) {
            terminal('grow');
            await waitForStableResponse('grow');
            const growResult = getLastResponse('grow');

            const growthMatch = growResult.match(/grown by ([\d.]+)%/);
            lastGrowth = growthMatch ? parseFloat(growthMatch[1]) : 0;

            const securityMatch = growResult.match(/Security increased .* from ([\d.]+) to ([\d.]+)/);
            if (securityMatch) {
                currentSecurity = parseFloat(securityMatch[2]);
                if (currentSecurity > minSecurity) {
                    currentSecurity = await optimizeSecurity(currentSecurity, minSecurity);
                }
            }

            terminal('analyze');
            await waitForStableResponse('analyze');
            const moneyAnalysis = getLastResponse('analyze');
            // Verbesserte Geldextraktion
            const moneyMatch = moneyAnalysis.match(/Total money available on server: \$([\d.]+[km]?)/);
            if (moneyMatch) {
                let moneyStr = moneyMatch[1];
                // Konvertiere k/m/b Suffixe
                if (moneyStr.endsWith('k')) {
                    currentMoney = parseFloat(moneyStr.slice(0, -1)) * 1000;
                } else if (moneyStr.endsWith('m')) {
                    currentMoney = parseFloat(moneyStr.slice(0, -1)) * 1000000;
                } else if (moneyStr.endsWith('b')) {
                    currentMoney = parseFloat(moneyStr.slice(0, -1)) * 1000000000;
                } else {
                    currentMoney = parseFloat(moneyStr);
                }
                if (currentMoney > maxMoney) maxMoney = currentMoney;
            }

            ns.print(`Aktuelles Geld: $${ns.formatNumber(currentMoney)}, Wachstum: ${lastGrowth.toFixed(2)}%`);
        }
        return { maxMoney, currentMoney, currentSecurity };
    };

    // Hack durchführen
    const performHack = async (currentMoney, currentSecurity, minSecurity, maxMoney) => {
        ns.print('🔓 Hacking...');
        terminal('hack');
        await waitForStableResponse('hack');
        const result = getLastResponse('hack');
        if (result.includes('Hack successful')) {
            const moneyMatch = result.match(/Gained \$([\d.]+[km])/);
            if (moneyMatch) {
                let moneyStr = moneyMatch[1];
                // Konvertiere k/m/b Suffixe auch hier
                if (moneyStr.endsWith('k')) {
                    currentMoney -= parseFloat(moneyStr.slice(0, -1)) * 1000;
                } else if (moneyStr.endsWith('m')) {
                    currentMoney -= parseFloat(moneyStr.slice(0, -1)) * 1000000;
                } else if (moneyStr.endsWith('b')) {
                    currentMoney -= parseFloat(moneyStr.slice(0, -1)) * 1000000000;
                } else {
                    currentMoney -= parseFloat(moneyStr);
                }
            }
            const securityMatch = result.match(/Security increased .* from ([\d.]+) to ([\d.]+)/);
            if (securityMatch) {
                currentSecurity = parseFloat(securityMatch[2]);
            }
            ns.print(result.split('\n')[1]);
        }
        return { currentMoney, currentSecurity };
    };

    // Zu n00dles verbinden
    ns.print('Verbinde zu n00dles...');
    terminal('home');
    await ns.sleep(500);
    terminal('connect n00dles');
    await ns.sleep(500);

    // Erste Analyse für Security Minimum
    terminal('analyze');
    await waitForStableResponse('analyze');
    const analysis = getLastResponse('analyze');
    const minSecurity = parseFloat(analysis.match(/min: ([\d.]+)/)?.[1] || "1.0");
    let currentSecurity = parseFloat(analysis.match(/Server security level: ([\d.]+)/)?.[1] || "999");
    ns.print(`Security: ${currentSecurity}/${minSecurity}`);

    // Security optimieren
    ns.print('\nOptimiere Security...');
    currentSecurity = await optimizeSecurity(currentSecurity, minSecurity);

    // Maximales Geld ermitteln
    ns.print('\nErmittle maximales Geld...');
    let { maxMoney, currentMoney } = await findMaxMoney(currentSecurity, minSecurity);
    ns.print(`\nMaximales Geld ermittelt: $${ns.formatNumber(maxMoney)}`);

    // Hack-Loop
    while (true) {
        ns.print(`\nStatus: Security ${currentSecurity}/${minSecurity}, Money $${ns.formatNumber(currentMoney)}/$${ns.formatNumber(maxMoney)}`);

        if (currentSecurity > minSecurity + 0.1) {
            currentSecurity = await optimizeSecurity(currentSecurity, minSecurity);
        }
        else if (currentMoney < maxMoney * 0.75) {
            let result = await findMaxMoney(currentSecurity, minSecurity);
            currentMoney = result.currentMoney;
            currentSecurity = result.currentSecurity;
        }
        else {
            let result = await performHack(currentMoney, currentSecurity, minSecurity, maxMoney);
            currentMoney = result.currentMoney;
            currentSecurity = result.currentSecurity;
        }
    }
}
