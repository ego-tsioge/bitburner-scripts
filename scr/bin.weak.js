/* ----------------------------------------------------------------------- *//**
 * bin.weak.js
 *
 * bekommt spielintern einen parameter als string übergeben und fürht den befehl
 * ns.weaken() aus
 * @todo eingangsparameter prüfen?
 *
 * @param {ns} ns
 * -------------------------------------------------------------------------- */
export async function main(ns) {
  // Definiert den "Zielserver"
  var target = ns.args[0];

  await ns.weaken(target);
}
