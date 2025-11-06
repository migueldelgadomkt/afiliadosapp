import Link from 'next/link';
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { ROUTES } from '@/lib/utils';
import { SignOutButton } from '@/components/layout/sign-out-button';

function AdminSidebar() {
  const links = [
    { href: ROUTES.admin.overview, label: 'Resumen' },
    { href: ROUTES.admin.affiliates, label: 'Afiliados' },
    { href: ROUTES.admin.invitations, label: 'Invitaciones' },
    { href: ROUTES.admin.orders, label: 'Pedidos' },
    { href: ROUTES.admin.resources, label: 'Recursos' }
  ];
  return (
    <nav className="space-y-2">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="block rounded-2xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function AffiliateSidebar() {
  const links = [
    { href: ROUTES.affiliate.overview, label: 'Resumen' },
    { href: ROUTES.affiliate.inventory, label: 'Inventario' },
    { href: ROUTES.affiliate.orders, label: 'Pedidos' },
    { href: ROUTES.affiliate.profile, label: 'Perfil' },
    { href: ROUTES.affiliate.resources, label: 'Recursos' }
  ];
  return (
    <nav className="space-y-2">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="block rounded-2xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="grid min-h-screen grid-cols-1 gap-6 bg-slate-100 p-6 md:grid-cols-[280px_1fr]">
      <aside className="flex flex-col justify-between rounded-3xl bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Invitado Afiliados</h2>
          <p className="text-xs text-slate-500">Panel de gestión</p>
          <div className="mt-6 space-y-2">
            {session?.user?.role === 'SUPERADMIN' ? <AdminSidebar /> : <AffiliateSidebar />}
          </div>
        </div>
        <SignOutButton />
      </aside>
      <section className="space-y-6">
        <header className="rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Bienvenido/a</h1>
          <p className="text-sm text-slate-600">Gestiona tu operación desde un solo lugar.</p>
        </header>
        <main className="space-y-6">{children}</main>
      </section>
    </div>
  );
}
