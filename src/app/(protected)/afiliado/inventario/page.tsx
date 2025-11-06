import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AffiliateInventoryPage() {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    throw new Error('No autorizado');
  }

  const invitations = await prisma.eventInvitation.findMany({
    where: { affiliate: { userId: session.user.id } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Inventario</h1>
        <p className="text-sm text-slate-600">Gestiona tus invitaciones disponibles.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Listado de invitaciones</CardTitle>
          <CardDescription>Selecciona la invitación al crear un pedido</CardDescription>
        </CardHeader>
        <div className="space-y-2 p-6 pt-0 text-sm">
          {invitations.map((invitation) => (
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
    </div>
  );
}
