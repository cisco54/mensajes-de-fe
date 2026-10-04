import { Worker, Job } from 'bullmq';
import { prisma } from '../lib/db.js';
import { generateScript } from '../services/text.js';
import { buildSubtitlesSrt } from '../services/video.js';
import { generateSpeechOpenAI, generateSpeechElevenLabs, generateSpeechLocal } from '../services/tts.js';
import { renderVideo } from '../services/video.js';

export async function renderVideoJob(job: Job) {
  const { videoId } = job.data;
  const update = async (patch: Record<string, unknown>) => {
    await prisma.video.update({ where: { id: videoId }, data: patch });
  };

  try {
    await update({ status: 'PROCESANDO', progress: 5, currentStep: 'Generando reflexión', errorMessage: null });
    await job.updateProgress(5);

    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) throw new Error('Video no encontrado');

    const script = generateScript({
      topic: video.topic,
      customReflection: video.customReflection || undefined,
      intensity: video.intensity || 'inspiradora',
    });

    await update({ currentStep: 'Preparando versículo', progress: 20 });
    await job.updateProgress(20);

    await update({ currentStep: 'Generando narración', progress: 30 });
    await job.updateProgress(30);

    // TTS
    const audioPath = `/app/output/${videoId}_audio.mp3`;
    const fullText = `${script.intro} ${script.reflection} ${script.verse} ${script.closing} ${script.cta}`.replace(/\s+/g, ' ').trim();
    try {
      if (process.env.TTS_PROVIDER === 'openai' && process.env.OPENAI_API_KEY) {
        await generateSpeechOpenAI({ text: fullText, voice: video.voice === 'masculina' ? 'onyx' : video.voice === 'femenina' ? 'nova' : 'alloy', outputPath: audioPath });
      } else if (process.env.TTS_PROVIDER === 'elevenlabs' && process.env.ELEVENLABS_API_KEY) {
        await generateSpeechElevenLabs({ text: fullText, voiceId: 'EXAVITQu4vr4xnSDxMaL', outputPath: audioPath });
      } else {
        await generateSpeechLocal({ text: fullText, outputPath: audioPath });
      }
    } catch (ttsError) {
      const message = ttsError instanceof Error ? ttsError.message : 'Error TTS';
      console.error(`TTS error for ${videoId}:`, message);
      await generateSpeechLocal({ text: fullText, outputPath: audioPath });
    }

    await update({ currentStep: 'Preparando escenas', progress: 45 });
    await job.updateProgress(45);

    // Subtitles
    const blocks = [script.intro, script.reflection, script.verse, script.closing, script.cta];
    const avgWordsPerSec = 2.4;
    const subtitles = [];
    let cursor = 0;
    for (const block of blocks) {
      const words = block.split(' ').filter(Boolean);
      const secs = Math.max(3, Math.ceil(words.length / avgWordsPerSec));
      subtitles.push({ start: cursor, end: cursor + secs, text: block });
      cursor += secs;
    }
    const srtPath = `/app/output/${videoId}.srt`;
    await buildSubtitlesSrt(subtitles, srtPath);

    await update({ currentStep: 'Creando subtítulos', progress: 60 });
    await job.updateProgress(60);

    const outputPath = `/app/output/${videoId}.mp4`;
    await update({ currentStep: 'Renderizando video', progress: 70 });
    await job.updateProgress(70);

    const result = await renderVideo({
      aspectRatio: video.aspectRatio,
      durationSec: video.durationSec,
      style: video.style,
      voice: video.voice,
      music: video.music,
      title: script.title,
      verse: script.verse,
      brandName: process.env.BRAND_NAME || 'MENSAJES DE FE',
      outputPath,
      srtPath,
      audioPath,
      onProgress: async (step, progress) => {
        await update({ currentStep: step, progress });
        await job.updateProgress(progress);
      },
    });

    await update({
      status: 'COMPLETADO',
      progress: 100,
      currentStep: 'Video terminado',
      filePath: result.path,
      url: `/output/${videoId}.mp4`,
      thumbnailPath: result.thumbnailPath,
      meta: JSON.stringify({ width: result.width, height: result.height, script }),
    });

    await job.updateProgress(100);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    await update({
      status: 'ERROR',
      currentStep: 'Error',
      errorMessage: message,
    });
    throw err;
  }
}

const worker = new Worker('video-queue', renderVideoJob, {
  connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
  concurrency: 2,
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

worker.on('completed', (job) => {
  console.log(`Job ${job?.id} completed`);
});

console.log('Render worker started');
