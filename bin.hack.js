/* ----------------------------------------------------------------------- *//**
 * bin.hack.js
 *
 * bekommt spielintern einen parameter als string übergeben und fürht den befehl
 * ns.hack() aus
 * @todo eingangsparameter prüfen?
 *
 * @param {ns} ns
 * -------------------------------------------------------------------------- */
export async function main(ns) {
  // Definiert den "Zielserver"
  var target = ns.args[0];

  await ns.hack(target);
}
