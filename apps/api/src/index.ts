import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Queue } from 'bullmq';
import { prisma } from './lib/db.js';
import { env } from './lib/env.js';
import routes from './routes/index.js';
import './jobs/renderVideo.js';

const app = express();

app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import { existsSync, mkdirSync } from 'fs';
const outputDir = env.outputDir;
if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
const publicDir = env.publicDir;
if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

app.use('/output', express.static(outputDir));
app.use('/public', express.static(publicDir));

app.use(routes);

const videoQueue = new Queue('video-queue', { connection: { url: env.redisUrl } });

(async () => {
  try {
    await prisma.$connect();
    console.log('Database connected');

    const exists = await prisma.user.findFirst({ where: { email: env.adminEmail } });
    if (!exists) {
      const hash = await import('bcryptjs').then((m) => m.default.hash(env.adminPassword, 12));
      await prisma.user.create({ data: { email: env.adminEmail, password: hash, role: 'admin' } });
      console.log('Admin created');
    }

    const server = app.listen(env.port, () => {
      console.log(`API running on port ${env.port}`);
    });
  } catch (err) {
    console.error('Failed to start', err);
    process.exit(1);
  }
})();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
