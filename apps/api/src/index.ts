/**
 * Fil: Index.ts
 * Utvikler(e): Vebjørn Baustad & Parasto Jamshidi & Fredrik Tharaldsen
 * Beskrivelse: Starter backend-serveren og definerer hovedrutene.
 *
 * KI-bruk: Claude (Anthropic) og GitHub Copilot er brukt som verktøy
 * under utvikling. All kode er lest, forstått og testet. Se rapportens
 * kapittel "Kommentarer til bruk/tilpassing av kode".
 */

import "dotenv/config";
import express from 'express';
import cors from 'cors';
import passport from "./auth/passport"
import { authRouter } from './routes/authRoutes';
import { hytteRouter } from "./routes/hytteRoutes";
import { turRouter } from "./routes/turRoutes";
import { annonseRouter, annonsorRouter } from "./routes/annonseRoutes";
import { rolleRouter } from "./routes/rolleRoutes";
import { userRouter } from "./routes/userRoutes";
import { adminRouter } from "./routes/adminRoutes";
import { favorittRouter } from "./routes/favorittRoutes";
import { turstiRouter } from "./routes/turstiRoutes";
import { chatRouter } from "./routes/chatRoutes";
import { weatherRouter } from "./routes/weatherRoutes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// API-ruter
app.use('/api/auth', authRouter);
app.use("/api/hytter", hytteRouter);
app.use("/api/annonser", annonseRouter);
app.use("/api/annonsorer", annonsorRouter);
app.use("/api/roller", rolleRouter);

app.use("/api/turer", turRouter);
app.use("/api/turstier", turstiRouter);
app.use("/api/bruker", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/favoritter", favorittRouter);
app.use("/api/chats", chatRouter);
app.use("/api/weather", weatherRouter);
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
