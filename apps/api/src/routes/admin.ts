import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db.js';
import { env } from '../lib/env.js';
import { authMiddleware, adminOnly, AuthRequest } from '../middlewares/auth.js';

const router = Router();
router.use(authMiddleware, adminOnly);

router.get('/stats', async (_req, res) => {
  const totalVideos = await prisma.video.count();
  const completed = await prisma.video.count({ where: { status: 'COMPLETADO' } });
  const failed = await prisma.video.count({ where: { status: 'ERROR' } });
  const users = await prisma.user.count();

  res.json({ totalVideos, completed, failed, users });
});

router.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, createdAt: true },
  });
  res.json(users);
});

export default router;
