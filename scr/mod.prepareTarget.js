import { settings, timeStamp } from "./lib.helpers.js";

/** @param {NS} ns */
export async function main(ns) {

	const options = ns.flags([
		['botnetName', settings.botnetName],	// default botnetName
		['help', false],			// a default boolean means this flag is a boolean
		['nextScript', undefined]
	]);
	if (options.help) {
		let info = "INFO: dieses script nimmt die serverdaten, ... und tut dinge";
		ns.tprint(info);
		return 0
	}

	// wirklicher start ***************************************************************
	ns.tprint(`[${timeStamp()}] Starte Skript '${ns.getScriptName()}'`)


      settings.setItem('lastAction', aktion);
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


}