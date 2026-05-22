# PROJ-3: Idea Submission

**Status:** Approved  
**Priority:** P0 (MVP)  
**Created:** 2026-05-22  
**Updated:** 2026-05-22

## Beschreibung
Eingeloggte Team-Mitglieder können neue Produkt-Ideen einreichen. Eine Idee besteht aus Titel und optionaler Beschreibung. Eingereichte Ideen erscheinen sofort auf dem Ideas Board.

## User Stories

### Story 1 — Idee einreichen
Als eingeloggtes Team-Mitglied möchte ich eine neue Idee mit Titel und Beschreibung einreichen, damit andere sie sehen und dafür stimmen können.

### Story 2 — Eigene Idee sehen
Als Autor möchte ich meine eingereichte Idee sofort auf dem Board sehen, damit ich weiß, dass sie erfasst wurde.

## Akzeptanzkriterien

### AC-1: Formular aufrufen
- **Angenommen** ich bin eingeloggt und auf dem Ideas Board
- **Wenn** ich auf „Neue Idee einreichen" klicke
- **Dann** öffnet sich ein Formular (Modal oder dedizierte Seite) mit den Feldern Titel und Beschreibung

### AC-2: Pflichtfeld Titel
- **Angenommen** ich versuche das Formular ohne Titel abzuschicken
- **Wenn** ich auf „Einreichen" klicke
- **Dann** wird eine Validierungsfehlermeldung angezeigt: „Titel ist erforderlich"

### AC-3: Titel-Längenbegrenzung
- **Angenommen** ich gebe einen Titel mit mehr als 120 Zeichen ein
- **Wenn** ich das Formular abschicke
- **Dann** sehe ich die Fehlermeldung: „Titel darf maximal 120 Zeichen lang sein"

### AC-4: Beschreibung optional
- **Angenommen** ich fülle nur den Titel aus und lasse die Beschreibung leer
- **Wenn** ich auf „Einreichen" klicke
- **Dann** wird die Idee ohne Beschreibung erfolgreich gespeichert

### AC-5: Erfolgreiche Einreichung
- **Angenommen** ich habe Titel (und optional Beschreibung) ausgefüllt
- **Wenn** ich auf „Einreichen" klicke
- **Dann** wird die Idee gespeichert, das Formular geschlossen und die neue Idee erscheint oben auf dem Board

### AC-6: Duplikat-Schutz (UX)
- **Angenommen** ich submit das Formular
- **Wenn** der Request läuft
- **Dann** ist der Submit-Button deaktiviert (verhindert Doppelklick)

### AC-7: Fehlerzustand
- **Angenommen** der Supabase-Insert schlägt fehl (Netzwerkfehler etc.)
- **Wenn** der Request zurückkommt
- **Dann** sehe ich eine Fehlermeldung: „Einreichung fehlgeschlagen. Bitte versuche es erneut."

## UI-Anforderungen

- Einreichungs-Trigger: Button auf dem Ideas Board (z. B. „+ Idee einreichen")
- Form-Layout: Modal (bevorzugt) oder `/ideas/new`-Seite
- Felder:
  - **Titel** (required, max 120 Zeichen, Zeichenzähler anzeigen)
  - **Beschreibung** (optional, Textarea, max 1000 Zeichen)
- Buttons: „Einreichen" (primary) + „Abbrechen" (secondary)
- Erfolgs-Feedback: Toast-Notification oder direkte Board-Aktualisierung

## Out of Scope
- Kategorien oder Tags (ggf. P1)
- Anhänge / Bilder
- Idee bearbeiten nach Einreichung (nur Admin, PROJ-6)
- Entwürfe / Draft-Modus
- Duplicate-Detection (semantisch)

## Decision Log

### Product Decisions
| Entscheidung | Begründung | Datum |
|---|---|---|
| Nur Titel + Beschreibung im MVP | Einfach halten, keine unnötige Komplexität | 2026-05-22 |
| Idee sofort sichtbar (kein Moderations-Flow) | Internes Team, Vertrauen vorausgesetzt | 2026-05-22 |

### Technical Decisions
| Entscheidung | Begründung | Datum |
|---|---|---|
| Zod-Validierung client-seitig | Sofortiges Feedback ohne Server-Round-trip | 2026-05-22 |
| Optimistic UI nach Insert | Board fühlt sich schneller an | 2026-05-22 |

## Implementation Notes

### Backend (2026-05-22)
- `POST /api/ideas` — Zod-validierter Insert (title max 120, description optional max 1000), returns Idea + author join
- `GET /api/ideas` — gibt alle Ideen zurück, sortiert nach `created_at desc`, inkl. `profiles` (full_name, email) und `votes (count)`, limit 100
- Zod v4 verwendet `.issues` statt `.errors` — beachten bei weiteren Zod-Validierungen

### Frontend (2026-05-22)
- `src/components/ideas/submit-idea-dialog.tsx` — Modal mit react-hook-form + Zod, Char-Counter (Titel/Beschreibung), Loading-State, Toast-Feedback
- `src/app/page.tsx` — Ideas Board: sticky Nav, Ideen-Liste (Fetch bei Mount), „Neue Idee"-Button, Optimistic Insert an Listenspitze, Loading-Skeleton, Empty State

## Open Questions
- [ ] Soll das Formular als Modal oder als separate Seite erscheinen?
- [x] Soll der Autor auf der Ideen-Karte angezeigt werden (Name sichtbar)? → **Ja**, author_name wird via profiles-Join zurückgegeben

## QA Test Results

**Datum:** 2026-05-22 | **Tester:** QA Engineer | **Status:** In Review

### Akzeptanzkriterien

| AC | Beschreibung | Ergebnis |
|----|-------------|---------|
| AC-1 | Formular öffnet sich bei Klick auf „Neue Idee einreichen" | FAIL — kein Frontend |
| AC-2 | Pflichtfeld-Validierung: „Titel ist erforderlich" | Backend: PASS (Zod `min(1)`) / UI: FAIL |
| AC-3 | Längenbegrenzung: max 120 Zeichen | Backend: PASS (Zod `max(120)`) / UI: FAIL |
| AC-4 | Beschreibung optional, Idee wird ohne gespeichert | Backend: PASS (optional, `max(1000)`) / UI: FAIL |
| AC-5 | Idee nach Einreichung sofort auf Board sichtbar | FAIL — kein Board, kein Formular |
| AC-6 | Submit-Button deaktiviert während Request | FAIL — kein Frontend |
| AC-7 | Fehlermeldung bei Supabase-Fehler | Backend: PASS (`status 500` + Meldung) / UI: FAIL |

### Backend-API-Prüfung (Code Review)

| Prüfpunkt | Ergebnis |
|-----------|---------|
| `POST /api/ideas` — Auth-Check | PASS — `supabase.auth.getUser()` + 401 bei Fehler |
| `POST /api/ideas` — Zod title min(1) | PASS — `z.string().min(1, 'Titel ist erforderlich')` |
| `POST /api/ideas` — Zod title max(120) | PASS — `z.string().max(120, ...)` |
| `POST /api/ideas` — description optional max(1000) | PASS — `.optional().nullable()` mit `max(1000)` |
| `POST /api/ideas` — author_id = aktueller User | PASS — `author_id: user.id` |
| `GET /api/ideas` — Auth-Check | PASS — gleiche Prüfung wie POST |
| `GET /api/ideas` — sortiert nach created_at desc | PASS — `.order('created_at', { ascending: false })` |
| `GET /api/ideas` — limit 100 | PASS — `.limit(100)` |
| `GET /api/ideas` — inkl. profiles + vote count | PASS — Join auf `profiles` + `votes (count)` |
| Unauthentifizierter API-Zugriff | 307 → `/login` (Middleware, korrekt) |

### Bugs

| ID | Schwere | Beschreibung |
|----|---------|-------------|
| BUG-4 | High | **Kein Frontend für Idea Submission** — Kein Formular, kein Modal, kein „Neue Idee"-Button auf `page.tsx`. AC-1, AC-5, AC-6 nicht erfüllbar. Das Feature ist backend-seitig vollständig, frontend-seitig nicht gestartet. |

### Sicherheits-Audit

| Prüfpunkt | Ergebnis |
|-----------|---------|
| Injection via title/description | Kein Risiko — Supabase SDK parametrisiert alle Queries |
| author_id Manipulation (User gibt fremde ID an) | PASS — `author_id` wird server-seitig aus `user.id` gesetzt, nicht aus dem Request-Body |
| RLS: Nur eigene Ideen einsehbar? | Nein — Policy „Ideen lesen" erlaubt allen eingeloggten Usern alle Ideen (korrekt laut Spec) |
| Limit auf returned records | PASS — `.limit(100)` verhindert übermäßige Datenmengen |

### Entscheidung
**Bereit für Deployment: NEIN** — BUG-4 (High): Frontend komplett fehlend.
