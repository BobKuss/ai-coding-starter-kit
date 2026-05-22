# PROJ-7: Kommentare auf Ideen

**Status:** Planned  
**Priority:** P1  
**Created:** 2026-05-22  
**Updated:** 2026-05-22

## Beschreibung
Eingeloggte Nutzer können Kommentare zu Ideen hinterlassen, um Diskussionen zu führen, Fragen zu stellen oder Feedback zu geben. Kommentare sind chronologisch sortiert und für alle Team-Mitglieder sichtbar.

## User Stories

### Story 1 — Kommentar schreiben
Als eingeloggtes Team-Mitglied möchte ich einen Kommentar zu einer Idee hinterlassen, damit ich meine Meinung oder Rückfragen teilen kann.

### Story 2 — Kommentare lesen
Als eingeloggtes Team-Mitglied möchte ich alle Kommentare zu einer Idee sehen, damit ich den Diskussionsstand kenne.

### Story 3 — Eigenen Kommentar löschen
Als Autor eines Kommentars möchte ich ihn löschen können, falls er nicht mehr relevant ist.

## Akzeptanzkriterien

### AC-1: Kommentare anzeigen
- **Angenommen** ich bin eingeloggt und öffne die Detailseite einer Idee (`/ideas/[id]`)
- **Wenn** die Seite lädt
- **Dann** sehe ich alle Kommentare chronologisch (älteste zuerst) mit Autor und Zeitstempel

### AC-2: Kommentar schreiben
- **Angenommen** ich bin eingeloggt und auf der Detailseite
- **Wenn** ich Text in das Kommentarfeld eingebe und auf „Kommentieren" klicke
- **Dann** erscheint mein Kommentar sofort unten in der Liste

### AC-3: Leeres Kommentarfeld
- **Angenommen** ich klicke auf „Kommentieren" ohne Text
- **Wenn** das Formular validiert wird
- **Dann** erscheint: „Kommentar darf nicht leer sein"

### AC-4: Zeichenbegrenzung
- **Angenommen** ich gebe einen Kommentar mit mehr als 1000 Zeichen ein
- **Wenn** ich absende
- **Dann** erscheint: „Kommentar darf maximal 1000 Zeichen lang sein"

### AC-5: Eigenen Kommentar löschen
- **Angenommen** ich bin der Autor eines Kommentars
- **Wenn** ich auf das Löschen-Icon meines Kommentars klicke
- **Dann** erscheint ein Bestätigungs-Dialog: „Kommentar löschen?"

### AC-6: Löschen bestätigt
- **Angenommen** ich bestätige das Löschen
- **Wenn** die Aktion ausgeführt wird
- **Dann** verschwindet der Kommentar aus der Liste

### AC-7: Fremden Kommentar nicht löschen
- **Angenommen** ich sehe einen Kommentar eines anderen Nutzers
- **Wenn** ich die Kommentarliste betrachte
- **Dann** sehe ich kein Löschen-Icon für fremde Kommentare (außer ich bin Admin)

### AC-8: Kommentar-Anzahl auf Board-Karte
- **Angenommen** ich bin auf dem Ideas Board
- **Wenn** eine Idee Kommentare hat
- **Dann** sehe ich die Kommentar-Anzahl als kleines Icon auf der Ideen-Karte

## UI-Anforderungen

- **Einstiegspunkt:** Detailseite pro Idee (`/ideas/[id]`)
- **Kommentarliste:** Chronologisch, Avatar (Initials) + Name + Zeitstempel + Text
- **Kommentarformular:** Textarea (max 1000 Zeichen) + „Kommentieren"-Button
- **Löschen:** Nur eigene Kommentare (Admins: alle), Icon erscheint on-hover
- **Board-Karte:** Kommentar-Icon + Zähler (z. B. 💬 3)

## Out of Scope
- Kommentare bearbeiten (nur löschen im MVP)
- Antworten auf Kommentare (nested Threads)
- @Mentions
- Kommentar-Reaktionen (Likes etc.)
- Admin löscht Kommentare aus Admin-Panel (direkt via Supabase Dashboard)

## Decision Log

### Product Decisions
| Entscheidung | Begründung | Datum |
|---|---|---|
| Nur Löschen, kein Bearbeiten | Einfacher, ausreichend für MVP | 2026-05-22 |
| Chronologische Sortierung (älteste zuerst) | Diskussionskontext erhalten | 2026-05-22 |

### Technical Decisions
| Entscheidung | Begründung | Datum |
|---|---|---|
| Detailseite für Kommentare (nicht Modal) | Mehr Platz für Diskussion, saubere URL | 2026-05-22 |
| RLS: Nur eigene Kommentare löschen | Sicherheit auf DB-Ebene, nicht nur Frontend | 2026-05-22 |

## Open Questions
- [ ] Soll die Detailseite (`/ideas/[id]`) auch die Idee vollständig anzeigen (Titel + Beschreibung + Vote-Button)?
- [ ] Sollen Admins Kommentare anderer Nutzer löschen können (Admin-Recht)?
