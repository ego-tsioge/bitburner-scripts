# Bitburner Hacking System

Willkommen auf meiner Spielwiese mit Bitburner-Skripten. Sie sind in der spielinternen Sprache Netscript geschrieben, was quasi JavaScript entspricht. Dieses Repro dient hauptsächlich dazu, meine Fortschritte festzuhalten und beim nächsten Neustart die Skripte automatisch parat zu haben.

Wenn Sie das Spiel selbst mal ausprobieren möchten, klicken Sie bitte auf einen der folgenden Links.
[Bitburner (Github)](https://danielyxie.github.io/bitburner/) 
[Bitburner (Steam)](https://store.steampowered.com/app/1812820/Bitburner/)

Wichtige Anmerkung: Was du hier siehst, ist größtenteils von anderen kopiert. Inspirationen gab es bei:
    https://github.com/jenheilemann/bitburner-scripts/blob/main/README.md
    https://www.youtube.com/watch?v=85-A4rOJr5A&list=PLbUKWaoZ7R0gWs0RBUUAzpXH_D8QKT1Fs&index=9
    https://www.reddit.com/r/Bitburner/
    https://quacksouls.github.io/lyf/hello_README/
    https://bitburner.readthedocs.io/en/stable/ (achtung! das ist die alte Spieldokumentation, brauch ich aber manchmal)


## Anforderungen

Mein Lösungsansatz soll mit den 8 GB RAM auskommen, die man beim Spielstart hat. 

## Installation

1. Laden Sie das Skript namens `git-init.js` von GitHub, indem Sie die folgende Zeile im Bitburner Terminal ausführen:

`wget https://raw.githubusercontent.com/ego-tsioge/bitburner-scripts/main/git-init.js git-init.js`

2. Starten Sie dann das Skript mit `run git-init.js`. 

Dieses Skript lädt automatisch dieses Repro auf den Home Server (im Spiel).

3. Mit `run go.js` werden die ersten Server infiziert (Geld verdient) und der Hacking-Skill trainiert.

## Ordnerstruktur
bitburner-scripts/              # Haupt-Repository
│
├── bitburner-gamefolder/       # Entspricht 'home' im Spiel Bitburner
│   ├── basis.js                # Hauptsteuerung (Einstiegspunkt)
│   ├── git-init.js             # GitHub Initialisierung
│   │
│   └── scripts/                # Alle anderen Spiel-Dateien
│       ├── bin.*               # Ausführbare Skripte (hack/weak/grow)
│       ├── lib.*               # Bibliotheken
│       └── mod.*               # Module (werden normalerweise von basis.js angesprochen)


## Funktionsweise
Es läuft nach möglichkeit nur eine Datei von den Managern und der Status wird im localStorage gespeichert, um das RAM-Limit von 8GB auf Home zu umgehen. 

### Modularer Aufbau
- Module sind unabhängig voneinander und kennen ihre Aufrufer nicht
- Der Aufrufer bestimmt den Rückkehrpunkt via `--nextScript` Parameter
- basis.js steuert den Workflow und Modulablauf
- Module können im Test-Modus (`--test`) ausgeführt werden, der den Rückkehrpunkt ignoriert

### Module
- `basis.js` - Hauptmanager (Einstiegspunkt)
- `mod.spider.js` - Netzwerk-Scanner und Analyse
- `mod.scheduler.js` - Timing und Koordination

### Operationen
- `bin.hack.js` - Hack-Operation (1.7 GB RAM)
- `bin.grow.js` - Grow-Operation (1.7 GB RAM)
- `bin.weak.js` - Weaken-Operation (1.7 GB RAM)

### Bibliotheken
- `lib.storage.js` - Speicher-Bibliothek
- `lib.format.js` - Formatierungs-Bibliothek
- `lib.log.js` - Logging-Bibliothek    
- `lib.config.js` - Konfigurations-Bibliothek

## Entwicklungsstand / TODOs
- [ ] alte Codebasis übernehmen analysieren
- [ ] ordnerstruktur anpassen
	- [ ] ordner scripts umbenennen zu gamefolder
	- [ ] scripts anlegen
	- [ ] im spiel die dateien löschen
	- [ ] bitburner plugin anpassen
	- [ ] im spiel die dateien löschen
	- [ ] dateien verschieben
- [ ] github repo anlegen/aktualiseren
	- [ ] readme.md pflegen
	- [ ] installation beschreiben
	- [ ] installation umsetzen
- [ ] punkte aus alten stand übernehmen
### alter stand, punkt übernehmen
	- [ ] Basis-System & Koordination
	- [ ] Netzwerk-Scanner (mod.spider.js)
	- [ ] Minimale Ausführungs-Scripts (bin.*.js)
	- [ ] Status-Speicherung (lib.storage.js)
	- [ ] Logging (lib.log.js) 
	- [ ] Konfiguration (lib.config.js)
	- [ ] Formatierung (lib.format.js)
	- [ ] Scheduler & Timing-System
	- [ ] Batch-Operationen
	- [ ] Automatische Ziel-Optimierung