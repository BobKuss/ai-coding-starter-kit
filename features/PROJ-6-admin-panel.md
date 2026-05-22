# PROJ-6: Admin Panel

**Status:** Planned  
**Priority:** P1  
**Created:** 2026-05-22  
**Updated:** 2026-05-22

## Beschreibung
Ein geschütztes Admin-Interface für berechtigte Nutzer (is_admin = true). Admins können den Status von Ideen ändern, Ideen löschen und neue Nutzer einladen. Kein separates Admin-Login — gleiche Auth wie normale Nutzer, aber mit erweiterten Rechten.

## User Stories

### Story 1 — Status einer Idee ändern
Als Admin möchte ich den Status einer Idee ändern (z. B. von „Offen" auf „Geplant"), damit das Team den Fortschritt verfolgen kann.

### Story 2 — Idee löschen
Als Admin möchte ich eine Idee löschen können (z. B. Spam oder Duplikat), damit das Board sauber bleibt.

### Story 3 — Nutzer einladen
Als Admin möchte ich neue Team-Mitglieder per E-Mail einladen, damit sie Zugang zum Board erhalten.

### Story 4 — Admin-Zugang schützen
Als System möchte ich sicherstellen, dass nur Admins auf das Admin-Panel zugreifen können.

## Akzeptanzkriterien

### AC-1: Admin-Panel nur für Admins
- **Angenommen** ich bin eingeloggt aber kein Admin (is_admin = false)
- **Wenn** ich `/admin` aufrufe
- **Dann** erhalte ich einen 403-Fehler oder werde zu `/` weitergeleitet

### AC-2: Status-Änderung einer Idee
- **Angenommen** ich bin eingeloggt als Admin und auf dem Admin-Panel
- **Wenn** ich den Status einer Idee auf „Geplant" setze und speichere
- **Dann** wird der Status in der Datenbank aktualisiert und auf dem Board sofort angezeigt

### AC-3: Erlaubte Status-Übergänge
- **Angenommen** ich bin Admin
- **Wenn** ich den Status einer Idee ändern möchte
- **Dann** kann ich zwischen folgenden Status wählen: `open`, `planned`, `in_progress`, `done`, `rejected`

### AC-4: Idee löschen
- **Angenommen** ich bin Admin und auf dem Admin-Panel
- **Wenn** ich auf „Löschen" bei einer Idee klicke
- **Dann** erscheint ein Bestätigungs-Dialog: „Idee unwiderruflich löschen?"

### AC-5: Löschen bestätigt
- **Angenommen** ich bestätige das Löschen
- **Wenn** die Aktion ausgeführt wird
- **Dann** wird die Idee (inkl. zugehöriger Votes und Kommentare) aus der DB entfernt

### AC-6: Nutzer einladen
- **Angenommen** ich bin Admin
- **Wenn** ich eine E-Mail-Adresse eingebe und „Einladen" klicke
- **Dann** sendet Supabase eine Invite-E-Mail an diese Adresse

### AC-7: Bereits eingeladener Nutzer
- **Angenommen** ich versuche eine E-Mail einzuladen, die bereits existiert
- **Wenn** ich den Invite absende
- **Dann** erhalte ich eine Fehlermeldung: „Diese E-Mail ist bereits registriert"

### AC-8: Admin kann is_admin nicht selbst entziehen
- **Angenommen** ich bin der einzige Admin
- **Wenn** ich versuche, meinen eigenen Admin-Status zu entfernen
- **Dann** wird dies blockiert mit Meldung: „Du kannst deinen eigenen Admin-Status nicht entfernen"

## UI-Anforderungen

- **Route:** `/admin` (geschützt via Middleware + RLS)
- **Navigation:** Link im Header nur sichtbar für Admins
- **Ideen-Tabelle:** Alle Ideen tabellarisch (Titel, Autor, Status, Votes, Datum, Aktionen)
- **Status-Änderung:** Inline-Dropdown in der Tabelle
- **Nutzer-Einladung:** Einfaches Formular mit E-Mail-Feld + Button
- **Bestätigungs-Dialog:** shadcn/ui AlertDialog

## Out of Scope
- Nutzer aus der App entfernen / deaktivieren (direkt via Supabase Dashboard)
- Admin-Rollen / Berechtigungsstufen (nur ein Admin-Level)
- Audit-Log aller Admin-Aktionen
- Massen-Aktionen (mehrere Ideen gleichzeitig löschen)
- Idee bearbeiten (Titel/Beschreibung ändern) — nur Status

## Decision Log

### Product Decisions
| Entscheidung | Begründung | Datum |
|---|---|---|
| Nur Status-Änderung und Löschen im MVP | Einfach halten, weitere Aktionen bei Bedarf | 2026-05-22 |
| Einladen via Supabase Admin API | Kein eigener Invite-Flow nötig | 2026-05-22 |

### Technical Decisions
| Entscheidung | Begründung | Datum |
|---|---|---|
| Admin-Check via `profiles.is_admin` | Einfaches Boolean-Flag, kein separates Rollen-System | 2026-05-22 |
| Middleware + RLS für doppelten Schutz | Middleware verhindert Seitenaufruf, RLS verhindert Daten-Zugriff | 2026-05-22 |
| Supabase Admin API (service_role) für Invite | Nur server-side, Key niemals im Client | 2026-05-22 |

## Open Questions
- [ ] Soll der Admin auch Kommentare löschen können (direkt aus dem Admin-Panel)?
- [ ] Soll es eine Nutzer-Liste im Admin-Panel geben (alle eingeladenen E-Mails)?
