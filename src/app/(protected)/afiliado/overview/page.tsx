import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function AffiliateOverviewPage() {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    throw new Error('No autorizado');
  }

  const affiliate = await prisma.affiliateProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      inventory: true,
      orders: { orderBy: { createdAt: 'desc' }, take: 5 }
    }
  });

  if (!affiliate) {
    throw new Error('Afiliado no encontrado');
  }

  const used = affiliate.inventory.filter((invitation) => invitation.status === 'USADO').length;
  const available = affiliate.inventory.filter((invitation) => invitation.status === 'DISPONIBLE').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Hola {affiliate.displayName}</h1>
        <p className="text-sm text-slate-600">Aquí tienes un resumen rápido de tu desempeño.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Invitaciones disponibles</CardDescription>
            <CardTitle className="text-3xl">{available}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Invitaciones usadas</CardDescription>
            <CardTitle className="text-3xl">{used}</CardTitle>
          </CardHeader>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pedidos recientes</CardTitle>
          <CardDescription>Tus últimos movimientos</CardDescription>
        </CardHeader>
        <div className="space-y-2 p-6 pt-0 text-sm">
          {affiliate.orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-slate-100 px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-700">{order.customerName}</p>
                <Badge variant="neutral">{order.status}</Badge>
              </div>
              <p className="text-xs text-slate-500">
                {order.eventInvitationId ? `Invitación ${order.eventInvitationId}` : 'Sin invitación asignada'}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
