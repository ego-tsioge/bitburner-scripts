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

    name: "ego-tsioge",              // Spielername
    money: 0,                        // Verfügbares Geld
    
    hp: {
        current: 100,                // Aktuelle Lebenspunkte
        max: 100                     // Maximale Lebenspunkte
    },

    stats: {
        hacking: {
            level: 1,                // Hacking-Fähigkeitslevel
            exp: 0,                  // Gesammelte Hacking-Erfahrung
            mult: 1.0                // Multiplikator durch Augmentations
        },
        strength: {
            level: 1,                // Stärke-Level für Kampf
            exp: 0,                  // Gesammelte Stärke-Erfahrung
            mult: 1.0                // Multiplikator durch Augmentations
        },
        defense: {
            level: 1,                // Verteidigungs-Level für Kampf
            exp: 0,                  // Gesammelte Verteidigungs-Erfahrung
            mult: 1.0                // Multiplikator durch Augmentations
        },
        dexterity: {
            level: 1,                // Geschicklichkeits-Level für Kampf
            exp: 0,                  // Gesammelte Geschicklichkeits-Erfahrung
            mult: 1.0                // Multiplikator durch Augmentations
        },
        agility: {
            level: 1,                // Beweglichkeits-Level für Kampf
            exp: 0,                  // Gesammelte Beweglichkeits-Erfahrung
            mult: 1.0                // Multiplikator durch Augmentations
        },
        charisma: {
            level: 1,                // Charisma-Level für Verhandlungen
            exp: 0,                  // Gesammelte Charisma-Erfahrung
            mult: 1.0                // Multiplikator durch Augmentations
        }
    },

    location: {
        city: "Sector-12",          // Aktuelle Stadt
        lastCity: "Sector-12",      // Vorherige Stadt für Rückreise
        location: "Home",           // Spezifischer Ort in der Stadt
        working: {
            isWorking: false,       // Arbeitet der Spieler gerade?
            type: null,             // Art der Arbeit (Firma/Faction/etc)
            description: null       // Details zur aktuellen Arbeit
        }
    },

    access: {
        programs: {
            "BruteSSH.exe": false,   // SSH Port Öffner verfügbar?
            "FTPCrack.exe": false,   // FTP Port Öffner verfügbar?
            "relaySMTP.exe": false,  // SMTP Port Öffner verfügbar?
            "HTTPWorm.exe": false,   // HTTP Port Öffner verfügbar?
            "SQLInject.exe": false,  // SQL Port Öffner verfügbar?
            "ServerProfiler.exe": false, // Server-Analyse Tool verfügbar?
            "DeepscanV1.exe": false,    // Scanner V1 verfügbar?
            "DeepscanV2.exe": false,    // Scanner V2 verfügbar?
            "AutoLink.exe": false,      // Auto-Connect Tool verfügbar?
            "Formulas.exe": false       // Formulas API verfügbar?
        },
        tix: {
            api: false,              // Basis-Börsenzugang
            wse: false,              // World Stock Exchange Zugang
            fourSigma: false,        // 4S Marktdaten Zugang
            fourSigmaApi: false      // 4S API Zugang
        }
    },

    factions: {
        current: [],                // Liste aktiver Factions
        invites: [],               // Offene Faction-Einladungen
        reputation: {              
            "CyberSec": 0,         // Reputation bei CyberSec
            // ... weitere Factions
        }
    },

    resources: {
        hacknet: {
            nodes: 0,               // Anzahl Hacknet Nodes
            production: 0,          // Aktuelle Produktion/Sekunde
            money: 0                // Gesamteinnahmen
        },
        servers: {
            purchased: [],          // Liste gekaufter Server
            total: 0,              // Gesamtanzahl Server
            ram: {
                max: 0,            // Max RAM pro Server
                trueMax: 0         // Absolutes RAM Limit
            }
        }
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

    time: {
        game: 0,                    // Spielzeit in Millisekunden
        real: 1705093603000,        // Reale Zeit (UTC)
        offline: 0,                 // Zeit seit letztem Online
        lastSave: 1705093603000,    // Letzte Speicherung
        lastAug: 1705093603000      // Letzte Augmentation
    },

    bitnode: {
        number: 1,                  // BitNode Nummer
        level: 1,                   // BitNode Level
        multipliers: {
            hackingMoney: 1.0,      // Geld-Multiplikator für Hacking
            hackingSpeed: 1.0,      // Geschwindigkeits-Multiplikator
            // ... weitere Multiplikatoren
        }
    },

    achievements: {
        "BN1": true,               // BitNode 1 abgeschlossen
        // ... weitere Achievements
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



















# alte Entscheidungen

### aPDP-002: Persistenz-Methode
- **Status**: Accepted
- **Context**: 
  - Module benötigen Zugriff auf gemeinsame Daten
  - State muss zwischen Script-Runs persistent sein
  - Für Datenpersistenz bietet Bitburner:
    - localStorage
    - Dateisystem
    - Ports

- **Decision**: 
  - localStorage als primäre Persistenz-Methode
  - JSON.stringify/parse für Objektspeicherung
  - Klare Key-Struktur für verschiedene Datentypen

- **Consequences**: 
  - (+) Einfache, schnelle Implementierung
  - (+) Gute Performance beim Lesen/Schreiben
  - (+) Überlebt Browser-Refresh/Spiel-Neustarts
  - (-) Begrenzte Speichergröße beachten
  - (-) JSON Konvertierung notwendig
  - (-) Keine komplexen Queries möglich

- **Alternatives**: 
  1. localStorage
     Daten werden im Browser-localStorage gespeichert. Dies ist eine einfache Key-Value Speicherung, die Strings persistent ablegen kann.
     
     Vorteile:
     - Einfache API (setItem/getItem)
     - Schneller Zugriff
     - Überlebt Browser-Refresh
     
     Nachteile:
     - Nur Strings (JSON.stringify nötig)
     - Begrenzte Größe
     - Keine Struktur/Queries

  2. Dateisystem
     Bitburner bietet Zugriff auf ein virtuelles Dateisystem, in dem Daten als Textdateien gespeichert werden können.
     
     Vorteile:
     - Unbegrenzte Datenmenge
     - Strukturierung in Ordnern möglich
     - Gute Lesbarkeit/Debugging
     
     Nachteile:
     - Langsamer als localStorage
     - Mehr RAM-Verbrauch
     - Komplexere API

  3. Ports
     Bitburner stellt nummerierte Ports für die Kommunikation zwischen Scripts zur Verfügung.
     
     Vorteile:
     - Echtzeitkommunikation möglich
     - Gut für temporäre Daten
     - Einfaches Interface
     
     Nachteile:
     - Nicht persistent
     - Begrenzte Anzahl (20)
     - Nur für aktive Kommunikation

### aPDP-003: Modul-Auswahl (Frühe Phase)
- **Status**: Accepted
- **Context**: 
  - Spielmechaniken müssen in sinnvolle Module aufgeteilt werden
  - Verfügbare Spielmechaniken nach Spielfortschritt:
    
    Frühe Phase:
    - Server
      - Scannen und Analysieren
      - Hacken (hack/grow/weaken)
      - Backdoors installieren
    - Hacknet
      - Nodes kaufen und upgraden
    - Programme
      - Entwickeln (create_program)
      - Ausführen
    
    Mittlere Phase:
    - Server kaufen und verwalten
    - Hacknet-Server und Hashes
    - Factions und Augmentations
    - Contracts
    
    Späte Phase:
    - Gang Management
    - Sleeve Management
  
  - Abhängigkeiten zwischen Mechaniken beachten
  - RAM-Effizienz durch granulare Module

- **Decision**: 
  - Fokus auf frühe Spielphase
  - Benötigte Module:
    - Server
      - Scannen und Analysieren
      - Hacken (hack/grow/weaken)
      - Backdoors installieren
    - Hacknet
      - Nodes kaufen und upgraden
    - Programme
      - Entwickeln (create_program)
      - Ausführen

- **Consequences**: 
  - (+) Klarer Fokus auf essentielle Funktionen
  - (+) Überschaubare Anzahl Module zu Beginn
  - (-) Spätere Spielmechaniken erfordern neue PDPs (siehe aPDP-006)
  - (-) Mögliche Restrukturierung bei Phasenübergängen

- **Alternatives**: 
  1. Alle Phasen direkt umsetzen
     + Keine späteren Umstrukturierungen
     + Vollständige Architektur von Anfang an
     - Hohe initiale Komplexität
     - Viele ungenutzte Module zu Beginn
  
  2. Bedarfsgetriebene Entwicklung
     + Module erst bei Bedarf entwickeln
     + Sehr agiler Ansatz
     - Keine langfristige Planung
     - Risiko von Inkonsistenzen

### aPDP-004: Modul-Umfang
- **Status**: Proposed
- **Context**: 
  - Module aus aPDP-003 müssen implementiert werden
  - Funktionen können unterschiedlich gruppiert werden
  - Balance zwischen Kohäsion und Komplexität

- **Decision**: 
  - Server als "Spider"
    - Server scannen und analysieren
    - Daten persistent speichern
    - BIN-Dateien verteilen
    - NUKE und Backdoors
  - Hacking als "Scheduler"
    - Hack/Grow/Weaken planen
    - BIN-Dateien mit Parametern starten
    - Optimale Server-Nutzung
  - Hacknet
    - Nodes kaufen und upgraden
  - Programs
    - Entwickeln (create_program)
    - Ausführen?

- **Consequences**: TBD

- **Alternatives**: 
  1. Ein Modul pro Mechanik
     - Spider
     - Scanner
     - Hacking
     - HacknetNodes
     - Programs
     + Maximale Granularität
     + Sehr fokussierte Module
     + Einfach zu testen
     + Klare Verantwortlichkeiten
     - Mehr Kommunikationsaufwand
     - Höherer Verwaltungsaufwand
     - Komplexere Koordination
     - Mehr RAM durch Overhead

  2. Mechaniken zusammenfassen
     - ServerManager (Spider, Scan, Hack)
     - ResourceManager (Hacknet, Programs)
     + Weniger Kommunikation nötig
     + Einfachere Verwaltung
     + Weniger RAM-Overhead
     + Zentrale Koordination
     - Größere Module
     - Weniger flexibel
     - Schwerer zu testen
     - Risiko von Spaghetti-Code

### aPDP-005: Datenmodell
- **Status**: Proposed
- **Context**: 
  - Module aus aPDP-003 müssen implementiert werden
  - Funktionen können unterschiedlich gruppiert werden
  - Balance zwischen Kohäsion und Komplexität

- **Decision**: TBD

- **Consequences**: TBD

- **Alternatives**: 
  1. Ein Modul pro Mechanik
     - Spider
     - Scanner
     - Hacking
     - HacknetNodes
     - Programs
     + Maximale Granularität
     + Sehr fokussierte Module
     - Mehr Kommunikationsaufwand
     - Höherer Verwaltungsaufwand

  2. Mechaniken zusammenfassen
     - ServerManager (Spider, Scan, Hack)
     - ResourceManager (Hacknet, Programs)
     + Weniger Kommunikation nötig
     + Einfachere Verwaltung
     - Größere Module
     - Weniger flexibel

### aPDP-006: Mittlere Spielphase
- **Status**: Postponed
  - Trigger für diesen PDP:
    - Genug Geld für erste Server-Käufe
    - Hacknet-Nodes an Effizienzgrenze
    - Erste Faction-Einladungen
    - Contracts werden gefunden
- **Context**: 
  - Spielmechaniken werden schrittweise freigeschaltet
  - Unterschiedliche Anforderungen in verschiedenen Phasen
  - Offene Spielmechaniken aus aPDP-003:
    
    Mittlere Phase:
    - Server kaufen und verwalten
    - Hacknet-Server und Hashes
    - Factions und Augmentations
    - Contracts
    
    Späte Phase:
    - Gang Management
    - Sleeve Management

- **Decision**: TBD
- **Consequences**: TBD
- **Alternatives**: TBD


