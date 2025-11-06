import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
  params: { id: string };
}

export default async function AdminAffiliateDetailPage({ params }: Props) {
  const affiliate = await prisma.affiliateProfile.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      socialLinks: true,
      inventory: true,
      orders: { include: { eventInvitation: true } }
    }
  });

  if (!affiliate) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{affiliate.displayName}</CardTitle>
          <CardDescription>{affiliate.serviceType ?? 'Sin categoría definida'}</CardDescription>
        </CardHeader>
        <div className="space-y-3 p-6 pt-0 text-sm text-slate-600">
          <p>
            <strong>Correo:</strong> {affiliate.user.email}
          </p>
          <p>
            <strong>Ubicación:</strong> {affiliate.location ?? 'N/A'}
          </p>
          <p>
            <strong>WhatsApp:</strong> {affiliate.whatsapp ?? 'N/A'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant={affiliate.isActive ? 'success' : 'destructive'}>
              {affiliate.isActive ? 'Activo' : 'Bloqueado'}
            </Badge>
            <Badge variant="neutral">Pedidos: {affiliate.orders.length}</Badge>
            <Badge variant="neutral">Invitaciones: {affiliate.inventory.length}</Badge>
          </div>
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Redes sociales</CardTitle>
          <CardDescription>Links públicos para compartir</CardDescription>
        </CardHeader>
        <div className="space-y-2 p-6 pt-0 text-sm">
          {affiliate.socialLinks.length ? (
            affiliate.socialLinks.map((link) => (
              <div key={link.id} className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="font-medium text-slate-600">{link.platform}</span>
                <a href={link.url} className="text-brand-600 hover:underline">
                  {link.url}
                </a>
              </div>
            ))
          ) : (
            <p className="text-slate-500">Sin redes sociales registradas.</p>
          )}
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Inventario asignado</CardTitle>
          <CardDescription>Invitaciones disponibles y usadas</CardDescription>
        </CardHeader>
        <div className="space-y-2 p-6 pt-0 text-sm">
          {affiliate.inventory.map((invitation) => (
            <div key={invitation.id} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
              <div>
                <p className="font-medium text-slate-700">{invitation.code}</p>
                <p className="text-xs text-slate-500">
                  Creado: {invitation.createdAt.toLocaleDateString('es-MX')} • Vence:{' '}
                  {invitation.expiresAt ? invitation.expiresAt.toLocaleDateString('es-MX') : 'Sin fecha'}
                </p>
              </div>
              <Badge variant="neutral">{invitation.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pedidos recientes</CardTitle>
          <CardDescription>Últimos movimientos del afiliado</CardDescription>
        </CardHeader>
        <div className="space-y-2 p-6 pt-0 text-sm">
          {affiliate.orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-slate-100 px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-700">{order.customerName}</p>
                <Badge variant="neutral">{order.status}</Badge>
              </div>
              <p className="text-xs text-slate-500">
                {order.eventInvitation?.code ? `Invitación ${order.eventInvitation.code}` : 'Sin invitación asignada'}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
