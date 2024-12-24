/** 
 * Bibliothek für Formatierungen (Zahlen, Tabellen, etc.)
 */

// --- Zahlen-Formatierung ---
const UNITS = ['', 'k', 'm', 'b', 't', 'q'];

export function formatNumber(num, digits = 1) {
	if (num === 0) return '0';
	
	const neg = num < 0;
	const absNum = Math.abs(num);
	
	const magnitude = Math.floor(Math.log10(absNum) / 3);
	const scaled = absNum / Math.pow(10, magnitude * 3);
	
	const formatted = scaled.toFixed(digits);
	const unit = UNITS[magnitude] || '';
	
	return (neg ? '-' : '') + formatted + unit;
}

export function formatRam(gb) {
	if (gb < 1024) return gb + 'GB';
	return (gb / 1024).toFixed(1) + 'TB';
}

export function formatSecurity(level) {
	return level.toFixed(2);
}

// --- Tabellen-Formatierung ---
const BORDERS = {
	SINGLE: {
		top: '─',
		bottom: '─',
		left: '│',
		right: '│',
		topLeft: '┌',
		topRight: '┐',
		bottomLeft: '└',
		bottomRight: '┘',
		headerSeparator: '─',
		columnSeparator: '│',
		headerColumnLeft: '├',
		headerColumnRight: '┤',
		headerColumnIntersect: '┼',
		topIntersect: '┬',
		bottomIntersect: '┴'
	}
};

/**
 * Erstellt eine formatierte Tabelle
 * @param {Array<Object>} data - Rohdaten
 * @param {Array<Object>} columns - Spaltenkonfiguration
 * @param {Function} [formatData] - Optionale Funktion zur Datenvorverarbeitung
 * @returns {string} Formatierte Tabelle
 */
export function formatTable(data, columns, formatData = null) {
	const processedData = formatData ? formatData(data) : data;

	const columnConfig = columns.map(col => 
		typeof col === 'string' 
			? { name: col, align: 'left' } 
			: { align: 'left', format: (v) => String(v), ...col }
	);

	// Daten formatieren
	const formattedData = processedData.map(row => {
		const newRow = {};
		columnConfig.forEach(col => {
			const rawValue = row[col.name];
			newRow[col.name] = col.format ? col.format(rawValue) : String(rawValue);
		});
		return newRow;
	});

	// Spaltenbreiten berechnen
	const widths = columnConfig.map(col => 
		Math.max(
			col.name.length,
			...formattedData.map(row => String(row[col.name]).length)
		)
	);

	let table = '\n';

	// Obere Kante
	table += BORDERS.SINGLE.topLeft;
	table += widths.map(w => BORDERS.SINGLE.top.repeat(w + 2))
				   .join(BORDERS.SINGLE.topIntersect);
	table += BORDERS.SINGLE.topRight + '\n';

	// Header
	table += BORDERS.SINGLE.left + ' ';
	table += columnConfig.map((col, i) => 
		col.name.padEnd(widths[i])
	).join(' ' + BORDERS.SINGLE.columnSeparator + ' ');
	table += ' ' + BORDERS.SINGLE.right + '\n';

	// Header-Trenner
	table += BORDERS.SINGLE.headerColumnLeft;
	table += widths.map(w => BORDERS.SINGLE.headerSeparator.repeat(w + 2))
				   .join(BORDERS.SINGLE.headerColumnIntersect);
	table += BORDERS.SINGLE.headerColumnRight + '\n';

	// Datenzeilen
	formattedData.forEach(row => {
		table += BORDERS.SINGLE.left + ' ';
		table += columnConfig.map((col, i) => {
			const value = String(row[col.name]);
			
			switch(col.align) {
				case 'right':
					return ' '.repeat(Math.max(0, widths[i] - value.length)) + value;
				case 'center':
					const spaces = Math.max(0, widths[i] - value.length);
					const leftPad = Math.floor(spaces / 2);
					const rightPad = spaces - leftPad;
					return ' '.repeat(leftPad) + value + ' '.repeat(rightPad);
				default: // 'left'
					return value + ' '.repeat(Math.max(0, widths[i] - value.length));
			}
		}).join(' ' + BORDERS.SINGLE.columnSeparator + ' ');
		table += ' ' + BORDERS.SINGLE.right + '\n';
	});

	// Untere Kante
	table += BORDERS.SINGLE.bottomLeft;
	table += widths.map(w => BORDERS.SINGLE.bottom.repeat(w + 2))
				   .join(BORDERS.SINGLE.bottomIntersect);
	table += BORDERS.SINGLE.bottomRight;

	return table;
} 