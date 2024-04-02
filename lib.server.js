/* ----------------------------------------------------------------------- *//**
 * eine Klasse um server ohne spielmechanik zu repräsentieren
 *
 * @class BaseServer (name)
 * -------------------------------------------------------------------------- */
export class BaseServer {
	/* ---------------------------------------------------------------------- *//**
	 * Constructs a new instance.
	 *
	 * @param {NS} ns
	 * @param {string} hostname of server
	 * ------------------------------------------------------------------------- */
	constructor(ns, hostname)
	{
		this.ns = ns;
		this._id = hostname;
	}



}



/* ----------------------------------------------------------------------- *//**
 * funktionen zum testen der klasse
 *
 * @param {NS} ns
 * -------------------------------------------------------------------------- */
export async function main(ns) {
	let x= ns.getServer("n00dles");
	ns.tprint(x);
}