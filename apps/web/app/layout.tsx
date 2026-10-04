import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mensajes de Fe – Generador de Videos Bíblicos',
  description: 'Genera videos bíblicos reales desde tu dashboard.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
