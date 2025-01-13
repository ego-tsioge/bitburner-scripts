# Project Decision Points

## Einleitung

###Format
Jede Entscheidung folgt diesem Format:
- **Status**: Proposed | Accepted | Rejected | Deprecated
- **Tags**: Welche Tags sind relevant für diese Entscheidung?
- **Context**: Warum müssen wir diese Entscheidung treffen?
- **Decision**: Was haben wir entschieden?
- **Consequences**: Welche Auswirkungen hat die Entscheidung?
- **Alternatives**: Welche Alternativen wurden betrachtet?
- **Miscellaneous**: Sonstige Informationen, die relevant sein können.

## PDP-001: Auswahl der Hacking-Strategie
- Status: accepted 
- Tags: hacking, strategie, architektur

### Kontext und Problemstellung
Ermittlung der effizientesten Hacking-Strategie für frühe und späte Spielphasen in Bitburner. Benötigt wird ein skalierbarer Ansatz, der mit den wachsenden Möglichkeiten im Spielverlauf mitwächst.

#### Entscheidungsfaktoren
* Effizienz der Geldgenerierung
* RAM-Nutzung und Skalierbarkeit
* Implementierungskomplexität  
* Anpassungsfähigkeit an verschiedene Spielphasen

### Entscheidung
Gewählte Option: "Hybrid-Ansatz mit Batching (#1) für frühe Phase und Übergang zu Predictive Targeting (#2)"

#### Positive Konsequenzen
* Optimale Strategie für verschiedene Spielphasen
* Effiziente frühe Progression durch Batching
* Maximales Spätspiel-Potenzial durch Predictive
* Klarer Übergangspfad zwischen Strategien

#### Negative Konsequenzen
* Höhere Implementierungskomplexität
* Übergangsmanagement erforderlich
* Zusätzliches Monitoring notwendig

### Betrachtete Optionen
1. Batching (HWGW-Muster)
2. Predictive Targeting
3. Multi-Target Opportunistic
4. Wave Attack
5. Distributed Consensus

#### Batching (HWGW)
* Pro: Einfach, zuverlässig, RAM-effizient
* Pro: Präzises Timing und vorhersehbares Verhalten
* Contra: Weniger flexibel
* Contra: Begrenztes Skalierungspotenzial

#### Predictive Targeting
* Pro: Hocheffizient bei verfügbaren Ressourcen
* Pro: Adaptiv an Server-Bedingungen
* Contra: Komplexe Implementierung
* Contra: Höhere RAM-Anforderungen

#### Multi-Target Opportunistic
* Pro: Natürliche Lastverteilung
* Pro: Flexible Zielauswahl
* Contra: Weniger konsistente Ergebnisse
* Contra: Kann optimale Gelegenheiten verpassen

#### Wave Attack
* Pro: Einfache Synchronisation
* Pro: Hohe Spitzenleistung
* Contra: Lange Erholungszeiten
* Contra: Insgesamt ineffizient

#### Distributed Consensus
* Pro: Selbstorganisierend
* Pro: Theoretische Skalierbarkeit
* Contra: Hoher RAM-Overhead
* Contra: Komplexe Koordination

### Übergangs-Indikatoren
Wechsel von Batching zu Predictive wenn:
1. Hardware:
   - Home RAM > 128GB
   - 10+ gekaufte Server
   - Durchschnittliches Server-RAM > 32GB

2. Skills:
   - Hacking Level > 300
   - Formulas.exe verfügbar

3. Netzwerk:
   - 15+ zugängliche Server
   - 5+ High-Tier Ziele
   - Root auf Level 100+ Servern

4. Effizienz:
   - Batch-Ertrag < 15% des max. Geldes
   - RAM-Auslastung > 50%
   - Hack-Zeit > 3 Minuten

## PDP-002: Modul-Architektur
- **Status**: Proposed 
- **Tags**: architektur, module, design

### Kontext und Problemstellung
Der Home-Server, auf dem die Automatisierung laufen soll, verfügt zu Beginn nur über 8GB RAM. Diese Beschränkung macht es unmöglich, alle benötigten Funktionen gleichzeitig auszuführen. 

Die technische Lösung sieht vor, dass Module nacheinander auf Home ausgeführt werden und jeweils maximal 8GB RAM nutzen dürfen. Zwischen den Modulaufrufen muss der Zustand (State) über localStorage persistiert werden, damit die Module aufeinander aufbauen können. Das Hauptmodul main.js übernimmt dabei die Orchestrierung der anderen Module, welche Daten sammeln, Angriffe steuern und sonstige Aufgaben übernehmen.

Diese Architekturentscheidung wirft die Frage auf, wie die verschiedenen Spielmechaniken sinnvoll in Module aufgeteilt werden können. Die Module müssen dabei nicht nur RAM-effizient sein, sondern auch einen klar definierten Verantwortungsbereich haben und über den persistierten State effektiv zusammenarbeiten.

### Entscheidung
Für die Early Game Phase werden folgende Module implementiert:

1. **main.js**
   - Orchestriert die Modulaufrufe
   - Verwaltet den globalen State
   - Steuert den Spielablauf
   - Entwickelt benötigte Programme (BruteSSH.exe etc.)
   - Übernimmt globales Error-Handling

2. **modules/network-spider.js**
   - Scannt das Netzwerk
   - Analysiert Server-Eigenschaften
   - Verwaltet Zugriffsmöglichkeiten (Ports/NUKE)
   - Deployed H/G/W-Skripte auf gehackte Server

3. **modules/hack-manager.js**
   - Wählt optimale Angriffsziele
   - Berechnet H/G/W-Parameter
   - Koordiniert Hack-Operationen
   - Überwacht Hack-Performance

4. **modules/hacknet-manager.js**
   - Verwaltet Hacknet-Nodes
   - Optimiert Upgrades (Level/RAM/Cores)
   - Berechnet ROI
   - Trackt Einnahmen

Zusätzlich werden folgende Binary-Scripts benötigt:
- **bin/hack.js**
- **bin/grow.js**
- **bin/weaken.js**

### Konsequenzen
- **Positiv**
  - Klare Trennung der Verantwortlichkeiten
  - RAM-Effizienz durch sequentielle Ausführung
  - Einfache Erweiterbarkeit für Mid/Late-Game Features
  - Übersichtliches State-Management

- **Negativ**
  - Overhead durch häufige Modul-Wechsel
  - Komplexeres Debugging durch verteilte Ausführung
  - State-Synchronisation muss sorgfältig gehandhabt werden

### Zurückgestellte Spielmechaniken (Mid/Late-Game)
Folgende Mechaniken werden in der initialen Version bewusst nicht implementiert, da sie erst im weiteren Spielverlauf relevant werden:

1. **Server-Management**
   - Kauf und Upgrade eigener Server
   - Kapazitätsplanung
   - Server-Farm Optimierung

2. **Factions**
   - Beitrittskriterien überwachen
   - Einladungen verwalten
   - Reputation aufbauen
   - Augmentations evaluieren/kaufen

3. **Hacknet-Server** (erweiterte Hacknet-Mechanik)
   - Hash-Generierung
   - Hash-Upgrade Management
   - Kapazitätsplanung

4. **Contracts**
   - Auffinden von Contracts
   - Automatische Lösung
   - Reward-Optimierung

5. **Advanced Hacking**
   - Formulas.exe Integration
   - Optimierte Batch-Attacks
   - Predictive Targeting

Diese Mechaniken können in späteren Versionen durch neue Module oder Erweiterung bestehender Module implementiert werden.

## PDP-003: State-Struktur
- **Status**: Draft
- **Tags**: state, design, architektur

### Kontext und Problemstellung
Für die Kommunikation zwischen den Modulen und das Speichern von Zuständen wird eine effiziente State-Struktur benötigt. Dabei müssen verschiedene Datentypen wie Server-Informationen, Hack-Status, Hacknet-Daten und Programm-Fortschritte persistent gespeichert werden. Die Struktur muss sowohl performant als auch wartbar sein und gleichzeitig den limitierten Speicherplatz des localStorage optimal nutzen.

### Entscheidung

Ich sehe Bedarf für folgende Strukturen:
- networkState
- serverState
- playerState
- processState
- globalState

Jede Struktur bekommt 2 Timestamps (updateStarted, updateCompleted) und werden bei Aktualisierung der Struktur mit befüllt. Idealer weise haben sie die gleichen Werte. Ein unterschied deutet auf korrupte states hin.

Konventionen:
- Datenvalidität wird durch Sterne markiert:
  ** = nur kurzfristig valide (sollte kurfristig vor verwendung erhoben werden)
  * = ist langfristig valide (zB durch Spieler-Aktionen)
  kein Stern = ist statisch
- Timestamps immer in UTC als Unix timestamp in ms.

#### Strukturdefinition für NETWORK STATE
```javascript
const networkState = {
	// Metadaten für State-Validierung
    updateStarted: 1705093603000,    
    updateCompleted: 1705093603000,  

    servers: {
        "n00dles": {                 // Server-Hostname als Key
            hostname: "n00dles",      // Server-Hostname (server.hostname)
            ip: "192.168.0.1",       // IP-Adresse des Servers (server.ip)
            cores: 1,                // Anzahl CPU-Kerne (server.cpuCores)
            organization: "Noodles",  // Name der Organisation (server.organizationName)
            isHome: false,           // Ist Home-Server? (hostname === 'home')
            purchased: false,        // Von Spieler gekauft? (server.purchasedByPlayer)
            connections: ["home", "foodnstuff"], // Direkte Netzwerkverbindungen (ns.scan())
            
            admin: false,            // Root-Rechte vorhanden? (server.hasAdminRights)
            backdoored: false,       // Backdoor installiert? (server.backdoorInstalled)
            level: 1,                // Benötigtes Hacking-Level (server.requiredHackingSkill)
            
            ram: {
                used: 0.0,           // Genutztes RAM (server.ramUsed)
                max: 4.0,            // Verfügbares RAM (home: maxRam - RESERVED_RAM, sonst: maxRam)
                free: 4.0,           // Freies RAM (max - used)
                trueMax: 4.0         // Absolutes RAM Maximum (server.maxRam)
            },
            
            power: 2,                // Berechnete aus (Math.max(0, Math.log2(maxRam)))
            
            ports: {
                required: 0,          // Benötigte offene Ports (server.numOpenPortsRequired)
                openPortCount: 0,     // Anzahl offener Ports (server.openPortCount)
                ftp: false,           // FTP-Port offen? (server.ftpPortOpen)
                http: false,          // HTTP-Port offen? (server.httpPortOpen)
                smtp: false,          // SMTP-Port offen? (server.smtpPortOpen)
                sql: false,           // SQL-Port offen? (server.sqlPortOpen)
                ssh: false            // SSH-Port offen? (server.sshPortOpen)
            },
            
            security: {
                base: 1.0,           // Basis-Sicherheitslevel (server.baseDifficulty)
                level: 1.0,          // Aktuelles Sicherheitslevel (server.hackDifficulty)
                min: 1.0             // Minimales Sicherheitslevel (server.minDifficulty)
            },
            
            money: {
                available: 0.0,      // Aktuell verfügbares Geld (server.moneyAvailable)
                max: 1750000.0,      // Maximales Geld (server.moneyMax)
                growth: 3000         // Server-Wachstumsfaktor (server.serverGrowth)
            }
        }
    }
};
```

#### Strukturdefinition für PLAYER STATE
```javascript
const playerState = {
	// Metadaten für State-Validierung
    updateStarted: 1705093603000,    // Zeitstempel wenn Update startet (UTC ms)
    updateCompleted: 1705093603000,  // Zeitstempel wenn Update endet (UTC ms)

    // Basis-Informationen (ns.getPlayer())
    name: "ego-tsioge",              // player.name - Spielername
    money: 0,                        // player.money - Verfügbares Geld
    
    hp: {                            // player.hp - Gesundheitsstatus
        current: 100,                // .current - Aktuelle HP
        max: 100                     // .max - Maximum HP
    },

    // Skill-System (ns.getPlayer())
    stats: {
        hacking: {
            level: 1,                // player.hacking - Aktuelles Level
            exp: 0,                  // player.exp.hacking - Gesammelte XP
            mult: 1.0                // player.mults.hacking - Multiplikator
        },
        strength: {
            level: 1,                // player.strength
            exp: 0,                  // player.exp.strength
            mult: 1.0                // player.mults.strength
        },
        defense: {
            level: 1,                // player.defense
            exp: 0,                  // player.exp.defense
            mult: 1.0                // player.mults.defense
        },
        dexterity: {
            level: 1,                // player.dexterity
            exp: 0,                  // player.exp.dexterity
            mult: 1.0                // player.mults.dexterity
        },
        agility: {
            level: 1,                // player.agility
            exp: 0,                  // player.exp.agility
            mult: 1.0                // player.mults.agility
        },
        charisma: {
            level: 1,                // player.charisma
            exp: 0,                  // player.exp.charisma
            mult: 1.0                // player.mults.charisma
        }
    },

    // Hacking-Multiplikatoren (ns.getPlayer().mults)
    hackingMults: {
        chance: 1.0,                 // .hacking_chance - Erfolgswahrscheinlichkeit
        speed: 1.0,                  // .hacking_speed - Ausführungsgeschwindigkeit
        money: 1.0,                  // .hacking_money - Geldertrag
        growth: 1.0                  // .hacking_grow - Wachstumsrate
    },

    // Standort & Arbeit (ns.getPlayer())
    location: {
        city: "Sector-12",          // player.city - Aktuelle Stadt
        lastCity: "Sector-12",      // Vorherige Stadt für Rückreise
        location: "Home",           // player.location - Spezifischer Ort
        working: {
            isWorking: false,       // player.currentWork !== null
            type: null,             // player.currentWork?.type - Art der Arbeit
            description: null       // player.currentWork?.description - Details
        },
        focus: false                // player.focus - Fokus-Modus aktiv?
    },

    // Zugriffs-Level (ns.getPlayer())
    access: {
        programs: {
            "BruteSSH.exe": false,   // Verfügbarkeit via ns.fileExists()
            "FTPCrack.exe": false,   
            "relaySMTP.exe": false,  
            "HTTPWorm.exe": false,   
            "SQLInject.exe": false,  
            "ServerProfiler.exe": false,
            "DeepscanV1.exe": false, 
            "DeepscanV2.exe": false, 
            "AutoLink.exe": false,   
            "Formulas.exe": false    
        },
        tix: {
            api: false,              // player.hasTixApiAccess - Basis-Börsenzugang
            wse: false,              // player.hasWseAccount - World Stock Exchange Zugang
            fourSigma: false,        // player.has4SData - 4S Marktdaten Zugang
            fourSigmaApi: false      // player.has4SDataTixApi - 4S API Zugang
        }
    },

    // Factions (ns.getPlayer())
    factions: {
        current: [],                // player.factions - Aktive Mitgliedschaften
        invites: [],               // player.factionInvitations - Offene Einladungen
        reputation: {              // Reputation via ns.getFactionRep() pro Faction           
            "CyberSec": 0,         // Reputation bei CyberSec
            // ... weitere Factions
        }
    },

    // Hacknet (ns.hacknet.*)
	hacknet: {
		nodes: 0,               // numNodes() - Anzahl Nodes
		production: {
			current: 0,         // Summe aller getNodeStats(i).production
			total: 0           // Summe aller getNodeStats(i).totalProduction
		}
    },

    // BitNode Informationen
    bitNode: {
        current: 1,                // ns.getResetInfo().currentNode
        multipliers: {             // ns.getBitNodeMultipliers()
            hackingMoney: 1.0,     // .HackingMoney - Geld-Multiplikator
            hackingGrowth: 1.0,    // .HackingGrowth - Wachstums-Multiplikator
            hackingLevel: 1.0,     // .HackingLevelMultiplier - Level-Multiplikator
            hacknetProduction: 1.0  // .HacknetNodeMoney - Hacknet-Produktion
        }
    },

    // Spielzeit-Tracking
    playtime: {
        total: 0,                  // player.totalPlaytime - Gesamte Spielzeit
        sinceLastAug: 0,          // ns.getResetInfo().lastAugReset - Zeit seit letztem Aug
        sinceLastNode: 0          // ns.getResetInfo().lastNodeReset - Zeit seit Node-Reset
    },

    // Fortschritt & Achievements
    progress: {
        peopleKilled: 0,           // player.numPeopleKilled - Getötete NPCs
        karma: 0,                  // ns.heart.break() - Karma-Wert
        achievements: [],          // player.achievements - Freigeschaltete Achievements
        sourceFiles: {}           // player.sourceFileLvl - Freigeschaltete Source Files
    }
};
```

#### Strukturdefinition für PROCESS STATE
```javascript
const processState = {
	// Metadaten für State-Validierung
    updateStarted: 1705093603000,
    updateCompleted: 1705093603000,  

    processes: {                     // Aktive Prozesse nach PID
        "1": {
            filename: "hack.js",     // Name des Script-Files
            args: ["n00dles"],       // Script-Parameter
            pid: 1,                  // Prozess-ID
            server: "home",          // Ausführender Server
            threads: 1,              // Anzahl Script-Threads
            ramUsage: 1.6,          // RAM-Verbrauch in GB
            logs: []                 // Script-Ausgaben
        }
    }
};
```

#### Strukturdefinition für GLOBAL STATE
```javascript
const globalState = {
    // Metadaten für State-Validierung
    updateStarted: 1705093603000,    
    updateCompleted: 1705093603000,  

	// Versionierung für alle States
    versions: {
        global: "1.0.0",
        network: "1.0.0",
        player: "1.0.0",
        process: "1.0.0"    // für später
    },

    time: {
        game: 0,                    // Spielzeit in Millisekunden
        real: 1705093603000,        // Reale Zeit (UTC)
        offline: 0,                 // Zeit seit letztem Online
        lastSave: 1705093603000,    // Letzte Speicherung
        lastAug: 1705093603000      // Letzte Augmentation
    },

    // Globale Einstellungen
    settings: {
        minSecurityBuffer: 1,        // Sicherheits-Puffer für Hacking
        minMoneyBuffer: 100000,      // Minimales Geld auf der Bank
        reservedHomeRam: 4,          // Reserviertes RAM auf home
        logLevel: 'info'             // Logging Level (debug/info/warn/error)
    },

    // Aktuelle Ziele/Prioritäten
    objectives: {
        primary: 'money',            // Haupt-Fokus (money/rep/hack_xp)
        target: 'n00dles',          // Aktueller Server-Target
        hacknet: {
            enabled: true,           // Hacknet-Automatisierung aktiv?
            maxSpend: 0.5            // Max. 50% des Geldes für Hacknet
        }
    },

    // Script-Status
    modules: {
        spider: {
            lastRun: 0,              // Letzter Scan-Durchlauf
            interval: 60000          // Scan alle 60 Sekunden
        },
        hacknet: {
            lastRun: 0,
            interval: 1000
        }
        // ... weitere Module
    },

    phase: {
        current: 'early',            // Aktuelle Spielphase
        thresholds: {
            midGame: {
                // Mind. eines dieser Kriterien für Mid-Game
                criteria: {
                    hackLevel: 100,          // Hacking-Level als Indikator
                    portOpeners: 2,          // Anzahl verfügbarer Port-Programme
                    homeRam: 64,             // GB RAM auf Home-Server
                    purchasedServers: 5      // Anzahl gekaufter Server
                }
            },
            lateGame: {
                // Mind. eines dieser Kriterien für Late-Game
                criteria: {
                    hackLevel: 500,          // Fortgeschrittenes Hacking-Level
                    portOpeners: 4,          // Mehrere Port-Programme
                    homeRam: 1024,           // 1TB RAM auf Home
                    factionRep: true,        // Wichtige Factions erschlossen
                    augmentations: 5         // Anzahl installierter Augmentations
                }
            }
        }
    }
};
```

## PDP-004: Modul-Kommunikation
- **Status**: Draft
- **Tags**: kommunikation, design, architektur

### Kontext und Problemstellung
Die Module werden sequentiell ausgeführt und müssen ihre Ergebnisse und Anforderungen untereinander kommunizieren. Dies geschieht über den persistierten State, erfordert aber klare Regeln für Datenzugriff und -modifikation. Zusätzlich muss eine Versionierung des States implementiert werden, um Kompatibilitätsprobleme bei Updates zu vermeiden und eine geordnete Migration zu ermöglichen.


## PDP-005: Error-Handling
- **Status**: Draft
- **Tags**: fehlerbehandlung, robustheit, design

### Kontext und Problemstellung
In einem verteilten System mit sequentieller Modulausführung können verschiedene Fehlerszenarien auftreten: korrupter State, Modul-Crashes, Netzwerkfehler oder unerwartete Spielzustände. Es wird ein robustes Error-Handling-System benötigt, das diese Fehler erkennt, behandelt und eine sichere Wiederaufnahme des Betriebs ermöglicht, ohne dass manuelle Eingriffe erforderlich sind.


## PDP-006: Performance-Tracking
- **Status**: Draft
- **Tags**: monitoring, optimierung, metriken

### Kontext und Problemstellung
Um die Effizienz der Automatisierung zu messen und zu optimieren, müssen relevante Metriken erfasst und ausgewertet werden. Dies umfasst Hack-Erfolgsraten, Einnahmen-Entwicklung, RAM-Nutzung und Modul-Laufzeiten. Die Herausforderung besteht darin, die richtigen Metriken zu identifizieren, effizient zu speichern und so aufzubereiten, dass daraus Optimierungspotentiale erkannt werden können.



















