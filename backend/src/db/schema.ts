import { pgTable, uuid, text, real, integer, date, timestamp, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';

// --- Enums ---

export const cropGroupEnum = pgEnum('crop_group', [
  'vegetable',
  'herb',
  'fruit',
  'berry',
  'legume',
  'root',
  'brassica',
  'leafy_green',
]);

export const lightRequirementEnum = pgEnum('light_requirement', ['full_sun', 'partial_shade', 'full_shade']);

export const thermalDataSourceEnum = pgEnum('thermal_data_source', ['measured', 'estimated', 'inferred']);

export const confidenceLevelEnum = pgEnum('confidence_level', ['high', 'medium', 'low']);

export const plantSourceEnum = pgEnum('plant_source', ['seed', 'trefle', 'manual']);

export const durationEnum = pgEnum('duration', ['annual', 'biennial', 'perennial']);

// --- Tables ---

export const plants = pgTable('plants', {
  id: uuid('id').primaryKey().defaultRandom(),
  scientificName: text('scientific_name').notNull(),
  commonName: text('common_name').notNull(),
  family: text('family').notNull(),
  cropGroup: cropGroupEnum('crop_group').notNull(),
  source: plantSourceEnum('source').notNull().default('seed'),
  externalId: text('external_id'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const plantProperties = pgTable('plant_properties', {
  id: uuid('id').primaryKey().defaultRandom(),
  plantId: uuid('plant_id')
    .notNull()
    .references(() => plants.id, { onDelete: 'cascade' })
    .unique(),

  // Growing info
  daysToHarvest: integer('days_to_harvest'),
  lightRequirement: lightRequirementEnum('light_requirement'),
  soilPreferences: text('soil_preferences').array().notNull().default([]),
  duration: durationEnum('duration'),
  edibleParts: text('edible_parts').array().notNull().default([]),
  description: text('description'),
  sowingInfo: text('sowing_info'),
  bloomMonths: text('bloom_months').array().notNull().default([]),
  growthMonths: text('growth_months').array().notNull().default([]),

  // Temperature tolerance (from Trefle or other sources)
  minTemperature: real('min_temperature'),
  maxTemperature: real('max_temperature'),

  // Thermal properties (from GDD paper / curated data)
  tBase: real('t_base'),
  tUpper: real('t_upper'),
  gddRequired: integer('gdd_required'),
  thermalSource: thermalDataSourceEnum('thermal_source'),
  thermalConfidence: confidenceLevelEnum('thermal_confidence'),

  // Enrichment tracking
  lastEnrichedAt: timestamp('last_enriched_at'),
});

export const weatherStations = pgTable('weather_stations', {
  id: uuid('id').primaryKey().defaultRandom(),
  frostApiId: text('frost_api_id').notNull().unique(),
  name: text('name').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  availableObservations: text('available_observations').array().notNull().default([]),
});

export const climateData = pgTable(
  'climate_data',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    stationId: uuid('station_id')
      .notNull()
      .references(() => weatherStations.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    tempMin: real('temp_min').notNull(),
    tempMax: real('temp_max').notNull(),
    fetchedAt: timestamp('fetched_at').notNull().defaultNow(),
  },
  (table) => [uniqueIndex('climate_data_station_date_idx').on(table.stationId, table.date)],
);

export const derivedMetrics = pgTable(
  'derived_metrics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    stationId: uuid('station_id')
      .notNull()
      .references(() => weatherStations.id, { onDelete: 'cascade' }),
    year: integer('year').notNull(),
    gddAccumulated: real('gdd_accumulated').notNull(),
    lastFrostSpring: date('last_frost_spring'),
    firstFrostAutumn: date('first_frost_autumn'),
    frostFreeDays: integer('frost_free_days').notNull(),
  },
  (table) => [uniqueIndex('derived_metrics_station_year_idx').on(table.stationId, table.year)],
);

export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  nearestStationId: uuid('nearest_station_id')
    .notNull()
    .references(() => weatherStations.id),
});

export const gardens = pgTable('gardens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id'),
  name: text('name').notNull(),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const gardenPlants = pgTable(
  'garden_plants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gardenId: uuid('garden_id')
      .notNull()
      .references(() => gardens.id, { onDelete: 'cascade' }),
    plantId: uuid('plant_id')
      .notNull()
      .references(() => plants.id),
    plantedDate: date('planted_date'),
    notes: text('notes').notNull().default(''),
  },
  (table) => [uniqueIndex('garden_plants_garden_plant_idx').on(table.gardenId, table.plantId)],
);
