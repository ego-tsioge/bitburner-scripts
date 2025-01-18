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
- **Status**: Accepted 
- **Tags**: hacking, strategie, architektur

### Kontext und Problemstellung
Ermittlung der effizientesten Hacking-Strategie für frühe und späte Spielphasen in Bitburner. Benötigt wird ein skalierbarer Ansatz, der mit den wachsenden Möglichkeiten im Spielverlauf mitwächst.

### Entscheidung
Gewählte Option: "Hybrid-Ansatz mit Batching (#1) für frühe Phase und Übergang zu Predictive Targeting (#2)"

## PDP-002: Modul-Architektur
- **Status**: Accepted 
- **Tags**: architektur, module, design

### Kontext und Problemstellung
Der Home-Server, auf dem die Automatisierung laufen soll, verfügt zu Beginn nur über 8GB RAM. Diese Beschränkung macht es unmöglich, alle benötigten Funktionen gleichzeitig auszuführen. 

Die technische Lösung sieht vor, dass Module nacheinander auf Home ausgeführt werden und jeweils maximal 8GB RAM nutzen dürfen. Zwischen den Modulaufrufen muss der Zustand (State) über localStorage persistiert werden, damit die Module aufeinander aufbauen können. Das Hauptmodul main.js übernimmt dabei die Orchestrierung der anderen Module, welche Daten sammeln, Angriffe steuern und sonstige Aufgaben übernehmen.

Diese Architekturentscheidung wirft die Frage auf, wie die verschiedenen Spielmechaniken sinnvoll in Module aufgeteilt werden können. Die Module müssen dabei nicht nur RAM-effizient sein, sondern auch einen klar definierten Verantwortungsbereich haben und über den persistierten State effektiv zusammenarbeiten.

### Entscheidung
Für die Early Game Phase werden folgende Module implementiert:

1. **main.js**
2. **mod.network-spider.js**
3. **mod.hack-manager.js**
4. **mod.hacknet-manager.js**
5. Zusätzlich werden folgende Binary-Scripts benötigt:
	- **bin.hack.js**
	- **bin.grow.js**
	- **bin.weaken.js**

## PDP-003: State-Strukturen
- **Status**: Accepted
- **Tags**: state, design, architektur

### Kontext und Problemstellung
Für die Kommunikation zwischen den Modulen und das Speichern von Zuständen wird eine effiziente State-Struktur 
benötigt. 

Konkret werden folgende Strukturen benötigt:
1. **Network State**: Detaillierte Server- und Netzwerkinformationen
2. **Player State**: Aktuelle Spieler-Attribute und Fortschritte
3. **Global State**: Kompakter Überblick über systemweite Einstellungen

Für das spätere Spiel wird zusätzlich eine Process-State-Struktur für predictive targeting vorgesehen.

### Entscheidung
Die drei Datenstrukturen sollen wie beschrieben implementiert werden.

## PDP-004: Modul-Kommunikation
- **Status**: Rejected
- **Tags**: kommunikation, design, architektur

### Kontext und Problemstellung
Die Module werden sequentiell ausgeführt und müssen ihre Ergebnisse und Anforderungen untereinander kommunizieren. Dies geschieht über den persistierten State, erfordert aber klare Regeln für Datenzugriff und -modifikation.

### Entscheidung
Feststellung: PDP-004 ist schon durch PDP-003 und andere Projektvorgaben erfüllt. Da fest steht das die module nur nacheinander laufen muss die kommunikation nicht weiter geregelt werden um unzulässige Zugriffe zu verhindern.

## PDP-005: Error-Handling
- **Status**: Accepted
- **Tags**: fehlerbehandlung, robustheit, design

### Kontext und Problemstellung
In einem verteilten System mit sequentieller Modulausführung können verschiedene Fehlerszenarien auftreten: korrupter State, Modul-Crashes, Netzwerkfehler oder unerwartete Spielzustände. Es wird ein robustes Error-Handling-System benötigt, das diese Fehler erkennt, behandelt und eine sichere Wiederaufnahme des Betriebs ermöglicht, ohne dass manuelle Eingriffe erforderlich sind.


## PDP-006: Performance-Tracking
- **Status**: Draft
- **Tags**: monitoring, optimierung, metriken

### Kontext und Problemstellung
Um die Effizienz der Automatisierung zu messen und zu optimieren, müssen relevante Metriken erfasst und ausgewertet werden. Dies umfasst Hack-Erfolgsraten, Einnahmen-Entwicklung, RAM-Nutzung und Modul-Laufzeiten. Die Herausforderung besteht darin, die richtigen Metriken zu identifizieren, effizient zu speichern und so aufzubereiten, dass daraus Optimierungspotentiale erkannt werden können.



















