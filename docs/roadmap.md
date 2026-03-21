# Frostleaf – Development Roadmap

## Phase 0: Project Setup ✓

- [x] Define core concept and methodology
- [x] Choose tech stack (SvelteKit + Node.js + TypeScript + PostgreSQL)
- [x] Define data model (shared types: plant, location, garden, climate)
- [x] Initialize monorepo with pnpm workspaces (frontend, backend, shared)
- [x] Docker Compose setup (PostgreSQL 16, backend, frontend)
- [x] ESLint + Prettier configuration
- [x] Dockerfiles for backend and frontend
- [x] Base TypeScript config with ESM
- [x] Health check route on backend
- [x] CLAUDE.md + memory setup
- [x] Database schema with Drizzle ORM (8 tables, enums, indexes)
- [x] Drizzle Kit config + migration scripts
- [x] Node 24 LTS via nvm

- [x] Run first migration — all 8 tables live in PostgreSQL

**Remaining:**

- [ ] Basic CI: linting, type-checking (GitHub Actions — when needed)

---

## Phase 1: Data Foundation

**Goal:** Populate the system with plant and climate data.

- [x] Curate V1 plant seed list (65 plants) with thermal properties
  - GDD paper parsed → CSV thermal data + summary
  - Norwegian hobby garden focus: vegetables, herbs, berries, fruit trees
- [x] Build seed script (`pnpm db:seed`) to populate plants + thermal properties
- [x] Integrate MET Norway Frost API (route → service → client architecture)
  - [x] Weather station lookup by coordinates (haversine nearest, cached in DB)
  - [x] Fetch historical temperature data
  - [x] Cache responses in DB
- [x] GDD calculation engine (`services/gdd.ts`)
  - [x] Daily GDD from temperature data (FAO simplified method)
  - [x] Seasonal accumulation
  - [x] Frost date detection (last spring / first autumn)
- [x] Plants REST API (`GET /api/plants`, `GET /api/plants/:id`)
- [x] Location REST API (`POST /api/location`, `GET /api/location/:id`)
- [x] Integrate Trefle API (supplementary plant data)
  - [x] Generated typed client from OpenAPI spec (`openapi-typescript` + `openapi-fetch`)
  - [x] Proxy endpoints: `GET /api/plants/search/trefle`, `GET /api/plants/trefle/:id`

---

## Phase 2: Viability Engine (MVP Core)

**Goal:** Given a location, determine which plants are viable.

- [x] Location resolution service (`services/location.ts`)
  - [x] Coordinate input → nearest weather station
  - [x] Address geocoding via Kartverket API (`clients/kartverket.ts`)
  - [x] Municipality lookup (Norwegian kommuner)
- [x] Viability calculation (`services/viability.ts`)
  - [x] Compare location avg GDD vs plant GDD requirements
  - [x] Confidence scoring from thermal data source
  - [x] Rank plants by viability score (0-1)
  - [x] Fallback to frost-free days when no GDD data
- [x] REST API endpoints
  - [x] `POST /api/location` — resolve coordinates/address/municipality
  - [x] `GET /api/location/:id` — location with metrics
  - [x] `GET /api/viability/:locationId` — viability report
  - [x] `GET /api/plants/search?q=&includeExternal=true` — unified search with Trefle import
  - [x] `POST /api/plants/import/:trefleId` — import single plant from Trefle

**Known issues:**
- Weather service should fallback to next nearest station on Frost API 412 errors

---

## Phase 3: Frontend MVP

**Goal:** Users can enter a location and see viable plants.

- [x] SvelteKit + Tailwind v4 + shadcn-svelte setup
- [x] App layout shell (nav, footer)
- [x] API client layer (`lib/api/`)
- [x] Landing page with location entry (municipality / address / coordinates)
- [x] Viability results page
  - [x] Climate summary cards (GDD, frost-free days, frost dates)
  - [x] Ranked plant list with viability scores (color-coded)
  - [x] Filter by viability status + crop group
- [x] Plant catalog/search page (with Trefle external toggle)
- [x] Plant detail page (growing info, thermal properties, sowing)
- [ ] Basic responsive design polish (mobile-friendly)

---

## Phase 4: My Garden

**Goal:** Users can create and manage a virtual garden (list-based).

- [x] Auth system (signup, login) — BetterAuth with Drizzle adapter
- [x] Garden CRUD
  - [x] Create garden (name, location)
  - [x] Add/remove plants
  - [x] Notes per plant
- [x] Garden list view (dashboard)
- [x] Anonymous mode
  - [x] Download garden as JSON
  - [x] Upload garden from JSON
- [x] Basic planting timeline (when to start based on frost dates)
  - [x] Multi-plant visual timeline (GardenTimeline component)
  - [x] Table view with CSV export

---

## Phase 5: Enhanced Planning

**Goal:** Turn the garden list into a real planning tool.

- [x] Planting calendar based on frost dates + GDD
  - [x] Basic sowing/growth/harvest timeline (viability service + GardenTimeline component)
  - [x] Sowing method field (`indoor` / `direct` / `both`) on plant schema
  - [x] Indoor sowing date calculation (weeks before transplant)
  - [x] Transplant date calculation (after last frost + hardiness)
  - [x] Direct sow date calculation
  - [x] Per-plant sowing choice toggle in garden (indoor/direct for `both` plants)
- [x] Harvest window estimates (from daysToHarvest + frost dates)
- [x] Seasonal overview / timeline visualization (GardenTimeline + TemperatureChart)
- [x] Photoperiod / daylight awareness (simple version)
  - [x] Calculate daylight hours from latitude + date (sunrise equation, no API)
  - [x] Add `photoperiod_class` field to plant schema (`long-day` / `short-day` / `day-neutral`)
  - [x] Enrich seed data with photoperiod classification (conservative: 7 well-known plants)
  - [x] Show daylight-related warnings on viability results (bolting risk, flowering unlikely)
  - [x] Peak daylight hours in climate summary banner

---

## Phase 6: Garden UX & Data Quality

**Goal:** Cleaner garden page, better content management, richer plant data.

- [x] Garden page layout cleanup
  - [x] Tabbed layout (Overview / Diary / Settings)
  - [x] Extracted components (GardenOverview, GardenDiary, GardenSettings)
  - [x] Plant grouping (viability, crop, soil, light, sowing) with collapsible buckets
  - [x] Compact header with centered tabs
  - [x] Light theme color refresh (sage green tones)
- [x] Aggregate soil/light requirements (via group-by views)
- [x] Garden-level notes with diary-style timestamped entries
  - [x] Timeline-style diary UI with add/delete
  - [x] Reference plants in notes (plant tag selector + filter)
  - [x] Sort by newest/oldest, filter by plant
- [x] Server sync improvements
  - [x] Gardens created on server immediately when logged in
  - [x] Plants synced to server on add/remove
  - [x] Rename synced to server
  - [x] Delete synced to server
  - [x] Gardens loaded from server on login
- [ ] Plant property editing (admin UI)
  - [ ] Edit plant properties from the plant detail page
  - [ ] Role-based access (admin for now, community later)
- [ ] Trefle data enrichment mapping
  - [ ] Map Trefle fields to Frostleaf-specific properties (sowing method, photoperiod, etc.)
- [ ] Current year weather overlay
  - [ ] Fetch ongoing year's temperature data from Frost API
  - [ ] Show current year vs historical average on temperature chart
  - [ ] Highlight deviations (warmer/colder than normal)

---

## Phase 7: Visual Garden Layout

**Goal:** Spatial garden planning with grid-based plots.

- [ ] Grid-based plot editor
  - [ ] Define bed dimensions
  - [ ] Drag-and-drop plants into grid
  - [ ] Spacing validation (plant spacing requirements)
- [ ] Multiple beds/zones per garden
- [ ] Print-friendly garden plan export

---

## Phase 8: Polish & Extend

**Goal:** Production readiness and broader use.

- ~~[ ] Photoperiod sensitivity modeling~~ → Done in Phase 5 (simple version)
- [ ] Soil temperature modeling
- [ ] Cultivar-level data (e.g., early vs late tomato varieties)
- [ ] User feedback loop (report actual harvest dates to refine model)
- [ ] Multi-language support (Norwegian + English)
- [ ] PWA / offline support

---

## Phase 9: Public API & Hosting

**Goal:** Make Frostleaf available to others.

- [ ] Deploy to cloud (Railway / Fly.io / VPS)
- [ ] Public API with rate limiting
  - [ ] API key management
  - [ ] Documentation (OpenAPI/Swagger)
- [ ] Landing page
- [ ] Global climate data support (extend beyond Norway, NASA POWER API as fallback)

---

## Open Questions

- ~~Auth library: Lucia, custom JWT, or passport.js?~~ → Resolved: **BetterAuth** with Drizzle adapter
- Do we want SSR for viability pages (SEO) or pure SPA?
- Frost API client ID: register at https://frost.met.no
- Trefle API key: register at https://trefle.io
