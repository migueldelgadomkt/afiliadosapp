'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { credentialsSchema } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const magicSchema = z.object({ email: z.string().email({ message: 'Ingresa un correo válido' }) });

export default function LoginPage() {
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const callbackUrl = params.get('callbackUrl') ?? '/dashboard';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => toast.error(issue.message));
      return;
    }
    setLoading(true);
    const result = await signIn('credentials', { redirect: false, ...parsed.data, callbackUrl });
    setLoading(false);
    if (result?.error) {
      toast.error('Credenciales inválidas.');
    } else {
      window.location.href = callbackUrl;
    }
  };

  const handleMagic = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = magicSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => toast.error(issue.message));
      return;
    }
    setLoading(true);
    const result = await signIn('magic-link', {
      email: parsed.data.email,
      redirect: false,
      callbackUrl
    });
    setLoading(false);
    if (result?.error) {
      toast.error('No se pudo enviar el enlace mágico');
    } else {
      toast.success('Revisa tu correo para acceder');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 p-6">
      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 rounded-3xl bg-white p-8 shadow-xl md:grid-cols-2">
        <section className="flex flex-col justify-between space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Invitado Afiliados</h1>
            <p className="mt-2 text-sm text-slate-600">
              Accede con tus credenciales o solicita un enlace mágico para ingresar al panel de afiliados.
            </p>
          </div>
          <div className="hidden md:block">
            <p className="text-xs uppercase tracking-widest text-brand-500">Beneficios</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Gestiona tu inventario de invitaciones digitales.</li>
              <li>• Registra pedidos y da seguimiento a tus clientes.</li>
              <li>• Descarga recursos y monitorea tu desempeño.</li>
            </ul>
          </div>
        </section>
        <section className="flex flex-col space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <Input id="email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Ingresando…' : 'Iniciar sesión'}
            </Button>
          </form>
          <div className="relative py-3 text-center text-xs uppercase text-slate-400">
            <span className="bg-white px-2">o usa enlace mágico</span>
            <span className="absolute inset-x-0 top-1/2 -z-10 h-px -translate-y-1/2 bg-slate-200" aria-hidden />
          </div>
          <form className="space-y-3" onSubmit={handleMagic}>
            <div>
              <label htmlFor="email-magic" className="block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <Input id="email-magic" name="email" type="email" placeholder="tu@correo.com" />
            </div>
            <Button type="submit" variant="secondary" className="w-full" disabled={loading}>
              Enviar enlace mágico
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
