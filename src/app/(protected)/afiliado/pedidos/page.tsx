import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AffiliateOrdersPage() {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    throw new Error('No autorizado');
  }

  const orders = await prisma.order.findMany({
    where: { affiliate: { userId: session.user.id } },
    include: { eventInvitation: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Pedidos</h1>
        <p className="text-sm text-slate-600">Crea y da seguimiento a tus pedidos.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Historial de pedidos</CardTitle>
          <CardDescription>Consulta el estado actual de cada pedido</CardDescription>
        </CardHeader>
        <div className="space-y-2 p-6 pt-0 text-sm">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-slate-100 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-700">{order.customerName}</p>
                  <p className="text-xs text-slate-500">
                    Invitación: {order.eventInvitation?.code ?? 'No asignada'}
                  </p>
                </div>
                <Badge variant="neutral">{order.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
