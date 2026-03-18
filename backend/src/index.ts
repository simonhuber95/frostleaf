import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../.env') });
import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { plantsRouter } from './routes/plants.js';
import { locationRouter } from './routes/location.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRouter);
app.use('/api/plants', plantsRouter);
app.use('/api/location', locationRouter);

app.listen(port, () => {
  console.log(`Frostleaf API running on port ${port}`);
});
