# Product Requirements Document

## Vision
Ein internes Voting Board für das City Concierge Team. Mitglieder reichen Produktideen ein,
stimmen ab und priorisieren gemeinsam — damit Produktentscheidungen transparent und datengetrieben werden.

## Target Users
**Interne Team-Mitglieder der City Concierge App** (nur nach Login zugänglich)
- Pain Point: Ideen landen verstreut in Chats/Meetings, werden nie priorisiert und gehen verloren.
- Bedarf: Ein zentraler Ort für alle Feature-Wünsche, mit klarer Priorisierung durch Voting.

## Core Features (Roadmap)

| Priority | Feature | Status |
|----------|---------|--------|
| P0 (MVP) | Supabase Infrastructure Setup | Roadmap |
| P0 (MVP) | User Authentication (E-Mail, invite-only) | Roadmap |
| P0 (MVP) | Idea Submission | Roadmap |
| P0 (MVP) | Voting System | Roadmap |
| P0 (MVP) | Ideas Board (internes Board, nur nach Login) | Roadmap |
| P1 | Admin Panel (Ideen verwalten, Status setzen) | Roadmap |
| P1 | Kommentare auf Ideen | Roadmap |
| P2 | E-Mail-Benachrichtigungen bei Statusänderung | Roadmap |
| P2 | Roadmap-Ansicht (interne Übersicht) | Roadmap |

## Success Metrics
- ≥ 80 % der Team-Mitglieder loggen sich aktiv ein
- ≥ 20 eingereichte Ideen im ersten Monat
- Produktentscheidungen werden auf Basis von Board-Daten getroffen

## Constraints
- Solo-Entwickler, MVP-Ziel ~2–3 Wochen
- Eigenes Supabase-Projekt (kein Shared Backend mit City Concierge App)
- Nur für internes Team — kein öffentlicher Zugang
- Design System: siehe `docs/design-system.md`

## Non-Goals
- Keine öffentliche Seite oder Gast-Zugang
- Keine Integration mit der City Concierge App (Auth, DB, etc.)
- Keine Bezahlfunktionen
- Kein SSO / OAuth (nur E-Mail/Magic Link)
- Kein Team-Management oder Rollen außer User/Admin
