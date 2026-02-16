/**
 * Fil: Index.ts
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Starter backend-serveren og definerer hovedrutene for autentisering
 * og hytte-API. Inkluderer grunnleggende middleware og en enkel helsesjekk.
 */

import "dotenv/config";
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/authRoutes';
import { hytteRouter } from "./routes/hytteRoutes";
import { turRouter } from "./routes/turRoutes";

const app = express();

app.use(cors());
app.use(express.json());

// Define routes
app.use('/api/auth', authRouter);

app.use("/api/hytter", hytteRouter);

app.use("/api/turer", turRouter);

// Basic health check route
app.get('/', (req, res) => {
  res.send('API is running!');
});
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'api' });
});


const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`API server is running at http://localhost:${port}`);
});

