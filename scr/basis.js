import { settings, timeStamp } from "./lib.helpers.js";

// https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/bitburner.ns.flags.md
const argsSchema = [
  ['nextAction', undefined], // platzhalter für eine nächste Aktion
  ['reset', false], // 
  ['target', undefined], // 
  ['help', false], // 
];

export async function main(ns) {
  let debug = false;
  // *** checks zum start ***********************************************************
  const opt = ns.flags(argsSchema);
  if (opt.help) {
    let info = "INFO: dieses script soll den Start managen, erstes geld sammeln und Hacknet initieren";
    ns.tprint(info);
    return 0
  }
  if (ns.getHostname() !== 'home') { ns.tprint('ERROR: dieses Skript sollte nur von home starten'); return -1 }
  if (opt.reset) { opt.nextAction = 'reset' }
  if (opt.target) { settings.setItem('target', opt.target) }

  // *** wirklicher start ***********************************************************
  ns.tprint(`[${timeStamp()}] Starte Skript '${ns.getScriptName()}'`)
  // Plan:: dieses script soll den start managen (eventuell auch alles), mangels kontrolle
  // Plan:: wird man den user zum aufstocken von Ram auffordern müssen
  // Plan:: 200k Hacknet invest kann das script regeln

  // Plan:: 1.  prüfen wieviel ram wir haben <32GB??? nee erstmal so
  let action;
  if (opt.nextAction) { // diese anweisung sollte alle anderen overrulen, zB zum aufräumen
    action = opt.nextAction;
  } else if (settings.nextAction) {
    action = settings.nextAction;
    settings.resetItem('nextAction');
  } else { // wenn noch nichts passiert ist, müssen wir wohl erstmal nachschauen

    if (!settings.lastAction) { //soll endlosschleifen verhindern 
      action = 'spider';
    }
  }
  dToast('' + settings.getItem(settings.botnetName)['bots'][settings.target]);

  dToast("Switch/Case: " + action);
  switch (action) {
    case 'reset':
    case 'neustart':
      settings.resetItem('nextAction');
      settings.resetItem('lastAction');
      settings.resetItem('target');
      action = 'spider'
    case 'spider':
      scriptChaining(ns, action, 'evaluate', ns.getScriptName());
      // throw new Error('an dem punkt sollte das script nicht ankommen');
      break;
    case 'evaluate':
      settings.setItem('lastAction', action);
      let botNet = settings.getItem(settings.botnetName)['bots'];
      let target = botNet[settings.target];
      let growCount = Math.ceil(target.growCount);
      let slots = 0;
      let index = Object.keys(botNet);

      for (let name of index) {
        slots += Math.floor(botNet[name]['maxRam'] / 1.75);
      }
      let weakCount = Math.ceil(target.weakCount + ns.growthAnalyzeSecurity(slots - target.weakCount, settings.target) * 20);



      if (target.isReady) {
        // target.ist ready START
        dToast('target is Ready');

        let hThreads = slots - 2;
        let hackValue = ns.hackAnalyze(settings.target) * target.maxMoney;
        let gThreads, wThreads;

        // hier die aktion definieren wenn target bereit für HGW ist
        let reCalc = false;
        do {
          gThreads = Math.ceil(ns.growthAnalyze(settings.target, 1750000 / Math.max(1750000 - (hackValue * hThreads * 3), 1)));
          wThreads = ns.hackAnalyzeSecurity(hThreads * 3, settings.target);
          wThreads += ns.growthAnalyzeSecurity(gThreads, settings.target);
          wThreads = Math.floor(wThreads * 20);

          let threadSum = hThreads + gThreads + wThreads;
          if (threadSum > slots) {
            reCalc = true;
            hThreads--;
          } else {
            reCalc = false;
          }
        } while (reCalc)

        dToast(`Threads  H: ${hThreads} G: ${gThreads} W: ${wThreads} `)

        for (let name of index) {
          let count = Math.floor(botNet[name]['maxRam'] / 1.75);
          dToast(`${name}  count: ${count} `)

          if (wThreads > 0) { // es muß noch geweaked werden
            if (count >= wThreads) {  // es sind genug slots auf diesem computer
              dToast(`    weaking  count: ${wThreads} `)
              ns.exec(settings.files.weaking, name, wThreads, ...[settings.target, wThreads]);
              count -= wThreads;
              wThreads = 0;
            } else {  // es sind NICHT genug slots auf diesem computer
              dToast(`    weaking  count: ${count} `)
              ns.exec(settings.files.weaking, name, count, ...[settings.target, count]);
              wThreads -= count;
              count = 0;
            }
          }
          dToast(`  remaining wThreads: ${wThreads} `)

          if (gThreads > 0 && count > 0) { // es muß noch gegrowth werden
            if (count >= gThreads) {  // es sind genug slots auf diesem computer
              dToast(`    growing  count: ${gThreads} `)
              ns.exec(settings.files.growing, name, gThreads, ...[settings.target, gThreads]);
              count -= gThreads;
              gThreads = 0;
            } else {  // es sind NICHT genug slots auf diesem computer
              dToast(`    growing  count: ${count} `)
              ns.exec(settings.files.growing, name, count, ...[settings.target, count]);
              gThreads -= count;
              count = 0;
            }
          }
          dToast(`  remaining gThreads: ${gThreads} `)

          if (hThreads > 0 && count > 0) { // es muß noch gehacked werden
            if (count >= hThreads) {  // es sind genug slots auf diesem computer
              dToast(`    hacking  count: ${hThreads} `)
              ns.exec(settings.files.hacking, name, hThreads, ...[settings.target, hThreads, 3]);
              count -= hThreads;
              hThreads = 0;
            } else {  // es sind NICHT genug slots auf diesem computer
              dToast(`    hacking  count: ${count} `)
              ns.exec(settings.files.hacking, name, count, ...[settings.target, count, 3]);
              hThreads -= count;
              count = 0;
            }
          }
          dToast(`  remaining hThreads: ${hThreads} `)

        }
        dToast(`await ns.weaken`)
        await ns.weaken(settings.target);
        scriptChaining(ns, 'spider', 'evaluate', ns.getScriptName());

        // target.ist ready ENDE
      } else {
        dToast('target is NOT Ready');
        // hier die aktionen definieren um den Server bereit zu machen
        // es sind 2 situationen denkbar (werden wohl zu 2 reduziert):
        // * slots reichen um geld zu maximieren und weaks auszuführen
        // * oder es braucht mehrere runden
        // n00dles macht es uns leicht, hier reicht die startaufstellung
        dToast(`Threads  slots: ${slots} G: ${growCount} W: ${weakCount} `)
        if ((growCount + weakCount) < slots) {
          weakCount-- // finetuning (weil wir selber einen weak machen)
          for (let name of index) {
            // slots ausrechnen
            // starte die scripts mit grow
            // reduziere growCount um die slotanzahl
            // dann weak --> rest grow (für hackinglvl)
            let count = Math.floor(botNet[name]['maxRam'] / 1.75);
            dToast(`${name}  count: ${count} `)

            if (weakCount > 0) { // es muß noch geweaked werden
              if (count >= weakCount) { // es sind genug slots auf diesem computer
                dToast(`    weaking  weakCount: ${weakCount} `)
                ns.exec(settings.files.weaking, name, weakCount, ...[settings.target, weakCount]);
                count -= weakCount;
                weakCount = 0;
              } else {  // es sind NICHT genug slots auf diesem computer
                if (count > 0) {
                  dToast(`    weaking  count: ${count} `)
                  ns.exec(settings.files.weaking, name, count, ...[settings.target, count]);
                  weakCount -= count;
                  count = 0;
                }
              }
            }
            dToast(`  remaining weakCount: ${weakCount} `)

            if (count > 0) {  // rest wird gegrowth
              dToast(`    growing  count: ${count} `)
              ns.exec(settings.files.growing, name, count, ...[settings.target, count]);
              growCount -= count;
            }
            dToast(`  remaining growCount: ${growCount} `)
          }

          //selber warten also "weaken"
          await ns.weaken(settings.target);

          // end slots reichen aus
        } else {

          // start slots reichen nicht aus


          // yyy 
          if (target.needWeakens) {
            for (let name of index) {
              // slots ausrechnen
              // starte die scripts mit grow
              // reduziere growCount um die slotanzahl
              // dann weak --> rest grow (für hackinglvl)
              let count = Math.floor(botNet[name]['maxRam'] / 1.75);
              dToast(`${name}  count: ${count} `)
              if (count > 0) {
                dToast(`    weaking  count: ${count} `)
                ns.exec(settings.files.weaking, name, count, ...[settings.target, count]);
                weakCount -= count;
                count = 0;
              }
            }

            //selber warten also "weaken"
            await ns.weaken(settings.target);
            // yyy
          }


          let gMul = 5;
          let wMul = 4;
          //dToast(`Threads  slots: ${slots} G: ${growCount} W: ${weakCount} `)
          let zwischensumme = Math.ceil((growCount + weakCount) / slots)
          gMul *= zwischensumme;
          wMul *= zwischensumme;
          growCount = Math.ceil(growCount / zwischensumme);
          weakCount = Math.ceil(weakCount / zwischensumme);

          zwischensumme = (slots - growCount - weakCount);
          weakCount += zwischensumme;


          dToast(`slots: ${slots} growCount: ${growCount} (${gMul}) weakCount: ${weakCount} (${wMul})  `)

          // xxx
          for (let name of index) {
            // slots ausrechnen
            // starte die scripts mit grow
            // reduziere growCount um die slotanzahl
            // dann weak --> rest grow (für hackinglvl)
            let count = Math.floor(botNet[name]['maxRam'] / 1.75);
            dToast(`${name}  count: ${count} `)

            if (weakCount > 0) { // es muß noch geweaked werden
              if (count >= weakCount) { // es sind genug slots auf diesem computer
                dToast(`    weaking  weakCount: ${weakCount} `)
                ns.exec(settings.files.weaking, name, weakCount, ...[settings.target, weakCount, wMul]);
                count -= weakCount;
                weakCount = 0;
              } else {  // es sind NICHT genug slots auf diesem computer
                if (count > 0) {
                  dToast(`    weaking  count: ${count} `)
                  ns.exec(settings.files.weaking, name, count, ...[settings.target, count, wMul]);
                  weakCount -= count;
                  count = 0;
                }
              }
            }
            dToast(`  remaining weakCount: ${weakCount} `)

            if (count > 0) {  // rest wird gegrowth
              dToast(`    growing  count: ${count} `)
              ns.exec(settings.files.growing, name, count, ...[settings.target, count, gMul]);
              growCount -= count;
            }
            dToast(`  remaining growCount: ${growCount} `)
          }

          //selber warten also "weaken"
          for (let i = 0; i < wMul; i++) {
            await ns.weaken(settings.target);
          }

          // xxx









          // end slots reichen nicht aus
        }
        // und von vorne
        scriptChaining(ns, 'spider', 'evaluate', ns.getScriptName());
        break;
      }

      /* ports: ns.getServerNumPortsRequired(node),
      hackingLevel: ns.getServerRequiredHackingLevel(node),
      maxMoney: ns.getServerMaxMoney(node),
      growth: ns.getServerGrowth(node),
      growCount: growCount,
      weakCount: weakCount,
      isReady: isReady,
      needGrows: needGrows,
      needWeakens: needWeakens,
      minSecurityLevel: ns.getServerMinSecurityLevel(node),
      baseSecurityLevel: ns.getServerBaseSecurityLevel(node),
      maxRam: ns.getServerMaxRam(node),
      files: ns.ls(node),
      children: children,
      parent: parent, */

      break;
    case 'stop':
      settings.resetItem('nextAction');
      break;

    default:
  }




  /**     let action = 'spider';
    let script = settings.files[action];

    ns.tprint(`[${timeStamp()}] Übergebe an Skript '${options.nextScript}'`)
    ns.spawn(options.nextScript, { threads: 1, spawnDelay: 50 }) */

  // Plan:: 1.1 bei 8gb sind wir noch am anfang und sollten NUR n00dles schröpfen (10-20min)
  // Plan:: 1.1a  daten sammeln und HGW-Scripte verteilen --> spider <100ms
  // Plan:: 1.1b  entscheidungsfindung 
  // Plan:: 1.1c  HGW gegen n00dles
  // Plan:: 1.1d  spider ... a s o 
  // Plan:: 1.2 hier nen teuflisch guten plan machen oder ram ausreizen AKA kommt später ...



  ns.tprint(`[${timeStamp()}] Skript '${ns.getScriptName()} endet bei EOF'`);


  function dToast(msg) {
    if (debug) ns.tprint('info: ' + msg);
  }

} // end main

function scriptChaining(ns, action, nextAction = undefined, nextScript = undefined) {
  let script = settings.files[action];
  settings.setItem('nextAction', nextAction);
  settings.setItem('lastAction', action);
  ns.tprint(`[${timeStamp()}] Übergebe an Skript '${script}'`)
  ns.spawn(script, { threads: 1, spawnDelay: settings.spawnDelay }, nextScript);
  ns.exit()
}

// Formelklau ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export function calculateGrowGain(ns, host, threads = 1, cores = 1, opts = {}) {
  threads = Math.max(Math.floor(threads), 0);
  const moneyMax = ns.getServerMaxMoney(host);
  const moneyAvailable = opts.moneyAvailable;
  const rate = growPercent(ns, host, threads, cores, opts);
  return Math.min(moneyMax, rate * (moneyAvailable + threads)) -
    moneyAvailable;
}

/** @param {number} gain money to be added to the server after grow */
export function calculateGrowThreads(ns, host, gain, cores = 1, opts = {}) {
  const moneyMax = ns.getServerMaxMoney(host);
  const moneyAvailable = opts.moneyAvailable;
  const money = Math.min(Math.max(moneyAvailable + gain, 0),
    moneyMax);
  const rate = Math.log(growPercent(ns, host, 1, cores, opts));
  const logX = Math.log(money * rate) + moneyAvailable * rate;
  return Math.max(lambertWLog(logX) / rate - moneyAvailable, 0);
}

function growPercent(ns, host, threads = 1, cores = 1, opts = {}) {
  const ServerGrowthRate = opts.ServerGrowthRate;
  const hackDifficulty = opts.hackDifficulty;
  const growth = ns.getServerGrowth(host) / 100;
  const multiplier = ns.getPlayer().mults.hacking_grow;
  const base = Math.min(1 + 0.03 / hackDifficulty, 1.0035);
  const power = growth * ServerGrowthRate * multiplier * ((cores +
    15) / 16);
  return base ** (power * threads);
}

/** 
* Lambert W-function for log(x) when k = 0 
* {@link https://gist.github.com/xmodar/baa392fc2bec447d10c2c20bbdcaf687} 
*/
function lambertWLog(logX) {
  if (isNaN(logX)) return NaN;
  const logXE = logX + 1;
  const logY = 0.5 * log1Exp(logXE);
  const logZ = Math.log(log1Exp(logY));
  const logN = log1Exp(0.13938040121300527 + logY);
  const logD = log1Exp(-0.7875514895451805 + logZ);
  let w = -1 + 2.036 * (logN - logD);
  w *= (logXE - Math.log(w)) / (1 + w);
  w *= (logXE - Math.log(w)) / (1 + w);
  w *= (logXE - Math.log(w)) / (1 + w);
  return isNaN(w) ? (logXE < 0 ? 0 : Infinity) : w;
}
const log1Exp = (x) => x <= 0 ? Math.log(1 + Math.exp(x)) : x +
  log1Exp(-x);
// Formelklau ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++