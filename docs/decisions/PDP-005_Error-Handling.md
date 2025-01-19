# PDP-005: Error Handling Konzept
- **Status**: Accepted
- **Tags**: fehlerbehandlung, robustheit, design

## Kontext und Problemstellung
In einem verteilten System mit sequentieller Modulausführung können verschiedene Fehlerszenarien auftreten. Es wird ein robustes Error-Handling-System benötigt, das diese Fehler erkennt, behandelt und eine sichere Wiederaufnahme des Betriebs ermöglicht, ohne dass manuelle Eingriffe erforderlich sind.

## Entscheidung

Für die frühe Entwicklungsphase konzentrieren wir uns auf kritische Fehler und implementieren ein zweistufiges Error-Handling:

1. Kritische Fehler (zentral in lib.handler.js):
   - Korrupter State
     - Try-Catch bei JSON.parse
     - Logging des Fehlers mit Kontext
     - State-Reset wenn nötig
   - RAM-Limitierung
     - Exception-Handling beim Script-Start
     - Logging des Fehlers mit Kontext
     - State-Validierung bei Verdacht auf State-Problem

2. Nicht-kritische Fehler (lokal per Try-Catch):
   - Einfaches Exception-Handling
   - Minimales Logging
   - Keine komplexe Fehlerbehandlung
   - Keine Optimierungen in dieser Phase

Diese Entscheidung ermöglicht uns eine schnelle Entwicklung der Grundfunktionalität. Optimierungen und komplexere Fehlerbehandlung werden erst im späteren Spielverlauf implementiert.

## Konsequenzen

### Positive Konsequenzen
- Schnelle Entwicklung durch Fokus auf kritische Fehler
- Einfache Erweiterbarkeit für spätere Optimierungen
- Minimaler RAM-Overhead in der frühen Phase

### Negative Konsequenzen
- Nicht alle Fehler werden optimal behandelt
- Mögliche Ineffizienzen durch ignorierte Fehler
- Spätere Optimierung könnte aufwändiger werden

## Betrachtete Optionen (alternativen)

### Simples Try-Catch pro Aktion
- Pro: Leichtgewichtig, minimaler RAM-Verbrauch
- Pro: Direkte Behandlung wo der Fehler auftritt
- Contra: Könnte zu Code-Duplikation führen
- Beispiel: Direktes Try-Catch um `hack()`, `grow()`, `weaken()`

Diese Variante implementiert die Fehlerbehandlung direkt an der Stelle, wo die Aktion ausgeführt wird. Jede Hacking-Funktion (`hack()`, `grow()`, `weaken()`) wird in einen Try-Catch-Block eingebettet. Fehler werden sofort und lokal behandelt, ohne zusätzliche Abstraktionsebenen. Dies ist besonders RAM-effizient, da keine zusätzlichen Funktionen oder Module geladen werden müssen. Allerdings müssen ähnliche Fehlerbehandlungen möglicherweise an mehreren Stellen implementiert werden.

### Zentrale Fehlerbehandlung in lib.handler.js
- Pro: Einheitliche Fehlerlogik für alle Skripte
- Pro: Einfaches Logging/Debugging
- Pro: Wiederverwendbare Fehlerstrategien
- Contra: Zusätzlicher Funktionsaufruf
- Beispiel: Alle Aktionen werden über einen zentralen Handler geleitet

Hier werden alle Aktionen über eine zentrale Handler-Funktion geleitet, die in `lib.handler.js` implementiert ist. Diese Funktion übernimmt die Fehlerbehandlung für alle Module. Sie kann Fehler loggen, kategorisieren und einheitliche Strategien anwenden. Der Handler könnte zum Beispiel eine Funktion `handleHackAction(target, action)` bereitstellen, die dann intern das entsprechende Try-Catch und die Fehlerlogik enthält. Dies macht die Fehlerbehandlung konsistent und wartbar.

### State-basierte Fehlerbehandlung
- Pro: Nutzt vorhandene State-Strukturen (PDP-003)
- Pro: Fehler können persistent gespeichert werden
- Contra: Mehr Schreibzugriffe auf Storage
- Beispiel: Fehlgeschlagene Aktionen im State markieren, beim nächsten Zyklus berücksichtigen

Diese Alternative nutzt das vorhandene State-Management-System (PDP-003) zur Fehlerbehandlung. Fehlgeschlagene Aktionen werden im State gespeichert und können beim nächsten Durchlauf berücksichtigt werden. Zum Beispiel könnte ein fehlgeschlagener Hack-Versuch im Server-State vermerkt werden, wodurch das System beim nächsten Zyklus eine alternative Strategie wählen kann. Dies ermöglicht eine "Gedächtnis"-Funktion für Fehler, erhöht aber die Anzahl der Schreibzugriffe auf den State.

### Threshold-basierte Fehlerbehandlung
- Pro: Verhindert RAM-Verschwendung bei wiederkehrenden Fehlern
- Pro: Automatische Anpassung der Strategie
- Contra: Braucht Tracking von Fehler-Häufigkeit
- Beispiel: Nach X Fehlversuchen Server temporär ignorieren

Dieser Ansatz führt Buch über die Häufigkeit bestimmter Fehler und passt die Strategie entsprechend an. Wenn beispielsweise ein Server mehrfach nicht erfolgreich gehackt werden kann, wird er temporär aus der Target-Liste entfernt. Dies verhindert, dass RAM für aussichtslose Aktionen verschwendet wird. Die Implementierung könnte einen einfachen Zähler pro Server und Fehlertyp verwenden und bei Überschreitung eines Schwellwerts reagieren.

### Hierarchisches Error-Handling
- Pro: Verschiedene Behandlung je nach Fehlertyp und Modul
- Pro: Flexible Eskalation von Fehlern
- Contra: Initiale Komplexität beim Setup
- Beispiel: 
  - Level 1: Einzelne Hack-Aktionen
  - Level 2: Server-spezifische Fehler
  - Level 3: Modul-weite Probleme (z.B. Hacknet)

Diese Lösung organisiert die Fehlerbehandlung in verschiedenen Ebenen. Auf der untersten Ebene werden einzelne Aktionsfehler behandelt (z.B. fehlgeschlagener Hack). Die mittlere Ebene kümmert sich um serverspezifische Probleme (z.B. zu wenig verfügbarer RAM). Die oberste Ebene behandelt modulweite Fehler (z.B. Probleme im Hacknet-Modul). Fehler können von einer Ebene zur nächsten eskaliert werden, wenn sie nicht lokal gelöst werden können. Dies ermöglicht eine sehr flexible und kontrollierte Fehlerbehandlung.

## Betrachtete Fehlerszenarien

In der frühen Entwicklungsphase konzentrieren wir uns auf kritische Fehler, die den Spielfortschritt gefährden können. Effizienz-Einbußen werden zunächst akzeptiert und erst im späteren Spielverlauf optimiert. Diese Priorisierung ermöglicht uns:
- Fokus auf robuste Grundfunktionalität
- Vermeidung von verfrühter Optimierung
- Schnellere Entwicklung der Kernfunktionen

### Kritische Fehler (Spielverlauf gefährdet)
- **Korrupter State**
  - Auslöser:
    1. JSON.parse schlägt fehl
    2. State-Validierung fehlgeschlagen (konkrete Prüfungen werden mit der Implementierung definiert)
    3. Inkonsistente Datenstrukturen (abhängig von finaler State-Struktur)
  - Erkennung:
    - Try-Catch bei JSON.parse
    - Basis-Validierung nach dem Laden
    - Konsistenzprüfung wo möglich
  - Recovery:
    1. State neu initialisieren wenn nötig
    2. Logging für Analyse

- **RAM-Limitierung**
  - Auslöser:
    1. Berechnungsfehler:
       - Falsche RAM-Kalkulation vor Script-Start
       - Unberücksichtigte RAM-Kosten
    2. State-Problem:
       - Inkonsistenzen im State
       - Fehler beim Aufzeichnen/Auswerten
       - Race Conditions durch User-Aktionen
  - Erkennung:
    - Exception beim Script-Start
  - Recovery:
    1. Logging des Fehlers mit Kontext
    2. Bei Verdacht auf State-Problem: State-Validierung und ggf. Reset

### Effizienz-Einbußen (Nicht kritisch in früher Phase)
- **Server-Zugriff nicht möglich**
  - Teil der normalen Spielprogression
  - Wird durch Spielfortschritt gelöst (Port-Programme, Hacking-Level)
  - Keine Fehlerbehandlung nötig

- **Nicht genug Geld auf Server**
  - Nur Effizienz-Impact (mehr grow-ops nötig)
  - Keine Behandlung in früher Phase notwendig

- **Server-Sicherheit zu hoch**
  - Reduzierte Hack-Effizienz
  - Teil der normalen Spielmechanik

- **Thread-Limitierung**
  - Suboptimale Parallelisierung
  - Kein kritischer Impact

- **Hacknet/Stock Market Fehler**
  - Optionale Spielmechaniken
  - Keine Kernfunktionalität betroffen
