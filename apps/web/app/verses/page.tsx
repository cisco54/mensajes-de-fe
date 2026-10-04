'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../components/api';

type Verse = {
  id: string;
  book: string;
  chapter: number;
  verse: string;
  text: string;
  theme: string | null;
  language: string;
};

export default function VersesPage() {
  const [q, setQ] = useState('');
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch(`/api/verses?q=${encodeURIComponent(q)}&limit=50`);
      setVerses(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    search();
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Biblia</h1>
        <a href="/dashboard" className="text-sm text-slate-400 hover:text-white">Dashboard</a>
      </div>
      <form onSubmit={search} className="mt-4 flex gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por texto, libro o tema"
          className="flex-1 rounded-lg border border-slate-800 bg-slate-950 p-3"
        />
        <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold hover:bg-indigo-500">Buscar</button>
      </form>
      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-slate-400">Buscando...</p>}
        {!loading && verses.map((v) => (
          <div key={v.id} className="rounded-xl border border-slate-800 p-4">
            <p className="text-xs text-slate-400">{v.book} {v.chapter}:{v.verse} • {v.theme || v.language}</p>
            <p className="mt-1">{v.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
