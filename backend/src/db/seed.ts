import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { plants, plantProperties } from './schema';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../../.env') });

type SeedPlant = {
  commonName: string;
  scientificName: string;
  family: string;
  cropGroup: 'vegetable' | 'herb' | 'fruit' | 'berry' | 'legume' | 'root' | 'brassica' | 'leafy_green';
  daysToHarvest: number;
  lightRequirement: 'full_sun' | 'partial_shade' | 'full_shade';
  soilPreferences: string[];
  thermal: {
    tBase: number;
    tUpper: number;
    gddRequired: number | null;
    source: 'measured' | 'estimated' | 'inferred';
    confidence: 'high' | 'medium' | 'low';
  };
};

async function seed() {
  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client);

  const seedPath = resolve(__dirname, '../../../data/seed/plants.json');
  const seedData: SeedPlant[] = JSON.parse(readFileSync(seedPath, 'utf-8'));

  console.log(`Seeding ${seedData.length} plants...`);

  for (const plant of seedData) {
    const [inserted] = await db
      .insert(plants)
      .values({
        scientificName: plant.scientificName,
        commonName: plant.commonName,
        family: plant.family,
        cropGroup: plant.cropGroup,
        source: 'seed',
      })
      .returning({ id: plants.id });

    await db.insert(plantProperties).values({
      plantId: inserted.id,
      daysToHarvest: plant.daysToHarvest,
      lightRequirement: plant.lightRequirement,
      soilPreferences: plant.soilPreferences,
      tBase: plant.thermal.tBase,
      tUpper: plant.thermal.tUpper,
      gddRequired: plant.thermal.gddRequired,
      thermalSource: plant.thermal.source,
      thermalConfidence: plant.thermal.confidence,
    });

    console.log(`  ✓ ${plant.commonName}`);
  }

  console.log(`\nDone! Seeded ${seedData.length} plants with properties.`);
  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
