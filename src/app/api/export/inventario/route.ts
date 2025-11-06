import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { toCsv } from '@/lib/csv';

export async function GET(request: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const affiliateId = searchParams.get('affiliateId') ?? undefined;

  const invitations = await prisma.eventInvitation.findMany({
    where: {
      AND: [
        session.user.role === 'AFILIADO'
          ? { affiliate: { userId: session.user.id } }
          : affiliateId
            ? { affiliateId }
            : {}
      ]
    },
    include: { affiliate: { select: { displayName: true } }, usedByOrder: true },
    orderBy: { createdAt: 'desc' }
  });

  if (!invitations.length) {
    return NextResponse.json({ error: 'Sin datos para exportar' }, { status: 404 });
  }

  const rows = invitations.map((invitation) => ({
    id: invitation.id,
    codigo: invitation.code,
    estado: invitation.status,
    afiliado: invitation.affiliate?.displayName ?? '-',
    pedido: invitation.usedByOrder?.id ?? '',
    vence: invitation.expiresAt?.toISOString() ?? '',
    creado: invitation.createdAt.toISOString()
  }));

  const csv = toCsv(rows);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="inventario-${Date.now()}.csv"`
    }
  });
}
