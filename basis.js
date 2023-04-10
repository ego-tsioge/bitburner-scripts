//basis.js test

/** @param {NS} ns */
export async function main(ns) {
  function getNumCracks() {
    let num = 0;
    for (let fileName of cracks) {
      if (ns.fileExists(fileName[0], homeServer)) num++;
    }
    return num;
  } // end getNumCracks

  function getTargetServers() {
    let visited = new Set;
    let speicher = ['home'];
    let targets = [];

    while (speicher.length > 0) {
      let node = speicher.shift();
      if (!visited.has(node)) {
        visited.add(node);
        if (canHack(node)) {
          targets.push(node);
          //As a rule of thumb, your hacking target should be the server 
          //with highest max money that’s required hacking level is under 1/3 of your hacking level.
        }
        let nachbarn = ns.scan(node);
        for (let child of nachbarn) {
          speicher.push(child);
        }
      }
    }

    let i = 0
    let serverPrefix = "ps-";
    while (ns.serverExists(serverPrefix + i)) {
      targets.push(serverPrefix + i);
      i++;
    }
    return targets;
  } // end getTargetServers

  function canHack(server) {
    // let numCracks = getNumCracks();
    let reqPorts = ns.getServerNumPortsRequired(server);
    let ramAvail = ns.getServerMaxRam(server);
    //ns.tprint(server," C:",numCracks, " RP:", reqPorts, " RA:",ramAvail);
    return numCracks >= reqPorts && ramAvail >= virusRam;
  } // end canHack

  async function deployHacks(targets) {
    ns.print("Verteile Virus an Server " + targets);
    for (let server of targets) {
      await copyAndRunVirus(server);
    }
  } // end deployHacks

  async function copyAndRunVirus(server) {
    ns.print("Copying virus to Server: ", server);
    await ns.scp(virus, server);

    if (!ns.hasRootAccess(server)) {
      let reqPorts = ns.getServerNumPortsRequired(server);
      if (reqPorts > 0) penetrate(server);
      ns.print("Gaining root acces on ", server);
      ns.nuke(server);
    }

    if (ns.scriptRunning(virus, server)) {
      ns.scriptKill(virus, server);
    }

    let maxThreads = Math.floor(ns.getServerMaxRam(server) / virusRam);
    ns.exec(virus, server, maxThreads, bestOption);
  } // end copyAndRunVirus

  function penetrate(server) {
    ns.print("Penetrating ", server);
    for (let fileName of cracks) {
      if (ns.fileExists(fileName[0], homeServer)) {
        fileName[1](server);
      }
    }
  } // end penetrate

  var curBots = [];             // hier sollten die 'Helfer' drin stehen
  const waitTime = 100;         // wartezeit für Endlosschleife
  var bestOption = "foodnstuff";   // Merker für das  Ziel
  var deployAgain = false;      // bestes Ziel wurde geändert? Virus neu ausrollen
  const virus = "ego_hack.js";              // standard virus
  const virusRam = ns.getScriptRam(virus);  // ram-verbrauch vom standardvirus
  const homeServer = "home";                // homeserver
  const cracks = new Map([           // alle cracks im spiel
    ["BruteSSH.exe", ns.brutessh],
    ["FTPCrack.exe", ns.ftpcrack],
    ["relaySMTP.exe", ns.relaysmtp],
    ["HTTPWorm.exe", ns.httpworm],
    ["SQLInject.exe", ns.sqlinject]]);
  let numCracks;

  ns.tail();
  ns.disableLog('ALL');
  // hauptschleife

  let lifeLine = ['|', '/', '-', '\\'];
  let ll = 0;
  while (true) {
    //sammle daten
    numCracks = getNumCracks();

    //aktionen
    let newTargets = getTargetServers();
    if (deployAgain || newTargets.length !== curBots.length) {
      await deployHacks(newTargets);
      deployAgain = false;
      curBots = newTargets;
    }


    //monitor vorbereiten

    //monitor ausgeben



    ns.clearLog();
    ns.print(" ");
    let money = ns.getServerMoneyAvailable(bestOption);
    if (money === 0) money = 1;
    let maxMoney = ns.getServerMaxMoney(bestOption);
    let minSec = ns.getServerMinSecurityLevel(bestOption);
    let sec = ns.getServerSecurityLevel(bestOption);
    ns.print(" ");
    ns.print(`${bestOption}:`);
    ns.print(` $_______: ${ns.formatNumber(money)} / ${ns.formatNumber(maxMoney)} (${(money / maxMoney * 100).toFixed(2)}%)`);
    ns.print(` security: +${(sec - minSec).toFixed(2)}`);
    ns.print(` weaken__:  (t=${Math.ceil((sec - minSec) * 20)})`);
    ll = (ll + .12); if (ll>=4.0) ll=0.0;
    ns.print(`${lifeLine[Math.floor(ll)]}`);

    // etwas warten
    //await ns.hack(bestOption);
    await ns.sleep(waitTime);
  }

}

export function autocomplete(data, args) {
  return data.servers;
}