import { prisma } from '@/lib/prisma';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function AdminInvitationsPage() {
  const invitations = await prisma.eventInvitation.findMany({
    include: { affiliate: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Invitaciones</h1>
        <p className="text-sm text-slate-600">Administra el inventario global y asigna a afiliados.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lote actual</CardTitle>
          <CardDescription>Últimas invitaciones creadas</CardDescription>
        </CardHeader>
        <div className="space-y-2 p-6 pt-0 text-sm">
          {invitations.map((invitation) => (
            <div key={invitation.id} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
              <div>
                <p className="font-medium text-slate-700">{invitation.code}</p>
                <p className="text-xs text-slate-500">
                  Creado: {invitation.createdAt.toLocaleDateString('es-MX')} • Asignado a:{' '}
                  {invitation.affiliate?.displayName ?? 'Inventario general'}
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
