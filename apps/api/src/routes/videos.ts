import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/db.js';
import { env } from '../lib/env.js';
import { Queue } from 'bullmq';
import { z } from 'zod';

const router = Router();

const videoQueue = new Queue('video-queue', {
  connection: { url: env.redisUrl },
});

const videoCreateSchema = z.object({
  topic: z.string().min(1),
  customTopic: z.string().optional(),
  customReflection: z.string().optional(),
  durationSec: z.number().int().min(15).max(90),
  aspectRatio: z.enum(['9:16', '1:1', '16:9']),
  style: z.string().min(1),
  voice: z.string().min(1),
  music: z.string().min(1),
  intensity: z.string().optional(),
});

router.post('/auth/login', async (req, res) => {
  const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password } = parsed.data;
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.jwtSecret, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

router.get('/videos', async (req, res) => {
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      topic: true,
      durationSec: true,
      aspectRatio: true,
      style: true,
      status: true,
      progress: true,
      currentStep: true,
      url: true,
      thumbnailPath: true,
      createdAt: true,
    },
  });

  res.json(videos.map((v) => ({
    ...v,
    thumbnail: v.thumbnailPath || '',
    url: v.url || '',
  })));
});

router.post('/videos', async (req, res) => {
  const parsed = videoCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const data = parsed.data;
  const video = await prisma.video.create({
    data: {
      topic: data.topic,
      durationSec: data.durationSec,
      aspectRatio: data.aspectRatio,
      style: data.style,
      voice: data.voice,
      music: data.music,
      intensity: data.intensity || 'inspiradora',
      customReflection: data.customReflection,
      title: `Video ${data.topic}`,
      status: 'PENDING',
    },
  });

  await videoQueue.add('render', { videoId: video.id }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
  res.status(201).json(video);
});

router.get('/videos/:id', async (req, res) => {
  const video = await prisma.video.findUnique({ where: { id: req.params.id } });
  if (!video) return res.status(404).json({ error: 'No encontrado' });
  res.json({
    ...video,
    thumbnail: video.thumbnailPath || '',
    url: video.url || '',
  });
});

router.get('/videos/:id/status', async (req, res) => {
  const video = await prisma.video.findUnique({ where: { id: req.params.id } });
  if (!video) return res.status(404).json({ error: 'No encontrado' });
  res.json({
    status: video.status,
    progress: video.progress,
    currentStep: video.currentStep,
    errorMessage: video.errorMessage,
  });
});

router.post('/videos/:id/generate', async (req, res) => {
  const video = await prisma.video.findUnique({ where: { id: req.params.id } });
  if (!video) return res.status(404).json({ error: 'No encontrado' });

  await videoQueue.add('render', { videoId: video.id }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
  await prisma.video.update({
    where: { id: video.id },
    data: { status: 'PENDING', progress: 0, currentStep: 'En cola', errorMessage: null },
  });
  res.json({ ok: true });
});

router.post('/videos/:id/regenerate', async (req, res) => {
  const video = await prisma.video.findUnique({ where: { id: req.params.id } });
  if (!video) return res.status(404).json({ error: 'No encontrado' });

  await videoQueue.add('render', { videoId: video.id }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
  await prisma.video.update({
    where: { id: video.id },
    data: { status: 'PENDING', progress: 0, currentStep: 'En cola', errorMessage: null },
  });
  res.json({ ok: true });
});

router.delete('/videos/:id', async (req, res) => {
  await prisma.video.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
