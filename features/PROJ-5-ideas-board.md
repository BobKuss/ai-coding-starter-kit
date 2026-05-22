# PROJ-5: Ideas Board

**Status:** In Review  
**Priority:** P0 (MVP)  
**Created:** 2026-05-22  
**Updated:** 2026-05-23

## Beschreibung
Die zentrale Seite der App. Zeigt alle eingereichten Ideen als Liste oder Karten-Ansicht. Nur für eingeloggte Nutzer zugänglich. Sortierung standardmäßig nach Votes (absteigend). Einfache Filter nach Status.

## User Stories

### Story 1 — Alle Ideen sehen
Als eingeloggtes Team-Mitglied möchte ich alle eingereichten Ideen auf einen Blick sehen, damit ich mir einen Überblick verschaffen kann.

### Story 2 — Nach Relevanz sortieren
Als eingeloggtes Team-Mitglied möchte ich Ideen nach Stimmenanzahl sortiert sehen, damit ich erkenne, was dem Team am wichtigsten ist.

### Story 3 — Nach Status filtern
Als eingeloggtes Team-Mitglied möchte ich Ideen nach Status filtern (z. B. nur „Offen"), damit ich den aktuellen Stand überblicke.

## Akzeptanzkriterien

### AC-1: Zugang nur nach Login
- **Angenommen** ich bin nicht eingeloggt
- **Wenn** ich `/` aufrufe
- **Dann** werde ich zu `/login` weitergeleitet

### AC-2: Ideen-Liste laden
- **Angenommen** ich bin eingeloggt
- **Wenn** ich `/` aufrufe
- **Dann** werden alle Ideen geladen und angezeigt (inkl. Titel, Autor, Datum, Status, Vote-Anzahl)

### AC-3: Standard-Sortierung nach Votes
- **Angenommen** ich öffne das Board ohne Sortierungsauswahl
- **Wenn** die Ideen geladen werden
- **Dann** sind sie nach Stimmenanzahl absteigend sortiert (meiste Stimmen oben)

### AC-4: Sortierung ändern
- **Angenommen** ich bin auf dem Board
- **Wenn** ich die Sortierung auf „Neueste zuerst" ändere
- **Dann** werden die Ideen nach Erstellungsdatum absteigend neu sortiert

### AC-5: Status-Filter
- **Angenommen** ich bin auf dem Board
- **Wenn** ich den Filter „Geplant" auswähle
- **Dann** werden nur Ideen mit Status „planned" angezeigt

### AC-6: Leerer Zustand
- **Angenommen** noch keine Ideen eingereicht wurden
- **Wenn** das Board lädt
- **Dann** sehe ich einen leeren Zustand: „Noch keine Ideen. Sei der Erste!" mit Call-to-Action-Button

### AC-7: Loading-State
- **Angenommen** das Board lädt Daten von Supabase
- **Wenn** der Request läuft
- **Dann** sehe ich Skeleton-Cards statt leerem Inhalt

### AC-8: Ideen-Karte — Pflichtinformationen
- **Angenommen** Ideen werden angezeigt
- **Wenn** ich eine Karte betrachte
- **Dann** sehe ich: Titel, Beschreibung (gekürzt auf 2 Zeilen), Status-Badge, Vote-Button + Zähler, Autor (Name oder E-Mail), Erstellungsdatum

### AC-9: Neue Idee einreichen (CTA)
- **Angenommen** ich bin eingeloggt
- **Wenn** ich das Board aufrufe
- **Dann** ist der Button „+ Idee einreichen" (PROJ-3) prominent sichtbar

## UI-Anforderungen

- **Layout:** Karten-Grid (2–3 Spalten auf Desktop, 1 auf Mobile)
- **Sortierung:** Dropdown oder Tab-Switcher oben rechts (Meiste Votes | Neueste)
- **Filter:** Chip-Buttons oder Dropdown für Status (Alle | Offen | Geplant | In Arbeit | Erledigt | Abgelehnt)
- **Karte:** shadcn/ui Card-Komponente
- **Skeleton:** shadcn/ui Skeleton während des Ladens
- **Responsive:** Mobile-first

## Out of Scope
- Suche / Volltextsuche (ggf. P1)
- Pagination (MVP: alle Ideen laden, max. ~100 erwartet)
- Infinite Scroll
- Saved Filters / persönliche Filtereinstellungen
- Kommentar-Vorschau auf der Karte (nur Anzahl)

## Decision Log

### Product Decisions
| Entscheidung | Begründung | Datum |
|---|---|---|
| Standard-Sortierung: Meiste Votes | Priorisierung ist der Kern-Use-Case | 2026-05-22 |
| Kein öffentlicher Zugang | Nur internes Team, PRD-Anforderung | 2026-05-22 |
| Keine Pagination im MVP | Max. ~20 User → max. ~100–200 Ideen realistisch | 2026-05-22 |

### Technical Decisions
| Entscheidung | Begründung | Datum |
|---|---|---|
| Server Component für initiales Laden | Bessere SEO-Unabhängigkeit und schnelleres LCP (auch wenn nur intern) | 2026-05-22 |
| Client-seitige Sortierung/Filterung | Einfacher im MVP, da Datenmenge klein | 2026-05-22 |

## Open Questions
- [x] Soll der Autor auf der Karte sichtbar sein? → Ja, Name oder E-Mail wird angezeigt
- [ ] Soll es eine Detailseite pro Idee geben (`/ideas/[id]`) oder alles auf dem Board?
- [x] Wie viele Status-Filter sollen im MVP aktiv sein? → Alle 5 (Offen, Geplant, In Arbeit, Erledigt, Abgelehnt)

## Implementation Notes (2026-05-23)

### Was gebaut wurde
- `src/app/page.tsx` — Ideas Board vollständig implementiert (Client Component)
  - Sortierung per Select-Dropdown: „Meiste Votes" (default) / „Neueste zuerst"
  - Status-Filter-Chips: Alle | Offen | Geplant | In Arbeit | Erledigt | Abgelehnt
  - StatusBadge-Komponente mit farbigen Dots (zinc/blue/amber/green/red)
  - Leerer Zustand: global (mit CTA) und filter-spezifisch (mit Reset-Link)
  - Skeleton-Loading: 3 animierte Platzhalter-Karten
- `src/lib/ideas-board.ts` — `filterAndSortIdeas()` als testbare Utility extrahiert

### Abweichungen vom Spec
- Layout: 1-Spalten-Liste statt Karten-Grid (einfacher, besser auf Mobile; Grid kann in P1 kommen)
- Skeleton: Custom animate-pulse statt shadcn Skeleton (gleiche visuelle Wirkung)

---

## QA Test Results (2026-05-23)

### Tester
QA Engineer (automatisiert)

### Acceptance Criteria

| AC | Beschreibung | Status | Notiz |
|----|---|---|---|
| AC-1 | Unauthentifizierter Zugriff → Redirect zu /login | ✅ PASS | E2E-Test grün |
| AC-2 | Ideen-Liste lädt und zeigt alle Felder | ⬜ MANUAL | E2E-Test bereit, auth-state.json fehlt |
| AC-3 | Standard-Sortierung: Meiste Votes | ⬜ MANUAL | Logik via Unit-Test geprüft ✅ |
| AC-4 | Sortierung wechseln auf Neueste | ⬜ MANUAL | Logik via Unit-Test geprüft ✅ |
| AC-5 | Status-Filter funktioniert | ⬜ MANUAL | Logik via Unit-Test geprüft ✅ |
| AC-6 | Leerer Zustand mit CTA | ⬜ MANUAL | Code-Review: korrekt implementiert |
| AC-7 | Skeleton während Loading | ⬜ MANUAL | Code-Review: animate-pulse vorhanden |
| AC-8 | Karte zeigt alle Pflichtfelder | ⬜ MANUAL | Code-Review: Titel, Badge, Vote, Autor, Datum |
| AC-9 | CTA-Button „Neue Idee" sichtbar | ⬜ MANUAL | Code-Review: prominent im Header |

### Test-Suiten

| Suite | Ergebnis |
|---|---|
| Vitest Unit (23 Tests) | ✅ 23/23 passed |
| Playwright E2E — AC-1 (kein Auth) | ✅ 1/1 passed |
| Playwright E2E — Auth-Tests (AC-2–9) | ⬜ Blockiert: `tests/auth-state.json` fehlt |

**Hinweis für Auth-Tests:** Einmalig ausführen:
```
npx playwright codegen --save-storage=tests/auth-state.json http://localhost:3000/login
```
Dann im Browser einloggen → Datei wird gespeichert → `npm run test:e2e` erneut ausführen.

### Bugs

| # | Schwere | Beschreibung | Schritte | Status |
|---|---|---|---|---|
| B-1 | Low | `ideaId` in `/api/votes/[ideaId]` ohne UUID-Format-Validierung — bei ungültigem Wert kommt HTTP 500 statt 400 | `POST /api/votes/invalid-id` | Offen |
| B-2 | Low | PROJ-2-Test AC-6 prüft Logout-Button ohne Auth → landet auf /login, nicht auf / (pre-existing, nicht PROJ-5) | — | Pre-existing |

### Security Audit

| Bereich | Befund |
|---|---|
| Auth-Prüfung | ✅ Beide API-Routen prüfen mit `getUser()` (server-side JWT) |
| Horizontal Privilege Escalation | ✅ Votes schreiben immer mit `user.id` aus JWT, nie aus Request-Body |
| SQL Injection | ✅ Supabase parametrisierte Queries, kein Raw-SQL |
| XSS | ✅ React escapet automatisch alle User-Inhalte |
| RLS | ✅ Alle Tabellen haben RLS aktiviert |
| Datenleck | ℹ️ Profil-E-Mail in API-Response sichtbar — für internes Team akzeptabel |

### Produktionsreife

**BEDINGT BEREIT** — keine Critical/High-Bugs vorhanden. Auth-E2E-Tests müssen nach Einrichtung von `auth-state.json` einmalig durchlaufen und grün sein.
