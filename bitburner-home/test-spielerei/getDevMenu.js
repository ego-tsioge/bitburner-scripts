/** @typedef {import("/types/NetscriptDefinitions").NS} NS */

/** @param {NS} ns **/
export async function main(ns) {
    try {
        const doc = eval("document");

        // Die openDevMenu Funktion definieren
        // https://www.reddit.com/r/Bitburner/comments/11rft88/comment/lig6vh5/
        globalThis.openDevMenu = function() {
            // @ts-ignore - Webpack Chunks
            globalThis.webpack_require ?? webpackChunkbitburner.push([[-1], {}, w => globalThis.webpack_require = w]);
            // @ts-ignore - Webpack Module Access
            Object.keys(webpack_require.m).forEach(k =>
                // @ts-ignore - Webpack Module Access
                Object.values(webpack_require(k)).forEach(p =>
                    p?.toPage?.('Dev')
                )
            );
        };

        // SVG Path für das Code-Icon (<>)
        // Besteht aus zwei Teilen:
        // 1. M9.4 16.6 ... - Zeichnet das linke "<" Symbol
        // 2. m5.2 0l4 ... - Zeichnet das rechte ">" Symbol
        const CODE_ICON_PATH = "M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z";

        // Finde den Help-Button und dann den dazugehörigen Container
        const helpButton = Array.from(doc.querySelectorAll('[role="button"]'))
            .find(el => el.textContent.includes('Help'));

        if (!helpButton) {
            throw new Error("Help button not found!");
        }

        const container = helpButton.nextElementSibling
            ?.querySelector('.MuiCollapse-wrapperInner');

        if (!container) {
            throw new Error("Menu container not found!");
        }

        // Finde einen existierenden Button als Vorlage
        const templateButton = container.querySelector('.MuiButtonBase-root.MuiListItem-root');
        if (!templateButton) {
            throw new Error("Template button not found!");
        }

        // Extrahiere ALLE CSS-Klassen von der Vorlage
        const buttonClasses = templateButton.className;
        const listItemIconClasses = templateButton.querySelector('.MuiListItemIcon-root').className;
        const badgeClasses = templateButton.querySelector('.MuiBadge-root').className;
        const iconClasses = templateButton.querySelector('.MuiSvgIcon-root').className;
        const badgeSpanClasses = templateButton.querySelector('.MuiBadge-badge').className;
        const listItemTextClasses = templateButton.querySelector('.MuiListItemText-root').className;
        const typographyClasses = templateButton.querySelector('.MuiTypography-root').className;
        const touchRippleClasses = templateButton.querySelector('.MuiTouchRipple-root').className;

        // Erstelle den Button mit den kopierten Klassen
        const buttonHtml = `
            <div class="${buttonClasses}" tabindex="0" role="button">
                <div class="${listItemIconClasses}">
                    <span class="${badgeClasses}">
                        <svg class="${iconClasses}" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="CodeIcon">
                            <path d="${CODE_ICON_PATH}"></path>
                        </svg>
                        <span class="${badgeSpanClasses}"></span>
                    </span>
                </div>
                <div class="${listItemTextClasses}">
                    <p class="${typographyClasses}">Dev Menu</p>
                </div>
                <span class="${touchRippleClasses}"></span>
            </div>
        `;

        // Erstelle ein temporäres Element um den HTML-String zu parsen
        const temp = doc.createElement('div');
        temp.innerHTML = buttonHtml;
        const devButton = temp.firstElementChild;

        // Füge den Click-Handler hinzu
        devButton.addEventListener('click', () => globalThis.openDevMenu());

        // Füge den Button vor dem Options-Button ein
        const optionsButton = Array.from(container.children)
            .find(el => el.textContent.includes('Options'));

        if (optionsButton) {
            container.insertBefore(devButton, optionsButton);
        } else {
            container.appendChild(devButton);
        }

        ns.tprint("Successfully added Dev Menu button!");

    } catch (err) {
        ns.tprint("ERROR: " + String(err));
        if (err.stack) ns.tprint("Stack: " + err.stack);
    }
}
