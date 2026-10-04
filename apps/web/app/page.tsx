'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    window.location.href = '/dashboard';
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">MENSAJES DE FE</h1>
        <p className="mt-2 text-slate-400">Redirigiendo al dashboard...</p>
      </div>
    </div>
  );
}
