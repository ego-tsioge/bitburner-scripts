/* ----------------------------------------------------------------------- *//**
 * bin.grow.js
 *
 * bekommt spielintern einen parameter als string übergeben und fürht den befehl
 * ns.grow() aus
 * @todo eingangsparameter prüfen?
 *
 * @param {ns} ns
 * -------------------------------------------------------------------------- */
export async function main(ns) {

  var target = ns.args[0];

  await ns.grow(target);
}
