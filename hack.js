//hack.js

export async function main(ns) {
  // Definiert den "Zielserver"
  var target = ns.args[0];

  await ns.hack(target);
}
