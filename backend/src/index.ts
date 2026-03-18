import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRouter);

app.listen(port, () => {
  console.log(`Frostleaf API running on port ${port}`);
});
