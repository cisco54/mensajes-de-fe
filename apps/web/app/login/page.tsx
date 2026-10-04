'use client';

import { useState } from 'react';
import { apiFetch } from '../../components/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', data.token);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-2xl font-bold">MENSAJES DE FE</h1>
        <p className="text-sm text-slate-400">Inicia sesión</p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <input
          className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />
        <input
          className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />
        <button className="w-full rounded-lg bg-indigo-600 p-3 font-semibold hover:bg-indigo-500">Entrar</button>
      </form>
    </div>
  );
}
