# Frostleaf

Scientific garden planning for Norwegian hobby gardeners. Frostleaf tells you which plants will actually grow where you live, based on real climate data and Growing Degree Days (GDD) modeling.

## How it works

1. **Resolve your location:** coordinates, an address (Kartverket geocoding) or a municipality are mapped to the nearest MET Norway weather station.
2. **Fetch climate data:** historical temperatures come from the [MET Norway Frost API](https://frost.met.no) and are cached in the database.
3. **Calculate GDD:** heat units accumulate over the season using `sum(max(0, (Tmax + Tmin) / 2 - Tbase))`, alongside last spring and first autumn frost dates.
4. **Score viability:** each plant's GDD requirement is compared with your location's average GDD, and plants are ranked by a viability score. If no GDD data exists for a plant, the comparison falls back to frost-free days.

Plant data comes from a curated seed list of Norwegian garden plants, supplemented by the [Trefle API](https://trefle.io).

## Tech stack

- **Frontend:** SvelteKit (Svelte 5), TypeScript, Tailwind v4, shadcn-svelte
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL 16 with Drizzle ORM
- **Tooling:** pnpm workspaces, Docker Compose, ESLint, Prettier

## Project structure

```
frostleaf/
├── frontend/       # SvelteKit app (@frostleaf/frontend)
├── backend/        # Express API server (@frostleaf/backend)
├── shared/         # Shared TypeScript types (@frostleaf/shared)
├── docs/           # Project documentation and roadmap
├── data/seed/      # Plant seed data
└── docker-compose.yml
```

## Getting started

### Prerequisites

- Node.js 24+ (see `.node-version`)
- pnpm 10
- Docker

### Setup

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# then fill in FROST_API_CLIENT_ID and TREFLE_API_TOKEN

# Start PostgreSQL, run migrations and seed plant data
pnpm db:up
pnpm db:migrate
pnpm db:seed

# Start backend and frontend in dev mode
pnpm dev
```

The frontend runs on http://localhost:5173 and the API on http://localhost:3000.

### Environment variables

| Variable              | Description                                               |
| --------------------- | --------------------------------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string                              |
| `PORT`                | Backend port (default `3000`)                             |
| `FROST_API_CLIENT_ID` | MET Norway Frost API client ID ([register](https://frost.met.no)) |
| `TREFLE_API_TOKEN`    | Trefle API token ([register](https://trefle.io))          |
| `PUBLIC_API_URL`      | Backend URL used by the frontend                          |

## Scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `pnpm dev`          | Start the database, backend and frontend     |
| `pnpm build`        | Build all workspaces                         |
| `pnpm typecheck`    | Type-check all workspaces                    |
| `pnpm lint`         | Run ESLint                                   |
| `pnpm format`       | Format with Prettier                         |
| `pnpm db:up`        | Start PostgreSQL                             |
| `pnpm db:down`      | Stop Docker services                         |
| `pnpm db:generate`  | Generate a Drizzle migration                 |
| `pnpm db:migrate`   | Apply migrations                             |
| `pnpm db:seed`      | Seed plant data                              |
| `pnpm db:studio`    | Open Drizzle Studio                          |

## Documentation

- [Roadmap](docs/roadmap.md)
- [App concept](docs/garden_planning_app.md)
- [GDD paper summary](docs/GDD_paper_summary.md)
