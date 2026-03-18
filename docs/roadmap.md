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

## Phase 1: Data Foundation ← NEXT

**Goal:** Populate the system with plant and climate data.

- [ ] Curate V1 plant seed list (~50–80 plants) with thermal properties
  - Common Norwegian hobby garden crops (tomato, potato, carrot, kale, peas, beans, herbs, strawberries, etc.)
  - Thermal data: T_base, T_upper, GDD required, days to harvest
- [ ] Build seed script to populate plants + thermal properties tables
- [ ] Integrate MET Norway Frost API
  - [ ] Weather station lookup by coordinates
  - [ ] Fetch historical temperature data
  - [ ] Cache responses in DB
- [ ] Integrate Trefle API (supplementary plant data)
  - [ ] Proxy + cache layer
- [ ] GDD calculation engine
  - [ ] Daily GDD from temperature data
  - [ ] Seasonal accumulation
  - [ ] Frost date detection (last spring / first autumn)

---

## Phase 2: Viability Engine (MVP Core)

**Goal:** Given a location, determine which plants are viable.

- [ ] Location resolution service
  - [ ] Coordinate input → nearest weather station
  - [ ] Address → geocode → nearest station
  - [ ] Municipality lookup (Norwegian kommuner)
- [ ] Viability calculation
  - [ ] Compare location GDD vs plant GDD requirements
  - [ ] Confidence scoring (measured vs inferred T_base)
  - [ ] Rank plants by viability score
- [ ] REST API endpoints
  - [ ] `POST /api/location` — resolve and store location
  - [ ] `GET /api/viability/:locationId` — viable plants for location
  - [ ] `GET /api/plants` — browse plant catalog
  - [ ] `GET /api/plants/:id` — plant detail with thermal data

---

## Phase 3: Frontend MVP

**Goal:** Users can enter a location and see viable plants.

- [ ] Location entry page (address / coordinates / municipality)
- [ ] Viability results page
  - [ ] Ranked plant list with viability scores
  - [ ] Filter by crop group (vegetable, herb, fruit, berry, etc.)
  - [ ] Plant detail view (thermal info, growing tips)
- [ ] Basic responsive design (mobile-friendly)

---

## Phase 4: My Garden

**Goal:** Users can create and manage a virtual garden (list-based).

- [ ] Auth system (signup, login)
- [ ] Garden CRUD
  - [ ] Create garden (name, location)
  - [ ] Add/remove plants
  - [ ] Notes per plant
- [ ] Garden list view (dashboard)
- [ ] Anonymous mode
  - [ ] Download garden as JSON
  - [ ] Upload garden from JSON
- [ ] Basic planting timeline (when to start based on frost dates)

---

## Phase 5: Enhanced Planning

**Goal:** Turn the garden list into a real planning tool.

- [ ] Planting calendar based on frost dates + GDD
  - [ ] Indoor sowing dates
  - [ ] Transplant dates
  - [ ] Direct sow dates
- [ ] Succession planting suggestions
- [ ] Companion planting data
- [ ] Harvest window estimates
- [ ] Seasonal overview / timeline visualization

---

## Phase 6: Visual Garden Layout

**Goal:** Spatial garden planning with grid-based plots.

- [ ] Grid-based plot editor
  - [ ] Define bed dimensions
  - [ ] Drag-and-drop plants into grid
  - [ ] Spacing validation (plant spacing requirements)
- [ ] Multiple beds/zones per garden
- [ ] Print-friendly garden plan export

---

## Phase 7: Polish & Extend

**Goal:** Production readiness and broader use.

- [ ] Photoperiod sensitivity modeling
- [ ] Soil temperature modeling
- [ ] Cultivar-level data (e.g., early vs late tomato varieties)
- [ ] User feedback loop (report actual harvest dates to refine model)
- [ ] Multi-language support (Norwegian + English)
- [ ] PWA / offline support

---

## Phase 8: Public API & Hosting

**Goal:** Make Frostleaf available to others.

- [ ] Deploy to cloud (Railway / Fly.io / VPS)
- [ ] Public API with rate limiting
  - [ ] API key management
  - [ ] Documentation (OpenAPI/Swagger)
- [ ] Landing page
- [ ] Global climate data support (extend beyond Norway, NASA POWER API as fallback)

---

## Open Questions

- Auth library: Lucia, custom JWT, or passport.js?
- Do we want SSR for viability pages (SEO) or pure SPA?
- Frost API client ID: register at https://frost.met.no
- Trefle API key: register at https://trefle.io
