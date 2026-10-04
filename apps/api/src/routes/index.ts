import { Router } from 'express';
import videosRouter from './videos.js';
import adminRouter from './admin.js';
import versesRouter from './verses.js';

const router = Router();

router.use(videosRouter);
router.use('/api', adminRouter);
router.use('/api', versesRouter);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
