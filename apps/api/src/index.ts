/**
 * Fil: Index.ts
 * Utvikler(e): Vebjørn Baustad & Parasto Jamshidi
 * Beskrivelse: Starter backend-serveren og definerer hovedrutene.
 */

import "dotenv/config";
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/authRoutes';
import { hytteRouter } from "./routes/hytteRoutes";
import { turRouter } from "./routes/turRoutes";
import { userRouter } from "./routes/userRoutes"; // Din nye rute

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API-ruter (Kun én definisjon per rute)
app.use('/api/auth', authRouter);
app.use("/api/hytter", hytteRouter);
app.use("/api/turer", turRouter);
app.use("/api/bruker", userRouter); // Din rute for profil/min side

// Helsesjekk
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