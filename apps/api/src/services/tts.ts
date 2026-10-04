import fs from 'fs';
import https from 'https';
import http from 'http';
import { spawn } from 'child_process';
import { ensureDir } from './video.js';
import { env } from '../lib/env.js';

function downloadFile(url: string, dest: string) {
  return new Promise<void>((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    });
    req.on('error', reject);
  });
}

export async function generateSpeechOpenAI({ text, voice = 'alloy', outputPath }: { text: string; voice?: string; outputPath: string }) {
  if (!env.openaiKey) throw new Error('OPENAI_API_KEY no configurada');
  const body = JSON.stringify({ model: 'tts-1', input: text, voice });
  const url = new URL('https://api.openai.com/v1/audio/speech');

  await new Promise<void>((resolve, reject) => {
    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.openaiKey}`,
        },
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          downloadFile(res.headers.location, outputPath).then(resolve).catch(reject);
          return;
        }
        const file = fs.createWriteStream(outputPath);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });

  return outputPath;
}

export async function generateSpeechElevenLabs({ text, voiceId = 'EXAVITQu4vr4xnSDxMaL', outputPath }: { text: string; voiceId?: string; outputPath: string }) {
  if (!env.elevenLabsKey) throw new Error('ELEVENLABS_API_KEY no configurada');
  const body = JSON.stringify({ text, model_id: 'eleven_multilingual_v2' });

  await new Promise<void>((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.elevenlabs.io',
        path: `/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': env.elevenLabsKey,
        },
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          downloadFile(res.headers.location, outputPath).then(resolve).catch(reject);
          return;
        }
        const file = fs.createWriteStream(outputPath);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });

  return outputPath;
}

export async function generateSpeechLocal({ text, outputPath }: { text: string; outputPath: string }) {
  ensureDir(outputPath.replace(/\\/g, '/').replace(/\/[^\/]+$/, '') || '.');
  const args = ['-f', 'lavfi', '-i', 'sine=frequency=440:duration=1', '-c:a', 'aac', '-y', outputPath];

  await new Promise<void>((resolve, reject) => {
    const child = spawn(env.ffmpegBin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (d: Buffer) => (stderr += d.toString()));
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr || 'ffmpeg local tts failed'));
    });
  });

  return outputPath;
}
