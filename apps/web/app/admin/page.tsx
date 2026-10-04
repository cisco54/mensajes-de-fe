'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../components/api';

type Stats = { totalVideos: number; completed: number; failed: number; users: number };

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/admin/stats')
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold">Administrador</h1>
      {error && <p className="mt-2 text-red-400">{error}</p>}
      {stats && (
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-800 p-4">
            <p className="text-xs text-slate-400">Videos totales</p>
            <p className="text-2xl font-bold">{stats.totalVideos}</p>
          </div>
          <div className="rounded-xl border border-slate-800 p-4">
            <p className="text-xs text-slate-400">Completados</p>
            <p className="text-2xl font-bold">{stats.completed}</p>
          </div>
          <div className="rounded-xl border border-slate-800 p-4">
            <p className="text-xs text-slate-400">Con error</p>
            <p className="text-2xl font-bold">{stats.failed}</p>
          </div>
          <div className="rounded-xl border border-slate-800 p-4">
            <p className="text-xs text-slate-400">Usuarios</p>
            <p className="text-2xl font-bold">{stats.users}</p>
          </div>
        </div>
      )}
    </div>
  );
}
