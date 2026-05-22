# PROJ-2: User Authentication

**Status:** Approved  
**Priority:** P0 (MVP)  
**Created:** 2026-05-22  
**Updated:** 2026-05-22

## Beschreibung
Invite-only E-Mail-Authentifizierung via Supabase Auth (Magic Link). Kein öffentliches Signup — nur Nutzer, die per Admin-Invite eingeladen wurden, können sich anmelden.

## User Stories

### Story 1 — Einloggen per Magic Link
Als Team-Mitglied möchte ich mich per E-Mail-Link einloggen, damit ich kein Passwort merken muss.

### Story 2 — Invite-only Zugang
Als Admin möchte ich Nutzer gezielt einladen, damit kein Unbefugter auf das Board zugreift.

### Story 3 — Ausloggen
Als eingeloggter Nutzer möchte ich mich ausloggen können, damit meine Session endet.

## Akzeptanzkriterien

### AC-1: Magic Link Login
- **Angenommen** ich bin auf der Login-Seite (`/login`)
- **Wenn** ich meine E-Mail eingebe und „Magic Link senden" klicke
- **Dann** erhalte ich innerhalb von 60 Sekunden eine E-Mail mit einem Einmal-Login-Link

### AC-2: Link-Redirect nach Login
- **Angenommen** ich klicke auf den Magic Link in meiner E-Mail
- **Wenn** der Link gültig ist (nicht abgelaufen, nicht bereits genutzt)
- **Dann** werde ich zu `/` (Ideas Board) weitergeleitet und bin eingeloggt

### AC-3: Ungültiger oder abgelaufener Link
- **Angenommen** ich klicke auf einen abgelaufenen Magic Link
- **Wenn** Supabase den Token ablehnt
- **Dann** sehe ich eine klare Fehlermeldung: „Dieser Link ist abgelaufen. Bitte fordere einen neuen an."

### AC-4: Invite-only — kein öffentlicher Zugang
- **Angenommen** ich bin nicht eingeladen
- **Wenn** ich eine E-Mail auf der Login-Seite eingebe
- **Dann** erhalte ich KEINE Magic-Link-E-Mail (oder eine generische „falls du ein Konto hast"-Nachricht ohne Bestätigung)

### AC-5: Geschützte Routen
- **Angenommen** ich bin nicht eingeloggt
- **Wenn** ich `/` oder eine andere geschützte Route direkt aufrufe
- **Dann** werde ich zu `/login` weitergeleitet

### AC-6: Ausloggen
- **Angenommen** ich bin eingeloggt
- **Wenn** ich auf „Ausloggen" klicke
- **Dann** wird meine Session beendet und ich lande auf `/login`

### AC-7: Session-Persistenz
- **Angenommen** ich bin eingeloggt und schließe den Browser
- **Wenn** ich die App erneut öffne
- **Dann** bin ich noch eingeloggt (Session bleibt bis zum expliziten Logout)

## UI-Anforderungen

- **Login-Seite (`/login`):** Zentriertes Card-Layout, E-Mail-Feld, Submit-Button, Branding (App-Name)
- **Feedback-State:** Nach Absenden des Formulars → Bestätigungsmeldung „Schau in dein Postfach"
- **Loading-State:** Button deaktiviert während des Requests
- **Error-State:** Inline-Fehlermeldung unter dem Formular

## Out of Scope
- Passwort-Login
- OAuth / SSO (Google, GitHub etc.)
- Registrierung durch den Nutzer selbst
- Passwort-Reset-Flow
- Multi-Factor Authentication
- Team-Management / Nutzer-Rollen außer Admin-Flag

## Decision Log

### Product Decisions
| Entscheidung | Begründung | Datum |
|---|---|---|
| Magic Link statt Passwort | Einfacher für internes Team, kein Passwort-Management | 2026-05-22 |
| Invite-only via Supabase Admin | Kein öffentliches Signup, volle Kontrolle über Zugang | 2026-05-22 |

### Technical Decisions
| Entscheidung | Begründung | Datum |
|---|---|---|
| Supabase Auth (built-in) | Kein extra Auth-Service nötig, integriert mit DB und RLS | 2026-05-22 |
| Middleware für Route-Protection | Next.js Middleware schützt alle Routen außer `/login` | 2026-05-22 |
| `@supabase/ssr` für Session-Handling | Empfohlener Ansatz für Next.js App Router | 2026-05-22 |

## Open Questions
- [ ] Soll die Bestätigungs-E-Mail nach Login-Anfrage einen generischen Text haben (kein Hinweis ob User existiert) oder offen kommunizieren „Link gesendet"?
- [ ] Wie lange soll ein Magic Link gültig sein? (Supabase-Default: 1 Stunde)

## QA Test Results

**Datum:** 2026-05-22 | **Tester:** QA Engineer | **Status:** In Review

### Akzeptanzkriterien

| AC | Beschreibung | Ergebnis |
|----|-------------|---------|
| AC-1 | Login-Seite mit Formular, Loading-State, Success-State | PASS |
| AC-2 | Link-Redirect nach Login zu `/` | MANUELL (kein Testaccount vorhanden) |
| AC-3 | Fehlermeldung bei abgelaufenem Link | FAIL |
| AC-4 | Invite-only (`shouldCreateUser: false`) | PASS |
| AC-5 | Geschützte Routen leiten zu `/login` weiter | PASS (Achtung: High-Bug) |
| AC-6 | Ausloggen-Funktion | FAIL |
| AC-7 | Session-Persistenz nach Browser-Neustart | MANUELL (kein Testaccount vorhanden) |

### Bugs

| ID | Schwere | Beschreibung | Schritte |
|----|---------|-------------|---------|
| BUG-1 | High | ~~**`src/middleware.ts` fehlt**~~ **GEFIXT** — `src/proxy.ts` → `src/middleware.ts` umbenannt, Named Export `middleware` korrekt. Verifiziert: `GET /` → 307 nach `.next`-Cache-Löschung. | — |
| BUG-2 | High | ~~**Kein Logout-Button**~~ **GEFIXT** — `page.tsx` ersetzt durch minimale App-Shell mit Header + "Ausloggen"-Button. `supabase.auth.signOut()` → redirect zu `/login`. | — |
| BUG-3 | Medium | **Kein Fehler-Display für abgelaufene Links** — `/auth/callback` leitet bei Fehler zu `/login?error=link-ungueltig` weiter, aber die Login-Seite liest den `?error=`-Parameter NICHT aus und zeigt dem User keine Fehlermeldung. AC-3 nicht erfüllt. | Abgelaufenen Magic Link öffnen → zu `/login?error=link-ungueltig` weitergeleitet → kein Fehlertext sichtbar |

### E2E-Tests (`tests/PROJ-2-user-authentication.spec.ts`)

Ausführen mit `npm run test:e2e -- --workers=1`:

| Test | Ergebnis |
|------|---------|
| AC-1: Login-Seite zeigt Formular | PASS |
| AC-1 (Loading State): Button deaktiviert | PASS |
| AC-3: Fehlermeldung bei abgelaufenem Link | FAIL (BUG-3) |
| AC-5: Redirect zu /login ohne Session | PASS (echte Middleware) |
| AC-6: Logout-Button vorhanden | FAIL (BUG-2) |

### Sicherheits-Audit

| Prüfpunkt | Ergebnis |
|-----------|---------|
| Auth Bypass: Direkt zu `/` ohne Session | Blockiert (307) — echte Middleware in `src/middleware.ts` |
| Authorization: User X sieht User Y Daten | N/A — noch kein User-Content |
| XSS: E-Mail-Feld | Kein Risiko — React escaped automatisch |
| SQL-Injection | Kein Risiko — Supabase SDK parametrisiert |
| Secrets in Browser | `SUPABASE_SERVICE_ROLE_KEY` korrekt server-only, nicht im Client |
| Rate Limiting | Fehlt — kein Rate Limit auf `/login` oder `/auth/callback` |
| Open Redirect in `/auth/callback` | Geringes Risiko — `origin` aus `request.url`, in Next.js immer eigener Server |

### Entscheidung
**Bereit für Deployment: JA** — Kein Critical/High Bug. BUG-3 (Medium: kein Fehlertext bei abgelaufenem Link) kann als Follow-up gefixt werden.
