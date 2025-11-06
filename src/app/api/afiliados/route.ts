import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { affiliateUpsertSchema } from '@/lib/server-actions';
import { sendEmail } from '@/lib/email';

const searchSchema = z.object({
  q: z.string().optional()
});

export async function GET(request: Request) {
  const session = await getServerSession(authConfig);
  if (session?.user?.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = searchSchema.safeParse(Object.fromEntries(searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
  }

  const affiliates = await prisma.affiliateProfile.findMany({
    where: parsed.data.q
      ? {
          OR: [
            { displayName: { contains: parsed.data.q, mode: 'insensitive' } },
            { user: { email: { contains: parsed.data.q, mode: 'insensitive' } } }
          ]
        }
      : undefined,
    include: {
      user: true,
      socialLinks: true,
      inventory: true,
      orders: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ affiliates });
}

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  if (session?.user?.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const body = await request.json();
  try {
    const affiliate = await prisma.$transaction(async (tx) => {
      const data = affiliateUpsertSchema.parse(body);
      const password = Math.random().toString(36).slice(-10);
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash(password, 10);

      const created = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          role: 'AFILIADO',
          affiliate: {
            create: {
              displayName: data.displayName,
              location: data.location,
              serviceType: data.serviceType,
              whatsapp: data.whatsapp,
              emailPublic: data.emailPublic,
              photoUrl: data.photoUrl,
              isActive: data.isActive ?? true,
              socialLinks: { create: data.socialLinks ?? [] }
            }
          }
        },
        include: { affiliate: true }
      });

      return { created, password };
    });

    await sendEmail({
      to: affiliate.created.email,
      subject: 'Tus credenciales de Invitado Afiliados',
      html: `<p>Hola ${affiliate.created.affiliate?.displayName ?? ''},</p><p>Usuario: <strong>${affiliate.created.email}</strong></p><p>Contraseña temporal: <strong>${affiliate.password}</strong></p>`
    });

    return NextResponse.json({ affiliate: affiliate.created, password: affiliate.password }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'No se pudo crear el afiliado' }, { status: 400 });
  }
}
