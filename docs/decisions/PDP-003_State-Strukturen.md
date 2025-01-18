# PDP-003: State-Strukturen
- **Status**: Accepted
- **Tags**: state, design, architektur

## Kontext und Problemstellung
Für die Kommunikation zwischen den Modulen und das Speichern von Zuständen wird eine effiziente State-Struktur 
benötigt. 

Konkret werden folgende Strukturen benötigt:
1. **Network State**: Detaillierte Server- und Netzwerkinformationen
2. **Player State**: Aktuelle Spieler-Attribute und Fortschritte
3. **Global State**: Kompakter Überblick über systemweite Einstellungen

Für das spätere Spiel wird zusätzlich eine Process-State-Struktur für predictive targeting vorgesehen.

## Entscheidung
Die drei Datenstrukturen sollen wie in [Strukturdefinitionen] beschrieben implementiert werden.

## Konsequenzen

postponed

## Strukturdefinitionen
### Strukturdefinition für NETWORK STATE
```javascript
const networkState = {  

    servers: {
        "n00dles": {                 // Server-Hostname als Key
            hostname: "n00dles",     // Server-Hostname (server.hostname)
            ip: "192.168.0.1",       // IP-Adresse des Servers (server.ip)
            cores: 1,                // Anzahl CPU-Kerne (server.cpuCores)
            organization: "Noodles", // Name der Organisation (server.organizationName)
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
wegen fehlender Erkenntnisse wird diese Struktur erst später implementiert.

### Strukturdefinition für GLOBAL STATE
```javascript
const globalState = {

	// Versionierung für alle States
    version: "1.0.0",

    minSecurityBuffer: 1,        // Sicherheits-Puffer für Hacking
	minMoneyBuffer: 100000,      // Minimales Geld auf der Bank
	reservedHomeRam: 8,          // Reserviertes RAM auf home
	logLevel: 'info'             // Logging Level (debug/info/warn/error)

    // Aktuelle Ziele/Prioritäten
    objectives: {
        focus: 'money',             // Haupt-Fokus (money/rep/hack_xp)
        target: 'n00dles',          // Aktueller Server-Target
        hacknet: {
            enabled: true,           // Hacknet-Automatisierung aktiv?
            maxSpend: 0.5            // Max. 50% des Geldes für Hacknet
        }
    }
};
```
