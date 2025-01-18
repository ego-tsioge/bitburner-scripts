# PDP-002: Modul-Architektur
- **Status**: Accepted 
- **Tags**: architektur, module, design

## Kontext und Problemstellung
Der Home-Server, auf dem die Automatisierung laufen soll, verfügt zu Beginn nur über 8GB RAM. Diese Beschränkung macht es unmöglich, alle benötigten Funktionen gleichzeitig auszuführen. 

Die technische Lösung sieht vor, dass Module nacheinander auf Home ausgeführt werden und jeweils maximal 8GB RAM nutzen dürfen. Zwischen den Modulaufrufen muss der Zustand (State) über localStorage persistiert werden, damit die Module aufeinander aufbauen können. Das Hauptmodul main.js übernimmt dabei die Orchestrierung der anderen Module, welche Daten sammeln, Angriffe steuern und sonstige Aufgaben übernehmen.

Diese Architekturentscheidung wirft die Frage auf, wie die verschiedenen Spielmechaniken sinnvoll in Module aufgeteilt werden können. Die Module müssen dabei nicht nur RAM-effizient sein, sondern auch einen klar definierten Verantwortungsbereich haben und über den persistierten State effektiv zusammenarbeiten.

## Entscheidung
Für die Early Game Phase werden folgende Module implementiert:

1. **main.js**
   - Orchestriert die Modulaufrufe
   - Verwaltet den globalen State
   - Steuert den Spielablauf
   - Entwickelt benötigte Programme (BruteSSH.exe etc.)
   - Übernimmt globales Error-Handling

2. **mod.net-spider.js**
   - Scannt das Netzwerk
   - Analysiert Server-Eigenschaften
   - Verwaltet Zugriffsmöglichkeiten (Ports/NUKE)
   - Deployed H/G/W-Skripte auf gehackte Server

3. **mod.hack-scheduler.js**
   - Wählt optimale Angriffsziele
   - Berechnet H/G/W-Parameter
   - Koordiniert Hack-Operationen
   - Überwacht Hack-Performance

4. **mod.hacknet.js**
   - am anfang nur [Netburner Faction Anforderungen erfüllen]
   - Verwaltet Hacknet-Nodes
   - Optimiert Upgrades (Level/RAM/Cores)
   - Berechnet ROI
   - Trackt Einnahmen

### Unterstützende Skripte
- **bin/hack.js**
- **bin/grow.js**
- **bin/weaken.js**

## Konsequenzen

### Positive Konsequenzen
- Jedes Modul deckt eine klar definierte Spielmechanik ab
- Module können unabhängig voneinander entwickelt/getestet werden
- Frühe Spielphase wird durch die vier Module vollständig abgedeckt
- Spätere Spielmechaniken können als neue Module hinzugefügt werden
- Durch sequentielle Ausführung wird das 8GB RAM-Limit eingehalten

### Negative Konsequenzen
- Abhängigkeit von State-Persistenz zwischen Modulaufrufen
- Verzögerungen durch sequentielle Verarbeitung der Spielmechaniken
- Erhöhter Koordinationsaufwand in main.js für Modulreihenfolge
- Mögliche Inkonsistenzen wenn State-Updates nicht synchron sind

## Zurückgestellte Spielmechaniken (Mid/Late-Game)
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
