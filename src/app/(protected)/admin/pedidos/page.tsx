import { prisma } from '@/lib/prisma';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { eventInvitation: true, affiliate: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Pedidos</h1>
        <p className="text-sm text-slate-600">Controla los pedidos generados por afiliados.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de pedidos</CardTitle>
          <CardDescription>Detalle de estado y clientes</CardDescription>
        </CardHeader>
        <div className="space-y-2 p-6 pt-0 text-sm">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-slate-100 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-700">{order.customerName}</p>
                  <p className="text-xs text-slate-500">
                    Afiliado: {order.affiliate.displayName} • Invitación:{' '}
                    {order.eventInvitation?.code ?? 'No asignada'}
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
