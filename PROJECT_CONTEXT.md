# Project Context

## Overview

**Name:** AI Coding Starter Kit  
**Repo:** https://github.com/BobKuss/ai-coding-starter-kit  
**Status:** Template — not yet initialized with a product idea

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Validation | Zod + react-hook-form |
| State | React useState / Context API |
| Testing | Vitest (unit) + Playwright (E2E) |
| Deployment | Vercel |

## Project Structure

```
src/app/          Pages (Next.js App Router)
src/components/
  ui/             shadcn/ui components (pre-installed, never recreate)
src/hooks/        Custom React hooks
src/lib/          Utilities (supabase.ts, utils.ts)
features/         Feature specs (PROJ-X-name.md)
docs/             PRD + production guides
.claude/          Skills, agents, rules
```

## Current State

- PRD is empty (template placeholders)
- No features defined yet (INDEX.md is blank)
- No custom pages or components built yet
- All shadcn/ui base components are pre-installed

## Workflow

1. `/init` — Define the product idea → PRD + feature map
2. `/write-spec PROJ-X` — Full spec for one feature
3. `/architecture` — Tech design
4. `/frontend` — Build UI
5. `/backend` — APIs + database
6. `/qa` — Test + security audit
7. `/deploy` — Deploy to Vercel

## Key Conventions

- Feature IDs: PROJ-1, PROJ-2, ... (see `features/INDEX.md`)
- Commits: `feat(PROJ-X): description`
- shadcn/ui first — never build custom versions of installed components
- All status changes written to `features/INDEX.md` and the feature spec file
