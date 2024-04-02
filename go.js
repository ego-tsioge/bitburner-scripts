// go.js rewrite 2024/04

/**
 * kernprogramm:
 * ******* TODO ******************************************
 * Kernprogramm, das folgende Aufgaben löst:
 * - Server finden: Das Programm soll regelmäßig die Server suchen, die mit
 *   Home verbunden sind.
 * - weitere Ressourcen ermitteln: Hacks müssen freigespielt werden, das soll
 *   das Programm auch machen
 * - Geld verdienen: unter den bekannten Servern wird nach angreifbaren
 *   Servern gesucht, diese gehackt und ausgebeutet
 * - Strategie: zeitlich abgestimmtes batching WGHW? irgendwann mal komplett
 *   lesen:
 *   https://steamcommunity.com/app/1812820/discussions/4/4731597528368392803/
 * - Ziele priorisieren: 
 * - Vorgänge monitoren: was soll da stehen?
 * - nebenher Hacknet bedienen
 * - server kaufen : dazu gehört auch schon gekaufte server erkennen, und wenn
 *   nötig abstoßen und verbessern
 *   
 * @param {Object} ns - bitburners vordefinierte Netscript funktionen
 * 
 */
export async function main(ns) {
  // ******* initialisierung ******************************************
  ns.tail();                    // öffnet das infofenster zum prozess
  ns.disableLog('ALL');         // unterdrückt die meisten warnungen/mitteilungen

  /** alle cracks fürs spiel (dateiname) und der befehl um ihn auszuführen */
  const cracks = new Map([
    ["BruteSSH.exe", ns.brutessh],
    ["FTPCrack.exe", ns.ftpcrack],
    ["relaySMTP.exe", ns.relaysmtp],
    ["HTTPWorm.exe", ns.httpworm],
    ["SQLInject.exe", ns.sqlinject]]);

  let server;                   // alle server im spiel TODO:eventuell muss man die liste später aktualisieren
  let bots = [];                // hier sollten die 'Helfer' drin stehen
  let targets = ["n00dles"];    // hier unsere Ziele, TODO:für den start erstmal nur das aus dem Tutorial --> bis wir eine funktion haben die ziele auswählt
  const waitTime = 500;         // wartezeit für Endlosschleife (milliSek)

  let numCracks;                // merker welche stufe schon angreifen kann


  let go_on = true;             // variable mit der die hauptschleife beendet werden kann


  // ******* hauptschleife ******************************************
  while (go_on) {
    //sammle daten
    numCracks = getNumCracks(ns, cracks);
    server = listServer(ns);
    // hackbare server
    bots = server.filter(s => makeBot(s));
    //serverAktion bestimen
  ns.tprint(bots);
    await ns.sleep(waitTime);
    go_on = false;
  } // end while-loop


  // ******* interne funktionen ******************************************

  /* ------------------------------------------------------------------- *//**
   * Prüft, ob die Dateien in Array cracks auf dem Home-Server vorhanden sind
   * (aka freigespielt sind) und gibt die Anzahl der funktionierenden Cracks
   * zurück.
   *
   * @return {number} The number of working cracks.
   */
  function getNumCracks() {
    let num = 0;
    for (let crack of cracks) {
      if (ns.fileExists(crack[0], 'home')) num++;
    }
    return num;
  } // end getNumCracks()

  /* ------------------------------------------------------------------- *//**
   * Listet alle Server, die von 'home' aus erreichbar/sichtbar sind. 
   *
   * @param {ns} ns
   * @return {string[]} alle Server die von Home aus erreichbar/sichtbar sind
   * ---------------------------------------------------------------------- */
  function listServer(ns) {
    /**
     * hier merken wir uns die server die wir angesehen haben
     *
     * @type {Array}
     */
    let ergebnis = [];
    /**
     * listet die server die wir noch anschauen wollen
     *
     * @type {Array}
     */
    let speicher = ['home'];

    //solange noch was im speicher liegt
    while (speicher.length > 0) {
      //nehme ein element aus dem speicher
      let server = speicher.shift();

      //prüfe ob wir es noch _nicht_ angeschaut haben
      if (!ergebnis.includes(server)) {
        //wenn ja, merke es schonmal als angeschaut
        ergebnis.push(server);

        // alle nachbarn in den speicher legen
        let nachbarn = ns.scan(server);
        for (let child of nachbarn) {
          speicher.push(child);
        }
      }
    } // end while

    // wenn wir gekaufte server haben, füge sie zum ergebnis hinzu 
    // --> passiert schon über scan

    // ergebnis zurückgeben
    return ergebnis;
  } // end listServer()

  /* ------------------------------------------------------------------- *//**
   * Prüft ob *server* mit den bekannten cracks gehackt werden kann
   *
   * @param {string} server The server to be checked
   * @return {boolean} True if able to hack, False otherwise.
   * ---------------------------------------------------------------------- */
  function canHack(server) {
    let reqPorts = ns.getServerNumPortsRequired(server);
    return numCracks >= reqPorts;
  } // end canHack()

  /* ------------------------------------------------------------------- *//**
   * Funktion um unser Script zu verteilen, es öffnet auch die Server je nach
   * vorhandenen cracks
   *
   * @param {string[]} botNet liste der server, die uns helfen
   * @param {string} script das script das ausgeführt werden soll
   * @param {string} target der server der geschröpft werden soll
   * @return {Promise} { description_of_the_return_value }
   * ---------------------------------------------------------------------- */
  async function deployScript(botNet, script, target) {
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

      // kopiere unser script auf den server (überschreibt automatisch)


      // starte unser script so oft wie ram vorhanden ist
      let maxThreads = Math.floor(ns.getServerMaxRam(server) / 1.75);
      if (maxThreads > 0) {
        await ns.scp(script, server);
        ns.print("S: " + server + " hTime:" + ns.getHackTime(server) + "  wTime:" + ns.getWeakenTime(server) + "  gTime:" + ns.getGrowTime(server));
        ns.exec(script, server, maxThreads, target);

      }

    }
  } // end deployScript()





  /*---------------------------------------------------------------------*//**
   * @brief      Makes a bottom.
   *
   * @param      server  The server
   *
   * @return     { description_of_the_return_value }
   *------------------------------------------------------------------------*/
  function makeBot(server) {
    if (ns.hasRootAccess(server)) {
      // ist schon gecrackt
      return true;
    }
    else {
      // wenn kein rootAccess dann hacken
      // dazu prüfen ob wir mehr cracks haben als der server benötigt
      if (canHack(server)) {
        // wenn ja, gehe unsere cracks durch und führe sie aus
        for (let crack of cracks) {
          if (ns.fileExists(crack[0], 'home')) {
            crack[1](server);
          }
        }
        // anschliesend führe NUKE aus
        ns.nuke(server);
        //erfolg, der server gehört dazu
        return true;
      }
      else {
        // cracken nicht möglich
        return false;
      }
    }
  } // end makebot()

} // end main
