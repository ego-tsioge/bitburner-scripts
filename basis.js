//basis.js test
/** @param {NS} ns */
export async function main(ns) {
  function getNumCracks() {
    let num = 0;
    for (let fileName of cracks) {
      if (ns.fileExists(fileName[0], homeServer)) num++;
    }
    return num;
  }
  function getTargetServers() {
    ns.print("Retrieving all nodes in network");
    let visited = new Set;
    let stack = [];
    let origin = ns.getHostname();
    let targets = []
    stack.push(origin);

    while (stack.length > 0) {
      let node = stack.shift(); //jetzt kein stack mehr
      if (!visited.has(node)) {
        visited.add(node);
        if (canHack(node)) {
          targets.push(node);
          //As a rule of thumb, your hacking target should be the server 
          //with highest max money that’s required hacking level is under 1/3 of your hacking level.
          if ((ns.getHackingLevel() / 3) > ns.getServerRequiredHackingLevel(node) && ns.getServerMaxMoney(node) > ns.getServerMaxMoney(bestOption)) {
            ns.tprint("setze bestOption auf ", node);
            if (node != bestOption) {
              piggyBank = bestOption;
              bestOption = node;
              deployAgain = true;
            }

          }
        }
        let nachbarn = ns.scan(node);
        for (let child of nachbarn) {
          stack.push(child);
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
  }
  function canHack(server) {
    // let numCracks = getNumCracks();
    let reqPorts = ns.getServerNumPortsRequired(server);
    let ramAvail = ns.getServerMaxRam(server);
    //ns.tprint(server," C:",numCracks, " RP:", reqPorts, " RA:",ramAvail);
    return numCracks >= reqPorts && ramAvail >= virusRam;
  }
  async function deployHacks(targets) {
    ns.print("Verteile Virus an Server " + targets);
    for (let server of targets) {
      await copyAndRunVirus(server);
    }
  }
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
  }
  function penetrate(server) {
    ns.print("Penetrating ", server);
    for (let fileName of cracks) {
      if (ns.fileExists(fileName[0], homeServer)) {
        let runScript = fileName[1];
        runScript(server);
      }
    }
  }

  //As a rule of thumb, your hacking target should be the server with highest max money that’s required hacking level is under 1/3 of your hacking level.

  var curBots = [];             // hier sollten die 'Helfer' drin stehen
  let piggyBank = "n00dles";    // beim Wechsel des Zieles, werden hier das vorherige Ziel aufgeführt
  const waitTime = 100;         // wartezeit für Endlosschleife
  var bestOption = "n00dles";   // Merker für das beste Ziel
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

    bringHomeTheBacon(curBots, "spamHack.js", piggyBank)

    //monitor vorbereiten

    //monitor ausgeben



    ns.clearLog();
    for (let bot of curBots) {
      ns.print (`${bot} :: ${ns.formatNumber(ns.getServerMoneyAvailable(bot))}`);
    }
    ns.print(" ");
    let money = ns.getServerMoneyAvailable(piggyBank);
    if (money === 0) money = 1;
    let maxMoney = ns.getServerMaxMoney(piggyBank);
    let minSec = ns.getServerMinSecurityLevel(piggyBank);
    let sec = ns.getServerSecurityLevel(piggyBank);
    ns.print(`${piggyBank}:`);
    ns.print(` $_______: ${ns.formatNumber(money)} / ${ns.formatNumber(maxMoney)} (${(money / maxMoney * 100).toFixed(2)}%)`);
    ns.print(` security: +${(sec - minSec).toFixed(2)}`);
    ns.print(` weaken__:  (t=${Math.ceil((sec - minSec) * 20)})`);
    money = ns.getServerMoneyAvailable(bestOption);
    if (money === 0) money = 1;
    maxMoney = ns.getServerMaxMoney(bestOption);
    minSec = ns.getServerMinSecurityLevel(bestOption);
    sec = ns.getServerSecurityLevel(bestOption);
    ns.print(" ");
    ns.print(`${bestOption}:`);
    ns.print(` $_______: ${ns.formatNumber(money)} / ${ns.formatNumber(maxMoney)} (${(money / maxMoney * 100).toFixed(2)}%)`);
    ns.print(` security: +${(sec - minSec).toFixed(2)}`);
    ns.print(` weaken__:  (t=${Math.ceil((sec - minSec) * 20)})`);

    // etwas warten
    await ns.hack(piggyBank);
    await ns.sleep(waitTime);
  }

  function bringHomeTheBacon(bots, script, target) {
    for (let server of bots) {
      ns.scp(script, server);

      if (ns.scriptRunning(script, server)) {
        ns.scriptKill(script, server);
      }

      ns.exec(script, server, 1, target);
    }
  }

}

export function autocomplete(data, args) {
  return data.servers;
}