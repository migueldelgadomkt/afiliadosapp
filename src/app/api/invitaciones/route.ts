import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createSchema = z.object({
  quantity: z.number().min(1).max(200),
  affiliateId: z.string().optional(),
  expiresAt: z.string().datetime().optional()
});

export async function GET(request: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const affiliateId = searchParams.get('affiliateId') ?? undefined;
  const status = searchParams.get('status') ?? undefined;

  const invitations = await prisma.eventInvitation.findMany({
    where: {
      AND: [
        status ? { status: status as any } : {},
        session.user.role === 'AFILIADO'
          ? { affiliate: { userId: session.user.id } }
          : affiliateId
            ? { affiliateId }
            : {}
      ]
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ invitations });
}

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  if (session?.user?.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const payload = createSchema.parse(await request.json());
    const invitations = await prisma.$transaction(async (tx) => {
      const results = [] as { id: string; code: string }[];
      for (let index = 0; index < payload.quantity; index += 1) {
        const invitation = await tx.eventInvitation.create({
          data: {
            code: `EVT-${Date.now()}-${index + 1}`,
            affiliateId: payload.affiliateId,
            expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
            status: payload.affiliateId ? 'ASIGNADO' : 'DISPONIBLE'
          }
        });
        results.push({ id: invitation.id, code: invitation.code });
      }
      return results;
    });

    return NextResponse.json({ invitations }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'No se pudo crear el lote' }, { status: 400 });
  }
}
