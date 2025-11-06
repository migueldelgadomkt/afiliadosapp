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
  const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined;
  const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined;

  const affiliateProfile = session.user.role === 'AFILIADO'
    ? await prisma.affiliateProfile.findUnique({ where: { userId: session.user.id } })
    : null;

  if (session.user.role === 'AFILIADO' && !affiliateProfile) {
    return NextResponse.json({ error: 'Afiliado no encontrado' }, { status: 404 });
  }

  const orders = await prisma.order.findMany({
    where: {
      affiliateId: session.user.role === 'AFILIADO' ? affiliateProfile!.id : affiliateId ?? undefined,
      createdAt: {
        gte: from,
        lte: to
      }
    },
    include: { eventInvitation: true, affiliate: { select: { displayName: true } } },
    orderBy: { createdAt: 'desc' }
  });

  if (!orders.length) {
    return NextResponse.json({ error: 'Sin datos para exportar' }, { status: 404 });
  }

  const rows = orders.map((order) => ({
    id: order.id,
    afiliado: order.affiliate.displayName,
    estado: order.status,
    cliente: order.customerName,
    telefono: order.customerPhone ?? '',
    email: order.customerEmail ?? '',
    invitacion: order.eventInvitation?.code ?? '',
    creado: order.createdAt.toISOString(),
    actualizado: order.updatedAt.toISOString()
  }));

  const csv = toCsv(rows);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="pedidos-${Date.now()}.csv"`
    }
  });
}
