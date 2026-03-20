import { pgTable, uuid, text, real, integer, date, timestamp, pgEnum, uniqueIndex, boolean } from 'drizzle-orm/pg-core';

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

export const sowingMethodEnum = pgEnum('sowing_method', ['indoor', 'direct', 'both']);

export const photoperiodClassEnum = pgEnum('photoperiod_class', ['long_day', 'short_day', 'day_neutral']);

// --- BetterAuth Tables ---

export const authUsers = pgTable('auth_users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const authSessions = pgTable('auth_sessions', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => authUsers.id, { onDelete: 'cascade' }),
});

export const authAccounts = pgTable('auth_accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => authUsers.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const authVerifications = pgTable('auth_verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

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
  sowingMethod: sowingMethodEnum('sowing_method'),
  transplantLeadWeeks: integer('transplant_lead_weeks'), // weeks to start indoors before transplant date
  sowingInfo: text('sowing_info'),
  bloomMonths: text('bloom_months').array().notNull().default([]),
  growthMonths: text('growth_months').array().notNull().default([]),

  // Photoperiod
  photoperiodClass: photoperiodClassEnum('photoperiod_class'),

  // Thermal properties
  minTemperature: real('min_temperature'),   // survival minimum (sowing threshold)
  baseTemperature: real('base_temperature'), // growth starts (GDD base)
  maxTemperature: real('max_temperature'),   // upper GDD cap / survival max
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
  dataYearsFrom: integer('data_years_from'),
  dataYearsTo: integer('data_years_to'),
  lastFetchedAt: timestamp('last_fetched_at'),
  // Pre-computed averaged metrics across all fetched years
  avgGdd: real('avg_gdd'),
  avgFrostFreeDays: integer('avg_frost_free_days'),
  lastFrostSpring: text('last_frost_spring'), // MM-DD
  firstFrostAutumn: text('first_frost_autumn'), // MM-DD
});

export const climateDailyAverages = pgTable(
  'climate_daily_averages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    stationId: uuid('station_id')
      .notNull()
      .references(() => weatherStations.id, { onDelete: 'cascade' }),
    dayOfYear: integer('day_of_year').notNull(), // 1-366
    avgMin: real('avg_min').notNull(),
    avgMax: real('avg_max').notNull(),
    avgMean: real('avg_mean').notNull(),
  },
  (table) => [uniqueIndex('climate_daily_avg_station_doy_idx').on(table.stationId, table.dayOfYear)],
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
  userId: text('user_id').references(() => authUsers.id, { onDelete: 'cascade' }),
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
