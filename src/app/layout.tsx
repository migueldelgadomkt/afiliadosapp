import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Panel de Afiliados Invitado',
  description: 'Gestión de afiliados y eventos-invitación para Invitado.mx'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="bg-slate-50">
      <body className={cn('min-h-screen font-sans antialiased text-slate-900', inter.className)}>
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
