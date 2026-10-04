'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../components/api';

type Video = {
  id: string;
  title: string;
  topic: string;
  durationSec: number;
  aspectRatio: string;
  status: string;
  progress: number;
  currentStep: string | null;
  url: string;
  thumbnail: string;
  createdAt: string;
};

export default function DashboardPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch('/api/videos');
      setVideos(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  async function createVideo(formData: FormData) {
    const payload = {
      topic: formData.get('topic'),
      customTopic: formData.get('customTopic'),
      customReflection: formData.get('customReflection'),
      durationSec: Number(formData.get('durationSec')),
      aspectRatio: formData.get('aspectRatio'),
      style: formData.get('style'),
      voice: formData.get('voice'),
      music: formData.get('music'),
      intensity: formData.get('intensity'),
    };
    await apiFetch('/api/videos', { method: 'POST', body: JSON.stringify(payload) });
    await load();
  }

  async function removeVideo(id: string) {
    await apiFetch(`/api/videos/${id}`, { method: 'DELETE' });
    await load();
  }

  async function regenerateVideo(id: string) {
    await apiFetch(`/api/videos/${id}/regenerate`, { method: 'POST' });
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">MENSAJES DE FE</h1>
          <p className="text-sm text-slate-400">Generador de videos bíblicos</p>
        </div>
        <div className="flex gap-3">
          <a className="rounded-lg border border-slate-800 px-4 py-2 hover:bg-slate-900" href="/verses">Biblia</a>
          <a className="rounded-lg border border-slate-800 px-4 py-2 hover:bg-slate-900" href="/admin">Admin</a>
          <button className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold" onClick={() => document.getElementById('create-form')?.scrollIntoView({ behavior: 'smooth' })}>
            Crear nuevo video
          </button>
        </div>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 p-4">
          <p className="text-sm text-slate-400">Total</p>
          <p className="text-2xl font-bold">{videos.length}</p>
        </div>
        <div className="rounded-xl border border-slate-800 p-4">
          <p className="text-sm text-slate-400">En proceso</p>
          <p className="text-2xl font-bold">{videos.filter((v) => !['COMPLETADO', 'ERROR'].includes(v.status)).length}</p>
        </div>
        <div className="rounded-xl border border-slate-800 p-4">
          <p className="text-sm text-slate-400">Completados</p>
          <p className="text-2xl font-bold">{videos.filter((v) => v.status === 'COMPLETADO').length}</p>
        </div>
      </section>

      <section id="create-form" className="mt-10 rounded-xl border border-slate-800 p-6">
        <h2 className="text-xl font-semibold">Crear nuevo video</h2>
        <form action={createVideo} className="mt-4 grid gap-4 md:grid-cols-2">
          <select name="topic" className="rounded-lg border border-slate-800 bg-slate-950 p-3">
            <option value="fe">Fe</option>
            <option value="esperanza">Esperanza</option>
            <option value="amor">Amor</option>
            <option value="sanidad">Sanidad</option>
            <option value="prosperidad">Prosperidad</option>
            <option value="proteccion">Protección</option>
            <option value="ansiedad">Ansiedad</option>
            <option value="familia">Familia</option>
            <option value="matrimonio">Matrimonio</option>
            <option value="jovenes">Jóvenes</option>
            <option value="oracion">Oración</option>
            <option value="milagros">Milagros</option>
            <option value="fortaleza">Fortaleza</option>
            <option value="otro">Otro</option>
          </select>
          <input name="customTopic" placeholder="Tema personalizado" className="rounded-lg border border-slate-800 bg-slate-950 p-3" />
          <select name="durationSec" className="rounded-lg border border-slate-800 bg-slate-950 p-3">
            <option value="15">15 segundos</option>
            <option value="30">30 segundos</option>
            <option value="45">45 segundos</option>
            <option value="60">60 segundos</option>
            <option value="90">90 segundos</option>
          </select>
          <select name="aspectRatio" className="rounded-lg border border-slate-800 bg-slate-950 p-3">
            <option value="9:16">9:16 vertical</option>
            <option value="1:1">1:1 cuadrado</option>
            <option value="16:9">16:9 horizontal</option>
          </select>
          <select name="style" className="rounded-lg border border-slate-800 bg-slate-950 p-3">
            <option value="cinematografico">Cinematográfico</option>
            <option value="naturaleza">Naturaleza</option>
            <option value="amanecer">Amanecer</option>
            <option value="cielo">Cielo</option>
            <option value="montanas">Montañas</option>
            <option value="mar">Mar</option>
            <option value="ciudad">Ciudad</option>
            <option value="iglesia">Iglesia</option>
            <option value="persona orando">Persona orando</option>
            <option value="luz celestial">Luz celestial</option>
            <option value="minimalista">Minimalista</option>
          </select>
          <select name="voice" className="rounded-lg border border-slate-800 bg-slate-950 p-3">
            <option value="masculina">Masculina</option>
            <option value="femenina">Femenina</option>
            <option value="neutra">Neutra</option>
            <option value="es-latino">Español latino</option>
            <option value="es-colombia">Español Colombia</option>
            <option value="es-venezuela">Español Venezuela</option>
            <option value="en">Inglés</option>
          </select>
          <select name="music" className="rounded-lg border border-slate-800 bg-slate-950 p-3">
            <option value="piano">Piano espiritual</option>
            <option value="cinematica">Cinemática</option>
            <option value="worship">Worship</option>
            <option value="ambient">Ambient</option>
            <option value="instrumental">Instrumental</option>
            <option value="none">Sin música</option>
          </select>
          <select name="intensity" className="rounded-lg border border-slate-800 bg-slate-950 p-3">
            <option value="suave">Suave</option>
            <option value="emocional">Emocional</option>
            <option value="inspiradora">Inspiradora</option>
            <option value="poderosa">Poderosa</option>
          </select>
          <textarea name="customReflection" placeholder="Reflexión personalizada (opcional)" className="md:col-span-2 rounded-lg border border-slate-800 bg-slate-950 p-3" />
          <div className="md:col-span-2">
            <button type="submit" className="w-full rounded-lg bg-indigo-600 p-3 font-semibold hover:bg-indigo-500">GENERAR VIDEO</button>
          </div>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Historial</h2>
        {loading ? (
          <p className="mt-4 text-slate-400">Cargando...</p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {videos.map((v) => (
              <div key={v.id} className="rounded-xl border border-slate-800 p-4">
                <div className="aspect-video rounded-lg bg-slate-900" style={v.thumbnail ? { backgroundImage: `url(${v.thumbnail})`, backgroundSize: 'cover' } : undefined}>
                  {!v.thumbnail && <div className="flex h-full items-center justify-center text-xs text-slate-500">Sin miniatura</div>}
                </div>
                <div className="mt-3">
                  <p className="font-semibold">{v.title}</p>
                  <p className="text-xs text-slate-400">{v.topic} • {v.aspectRatio} • {v.status}</p>
                  <p className="text-xs text-slate-400">{v.currentStep}</p>
                  <div className="mt-2 h-2 rounded-full bg-slate-800">
                    <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${v.progress}%` }} />
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <a href={`/videos/${v.id}`} className="rounded-lg border border-slate-800 px-3 py-2 text-sm hover:bg-slate-900">Ver</a>
                  <button onClick={() => regenerateVideo(v.id)} className="rounded-lg border border-slate-800 px-3 py-2 text-sm hover:bg-slate-900">Regenerar</button>
                  <button onClick={() => removeVideo(v.id)} className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-300 hover:bg-red-950">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
