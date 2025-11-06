import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('next-auth', async () => {
  const actual = await vi.importActual<typeof import('next-auth')>('next-auth');
  return {
    ...actual,
    getServerSession: vi.fn()
  };
});

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findMany: vi.fn().mockResolvedValue([])
    },
    affiliateProfile: {
      findUnique: vi.fn().mockResolvedValue({ id: 'aff', userId: 'user' })
    }
  }
}));

import { GET as getOrders } from '@/app/api/pedidos/route';
import { getServerSession } from 'next-auth';

const mockedGetServerSession = getServerSession as unknown as vi.Mock;

describe('GET /api/pedidos', () => {
  beforeEach(() => {
    mockedGetServerSession.mockReset();
  });

  it('requiere autenticación', async () => {
    mockedGetServerSession.mockResolvedValue(null);
    const response = await getOrders(new Request('http://localhost/api/pedidos'));
    expect(response.status).toBe(403);
  });

  it('retorna lista cuando hay sesión', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: 'user', role: 'AFILIADO' } });
    const response = await getOrders(new Request('http://localhost/api/pedidos'));
    expect(response.status).toBe(200);
  });
});
