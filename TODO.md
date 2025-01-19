# TODO Liste

## Legende
- [X] Abgeschlossen
- [ ] Offen
- [R] Verworfen (Rejected)
- [D] Entwurf (Draft) 

## 1. Projekt Architektur
- [X] Project Decision Points finalisieren
  - [X] [PDP-001](docs/decisions.md#pdp-001-auswahl-der-hacking-strategie): Auswahl der Hacking-Strategie
  - [X] [PDP-002](docs/decisions.md#pdp-002-modul-architektur): Modul-Architektur
  - [X] [PDP-003](docs/decisions.md#pdp-003-state-struktur): State-Struktur
  - [R] [PDP-004] Modul-Kommunikation   // Obsolet - in PDP-003 integriert
  - [X] [PDP-005](docs/decisions.md#pdp-005-error-handling): Error-Handling
  - [ ] [PDP-006](docs/decisions.md#pdp-006-performance-tracking): Performance-Tracking  // Draft - in Bearbeitung

## 2. Implementierung
### Error-Handling System (PDP-005)
- [ ] Error-Handler entwickeln
  - [ ] Wrapper für Module
  - [ ] Recovery-Logik
  - [ ] Logging-System
    - [ ] Modul-Start/Ende
    - [ ] Fehler mit Stack-Trace
    - [ ] Recovery-Versuche
    - [ ] State-Änderungen

### Basis-Module (PDP-002)
- [ ] Spider (Netzwerk-Scanner)
  - [ ] Server scannen/analysieren
  - [ ] BIN-Dateien verteilen
  - [ ] NUKE und Backdoors

- [ ] Scheduler (Hacking)
  - [ ] H/G/W Operationen planen
  - [ ] Server-Ressourcen optimieren
  - [ ] Batch-Timing koordinieren
  - [ ] Server auf definierte Werte bringen

- [X] Basis H/G/W Operationen
  - [ ] HACK
  - [ ] GROW
  - [ ] WEAKEN

### Offene Fragen & Tests
- [ ] GROW Performance-Test (PDP-006)
  - [ ] Vergleich: Parallele vs Sequentielle Ausführung
  - [ ] Benötigt: Spider & Batching
  - [ ] Metriken definieren

### Optimierungen für später
- [ ] Log-System verbessern (PDP-005, PDP-006)
  - [ ] Ringspeicher für In-Memory Logs
  - [ ] Rotation für wichtige Logs
  - [ ] Performance-Metriken sammeln

### Log-System
- [ ] Log-Rotation in main.js Modul-Logik verschieben
  - [ ] Zeitbasierte Prüfung (z.B. alle 5 Minuten)
  - [ ] Größen-Check
  - [ ] Archivierung/Rotation

## 3. Bestandsaufnahme & Optimierung
- [ ] [PDP-006](docs/decisions.md#pdp-006-performance-tracking): Performance-Tracking
  - [ ] Relevante Metriken identifizieren
  - [ ] Monitoring-Strategie entwickeln
- [ ] Performance-Analyse
  - [ ] Metriken erheben
  - [ ] Bottlenecks identifizieren
  - [ ] Optimierungspotentiale ermitteln

## 4. Nächste Schritte
- [ ] Mid-Game Features planen
  - [ ] Server Management
  - [ ] Factions & Augmentations
  - [ ] Contracts 
