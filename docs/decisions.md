# Project Decision Points

## Format
Jede Entscheidung folgt diesem Format:
- **Status**: Proposed | Accepted | Rejected | Deprecated
- **Context**: Warum müssen wir diese Entscheidung treffen?
- **Decision**: Was haben wir entschieden?
- **Consequences**: Welche Auswirkungen hat die Entscheidung?
- **Alternatives**: Welche Alternativen wurden betrachtet?

## Entscheidungen

### PDP-001: Grundlegende Architektur
- **Status**: Proposed
- **Context**: 
  - Verschiedene Spielmechaniken müssen automatisiert werden
  - Projektvorgabe lautet mit 8 GB spielinternem RAM auskommen

- **Decision**: 
  - Modulare Struktur mit:
    - main.js als zentraler Orchestrator
    - Unabhängige Module für Spielmechaniken
    - Zentraler State für Kommunikation
    - Gezielte Modul-Ausführung basierend auf State

- **Consequences**: 
  - (+) RAM-effizient durch gezielte Modul-Ausführung
  
  - (+) Klare, flache Struktur / Klare Aufgabentrennung
  
  - (+) Zentrale Kontrolle über Programmablauf
  
  - (+) Einfaches Hinzufügen neuer Module
  
  - (-) State-Management muss sehr robust sein
      - Zentrale Fehlerquelle
      - Soll Modul-Status tracken
      - localStorage Limitierungen beachten
  
  - (-) Abhängigkeit von main.js Entscheidungslogik
      - Single Point of Failure
      - Muss alle Spielsituationen abdecken
      - Komplexität steigt mit Modulanzahl

- **Alternatives**: 
  1. Event-getriebene Struktur
     Module agieren völlig autonom und reagieren auf definierte Events im Spiel. Statt einer zentralen Steuerung registriert sich jedes Modul für relevante Events (z.B. "Server gefunden", "Geld verfügbar", "Hack abgeschlossen") und entscheidet selbst, wann es aktiv wird. Die Kommunikation läuft über einen Event-Bus, der Nachrichten zwischen Modulen vermittelt. Dies ermöglicht sehr lose Kopplung und einfache Erweiterbarkeit, macht aber das Systemverhalten schwerer vorhersagbar und das RAM-Management komplexer.
     
     Bitburner-Kompatibilität:
     - ❌ Kein natives Event-System
     - ❌ Event-Bus müsste über localStorage simuliert werden
     - ❌ Hoher Overhead durch ständiges Polling

  2. Monolithische Struktur
     Ein einzelnes, großes Script übernimmt die komplette Steuerung aller Spielmechaniken. Alle Funktionen sind direkt verfügbar und können ohne Kommunikationsoverhead aufgerufen werden. Dies vereinfacht die Koordination und macht den Programmfluss sehr übersichtlich. Allerdings muss das komplette Script immer im RAM gehalten werden, was bei der 8GB Beschränkung problematisch ist. Zudem wird das System mit wachsender Größe schwerer zu warten und zu erweitern.
     
     Bitburner-Kompatibilität:
     - ✅ Technisch möglich
     - ❌ Nicht praktikabel wegen 8GB RAM-Limit
     - ✅ Einfach zu implementieren

  3. Pipeline-Struktur
     Die Automatisierung wird als Verarbeitungspipeline organisiert, ähnlich einer Produktionsstraße. Jedes Modul ist eine Verarbeitungsstufe (z.B. Scan->Analyse->Plan->Execute) und gibt seine Ergebnisse an die nächste Stufe weiter. Dies schafft einen sehr klaren, vorhersagbaren Datenfluss. Die starre Struktur macht es jedoch schwierig, auf dynamische Spielsituationen zu reagieren oder parallel laufende Aufgaben zu koordinieren.
     
     Bitburner-Kompatibilität:
     - ❌ Async/Await in Bitburner limitiert
     - ❌ Keine echte Pipeline möglich
     - ❌ Blockierendes Verhalten problematisch

  4. Hierarchische Struktur
     Module werden in einer Baumstruktur organisiert, wobei übergeordnete Module ihre Untermodule steuern. Zum Beispiel könnte ein "ServerManager" verschiedene Untermodule für Scanning, Hacking und Maintenance koordinieren. Dies ermöglicht gute Skalierbarkeit und klare Verantwortlichkeiten, führt aber zu erhöhtem Overhead durch die mehrschichtige Kommunikation und macht das RAM-Management komplexer.
     
     Bitburner-Kompatibilität:
     - ✅ Technisch möglich
     - ❌ Verschwendet RAM durch Verwaltungs-Overhead
     - ❌ Komplexe Koordination bei 8GB Limit schwierig

  5. Round-Robin Scheduling
     Ein simpler Scheduler durchläuft alle Module in einer festen Reihenfolge und gibt jedem einen definierten Zeitslot. Dies garantiert, dass jedes Modul regelmäßig ausgeführt wird und vereinfacht die Implementierung erheblich. Allerdings wird die verfügbare RAM-Zeit nicht optimal genutzt, da Module auch dann ihren Slot bekommen, wenn sie nichts zu tun haben, während andere dringend Rechenzeit bräuchten.
     
     Bitburner-Kompatibilität:
     - ✅ Technisch möglich
     - ❌ Ineffizient bei 8GB RAM-Limit
     - ✅ Einfach zu implementieren

### PDP-002: Persistenz-Methode
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

### PDP-003: Modul-Identifikation
- **Status**: Proposed
- **Context**: 
  - Spielmechaniken müssen in sinnvolle Module aufgeteilt werden
  - Abhängigkeiten zwischen Mechaniken beachten
  - RAM-Effizienz durch granulare Module

- **Decision**: TBD
  - Vorgeschlagene Core-Module:
    - Spider (Server-Scanning, Contracts)
    - Hacknet (Node Management)
    - ServerFarm (Gekaufte Server)
    - HackManager (Hack/Grow/Weaken)
    - FactionManager (Reputation, Augments)

- **Consequences**: TBD

- **Alternatives**: 
  - Gröbere Aufteilung (weniger, größere Module)
  - Feinere Aufteilung (mehr Spezialisierung)
  - Dynamische Modulgröße (Zusammenfassen/Aufteilen nach RAM)


