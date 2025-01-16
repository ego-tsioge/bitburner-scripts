# PDP-003: State-Strukturen

## Status
- Status: accepted
- Tags: state, design, architektur

## Kontext und Problemstellung
Für die Kommunikation zwischen den Modulen und das Speichern von Zuständen wird eine effiziente State-Struktur benötigt. Dabei müssen verschiedene Datentypen wie Server-Informationen, Hack-Status, Hacknet-Daten und Programm-Fortschritte persistent gespeichert werden. Die Struktur muss sowohl performant als auch wartbar sein und gleichzeitig den limitierten Speicherplatz des localStorage optimal nutzen.
Die Herausforderung liegt dabei in der Notwendigkeit, Spielzustände zwischen Modulaufrufen zu persistieren.

## Entscheidung
Implementierung von drei separaten State-Strukturen:
- networkState: Server-Informationen und Netzwerk-Topologie
- playerState: Spieler-Attribute und Fortschritte
- globalState: Übergreifende Einstellungen und Metriken
Zur Umsetzung von predictive targeting wird wohl eine zusätzliche processState-Struktur benötigt. 

Jede Struktur erhält Timestamps für Validierung:
- updateStarted: Timestamp der zum start des updates geschrieben wird
- updateCompleted: nochmal der gleiche Timestamp, geschrieben zum Update-Ende

## Konsequenzen

### Positive Konsequenzen
- Klare Zuordnung von Daten zu Verantwortungsbereichen
- Einfache Erkennung von State-Korruption durch Timestamps
- Modulare Aktualisierung einzelner State-Bereiche
- Gute Skalierbarkeit für neue Spielmechaniken

### Negative Konsequenzen
- Overhead durch Timestamp-Verwaltung
- Potenzielle Redundanz zwischen States
- Komplexere State-Verwaltung in main.js

## Strukturdefinitionen
### Strukturdefinition für NETWORK STATE
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

### Strukturdefinition für PLAYER STATE
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

### Strukturdefinition für PROCESS STATE
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

### Strukturdefinition für GLOBAL STATE
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
