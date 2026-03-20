CREATE TYPE "public"."confidence_level" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."crop_group" AS ENUM('vegetable', 'herb', 'fruit', 'berry', 'legume', 'root', 'brassica', 'leafy_green');--> statement-breakpoint
CREATE TYPE "public"."duration" AS ENUM('annual', 'biennial', 'perennial');--> statement-breakpoint
CREATE TYPE "public"."light_requirement" AS ENUM('full_sun', 'partial_shade', 'full_shade');--> statement-breakpoint
CREATE TYPE "public"."plant_source" AS ENUM('seed', 'trefle', 'manual');--> statement-breakpoint
CREATE TYPE "public"."sowing_method" AS ENUM('indoor', 'direct', 'both');--> statement-breakpoint
CREATE TYPE "public"."thermal_data_source" AS ENUM('measured', 'estimated', 'inferred');--> statement-breakpoint
CREATE TABLE "auth_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "auth_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "auth_users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auth_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "auth_verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "climate_daily_averages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"station_id" uuid NOT NULL,
	"day_of_year" integer NOT NULL,
	"avg_min" real NOT NULL,
	"avg_max" real NOT NULL,
	"avg_mean" real NOT NULL
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
	"sowing_method" "sowing_method",
	"transplant_lead_weeks" integer,
	"sowing_info" text,
	"bloom_months" text[] DEFAULT '{}' NOT NULL,
	"growth_months" text[] DEFAULT '{}' NOT NULL,
	"min_temperature" real,
	"base_temperature" real,
	"max_temperature" real,
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
	"data_years_from" integer,
	"data_years_to" integer,
	"last_fetched_at" timestamp,
	"avg_gdd" real,
	"avg_frost_free_days" integer,
	"last_frost_spring" text,
	"first_frost_autumn" text,
	CONSTRAINT "weather_stations_frost_api_id_unique" UNIQUE("frost_api_id")
);
--> statement-breakpoint
ALTER TABLE "auth_accounts" ADD CONSTRAINT "auth_accounts_user_id_auth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_auth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "climate_daily_averages" ADD CONSTRAINT "climate_daily_averages_station_id_weather_stations_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."weather_stations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garden_plants" ADD CONSTRAINT "garden_plants_garden_id_gardens_id_fk" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garden_plants" ADD CONSTRAINT "garden_plants_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gardens" ADD CONSTRAINT "gardens_user_id_auth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gardens" ADD CONSTRAINT "gardens_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_nearest_station_id_weather_stations_id_fk" FOREIGN KEY ("nearest_station_id") REFERENCES "public"."weather_stations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_properties" ADD CONSTRAINT "plant_properties_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "climate_daily_avg_station_doy_idx" ON "climate_daily_averages" USING btree ("station_id","day_of_year");--> statement-breakpoint
CREATE UNIQUE INDEX "garden_plants_garden_plant_idx" ON "garden_plants" USING btree ("garden_id","plant_id");