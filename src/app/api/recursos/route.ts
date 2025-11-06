import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const resourceSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  url: z.string().url()
});

export async function GET() {
  const resources = await prisma.resource.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ resources });
}

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  if (session?.user?.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const body = resourceSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const resource = await prisma.resource.create({ data: body.data });
  return NextResponse.json({ resource }, { status: 201 });
}
