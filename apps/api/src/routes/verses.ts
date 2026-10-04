import { Router } from 'express';
import { prisma } from '../lib/db.js';
import { z } from 'zod';

const router = Router();

const searchSchema = z.object({
  q: z.string().optional(),
  book: z.string().optional(),
  theme: z.string().optional(),
  language: z.string().optional(),
  limit: z.coerce.number().int().max(100).optional(),
});

router.get('/verses', async (req, res) => {
  const parsed = searchSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const where: any = {};
  if (parsed.data.q) {
    where.OR = [
      { text: { contains: parsed.data.q } },
      { book: { contains: parsed.data.q } },
      { verse: { contains: parsed.data.q } },
    ];
  }
  if (parsed.data.book) where.book = { contains: parsed.data.book };
  if (parsed.data.theme) where.theme = parsed.data.theme;
  if (parsed.data.language) where.language = parsed.data.language;

  const verses = await prisma.verse.findMany({
    where,
    take: parsed.data.limit || 20,
    orderBy: { createdAt: 'asc' },
  });

  res.json(verses);
});

export default router;
