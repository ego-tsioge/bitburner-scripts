/** @typedef {import("/types/NetscriptDefinitions").NS} NS */

/** @param {NS} ns **/
export async function main(ns) {
    // Zur Factions-Seite
    simulateKeyPress('f');
    await ns.sleep(100);

    try {
        const doc = eval("document");

        // Finden und Analysieren des h6 Elements
        eval(`
            const h6 = document.querySelector(".factions-rumors .MuiTypography-h6");
            if (!h6) {
                throw new Error("h6 Element nicht gefunden");
            }

            // Debug-Info sammeln
            window._debugInfo = {
                element: h6,
                html: h6.outerHTML,
                parentHTML: h6.parentElement.outerHTML,
                style: window.getComputedStyle(h6),
                rect: h6.getBoundingClientRect()
            };

            // Events auf dem h6 Element simulieren
            const rect = h6.getBoundingClientRect();
            const eventConfig = {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: rect.left + (rect.width / 2),
                clientY: rect.top + (rect.height / 2)
            };

            // Event-Sequenz
            [
                new MouseEvent('mouseenter', eventConfig),
                new MouseEvent('mouseover', eventConfig),
                new MouseEvent('pointerenter', eventConfig)
            ].forEach(event => h6.dispatchEvent(event));
        `);

        // Debug-Info ausgeben
        const debugInfo = eval("window._debugInfo");
        ns.tprint("\nElement Details:");
        ns.tprint("--------------------");
        ns.tprint(`Element: ${debugInfo.html}`);
        ns.tprint(`Position: x=${debugInfo.rect.left}, y=${debugInfo.rect.top}`);
        ns.tprint(`Size: ${debugInfo.rect.width}x${debugInfo.rect.height}`);

        // Warten und nach Tooltip suchen
        await ns.sleep(500);

        // Tooltip-Suche erweitern
        eval(`
            const tooltips = Array.from(document.querySelectorAll('*')).filter(el => {
                const role = el.getAttribute('role');
                const classes = el.className && typeof el.className === 'string' ? el.className : '';
                return role === 'tooltip' || classes.includes('Tooltip') || classes.includes('tooltip');
            });
            window._tooltips = tooltips.map(el => ({
                html: el.outerHTML,
                text: el.textContent,
                role: el.getAttribute('role'),
                class: el.className
            }));
        `);

        // Tooltip-Infos ausgeben
        const tooltips = eval("window._tooltips");
        ns.tprint("\nGefundene Tooltips:");
        ns.tprint("--------------------");
        tooltips.forEach((tooltip, i) => {
            ns.tprint(`\nTooltip ${i + 1}:`);
            ns.tprint(`Text: ${tooltip.text}`);
            ns.tprint(`Role: ${tooltip.role}`);
            ns.tprint(`Class: ${tooltip.class}`);
            ns.tprint(`HTML: ${tooltip.html}`);
        });

        // 2 Sekunden warten
        await ns.sleep(2000);

        // Cleanup
        eval(`
            const h6 = document.querySelector(".factions-rumors .MuiTypography-h6");
            if (h6) {
                [
                    new MouseEvent('mouseleave', eventConfig),
                    new MouseEvent('mouseout', eventConfig),
                    new MouseEvent('pointerleave', eventConfig)
                ].forEach(event => h6.dispatchEvent(event));
            }
        `);

    } catch (err) {
        ns.tprint("\nFehler: " + err);
    }

    // Cleanup
    eval("delete window._debugInfo; delete window._tooltips;");

    // Zurück zum Terminal
    simulateKeyPress('t');
}

/**
 * Simuliert einen Tastendruck mit Alt-Modifier
 * @param {string} key - Der Tastencode (z.B. 'f' für Factions, 't' für Terminal)
 */
function simulateKeyPress(key) {
    const doc = eval("document");
    const event = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: key,
        code: `Key${key.toUpperCase()}`,
        location: 0,
        altKey: true
    });
    doc.body.dispatchEvent(event);
}
