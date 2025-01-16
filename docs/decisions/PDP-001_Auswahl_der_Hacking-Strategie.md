# PDP-001: Auswahl der Hacking-Strategie

## Status
- Status: accepted 
- Tags: hacking, strategie, architektur

## Kontext und Problemstellung
Ermittlung der effizientesten Hacking-Strategie für frühe und späte Spielphasen in Bitburner. Benötigt wird ein skalierbarer Ansatz, der mit den wachsenden Möglichkeiten im Spielverlauf mitwächst.

### Entscheidungsfaktoren
- Effizienz der Geldgenerierung
- RAM-Nutzung und Skalierbarkeit
- Implementierungskomplexität  
- Anpassungsfähigkeit an verschiedene Spielphasen

## Entscheidung
Gewählte Option: "Hybrid-Ansatz mit Batching (#1) für frühe Phase und Übergang zu Predictive Targeting (#2)"

## Konsequenzen

### Positive Konsequenzen
- Optimale Strategie für verschiedene Spielphasen
- Effiziente frühe Progression durch Batching
- Maximales Spätspiel-Potenzial durch Predictive
- Klarer Übergangspfad zwischen Strategien

### Negative Konsequenzen
- Höhere Implementierungskomplexität
- Übergangsmanagement erforderlich
- Zusätzliches Monitoring notwendig

## Betrachtete Optionen
1. Batching (HWGW-Muster)
2. Predictive Targeting
3. Multi-Target Opportunistic
4. Wave Attack
5. Distributed Consensus

### Option 1: Batching (HWGW)
- Pro: Einfach, zuverlässig, RAM-effizient
- Pro: Präzises Timing und vorhersehbares Verhalten
- Contra: Weniger flexibel
- Contra: Begrenztes Skalierungspotenzial

### Option 2: Predictive Targeting
- Pro: Hocheffizient bei verfügbaren Ressourcen
- Pro: Adaptiv an Server-Bedingungen
- Contra: Komplexe Implementierung
- Contra: Höhere RAM-Anforderungen

### Option 3: Multi-Target Opportunistic
- Pro: Natürliche Lastverteilung
- Pro: Flexible Zielauswahl
- Contra: Weniger konsistente Ergebnisse
- Contra: Kann optimale Gelegenheiten verpassen

### Option 4: Wave Attack
- Pro: Einfache Synchronisation
- Pro: Hohe Spitzenleistung
- Contra: Lange Erholungszeiten
- Contra: Insgesamt ineffizient

### Option 5: Distributed Consensus
- Pro: Selbstorganisierend
- Pro: Theoretische Skalierbarkeit
- Contra: Hoher RAM-Overhead
- Contra: Komplexe Koordination

## Übergangs-Indikatoren
Wechsel von Batching zu Predictive wenn:

### Hardware
- Home RAM > 128GB
- 10+ gekaufte Server
- Durchschnittliches Server-RAM > 32GB

### Skills
- Hacking Level > 300
- Formulas.exe verfügbar

### Netzwerk
- 15+ zugängliche Server
- 5+ High-Tier Ziele
- Root auf Level 100+ Servern

### Effizienz
- Batch-Ertrag < 15% des max. Geldes
- RAM-Auslastung > 50%
- Hack-Zeit > 3 Minuten
