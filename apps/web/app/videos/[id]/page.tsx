'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../../components/api';

type Video = {
  id: string;
  title: string;
  topic: string;
  durationSec: number;
  aspectRatio: string;
  status: string;
  progress: number;
  currentStep: string | null;
  errorMessage?: string | null;
  url: string;
  thumbnail: string;
  createdAt: string;
};

export default function VideoDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/videos/${id}`);
      setVideo(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [id]);

  async function regenerate() {
    await apiFetch(`/api/videos/${id}/regenerate`, { method: 'POST' });
    await load();
  }

  async function remove() {
    await apiFetch(`/api/videos/${id}`, { method: 'DELETE' });
    window.location.href = '/dashboard';
  }

  if (loading) return <div className="p-6">Cargando...</div>;
  if (!video) return <div className="p-6">Video no encontrado</div>;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <a href="/dashboard" className="text-sm text-slate-400 hover:text-white">← Dashboard</a>
      <h1 className="mt-2 text-2xl font-bold">{video.title}</h1>
      <div className="mt-4 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="aspect-video rounded-xl border border-slate-800 bg-black">
            {video.status === 'COMPLETADO' && video.url ? (
              <video controls className="h-full w-full" src={video.url}>
                <source src={video.url} />
              </video>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <p className="font-semibold">Preparando tu video...</p>
                <p className="mt-2 text-sm text-slate-400">{video.currentStep}</p>
                <div className="mt-4 h-2 w-64 rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${video.progress}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500">{video.progress}%</p>
              </div>
            )}
          </div>
          {video.errorMessage && <p className="mt-2 text-sm text-red-400">Error: {video.errorMessage}</p>}
          <div className="mt-4 flex gap-3">
            <button onClick={regenerate} className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold hover:bg-indigo-500">REGENERAR</button>
            <button onClick={remove} className="rounded-lg border border-red-900 px-4 py-2 text-red-300 hover:bg-red-950">ELIMINAR</button>
          </div>
        </div>
        <div className="space-y-3 rounded-xl border border-slate-800 p-4">
          <div>
            <p className="text-xs text-slate-400">Tema</p>
            <p className="font-medium">{video.topic}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Duración</p>
            <p className="font-medium">{video.durationSec}s</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Formato</p>
            <p className="font-medium">{video.aspectRatio}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Estado</p>
            <p className="font-medium">{video.status}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Creado</p>
            <p className="font-medium">{new Date(video.createdAt).toLocaleString('es')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
