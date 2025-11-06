import { prisma } from '@/lib/prisma';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

async function getMetrics() {
  const [affiliates, orders, invitations] = await Promise.all([
    prisma.affiliateProfile.count({ where: { isActive: true } }),
    prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true }
    }),
    prisma.eventInvitation.groupBy({
      by: ['status'],
      _count: { _all: true }
    })
  ]);

  return { affiliates, orders, invitations };
}

export default async function AdminOverviewPage() {
  const metrics = await getMetrics();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Afiliados activos</CardDescription>
            <CardTitle className="text-3xl">{metrics.affiliates}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Pedidos totales</CardDescription>
            <CardTitle className="text-3xl">
              {metrics.orders.reduce((acc, order) => acc + order._count._all, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Invitaciones disponibles</CardDescription>
            <CardTitle className="text-3xl">
              {metrics.invitations.find((item) => item.status === 'DISPONIBLE')?._count._all ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pedidos por estado</CardTitle>
          <CardDescription>Resumen del pipeline</CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-3">
          {metrics.orders.map((order) => (
            <Badge key={order.status} variant="neutral" className="px-4 py-2 text-sm">
              {order.status}: {order._count._all}
            </Badge>
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Inventario por estado</CardTitle>
          <CardDescription>Seguimiento de invitaciones</CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-3">
          {metrics.invitations.map((invitation) => (
            <Badge key={invitation.status} className="px-4 py-2 text-sm">
              {invitation.status}: {invitation._count._all}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}
