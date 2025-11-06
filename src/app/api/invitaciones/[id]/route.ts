import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const updateSchema = z.object({
  status: z.enum(['DISPONIBLE', 'ASIGNADO', 'USADO', 'VENCIDO']).optional(),
  affiliateId: z.string().optional(),
  eventInvitationId: z.string().optional()
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

  const invitation = await prisma.eventInvitation.findUnique({ where: { id: params.id } });
  if (!invitation) {
    return NextResponse.json({ error: 'Invitación no encontrada' }, { status: 404 });
  }

  if (session.user.role === 'AFILIADO') {
    const affiliateProfile = await prisma.affiliateProfile.findUnique({ where: { userId: session.user.id } });
    if (!affiliateProfile || invitation.affiliateId !== affiliateProfile.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
  }

  const updated = await prisma.eventInvitation.update({
    where: { id: params.id },
    data: {
      status: body.data.status,
      affiliateId: body.data.affiliateId ?? invitation.affiliateId
    }
  });

  return NextResponse.json({ invitation: updated });
}
