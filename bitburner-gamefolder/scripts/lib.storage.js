/** 
 * Bibliothek für localStorage Management
 * Verwaltet alle Zugriffe auf den persistenten Speicher
 */

import { SETTINGS } from 'lib.config.js';

const PREFIX = 'bb_';  // Prefix für alle unsere Keys

/**
 * Speichert Daten im localStorage
 * @param {string} key - Schlüssel (ohne Prefix)
 * @param {any} data - zu speichernde Daten
 */
export function saveData(key, data) {
	try {
		localStorage.setItem(PREFIX + key, JSON.stringify({
			...data,
			lastUpdate: Date.now()
		}));
	} catch (error) {
		throw new Error(`Fehler beim Speichern von ${key}: ${error}`);
	}
}

/**
 * Liest Daten aus dem localStorage
 * @param {string} key - Schlüssel (ohne Prefix)
 * @param {any} defaultValue - Standardwert falls keine Daten gefunden
 * @returns {any} Geladene Daten oder defaultValue
 */
export function loadData(key, defaultValue = null) {
	try {
		const item = localStorage.getItem(PREFIX + key);
		if (!item) return defaultValue;
		
		const data = JSON.parse(item);
		const { lastUpdate, ...rest } = data;
		return rest;
	} catch (error) {
		console.error(`Fehler beim Laden von ${key}: ${error}`);
		return defaultValue;
	}
}

/**
 * Liest Daten mit Zeitstempel aus dem localStorage
 * @param {string} key - Schlüssel (ohne Prefix)
 * @returns {Object} Objekt mit data und lastUpdate oder null
 */
export function loadDataWithTimestamp(key) {
	try {
		const item = localStorage.getItem(PREFIX + key);
		return item ? JSON.parse(item) : null;
	} catch (error) {
		console.error(`Fehler beim Laden von ${key}: ${error}`);
		return null;
	}
}

/**
 * Löscht Daten aus dem localStorage
 * @param {string} key - Schlüssel (ohne Prefix)
 */
export function deleteData(key) {
	localStorage.removeItem(PREFIX + key);
}

/**
 * Listet alle unsere Daten im localStorage
 * @returns {Object} Alle gespeicherten Daten mit ihren Keys
 */
export function listAllData() {
	const data = {};
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (key.startsWith(PREFIX)) {
			const cleanKey = key.slice(PREFIX.length);
			data[cleanKey] = loadData(cleanKey);
		}
	}
	return data;
} 