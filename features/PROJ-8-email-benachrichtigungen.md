# PROJ-8: E-Mail-Benachrichtigungen bei Statusänderung

**Status:** Planned  
**Priority:** P2  
**Created:** 2026-05-22  
**Updated:** 2026-05-22

## Beschreibung
Wenn ein Admin den Status einer Idee ändert, erhält der Autor der Idee automatisch eine E-Mail-Benachrichtigung. Nutzer können Benachrichtigungen nicht deaktivieren (MVP: kein Preferences-Screen).

## User Stories

### Story 1 — Statusänderungs-Benachrichtigung
Als Autor einer Idee möchte ich eine E-Mail erhalten, wenn sich der Status meiner Idee ändert, damit ich über den Fortschritt informiert bin.

### Story 2 — Benachrichtigung nicht selbst auslösen
Als Admin möchte ich keine E-Mail erhalten, wenn ich den Status einer meiner eigenen Ideen ändere.

## Akzeptanzkriterien

### AC-1: E-Mail bei Statusänderung
- **Angenommen** ein Admin ändert den Status der Idee von User A von „Offen" auf „Geplant"
- **Wenn** die Status-Änderung gespeichert wird
- **Dann** erhält User A eine E-Mail mit dem neuen Status innerhalb von 2 Minuten

### AC-2: E-Mail-Inhalt
- **Angenommen** eine Benachrichtigung wird ausgelöst
- **Wenn** die E-Mail ankommt
- **Dann** enthält sie: Ideentitel, alter Status, neuer Status, Link zur Idee

### AC-3: Kein Self-Notification
- **Angenommen** ein Admin ist gleichzeitig der Autor einer Idee
- **Wenn** er/sie den Status dieser Idee ändert
- **Dann** wird keine E-Mail verschickt

### AC-4: Keine Benachrichtigung bei gleicher Status-Änderung
- **Angenommen** der Status einer Idee ist bereits „Geplant"
- **Wenn** der Admin „Geplant" erneut speichert (keine echte Änderung)
- **Dann** wird keine E-Mail ausgelöst

### AC-5: E-Mail bei gelöschter Idee
- **Angenommen** ein Admin löscht eine Idee
- **Wenn** die Löschung ausgeführt wird
- **Dann** wird KEINE Löschungs-Benachrichtigung versendet (Out of Scope)

## E-Mail-Template (Struktur)

```
Betreff: Deine Idee „[Ideentitel]" wurde aktualisiert

Hallo [Name],

der Status deiner Idee wurde geändert:

Idee: [Ideentitel]
Alter Status: [Alter Status]
Neuer Status: [Neuer Status]

→ Idee ansehen: [Link]

Das City Concierge Voting Board
```

## Out of Scope
- Benachrichtigungen bei neuen Kommentaren auf eigene Ideen
- Benachrichtigungen bei neuen Votes
- Weekly Digest / Zusammenfassungs-Mails
- Nutzer kann Benachrichtigungen deaktivieren (Preferences)
- Benachrichtigung bei Löschung einer Idee
- HTML-E-Mails mit Branding (Plain Text reicht im MVP)

## Decision Log

### Product Decisions
| Entscheidung | Begründung | Datum |
|---|---|---|
| Nur Statusänderung als Trigger | Wichtigster Feedback-Moment für Ideen-Autoren | 2026-05-22 |
| Kein Preferences-Screen im MVP | Zu komplex für P2, alle Nutzer erhalten Mails | 2026-05-22 |

### Technical Decisions
| Entscheidung | Begründung | Datum |
|---|---|---|
| Supabase Edge Function oder Next.js API Route als Trigger | Wird bei Architektur entschieden | 2026-05-22 |
| E-Mail-Versand via Resend oder Supabase SMTP | Resend bevorzugt (einfache API, Free Tier ausreichend) | 2026-05-22 |

## Open Questions
- [ ] Soll die E-Mail als Plain Text oder HTML versendet werden?
- [ ] Welcher E-Mail-Provider soll genutzt werden? (Resend empfohlen, Supabase SMTP als Fallback)
- [ ] Soll die Benachrichtigung synchron (im API-Aufruf) oder asynchron (Supabase Cron/Queue) ausgelöst werden?
