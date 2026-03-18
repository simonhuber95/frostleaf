# Frostleaf – Claude Code Instructions

## Project Overview

Frostleaf is a scientific garden planning app that determines plant viability based on real climate data using Growing Degree Days (GDD) modeling. Norway-focused, for hobby gardeners.

## Tech Stack

- **Monorepo** with pnpm workspaces: `shared/`, `backend/`, `frontend/`
- **Frontend:** SvelteKit + TypeScript (Svelte 5)
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL 16
- **Infrastructure:** Docker Compose for local dev
- **Shared types:** `@frostleaf/shared` package

## Project Structure

```
frostleaf/
├── frontend/       # SvelteKit app (@frostleaf/frontend)
├── backend/        # Express API server (@frostleaf/backend)
├── shared/         # Shared TypeScript types (@frostleaf/shared)
├── docs/           # Project documentation
├── data/seed/      # Plant seed data
└── docker-compose.yml
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Start PostgreSQL
pnpm db:up

# Start all services in dev mode
pnpm dev

# Build everything
pnpm build

# Type-check all workspaces
pnpm typecheck

# Work on a specific workspace
pnpm -F @frostleaf/backend dev
pnpm -F @frostleaf/frontend dev
```

## Workflow

- **Branching:** Work in feature branches off `main`, never commit directly to `main`
- **Roadmap:** Always update `docs/roadmap.md` after completing tasks (check off items, mark phases done)
- **Database:** Drizzle ORM with schema in `backend/src/db/schema.ts`, migrations via `drizzle-kit`

## Backend Architecture

```
backend/src/
├── routes/       # HTTP handlers — validation, response formatting
├── services/     # Business logic, orchestration (no direct DB access)
├── clients/      # All data access: db.ts, frost.ts, trefle.ts
├── db/           # Drizzle schema, connection, seed
└── types/        # Backend-specific type definitions
```

- **Route → Service → Client** layering: routes call services, services call clients
- **Services never import DB/ORM** — all DB access goes through `clients/db.ts`
- **Domain-independent service names** — e.g. `searchSpeciesByQuery` not `searchTrefleSpecies`
- **No inline types** — all types in `backend/src/types/` or `shared/src/types/`
- **`type` over `interface`** — use type aliases everywhere
- **day.js** for all date calculations

## Key Conventions

- All packages use ES modules (`"type": "module"`)
- Shared types are defined in `shared/src/types/` and exported from `shared/src/index.ts`
- **No `.js` extensions** in backend imports — `moduleResolution: "bundler"` handles this
- Shared package imports still use `.js` (compiled output)
- **Namespace imports for clients** — `import * as db from '../clients/db'`, call as `db.findPlant()`
- Database connection via `DATABASE_URL` env var
- External APIs (Frost, Trefle) are proxied through backend and cached in DB

## Environment Variables

Copy `.env.example` to `.env` and fill in API keys:

- `DATABASE_URL` — PostgreSQL connection string
- `FROST_API_CLIENT_ID` — MET Norway Frost API
- `TREFLE_API_TOKEN` — Trefle plant API
- `PORT` — Backend server port (default: 3000)

## External APIs

- MET Norway Frost API: https://frost.met.no (climate data, weather stations)
- Trefle API: https://trefle.io (plant metadata)

## Domain Concepts

- **GDD (Growing Degree Days):** `sum(max(0, (Tmax+Tmin)/2 - Tbase))` — accumulated heat units for plant growth
- **Viability:** A plant is viable if location GDD >= plant's required GDD
- **T_base:** Minimum temperature below which a plant doesn't grow (crop-specific)
- **Frost dates:** Last spring frost / first autumn frost determine the growing season
