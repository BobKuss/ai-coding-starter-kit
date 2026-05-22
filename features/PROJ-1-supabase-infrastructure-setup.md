# PROJ-1: Supabase Infrastructure Setup

**Status:** Approved  
**Priority:** P0 (MVP)  
**Created:** 2026-05-22  
**Updated:** 2026-05-22

## Beschreibung
Einrichtung des Supabase-Projekts als zentrales Backend für das Voting Board: Datenbank-Schema, Row Level Security, Umgebungsvariablen und lokales Dev-Setup.

## User Stories

### Story 1 — Infrastruktur bereit
Als Entwickler möchte ich ein vollständiges Supabase-Setup, damit ich alle anderen Features darauf aufbauen kann.

## Akzeptanzkriterien

### AC-1: Supabase-Projekt existiert
- **Angenommen** ich habe Zugriff auf das Supabase-Dashboard
- **Wenn** ich das Projekt aufrufe
- **Dann** sind alle Tabellen (`users`, `ideas`, `votes`, `comments`) vorhanden und erreichbar

### AC-2: Lokales Dev-Setup funktioniert
- **Angenommen** ich clone das Repository
- **Wenn** ich `.env.local` mit den Supabase-Keys befülle und `npm run dev` starte
- **Dann** verbindet sich die App ohne Fehler mit Supabase

### AC-3: RLS ist aktiviert
- **Angenommen** RLS ist auf allen Tabellen aktiv
- **Wenn** ein nicht-authentifizierter Request auf eine Tabelle zugreift
- **Dann** wird er blockiert (kein Daten-Leak)

### AC-4: Migrations-Datei ist eingecheckt
- **Angenommen** das Schema ist finalisiert
- **Wenn** ich `supabase/migrations/` öffne
- **Dann** existiert mindestens eine `.sql`-Migrationsdatei mit dem vollständigen Schema

## Datenbankschema

```sql
-- Profiles (erweitert auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- Ideas
create table public.ideas (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  status text default 'open' check (status in ('open', 'planned', 'in_progress', 'done', 'rejected')),
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Votes
create table public.votes (
  id uuid default gen_random_uuid() primary key,
  idea_id uuid references public.ideas(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(idea_id, user_id)
);

-- Comments
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  idea_id uuid references public.ideas(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete set null,
  content text not null,
  created_at timestamptz default now()
);
```

## RLS Policies (Übersicht)

| Tabelle | SELECT | INSERT | UPDATE | DELETE |
|---------|--------|--------|--------|--------|
| profiles | Nur eigenes Profil | Nur eigenes (trigger) | Nur eigenes | Nein |
| ideas | Alle eingeloggte User | Eingeloggte User | Nur Autor + Admin | Nur Admin |
| votes | Alle eingeloggte User | Nur eigene | Nein | Nur eigene |
| comments | Alle eingeloggte User | Eingeloggte User | Nur eigene | Nur eigene + Admin |

## Umgebungsvariablen

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # nur server-side
```

## Out of Scope
- Supabase Storage (keine Datei-Uploads im MVP)
- Supabase Edge Functions (kein Server-Code außer RLS im MVP)
- Mehrere Environments (Staging etc.)
- Backup-Strategie (wird nach MVP betrachtet)

## Tech Design (Solution Architect)

### Infrastruktur-Übersicht
```
Supabase Cloud Project
+-- auth.users            (Supabase Auth - built-in)
+-- public.profiles       (1:1 zu auth.users, via Trigger)
+-- public.ideas          (Ideen der Team-Mitglieder)
+-- public.votes          (Stimmen, UNIQUE pro User+Idea)
+-- public.comments       (Kommentare auf Ideen)
```

### Supabase Client Setup (Two-Client Pattern)
```
src/lib/
+-- supabase/
|   +-- client.ts         (Browser-Client für Client Components)
|   +-- server.ts         (Server-Client für Server Components & API Routes)
```
- **Browser-Client** (`createBrowserClient` aus `@supabase/ssr`): für React Client Components
- **Server-Client** (`createServerClient` aus `@supabase/ssr`): liest Cookies, für Server Components und Route Handlers
- `@supabase/ssr` ist nötig, weil Next.js App Router Cookie-basiertes Session-Handling braucht; `supabase-js` allein reicht nicht

### Migrations-Strategie
```
supabase/
+-- migrations/
|   +-- 20260522000001_initial_schema.sql    (alle 4 Tabellen + RLS + Trigger)
```
- Alle Schema-Änderungen als versionierte SQL-Dateien eingecheckt (erfüllt AC-4)
- Anwendung per Supabase MCP auf das Remote-Projekt

### Trigger (automatische Profil-Erstellung)
- Postgres-Trigger auf `auth.users` → bei jedem neuen Auth-User wird automatisch ein Eintrag in `public.profiles` erstellt
- Kein manueller `INSERT` nötig; verhindert Inkonsistenzen

### TypeScript-Typen
- Werden aus dem Supabase-Schema generiert (`supabase gen types`) → `src/types/supabase.ts`
- Sorgt für Typsicherheit bei allen DB-Zugriffen im Frontend und Backend

### Abhängigkeiten
| Paket | Zweck |
|---|---|
| `@supabase/ssr` | Next.js App Router Auth mit Cookie-Handling |

### Dateien (erstellt/geändert)
| Datei | Aktion |
|---|---|
| `supabase/migrations/20260522000001_initial_schema.sql` | Neu — Schema + RLS + Trigger |
| `src/lib/supabase/client.ts` | Neu — Browser-Client |
| `src/lib/supabase/server.ts` | Neu — Server-Client |
| `src/lib/supabase.ts` | Entfernt — ersetzt durch den neuen Ordner |
| `src/types/supabase.ts` | Neu — generierte DB-Typen |
| `.env.local.example` | Ergänzt — `SUPABASE_SERVICE_ROLE_KEY` hinzufügen |

## Decision Log

### Product Decisions
| Entscheidung | Begründung | Datum |
|---|---|---|
| Eigenes Supabase-Projekt (nicht geteilt) | Keine Abhängigkeit zur City Concierge App | 2026-05-22 |

### Technical Decisions
| Entscheidung | Begründung | Datum |
|---|---|---|
| `profiles`-Tabelle statt direkter `auth.users`-Nutzung | RLS einfacher, Custom-Felder möglich | 2026-05-22 |
| Trigger für Profil-Erstellung | Automatisch bei neuem Auth-User, kein manueller Insert nötig | 2026-05-22 |
| `votes` UNIQUE constraint auf (idea_id, user_id) | Verhindert Doppelstimmen auf DB-Ebene | 2026-05-22 |
| `@supabase/ssr` statt nur `supabase-js` | Next.js App Router braucht Cookie-basiertes Session-Handling | 2026-05-22 |
| Two-Client Pattern (browser + server) | Trennung von Client-/Server-Kontext; verhindert Session-Bugs in Server Components | 2026-05-22 |
| Migrations als SQL-Dateien eingecheckt | Versionskontrolle des Schemas; erfüllt AC-4 | 2026-05-22 |
| TypeScript-Typen aus Supabase generieren | Typsicherheit für alle DB-Zugriffe ohne manuelle Typ-Definitionen | 2026-05-22 |

## Open Questions
- [ ] Soll `full_name` beim Invite-Flow befüllt werden oder optional bleiben?
- [ ] Brauchen wir einen `category`-Feld auf `ideas` für spätere Filterung?

## QA Test Results

**Datum:** 2026-05-22 | **Tester:** QA Engineer | **Status:** In Review

### Akzeptanzkriterien

| AC | Beschreibung | Ergebnis |
|----|-------------|---------|
| AC-1 | Alle 4 Tabellen im Supabase-Dashboard vorhanden | PASS |
| AC-2 | Lokales Dev-Setup verbindet sich mit Supabase | PASS |
| AC-3 | RLS auf allen Tabellen aktiviert | PASS |
| AC-4 | Migrations-Datei in `supabase/migrations/` eingecheckt | PASS |

### Bugs

| Schwere | Beschreibung | Schritte |
|---------|-------------|---------|
| Low | `supabase_migrations`-Tabelle ist leer — Schema wurde direkt per MCP/SQL angewendet, nicht über den Migrations-Workflow (`supabase migration apply`). Risiko: Konflikt bei zukünftigem `supabase db push`. | Supabase Dashboard → Tabellen-Editor → `supabase_migrations` |

### Sicherheit
- RLS auf allen 4 Tabellen aktiv ✓
- Alle RLS-Policies korrekt für Authenticated/Public getrennt ✓
- Profile-Trigger (`handle_new_user`) verwendet `security definer` mit leerem `search_path` ✓

### Entscheidung
**Bereit für Deployment:** JA (kein Critical/High Bug)
