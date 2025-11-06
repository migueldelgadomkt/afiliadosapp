import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createSchema = z.object({
  customerName: z.string().min(3),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional(),
  notes: z.string().optional(),
  eventInvitationId: z.string().optional()
});

export async function GET(request: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') ?? undefined;
  const affiliateFilter = searchParams.get('affiliateId') ?? undefined;

  const affiliateProfile = session.user.role === 'AFILIADO'
    ? await prisma.affiliateProfile.findUnique({ where: { userId: session.user.id } })
    : null;

  if (session.user.role === 'AFILIADO' && !affiliateProfile) {
    return NextResponse.json({ error: 'Afiliado no encontrado' }, { status: 404 });
  }

  const orders = await prisma.order.findMany({
    where: {
      affiliateId: session.user.role === 'AFILIADO' ? affiliateProfile!.id : affiliateFilter ?? undefined,
      status: status as any
    },
    include: { eventInvitation: true, affiliate: { select: { displayName: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const body = createSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const affiliate = await prisma.affiliateProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!affiliate) {
    return NextResponse.json({ error: 'Afiliado no encontrado' }, { status: 404 });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      if (body.data.eventInvitationId) {
        const invitation = await tx.eventInvitation.findUnique({ where: { id: body.data.eventInvitationId } });
        if (!invitation || (invitation.affiliateId && invitation.affiliateId !== affiliate.id)) {
          throw new Error('Invitación no disponible');
        }
        await tx.eventInvitation.update({
          where: { id: body.data.eventInvitationId },
          data: { status: 'ASIGNADO', affiliateId: affiliate.id }
        });
      }

      return tx.order.create({
        data: {
          affiliateId: affiliate.id,
          status: body.data.eventInvitationId ? 'PENDIENTE' : 'DRAFT',
          customerName: body.data.customerName,
          customerPhone: body.data.customerPhone,
          customerEmail: body.data.customerEmail,
          notes: body.data.notes,
          eventInvitationId: body.data.eventInvitationId
        },
        include: { eventInvitation: true }
      });
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'No se pudo crear el pedido' }, { status: 400 });
  }
}
