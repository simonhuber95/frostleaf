# Frostleaf – Scientific Garden Planning App

## Overview

Frostleaf is a climate-aware gardening web application for hobby gardeners. It determines plant viability based on real environmental conditions using scientific principles such as Growing Degree Days (GDD), frost data, and plant-specific thermal parameters.

Instead of static planting calendars, Frostleaf answers:
**Can a plant complete its lifecycle under your local conditions?**

---

## Target Audience

- Primary: The developer (Norway-based hobby gardener)
- Secondary: Other hobby gardeners, initially Norway-focused
- Future: Global expansion if demand warrants it

---

## Tech Stack

| Layer          | Technology                                      |
| -------------- | ----------------------------------------------- |
| Frontend       | SvelteKit + TypeScript                          |
| Backend        | Node.js + TypeScript (Express or Fastify)       |
| Database       | PostgreSQL                                      |
| Infrastructure | Docker Compose (local dev)                      |
| Monorepo       | Single repo: `/frontend`, `/backend`, `/shared` |

---

## Core Concept

Plants require:

- Heat (GDD)
- Time (Days to Maturity)
- Temperature thresholds
- Light

---

## Key Data Sources

### 1. Climate / Weather

- Frost API (MET Norway)
  - Historical temperature
  - Frost dates
  - Climate normals

### 2. Plant Metadata

- Trefle API (proxied through backend, cached in DB)
  - Days to harvest
  - Temperature bounds
  - Soil, light, moisture

### 3. Scientific Literature

- GDD modeling papers (e.g. ScienceDirect)
  - Base temperature (Tbase)
  - Upper thresholds
  - Growth stage models

---

## User Flow (V1)

1. **Enter location** — address, coordinates, or municipality
2. **System resolves nearest weather station** with required data (cached if available)
3. **View viable plants** — ranked list with confidence scores
4. **Create a garden** — list-based "my garden" to track what you're growing
5. **Save or export** — logged-in users save to account; anonymous users can download/upload JSON

---

## Authentication

- Optional user accounts for persistent garden storage
- Stateless mode: download/upload garden data as JSON files
- No auth required to browse viability data

---

## Location Resolution

User input (address / lat,lon / municipality)
→ Geocode if needed
→ Find nearest Frost API weather station with required observations
→ Check if aggregated data exists in DB
→ If not, fetch from Frost API and store

---

## Methodology

### Growing Degree Days (GDD)

GDD is calculated as:

```
GDD = sum(max(0, T_mean - T_base))
```

Where:

- T_mean = (T_max + T_min) / 2
- T_base = crop-specific base temperature

---

### Viability Logic

1. Calculate local GDD from Frost API data
2. Retrieve plant requirements:
   - T_base
   - Days to maturity (DTM)
3. Estimate required GDD:

```
GDD_required ≈ DTM × (T_avg - T_base)
```

4. Compare:
   - If local GDD >= required → viable
   - Else → not viable

---

### Fallback Strategy for Missing T_base

Hierarchy:

1. Species-specific (measured)
2. Cultivar median
3. Crop group median
4. Family median
5. Class median (last resort)

Use median, not mean.

Include confidence score:

- measured = high
- inferred = medium/low

---

## Data Model

### Plant

- id
- scientific_name
- common_name
- family
- crop_group
- days_to_harvest
- light_requirement
- soil_preferences

### PlantThermalProperties

- plant_id
- t_base
- t_upper
- gdd_required (optional)
- source (measured / estimated)
- confidence

### Location

- id
- latitude
- longitude
- nearest_station_id

### WeatherStation

- id
- frost_api_id
- name
- latitude
- longitude
- available_observations

### ClimateData

- station_id
- date
- temp_min
- temp_max
- fetched_at

### DerivedMetrics

- station_id
- season/year
- gdd_accumulated
- last_frost_spring
- first_frost_autumn
- frost_free_days

### User

- id
- email
- password_hash
- created_at

### Garden

- id
- user_id (nullable for anonymous)
- name
- location_id
- created_at

### GardenPlant

- garden_id
- plant_id
- planted_date (optional)
- notes

---

## Curated V1 Plant List

Starting with ~50-80 plants common for Norwegian hobby gardeners, with known thermal properties from agricultural literature:

**Vegetables:**
Tomato, Potato, Carrot, Pea, Bean (bush/pole), Lettuce, Spinach, Kale, Cabbage, Broccoli, Cauliflower, Beetroot, Radish, Onion, Leek, Garlic, Cucumber, Zucchini/Courgette, Pumpkin, Sweet corn, Celery, Parsnip, Turnip, Swede/Rutabaga, Brussels sprouts, Kohlrabi, Chard

**Herbs:**
Basil, Dill, Parsley, Chives, Coriander/Cilantro, Thyme, Oregano, Mint, Sage, Rosemary

**Fruits/Berries:**
Strawberry, Raspberry, Blueberry, Blackcurrant, Redcurrant, Gooseberry, Rhubarb, Apple (selected cultivars)

Thermal data sources: FAO crop calendars, university extension services, GDD modeling literature, and the referenced ScienceDirect paper.

---

## Architecture

### Backend

- Node.js + TypeScript API server
- Services:
  - Climate ingestion (Frost API proxy + cache)
  - GDD calculation engine
  - Viability engine
  - Plant data service
  - Auth service

### Frontend

- SvelteKit + TypeScript
- Pages:
  - Location entry / search
  - Viability results (plant list)
  - My Garden (list view)
  - Plant detail page

### Data Layer

- PostgreSQL
- All external API data cached in DB
- Weather data aggregated per station per season

### Processing Pipeline

1. Resolve location → nearest weather station
2. Fetch or retrieve cached climate data
3. Compute daily GDD
4. Aggregate seasonal GDD + frost dates
5. Compare against plant requirements
6. Return ranked viability results

---

## Example Viability Function

```typescript
function isViable(locationGdd: number, plantGddRequired: number): boolean {
  return locationGdd >= plantGddRequired;
}

function viabilityScore(locationGdd: number, plantGddRequired: number): number {
  return Math.min(1, locationGdd / plantGddRequired);
}
```

---

## Monorepo Structure

```
frostleaf/
├── docker-compose.yml
├── package.json              # workspace root
├── frontend/
│   ├── package.json
│   ├── svelte.config.js
│   └── src/
├── backend/
│   ├── package.json
│   ├── Dockerfile
│   └── src/
│       ├── routes/
│       ├── services/
│       ├── models/
│       └── config/
├── shared/
│   ├── package.json
│   └── src/
│       └── types/            # shared TypeScript types
├── docs/
│   ├── garden_planning_app.md
│   └── roadmap.md
└── data/
    └── seed/                 # curated plant seed data
```

---

## Sources

- Trefle Plant API: https://docs.trefle.io
- MET Norway Frost API: https://frost.met.no
- FAO Crop Calendar: https://cropcalendar.apps.fao.org
- NASA POWER API: https://power.larc.nasa.gov
- Scientific paper (GDD modeling): https://www.sciencedirect.com/science/article/pii/S037837742500472X

---

## Key Insight

Trefle provides constraints.
Frost provides climate reality.
Your model provides the decision.
