import express from 'express';
import cors from 'cors';
import { userRouter } from './routes/userRoutes';

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Define routes
app.use('/api/users', userRouter);

// Basic health check route
app.get('/', (req, res) => {
  res.send('API is running!');
});
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'api' });
});


app.listen(port, () => {
  console.log(`API server is running at http://localhost:${port}`);
});
