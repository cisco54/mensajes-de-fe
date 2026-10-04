import { spawn } from 'child_process';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import { env } from '../lib/env.js';

export function ensureDir(path: string) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

function runFfmpeg(args: string[]) {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(env.ffmpegBin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));
    child.on('close', (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`FFmpeg failed: ${stderr || stdout}`));
    });
  });
}

function ffEscape(text: string) {
  return text.replace(/'/g, "\\'").replace(/:/g, "\\:");
}

export async function buildSubtitlesSrt(subtitles: { start: number; end: number; text: string }[], srtPath: string) {
  const lines = subtitles
    .map((sub, i) => {
      const fmt = (sec: number) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = Math.floor(sec % 60);
        const ms = Math.floor((sec - Math.floor(sec)) * 1000);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
      };
      return `${i + 1}\n${fmt(sub.start)} --> ${fmt(sub.end)}\n${sub.text}\n`;
    })
    .join('\n');

  ensureDir(join(srtPath, '..'));
  writeFileSync(srtPath, lines, 'utf8');
}

export async function generateThumbnail(videoPath: string, thumbnailPath: string) {
  ensureDir(join(thumbnailPath, '..'));
  await runFfmpeg([
    '-ss', '00:00:01',
    '-i', videoPath,
    '-vframes', '1',
    '-q:v', '2',
    '-y',
    thumbnailPath,
  ]);
}

export async function renderVideo(params: {
  aspectRatio: string;
  durationSec: number;
  style: string;
  voice: string;
  music: string;
  title: string;
  verse: string;
  brandName: string;
  outputPath: string;
  srtPath?: string;
  audioPath?: string;
  onProgress?: (step: string, progress: number) => void;
}) {
  const { aspectRatio, durationSec, style, title, verse, brandName, outputPath, srtPath, audioPath } = params;

  ensureDir(join(outputPath, '..'));

  const width = 1080;
  const height = aspectRatio === '9:16' ? 1920 : aspectRatio === '1:1' ? 1080 : 1920;
  const videoPath = outputPath.replace(/\.mp4$/i, '_raw.mp4');

  const introSec = Math.min(8, Math.floor(durationSec * 0.25));
  const verseSec = Math.min(10, Math.floor(durationSec * 0.3));
  const closingSec = Math.max(6, Math.floor(durationSec * 0.25));
  const middleSec = Math.max(1, durationSec - introSec - verseSec - closingSec);
  const closingStart = verseSec + middleSec;
  const totalDuration = durationSec;

  const escapedTitle = ffEscape(title);
  const escapedVerse = ffEscape(verse);
  const escapedBrand = ffEscape(brandName || 'MENSAJES DE FE');
  const closingText = ffEscape('Sigue creyendo');

  const styleLower = style.toLowerCase();
  let backgroundFilter: string;
  let overlayFilter = '';

  if (styleLower === 'cinematografico') {
    backgroundFilter = `color=c=black:s=${width}x${height}:r=30`;
    overlayFilter = `noise=alls=20:allf=t,eq=gamma=1.1:contrast=1.05`;
  } else if (styleLower === 'naturaleza') {
    backgroundFilter = `color=c=green:s=${width}x${height}:r=30`;
    overlayFilter = `noise=alls=8:allf=t,hue=H=80:0.2`;
  } else if (styleLower === 'amanecer') {
    backgroundFilter = `color=c=0xff7e5f:s=${width}x${height}:r=30`;
    overlayFilter = `color=c=0xfeb47b:s=${width}x${height}:r=30,blend=all_mode=overlay`;
  } else if (styleLower === 'cielo') {
    backgroundFilter = `color=c=0x1e3c72:s=${width}x${height}:r=30`;
    overlayFilter = `color=c=0x2a5298:s=${width}x${height}:r=30,blend=all_mode=softlight`;
  } else if (styleLower === 'montanas') {
    backgroundFilter = `color=c=0x2c3e50:s=${width}x${height}:r=30`;
    overlayFilter = `color=c=0x4ca1af:s=${width}x${height}:r=30,blend=all_mode=overlay`;
  } else if (styleLower === 'mar') {
    backgroundFilter = `color=c=0x0077b6:s=${width}x${height}:r=30`;
    overlayFilter = `color=c=0x90e0ef:s=${width}x${height}:r=30,blend=all_mode=softlight`;
  } else if (styleLower === 'ciudad') {
    backgroundFilter = `color=c=0x0f0c29:s=${width}x${height}:r=30`;
    overlayFilter = `color=c=0x302b63:s=${width}x${height}:r=30,blend=all_mode=overlay`;
  } else if (styleLower === 'iglesia') {
    backgroundFilter = `color=c=0x3e2723:s=${width}x${height}:r=30`;
    overlayFilter = `color=c=0x5d4037:s=${width}x${height}:r=30,blend=all_mode=softlight`;
  } else if (styleLower === 'persona orando') {
    backgroundFilter = `color=c=0x311b92:s=${width}x${height}:r=30`;
    overlayFilter = `color=c=0x674188:s=${width}x${height}:r=30,blend=all_mode=overlay`;
  } else if (styleLower === 'luz celestial') {
    backgroundFilter = `color=c=0x000428:s=${width}x${height}:r=30`;
    overlayFilter = `color=c=0x004e92:s=${width}x${height}:r=30,blend=all_mode=screen`;
  } else if (styleLower === 'minimalista') {
    backgroundFilter = `color=c=white:s=${width}x${height}:r=30`;
    overlayFilter = `noise=alls=6:allf=t`;
  } else {
    backgroundFilter = `color=c=0x0a0a0f:s=${width}x${height}:r=30`;
  }

  const textFilterParts = [
    `drawtext=text='${escapedTitle}':fontcolor=white:fontsize=72:box=1:boxcolor=black@0.45:boxborderw=18:textAlignment=center:x=(w-text_w)/2:y=(h*0.35):enable='between(t,0,${introSec})'`,
    `drawtext=text='${escapedVerse}':fontcolor=white:fontsize=56:box=1:boxcolor=black@0.45:boxborderw=18:textAlignment=center:x=(w-text_w)/2:y=(h*0.45):enable='between(t,${introSec},${introSec + verseSec})'`,
    `drawtext=text='${closingText}':fontcolor=white:fontsize=72:box=1:boxcolor=black@0.45:boxborderw=18:textAlignment=center:x=(w-text_w)/2:y=(h*0.45):enable='between(t,${closingStart},${totalDuration})'`,
    `drawtext=text='${escapedBrand}':fontcolor=white:fontsize=54:box=1:boxcolor=black@0.35:boxborderw=14:textAlignment=center:x=(w-text_w)/2:y=h-90:enable='between(t,${introSec + verseSec},${totalDuration})'`,
  ];

  const filterParts: string[] = [
    `color=c=black:s=${width}x${height}:r=30`,
    overlayFilter,
    `zoompan=z='1+0.00035*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${width}x${height}:fps=30`,
    ...textFilterParts,
    'fade=t=in:st=0:d=1:alpha=1',
    `fade=t=out:st=${totalDuration - 1}:d=1:alpha=1`,
  ];

  const vf = filterParts.filter(Boolean).join(',');

  const videoArgs = [
    '-f', 'lavfi',
    '-i', `color=c=black:s=${width}x${height}:r=30`,
    '-vf', vf,
    '-t', String(totalDuration),
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    '-y',
    videoPath,
  ];

  params.onProgress?.('GENERANDO ESCENAS', 10);
  await runFfmpeg(videoArgs);

  let finalVideoPath = videoPath;

  // Audio mixing: voice + optional music
  if (audioPath && existsSync(audioPath)) {
    const audioMixPath = videoPath.replace('_raw.mp4', '_mix.mp4');
    const musicInput = musicOptionToInput(params.music);
    const ffmpegAudioArgs = ['-i', videoPath, '-i', audioPath];
    if (musicInput) ffmpegAudioArgs.push('-i', musicInput);

    const audioFilter = musicInput
      ? '[1:a]volume=1.0[voice];[2:a]volume=0.3[music];[voice][music]amix=inputs=2:duration=first[aout]'
      : '[1:a]volume=1.0[aout]';

    const audioArgs = [
      ...ffmpegAudioArgs,
      '-filter_complex', audioFilter,
      '-map', '0:v',
      '-map', '[aout]',
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-shortest',
      '-y',
      audioMixPath,
    ];

    params.onProgress?.('GENERANDO AUDIO', 35);
    await runFfmpeg(audioArgs);
    finalVideoPath = audioMixPath;
  }

  // Burn subtitles if available
  if (srtPath && existsSync(srtPath)) {
    const subsPath = finalVideoPath.replace('.mp4', '_subs.mp4');
    const subtitlesFilter = `subtitles=${srtPath.replace(/\\/g, '\\\\').replace(/:/g, '\\:')}:force_style='FontSize=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,MarginV=30'`;
    const subsArgs = [
      '-i', finalVideoPath,
      '-vf', subtitlesFilter,
      '-c:a', 'copy',
      '-y',
      subsPath,
    ];

    params.onProgress?.('CREANDO SUBTÍTULOS', 55);
    try {
      await runFfmpeg(subsArgs);
      try { unlinkSync(finalVideoPath); } catch {}
      finalVideoPath = subsPath;
    } catch {
      // If subtitles filter fails, keep video without burned subs.
    }
  }

  // Thumbnail
  const thumbnailPath = outputPath.replace('.mp4', '_thumb.jpg');
  params.onProgress?.('RENDERIZANDO VIDEO', 70);
  await generateThumbnail(finalVideoPath, thumbnailPath);

  params.onProgress?.('Video terminado', 100);
  return { width, height, path: outputPath, rawPath: videoPath, thumbnailPath };
}

function musicOptionToInput(music: string) {
  if (!music || music === 'none' || music === 'sin música') return null;
  // Placeholder music assets would be placed in /app/public/music/*.mp3
  const map: Record<string, string> = {
    piano: '/app/public/music/piano.mp3',
    cinematica: '/app/public/music/cinematic.mp3',
    worship: '/app/public/music/worship.mp3',
    ambient: '/app/public/music/ambient.mp3',
    instrumental: '/app/public/music/instrumental.mp3',
  };
  return map[music] || null;
}
