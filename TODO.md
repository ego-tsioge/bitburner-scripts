# TODO Liste

## 1. Projekt Architektur
- [X] Project Decision Points finalisieren
  - [X] PDP-001: Auswahl der Hacking-Strategie
  - [X] PDP-002: Modul-Architektur
  - [X] PDP-003: State-Struktur
  - [X] PDP-004: Modul-Kommunikation   // Obsolet - in PDP-003 integriert
  - [X] PDP-005: Error-Handling

## 2. Implementierung
### Error-Handling System
- [ ] Error-Handler entwickeln
  - [ ] Wrapper für Module
  - [ ] Recovery-Logik
  - [ ] Logging-System
    - [ ] Modul-Start/Ende
    - [ ] Fehler mit Stack-Trace
    - [ ] Recovery-Versuche
    - [ ] State-Änderungen

### Basis-Module
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
- [ ] GROW Performance-Test
  - [ ] Vergleich: Parallele vs Sequentielle Ausführung
  - [ ] Benötigt: Spider & Batching
  - [ ] Metriken definieren

## 3. Bestandsaufnahme & Optimierung
- [ ] PDP-006: Performance-Tracking
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
