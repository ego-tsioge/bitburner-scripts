# TODO Liste

## Projekt Architektur
- [ ] Project Decision Points finalisieren
  - [X] PDP-001: Auswahl der Hacking-Strategie
  - [X] PDP-002: Modul-Architektur
  - [ ] PDP-003: State-Struktur
    - [X] networkState implementieren
    - [X] playerState implementieren
    - [-] processState implementieren	// verschoben in spätere Spielphase
    - [X] globalState implementieren

  - [ ] PDP-004: Modul-Kommunikation
    - [ ] State-Zugriffs-Regeln definieren
    - [ ] Versionierung implementieren
    - [ ] State-Migration konzipieren

  - [ ] PDP-005: Error-Handling
    - [ ] Fehlerszenarien dokumentieren
    - [ ] Recovery-Strategien entwickeln
    - [ ] Logging-System aufsetzen

  - [ ] PDP-006: Performance-Tracking
    - [ ] Relevante Metriken identifizieren
    - [ ] Monitoring implementieren
    - [ ] Analyse-Tools entwickeln

- [ ] Modul-Struktur (Early Game)
  - [ ] Spider (Netzwerk-Scanner)
    - [ ] Server scannen/analysieren
    - [ ] BIN-Dateien verteilen
    - [ ] NUKE und Backdoors
  
  - [ ] Scheduler (Hacking)
    - [ ] H/G/W Operationen planen
    - [ ] Server-Ressourcen optimieren
    - [ ] Batch-Timing koordinieren

  - [ ] Hacknet
    - [ ] Nodes kaufen/upgraden
    - [ ] ROI-Optimierung
    - [ ] Einnahmen tracken

  - [ ] Programs
    - [ ] Port-Opener entwickeln
    - [ ] Tools verwalten
    - [ ] Fortschritt überwachen

## Bitburner Automatisierung (entlang des bekannten Spielverlaufs)

### 1. Early Game Progress
- [ ] Basic Hacking
  - [ ] Erste Server hacken
  - [ ] Geld für Hacknet sammeln
  - [ ] RAM Management

- [ ] Hacknet Optimierung
  - [x] Netburner Requirements erfüllen
  - [x] ROI-basierte Entscheidungen
  - [ ] Geld-Limits einführen

### 2. Server Infrastruktur
- [ ] Gekaufte Server
  - [ ] Automatischer Kauf
  - [ ] Größen-Optimierung
  - [ ] Skript-Verteilung

- [ ] Gehackte Server
  - [ ] Automatisches Scannen
  - [ ] Nuking
  - [ ] Backdoors

### 3. Hacking Framework
- [ ] Basis Operationen
  - [ ] Hack
  - [ ] Grow
  - [ ] Weaken
  - [ ] Batch Timing

- [ ] Target Management
  - [ ] Server Analyse
  - [ ] Optimale Ziele finden
  - [ ] Dynamische Anpassung

### 4. Factions & Augmentations
- [ ] Faction Management
  - [ ] Requirements tracken
  - [ ] Automatisch joinen
  - [ ] Reputation farmen

- [ ] Augmentation Strategie
  - [ ] Priorisierung
  - [ ] Kosten/Nutzen Analyse
  - [ ] Kauf-Reihenfolge 
