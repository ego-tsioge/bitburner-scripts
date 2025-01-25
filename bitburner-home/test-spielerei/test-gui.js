/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");

    const doc = eval("document");
    const React = eval("window").React;
    const ReactDOM = eval("window").ReactDOM;

    // Verfügbare Hook-IDs
    const HOOKS = {
        TOP: "overview-extra-hook-0",
        MIDDLE: "overview-extra-hook-1",
        BOTTOM: "overview-extra-hook-2"
    };

    function HudElement({ children, borderColor = "#00ff00" }) {
        return React.createElement("div", {
            style: {
                color: "white",
                backgroundColor: "#00000080",
                padding: "5px",
                margin: "5px 0",
                borderLeft: `2px solid ${borderColor}`,
                fontSize: "12px"
            }
        }, children);
    }

    function formatDateTime(date) {
        const pad = (n) => n.toString().padStart(2, '0');
        return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ` +
               `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
    }

    function updateHUD() {
        // Top Hook - System Info & Time
        const topHook = doc.getElementById(HOOKS.TOP);
        if (topHook) {
            ReactDOM.render(
                React.createElement(HudElement, { borderColor: "#00ff00" }, [
                    React.createElement("div", {},
                        `UTC: ${formatDateTime(new Date())}`
                    ),
                    React.createElement("div", {},
                        `RAM: ${ns.formatRam(ns.getServerUsedRam("home"))} / ${ns.formatRam(ns.getServerMaxRam("home"))}`
                    )
                ]),
                topHook
            );
        }

        // Middle Hook - Money Info
        const middleHook = doc.getElementById(HOOKS.MIDDLE);
        if (middleHook) {
            // getTotalScriptIncome gibt ein Array zurück, wir nehmen den ersten Wert
            const income = ns.getTotalScriptIncome();
            const incomeValue = Array.isArray(income) ? income[0] : income;

            ReactDOM.render(
                React.createElement(HudElement, { borderColor: "#00ffff" }, [
                    React.createElement("div", {},
                        `Money: ${ns.formatNumber(ns.getServerMoneyAvailable("home"))}`
                    ),
                    React.createElement("div", {},
                        `Income/sec: ${ns.formatNumber(incomeValue)}`
                    ),
                    React.createElement("div", {},
                        `Running Scripts: ${ns.ps("home").length}`
                    )
                ]),
                middleHook
            );
        }
    }

    // Cleanup bei Script-Ende
    ns.atExit(() => {
        for (const hookId of Object.values(HOOKS)) {
            try {
                const hook = doc.getElementById(hookId);
                if (hook) ReactDOM.unmountComponentAtNode(hook);
            } catch (err) {
                ns.print(`Cleanup error for ${hookId}: ${String(err)}`);
            }
        }
    });

    // Update-Schleife
    while (true) {
        try {
            updateHUD();
        } catch (err) {
            ns.print("HUD update error: " + String(err));
        }
        await ns.sleep(1000);
    }
}
