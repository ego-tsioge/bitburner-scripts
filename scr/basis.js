//basis.js test
export async function main(ns) {
  let curBots = [];      // hier sollten die 'Helfer' drin stehen
  const waitTime = 100;    // wartezeit für Endlosschleife
  let ziel = "n00dles";    // Merker für das  Ziel
  let deployAgain = false;  // bestes Ziel wurde geändert? Virus neu ausrollen
  const cracks = new Map([  // alle cracks im spiel
    ["BruteSSH.exe", ns.brutessh],
    ["FTPCrack.exe", ns.ftpcrack],
    ["relaySMTP.exe", ns.relaysmtp],
    ["HTTPWorm.exe", ns.httpworm],
    ["SQLInject.exe", ns.sqlinject]]);
  let numCracks;
 
  ns.tail();
  ns.disableLog('ALL');

  // hauptschleife
  while (true) {
    //sammle daten
    numCracks = getNumCracks();
    curBots = getServers();

    //monitor vorbereiten
    //ns.clearLog();
    let availableMoney = ns.getServerMoneyAvailable(ziel);
    let maxMoney = ns.getServerMaxMoney(ziel);
    let minSec = ns.getServerMinSecurityLevel(ziel);
    let sec = ns.getServerSecurityLevel(ziel);
    let neededWeaks = Math.ceil((sec - minSec) * 20);
    let moneyRatio = (availableMoney / maxMoney);
    let script;
    let func;

    //serverAktion bestimen
    if (neededWeaks > 57) {
      script = "bin.weak.js";
      func = ns.weaken;
    } else if (moneyRatio < 0.8) {
      script = "bin.grow.js";
      func = ns.grow;
    } else {
      script = "bin.hack.js";
      func = ns.hack;
    }


    let s = 0;
    s = await deployScript(curBots, script, ziel);

    let freeRam = ns.getServerMaxRam('home') - ns.getServerUsedRam('home');
    let maxThreads = Math.floor(freeRam / 1.75);
    s += maxThreads;
    if (maxThreads > 0) {
      ns.exec(script, 'home', maxThreads, ziel);
    }

    //monitor ausgeben
    ns.print(" ");
    ns.print(" ");
    ns.print(` Zielserver: ${ziel}`);
    ns.print(` Money: ${ns.formatNumber(availableMoney)} von ${ns.formatNumber(maxMoney)} (${(moneyRatio * 100).toFixed(2)}%)`);
    ns.print(` security: ${sec.toFixed(2)} (Min: ${minSec.toFixed(2)})`);
    ns.print(` weaken__: ${(sec - minSec).toFixed(2)} (t=${neededWeaks})`);
    ns.print(` Aktion: ${script} (${s})`);

    // warten
    await func(ziel);
    await ns.sleep(waitTime);

  } // end while-loop

  function getNumCracks() {
    let num = 0;
    for (let crack of cracks) {
      if (ns.fileExists(crack[0], 'home')) num++;
    }
    return num;
  } // end getNumCracks()

  function getServers() {
    let visited = [];
    let speicher = ['home'];
    let result = [];

    //solange noch was im speicher liegt
    while (speicher.length > 0) {
      //nehme ein element aus dem speicher
      let node = speicher.shift();

      //prüfe ob wir es noch nicht angeschaut haben
      if (!visited.includes(node)) {
        //wenn ja, merke es als angeschaut
        visited.push(node);

        // prüfe ab wir es hacken können
        if (canHack(node)) {
          // wenn ja, merken als ziel
          result.push(node);

          ////As a rule of thumb, your hacking target should be the server 
          ////with highest max money that’s required hacking level is under 1/3 of your hacking level.
        }

        // alle nachbarn in den speicher legen
        let nachbarn = ns.scan(node);
        for (let child of nachbarn) {
          speicher.push(child);
        }
      }
    } // end while

    // wenn wir gepaufte server haben, füge sie zum ergebnis hinzu
    let i = 0
    let serverPrefix = "ps-";
    if (ns.serverExists(serverPrefix)) {
      result.push(serverPrefix);
    }
    while (ns.serverExists(serverPrefix + i)) {
      result.push(serverPrefix + i);
      i++;
    }

    return result;
  } // end getServers()

  function canHack(server) {
    let reqPorts = ns.getServerNumPortsRequired(server);
    return numCracks >= reqPorts;
  } // end canHack()

  /** 
   * Funktion um unser Script zu verteilen, es öffnet auch die Server je nach vorhandenen cracks
   * 
   * @param {string[]} botNet liste der server, die uns helfen
   * @param {string} script das script das ausgeführt werden soll
   * @param {string} target der server der geschröpft werden soll
   */
  async function deployScript(botNet, script, target) {
    let slots = 0;
    // für jeden einzelnen server
    for (let server of botNet) {
      // prüfe ob wir schon rootRechte haben
      if (!ns.hasRootAccess(server)) {
        // wenn nicht, prüfe ob noch ports geknackt werden müssen
        let reqPorts = ns.getServerNumPortsRequired(server);
        if (reqPorts > 0) {
          // wenn ja, gehe unsere cracks duch und führe sie aus
          for (let crack of cracks) {
            if (ns.fileExists(crack[0], 'home')) {
              crack[1](server);
            }
          }
        }
        // anschliesend führe NUKE aus
        ns.nuke(server);
      }
      // ab hier liegen rootRechte vor

      //stoppe alle laufenden scripts
      ns.killall(server);

      // kopiere unser script auf den server (überschreibt automatisch)
      await ns.scp(script, server);

      // starte unser script so oft wie ram vorhanden ist
      let maxThreads = Math.floor(ns.getServerMaxRam(server) / 1.75);
      slots += maxThreads;
      if (maxThreads > 0) {
        ns.exec(script, server, maxThreads, target);
      }

    }
    return slots;
  } // end deployScript()

} // end main