import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { affiliateUpsertSchema } from '@/lib/server-actions';

interface Params {
  params: { id: string };
}

export async function GET(_: Request, { params }: Params) {
  const session = await getServerSession(authConfig);
  if (session?.user?.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const affiliate = await prisma.affiliateProfile.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      socialLinks: true,
      inventory: true,
      orders: { include: { eventInvitation: true } }
    }
  });

  if (!affiliate) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  }

  return NextResponse.json({ affiliate });
}

export async function PUT(request: Request, { params }: Params) {
  const session = await getServerSession(authConfig);
  if (session?.user?.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const body = await request.json();
  try {
    const data = affiliateUpsertSchema.parse({ ...body, id: params.id });

    const existing = await prisma.affiliateProfile.findUnique({
      where: { id: params.id },
      include: { user: true }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Afiliado no encontrado' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: existing.userId },
        data: { email: data.email }
      });

      return tx.affiliateProfile.update({
        where: { id: params.id },
        data: {
          displayName: data.displayName,
          location: data.location,
          serviceType: data.serviceType,
          whatsapp: data.whatsapp,
          emailPublic: data.emailPublic,
          photoUrl: data.photoUrl,
          isActive: data.isActive ?? true,
          socialLinks: {
            deleteMany: {},
            create: data.socialLinks ?? []
          }
        },
        include: { socialLinks: true, user: true }
      });
    });

    return NextResponse.json({ affiliate: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 400 });
  }
}
