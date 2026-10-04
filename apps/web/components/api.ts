const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function apiFetch(path: string, options?: RequestInit) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers, redirect: 'manual' });
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(new Error('No autorizado'));
  }
  if (!res.ok) {
    const text = await res.text();
    let error: any = text;
    try { error = JSON.parse(text); } catch {}
    throw new Error(error?.error || error || `Error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}
