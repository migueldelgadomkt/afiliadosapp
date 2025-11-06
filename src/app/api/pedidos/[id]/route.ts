import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

const updateSchema = z.object({
  status: z.enum(['DRAFT', 'PENDIENTE', 'APROBADO', 'ENTREGADO', 'CANCELADO']).optional(),
  notes: z.string().optional()
});

interface Params {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const body = updateSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { affiliate: { include: { user: true } }, eventInvitation: true }
  });

  if (!order) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  }

  if (session.user.role === 'AFILIADO' && order.affiliate.userId !== session.user.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.order.update({
      where: { id: params.id },
      data: {
        status: body.data.status ?? order.status,
        notes: body.data.notes ?? order.notes,
        updatedById: session.user.id
      },
      include: { eventInvitation: true, affiliate: { include: { user: true } } }
    });

    if (body.data.status === 'APROBADO' && result.eventInvitationId) {
      await tx.eventInvitation.update({
        where: { id: result.eventInvitationId },
        data: { status: 'USADO', usedByOrderId: result.id }
      });
    }

    return result;
  });

  if (updated.affiliate.user.email) {
    try {
      await sendEmail({
        to: updated.affiliate.user.email,
        subject: `Actualización del pedido ${updated.id}`,
        html: `<p>El pedido ${updated.id} cambió a estado <strong>${updated.status}</strong>.</p>`
      });
    } catch (emailError) {
      console.error(emailError);
    }
  }

  return NextResponse.json({ order: updated });
}
