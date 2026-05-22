# PROJ-9: Roadmap-Ansicht

**Status:** Planned  
**Priority:** P2  
**Created:** 2026-05-22  
**Updated:** 2026-05-22

## Beschreibung
Eine interne Übersichtsseite, die eingereichte Ideen nach Status gruppiert anzeigt — ähnlich einem Kanban-Board. Gibt dem Team einen schnellen Überblick darüber, was geplant ist, was in Arbeit ist und was bereits umgesetzt wurde.

## User Stories

### Story 1 — Roadmap-Überblick
Als eingeloggtes Team-Mitglied möchte ich alle Ideen nach Status gruppiert sehen, damit ich auf einen Blick erkenne, was aktuell geplant und in Arbeit ist.

### Story 2 — Fokus auf aktive Ideen
Als eingeloggtes Team-Mitglied möchte ich schnell sehen, welche Ideen sich gerade in Umsetzung befinden, damit ich den Produktfortschritt verfolgen kann.

## Akzeptanzkriterien

### AC-1: Route und Zugang
- **Angenommen** ich bin eingeloggt
- **Wenn** ich `/roadmap` aufrufe
- **Dann** sehe ich die Roadmap-Ansicht mit allen Ideen gruppiert nach Status

### AC-2: Spalten-Struktur
- **Angenommen** ich bin auf der Roadmap-Seite
- **Wenn** die Seite lädt
- **Dann** sehe ich die Spalten: **Offen** | **Geplant** | **In Arbeit** | **Erledigt** | **Abgelehnt**

### AC-3: Ideen in der richtigen Spalte
- **Angenommen** eine Idee hat Status „planned"
- **Wenn** die Roadmap-Seite lädt
- **Dann** erscheint diese Idee in der Spalte „Geplant"

### AC-4: Ideen-Karte in der Roadmap
- **Angenommen** ich betrachte eine Ideen-Karte in der Roadmap
- **Wenn** ich sie ansehe
- **Dann** sehe ich: Titel, Vote-Anzahl, Autor, Link zur Detailseite

### AC-5: Leere Spalte
- **Angenommen** keine Idee hat Status „in_progress"
- **Wenn** die Roadmap lädt
- **Dann** ist die Spalte „In Arbeit" sichtbar, aber leer (mit Leer-Zustand-Text)

### AC-6: Navigation zur Roadmap
- **Angenommen** ich bin eingeloggt
- **Wenn** ich die App-Navigation betrachte
- **Dann** gibt es einen Link „Roadmap" neben „Ideas Board"

### AC-7: Nicht eingeloggt
- **Angenommen** ich bin nicht eingeloggt
- **Wenn** ich `/roadmap` aufrufe
- **Dann** werde ich zu `/login` weitergeleitet

## UI-Anforderungen

- **Layout:** Horizontales Kanban-Board (Spalten nebeneinander, horizontal scrollbar auf Mobile)
- **Spalten:** Offen | Geplant | In Arbeit | Erledigt | Abgelehnt
- **Karten:** Kompakter als auf dem Ideas Board (nur Titel + Vote-Zahl + Autor)
- **Drag & Drop:** Nicht im MVP (Status nur via Admin-Panel änderbar)
- **Spaltenheader:** Status-Name + Anzahl der Ideen in dieser Spalte
- **Navigation:** Link in der App-Header-Navigation

## Out of Scope
- Drag & Drop zur Status-Änderung (nur für Admins via Admin-Panel)
- Zeitachse / Timeline-Ansicht
- Öffentliche Roadmap (nur intern)
- Export als PDF oder CSV
- Swimlanes oder Gruppierung nach Kategorie

## Decision Log

### Product Decisions
| Entscheidung | Begründung | Datum |
|---|---|---|
| Alle 5 Status als Spalten | Vollständiges Bild des Produkt-Funnels | 2026-05-22 |
| Kein Drag & Drop | Zu komplex für P2 MVP, Admin-Panel reicht | 2026-05-22 |

### Technical Decisions
| Entscheidung | Begründung | Datum |
|---|---|---|
| Server Component für Daten-Fetch | Kein separater API-Aufruf nötig | 2026-05-22 |
| Gleiche Daten wie Ideas Board (kein extra Endpoint) | Nur Darstellung ändert sich, nicht die Daten | 2026-05-22 |

## Open Questions
- [ ] Soll die Roadmap-Seite auch den Vote-Button zeigen oder nur lesend sein?
- [ ] Sollen abgelehnte Ideen standardmäßig ausgeblendet werden (z. B. via Toggle)?
