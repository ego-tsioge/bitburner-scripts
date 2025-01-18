# PDP-005: Error Handling Konzept
- **Status**: Accepted
- **Tags**: fehlerbehandlung, robustheit, design

## Kontext und Problemstellung
In einem verteilten System mit sequentieller Modulausführung können verschiedene Fehlerszenarien auftreten: korrupter State, Modul-Crashes, Netzwerkfehler oder unerwartete Spielzustände. Es wird ein robustes Error-Handling-System benötigt, das diese Fehler erkennt, behandelt und eine sichere Wiederaufnahme des Betriebs ermöglicht, ohne dass manuelle Eingriffe erforderlich sind.

## Entscheidung
Implementierung eines zentralen Error-Handling-Systems mit folgenden Kernprinzipien:
- Einheitliche Fehlerbehandlung für alle Module
- Automatische Wiederherstellung wo möglich
- Transparentes Logging für Debugging

## Konsequenzen

### Positive Konsequenzen
- Zentrale Fehlererkennung und -behandlung
- Automatische Wiederherstellung des Betriebs
- Nachvollziehbarkeit durch Logging

### Negative Konsequenzen
- Zusätzlicher Overhead durch Error-Handling
- Komplexere Modulimplementierung
- Erhöhter Speicherbedarf durch Logging

## Betrachtete Optionen (alternativen)

### Try-Catch pro Modul
- Pro: Einfache Implementation
- Pro: Module bleiben unabhängig
- Contra: Keine einheitliche Fehlerbehandlung
- Contra: Redundanter Code
- Contra: Keine zentrale Überwachung

### Event-basiertes System
- Pro: Lose Kopplung
- Pro: Gute Skalierbarkeit
- Contra: Komplexe Implementation
- Contra: Overhead durch Event-System
- Contra: Schwer nachvollziehbare Fehlerflüsse

### Fail-Fast Ansatz
- Pro: Sehr einfach zu implementieren
- Pro: Klare Fehlerzustände
- Contra: Erfordert manuelle Eingriffe
- Contra: Keine automatische Wiederherstellung
- Contra: Unterbricht komplette Ausführung

### Retry-Only System
- Pro: Einfache Implementation
- Pro: Robust gegen temporäre Fehler
- Contra: Keine differenzierte Fehlerbehandlung
- Contra: Ressourcenverschwendung bei permanenten Fehlern
- Contra: Keine Root-Cause Analyse

## Betrachtete Fehlerszenarien

### State-Fehler
- Ungültiger/korrupter State
- Veraltete State-Version
- Inkonsistenzen zwischen States

### Modul-Fehler
- Unbehandelte Exceptions
- Timeouts
- Ressourcen-Probleme (RAM, etc.)

### Spiel-Fehler
- Server nicht erreichbar
- Unzureichende Ressourcen
- Fehlende Berechtigungen

## Recovery-Strategien

### State-Fehler Recovery
- Korrupter State
  - Erkennung: JSON.parse schlägt fehl oder Validierung fehlgeschlagen
  - Aktion: State neu initialisieren
  - Folge: Temporärer Datenverlust, aber System läuft weiter

- Veralteter State
  - Erkennung: Version im globalState < Script-Version
  - Aktion: Migration wenn möglich, sonst Neuinitialisierung
  - Folge: Kontrollierter Übergang zur neuen Version

- Inkonsistenter State
  - Erkennung: ???
  - Aktion: Vollständiges State-Update durchführen
  - Folge: Alle States werden auf aktuellen Stand gebracht

### Modul-Fehler Recovery
- Unbehandelte Exception
  - Erkennung: Exception im try-catch Block
  - Aktion: Logging und Neustart des Moduls (max. 3 Versuche)
  - Folge: Automatische Wiederaufnahme wenn möglich

- Timeout
  - Erkennung: Modul läuft länger als 5 Minuten
  - Aktion: Modul abbrechen und neu starten
  - Folge: Verhindert "hängende" Module

- RAM-Probleme
  - Erkennung: Nicht genug RAM für Modul-Start
  - Aktion: Warten und später neu versuchen
  - Folge: Verzögerung, aber keine Blockade

### Spiel-Fehler Recovery
- Server nicht erreichbar
  - Erkennung: Server-Zugriff schlägt fehl
  - Aktion: Server temporär aus Target-Liste entfernen
  - Folge: Andere Server werden angegriffen

- Unzureichende Ressourcen
  - Erkennung: Nicht genug Geld/Skill für Aktion
  - Aktion: Alternative Ziele wählen
  - Folge: Anpassung an aktuelle Möglichkeiten
