CREATE TYPE "public"."confidence_level" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."crop_group" AS ENUM('vegetable', 'herb', 'fruit', 'berry', 'legume', 'root', 'brassica', 'leafy_green');--> statement-breakpoint
CREATE TYPE "public"."duration" AS ENUM('annual', 'biennial', 'perennial');--> statement-breakpoint
CREATE TYPE "public"."light_requirement" AS ENUM('full_sun', 'partial_shade', 'full_shade');--> statement-breakpoint
CREATE TYPE "public"."plant_source" AS ENUM('seed', 'trefle', 'manual');--> statement-breakpoint
CREATE TYPE "public"."thermal_data_source" AS ENUM('measured', 'estimated', 'inferred');--> statement-breakpoint
CREATE TABLE "climate_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"station_id" uuid NOT NULL,
	"date" date NOT NULL,
	"temp_min" real NOT NULL,
	"temp_max" real NOT NULL,
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "derived_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"station_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"gdd_accumulated" real NOT NULL,
	"last_frost_spring" date,
	"first_frost_autumn" date,
	"frost_free_days" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "garden_plants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garden_id" uuid NOT NULL,
	"plant_id" uuid NOT NULL,
	"planted_date" date,
	"notes" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gardens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"name" text NOT NULL,
	"location_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"latitude" real NOT NULL,
	"longitude" real NOT NULL,
	"nearest_station_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plant_properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plant_id" uuid NOT NULL,
	"days_to_harvest" integer,
	"light_requirement" "light_requirement",
	"soil_preferences" text[] DEFAULT '{}' NOT NULL,
	"duration" "duration",
	"edible_parts" text[] DEFAULT '{}' NOT NULL,
	"description" text,
	"sowing_info" text,
	"bloom_months" text[] DEFAULT '{}' NOT NULL,
	"growth_months" text[] DEFAULT '{}' NOT NULL,
	"min_temperature" real,
	"max_temperature" real,
	"t_base" real,
	"t_upper" real,
	"gdd_required" integer,
	"thermal_source" "thermal_data_source",
	"thermal_confidence" "confidence_level",
	"last_enriched_at" timestamp,
	CONSTRAINT "plant_properties_plant_id_unique" UNIQUE("plant_id")
);
--> statement-breakpoint
CREATE TABLE "plants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scientific_name" text NOT NULL,
	"common_name" text NOT NULL,
	"family" text NOT NULL,
	"crop_group" "crop_group" NOT NULL,
	"source" "plant_source" DEFAULT 'seed' NOT NULL,
	"external_id" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weather_stations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"frost_api_id" text NOT NULL,
	"name" text NOT NULL,
	"latitude" real NOT NULL,
	"longitude" real NOT NULL,
	"available_observations" text[] DEFAULT '{}' NOT NULL,
	CONSTRAINT "weather_stations_frost_api_id_unique" UNIQUE("frost_api_id")
);
--> statement-breakpoint
ALTER TABLE "climate_data" ADD CONSTRAINT "climate_data_station_id_weather_stations_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."weather_stations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "derived_metrics" ADD CONSTRAINT "derived_metrics_station_id_weather_stations_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."weather_stations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garden_plants" ADD CONSTRAINT "garden_plants_garden_id_gardens_id_fk" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garden_plants" ADD CONSTRAINT "garden_plants_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gardens" ADD CONSTRAINT "gardens_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_nearest_station_id_weather_stations_id_fk" FOREIGN KEY ("nearest_station_id") REFERENCES "public"."weather_stations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_properties" ADD CONSTRAINT "plant_properties_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "climate_data_station_date_idx" ON "climate_data" USING btree ("station_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "derived_metrics_station_year_idx" ON "derived_metrics" USING btree ("station_id","year");--> statement-breakpoint
CREATE UNIQUE INDEX "garden_plants_garden_plant_idx" ON "garden_plants" USING btree ("garden_id","plant_id");