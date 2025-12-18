import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the user API!' });
});

export { router as userRouter };
