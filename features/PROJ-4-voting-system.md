# PROJ-4: Voting System

**Status:** In Review  
**Priority:** P0 (MVP)  
**Created:** 2026-05-22  
**Updated:** 2026-05-22

## Beschreibung
Eingeloggte Nutzer können für Ideen abstimmen (Upvote). Jeder Nutzer hat genau eine Stimme pro Idee. Votes können zurückgenommen werden (Toggle). Die Vote-Anzahl ist öffentlich sichtbar für alle eingeloggten Nutzer.

## User Stories

### Story 1 — Upvoten
Als eingeloggtes Team-Mitglied möchte ich für eine Idee stimmen, damit ich mein Interesse signalisieren kann.

### Story 2 — Vote zurücknehmen
Als eingeloggtes Team-Mitglied möchte ich meine Stimme zurücknehmen können, falls ich meine Meinung ändere.

### Story 3 — Abstimmungsstand sehen
Als eingeloggtes Team-Mitglied möchte ich sehen, wie viele Stimmen jede Idee hat, damit ich die Priorisierung einschätzen kann.

## Akzeptanzkriterien

### AC-1: Upvote abgeben
- **Angenommen** ich bin eingeloggt und habe noch nicht für eine Idee gestimmt
- **Wenn** ich auf den Vote-Button klicke
- **Dann** steigt der Zähler um 1 und der Button zeigt meinen aktiven Vote (visuelles Feedback)

### AC-2: Vote zurücknehmen (Toggle)
- **Angenommen** ich habe bereits für eine Idee gestimmt
- **Wenn** ich erneut auf den Vote-Button klicke
- **Dann** sinkt der Zähler um 1 und der Button kehrt in den Ausgangszustand zurück

### AC-3: Maximale Stimme pro Nutzer
- **Angenommen** ich habe bereits für eine Idee gestimmt
- **Wenn** ich versuche, erneut zu voten (z. B. via direktem API-Aufruf)
- **Dann** blockiert der UNIQUE-Constraint auf DB-Ebene den Insert

### AC-4: Eigene Idee voten
- **Angenommen** ich bin der Autor einer Idee
- **Wenn** ich die Ideen-Karte sehe
- **Dann** kann ich auch für meine eigene Idee stimmen (kein Selbst-Vote-Block)

### AC-5: Vote-Zähler sichtbar
- **Angenommen** ich bin eingeloggt und sehe das Board
- **Wenn** ich die Ideen-Liste betrachte
- **Dann** sehe ich bei jeder Idee die aktuelle Stimmenanzahl

### AC-6: Optimistic Update
- **Angenommen** ich klicke auf Vote
- **Wenn** der Request an Supabase gesendet wird
- **Dann** aktualisiert sich der Zähler sofort (optimistic), auch wenn der Server-Response noch aussteht

### AC-7: Fehler-Rollback
- **Angenommen** der Vote-Request schlägt fehl
- **Wenn** der Server einen Fehler zurückgibt
- **Dann** wird der Zähler auf den vorherigen Stand zurückgesetzt und eine Toast-Fehlermeldung erscheint

### AC-8: Nicht eingeloggt
- **Angenommen** ich bin nicht eingeloggt
- **Wenn** ich die Vote-Funktionalität aufrufe
- **Dann** werde ich zu `/login` weitergeleitet (RLS + Middleware verhindern unauthorizierten Zugriff)

## UI-Anforderungen

- Vote-Button auf jeder Ideen-Karte (Upvote-Pfeil + Zähler)
- Aktiver State: farblich hervorgehoben (z. B. primäre Farbe)
- Inaktiver State: grau / outline
- Zähler: immer sichtbar, auch bei 0

## Out of Scope
- Downvote
- Mehrfach-Votes (mehrere Stimmen pro Nutzer)
- Anonyme Votes
- Vote-Historie / wer hat gevotet (nicht sichtbar für andere User)
- Gewichtete Votes

## Decision Log

### Product Decisions
| Entscheidung | Begründung | Datum |
|---|---|---|
| Toggle-Vote (statt einmaliger Vote) | Bessere UX, Nutzer können Meinung ändern | 2026-05-22 |
| Selbst-Vote erlaubt | Kein Mehrwert durch Blockierung im internen Team | 2026-05-22 |
| Vote-Autor nicht öffentlich sichtbar | Keine sozialen Druckeffekte, anonymer Abstimmungsprozess | 2026-05-22 |

### Technical Decisions
| Entscheidung | Begründung | Datum |
|---|---|---|
| UNIQUE(idea_id, user_id) auf DB-Ebene | Sicherheitsnetz gegen Race Conditions und API-Bypasses | 2026-05-22 |
| Optimistic UI | Bessere gefühlte Performance | 2026-05-22 |
| Vote-Count als aggregierter Query (count) | Keine separate Spalte auf `ideas` — immer aktuell | 2026-05-22 |

## Implementation Notes

### Frontend + API (2026-05-22)
- `POST /api/votes/[ideaId]` — Toggle-Endpunkt: prüft ob Vote existiert, fügt ein oder löscht, gibt `{ voted, count }` zurück
- `GET /api/ideas` — um `user_has_voted` erweitert: zweite Query holt eigene Votes, merged als Set
- `src/components/ideas/vote-button.tsx` — Pill-Button, aktiv: Gradient + Glow, inaktiv: Ghost mit Hover-Lift
- `src/app/page.tsx` — Optimistic Update + Server-Reconciliation + Rollback bei Fehler; `votingIds` Set verhindert Doppelklick-Race

## Open Questions
- [ ] Soll die Sortierung des Boards automatisch nach Vote-Anzahl erfolgen (real-time)? Oder bleibt die Reihenfolge fix bis zur Seiten-Aktualisierung?
- [ ] Brauchen wir Realtime-Updates (Supabase Realtime) für den Vote-Zähler?

## QA Test Results

**Datum:** 2026-05-22 | **Tester:** QA Engineer | **Status:** Approved

### Akzeptanzkriterien

| AC | Beschreibung | Ergebnis |
|----|-------------|---------|
| AC-1 | Upvote: Zähler steigt um 1, Button zeigt aktiven State | PASS — User-bestätigt, Gradient + Glow korrekt |
| AC-2 | Toggle: Vote zurücknehmen senkt Zähler, Ghost-State | PASS — User-bestätigt |
| AC-3 | UNIQUE-Constraint blockiert Doppel-Vote via API | PASS — `UNIQUE(idea_id, user_id)` in DB-Migration verifiziert |
| AC-4 | Eigene Idee voten erlaubt | PASS — kein Selbst-Vote-Block im Code |
| AC-5 | Vote-Zähler immer sichtbar (auch bei 0) | PASS — User-bestätigt |
| AC-6 | Optimistic Update: Zähler sofort nach Klick | PASS — `setIdeas()` vor `fetch()`, Server-Reconciliation danach |
| AC-7 | Fehler-Rollback: Toast + Zähler zurücksetzen | PASS — try/catch in `handleVote`, `prev`-State gespeichert |
| AC-8 | Unauthentifiziert → Redirect zu /login | PASS — E2E-Test grün (Playwright, Chromium) |

### Unit Tests (`src/components/ideas/vote-button.test.tsx`)

| Test | Ergebnis |
|------|---------|
| Zeigt Stimmenzahl an | PASS |
| Rendert inaktiven Zustand korrekt | PASS |
| Rendert aktiven Zustand korrekt | PASS |
| Ruft onVote beim Klick auf | PASS |
| Ruft onVote NICHT auf wenn disabled | PASS |
| Zeigt 0 korrekt an | PASS |

**Gesamt: 6/6 PASS**

### E2E Tests (`tests/PROJ-4-voting-system.spec.ts`)

| Test | Ergebnis |
|------|---------|
| AC-8: Unauthentifiziert → /login | PASS (Playwright Chromium) |
| AC-1/AC-2: Vote-Toggle | Requires auth-state.json (storageState-Setup nötig) |
| AC-6: Optimistic Update | Requires auth-state.json |
| AC-5: Zähler ≥ 0 auf allen Karten | Requires auth-state.json |

### Sicherheits-Audit

| Prüfpunkt | Ergebnis |
|-----------|---------|
| Auth-Check in POST /api/votes/[ideaId] | PASS — `getUser()` + 401 |
| user_id aus Auth, nicht aus Request-Body | PASS — `user_id: user.id` server-seitig |
| Fremde Votes löschbar? | PASS — RLS `using (auth.uid() = user_id)` |
| UNIQUE-Constraint als Sicherheitsnetz | PASS — DB-Ebene, unumgehbar |
| Vote-Autoren sichtbar in Response? | PASS — nur `count` zurückgegeben, kein user_id |
| Injection via ideaId (URL-Parameter) | PASS — Supabase SDK parametrisiert |
| Unauthentifizierter API-Zugriff | PASS — 401 zurückgegeben |

### Bugs

| ID | Schwere | Beschreibung |
|----|---------|-------------|
| BUG-5 | Medium | **Race Condition beim gleichzeitigen Vote**: Check-then-Insert nicht atomar. Zwei simultane Requests mit gleicher (idea_id, user_id) könnten beide den `existing`-Check passieren; zweiter Insert schlägt mit 500 fehl statt 409 Conflict. In der Praxis für internes Einzelgerät-Team unwahrscheinlich. |
| BUG-6 | Low | **Kein Rate-Limiting** auf `/api/votes/[ideaId]`. Ein User könnte schnell toggling auslösen (kein praktisches Schadenspotenzial im internen Team). |

### Regressionstest

| Feature | Status |
|---------|--------|
| PROJ-3: Idea Submission — „Neue Idee"-Button | PASS — sichtbar und funktional |
| PROJ-3: Ideen-Liste laden (GET /api/ideas) | PASS — `user_has_voted` korrekt ergänzt |
| PROJ-2: Auth-Redirect bei nicht eingeloggt | PASS — AC-8 E2E bestätigt |

### Entscheidung
**Bereit für Deployment: JA** — Keine Critical/High Bugs. BUG-5 (Medium) und BUG-6 (Low) sind für internes Team-Tool akzeptabel.
