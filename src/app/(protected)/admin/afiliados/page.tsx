import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default async function AdminAffiliatesPage() {
  const affiliates = await prisma.affiliateProfile.findMany({
    include: { user: true, orders: true, inventory: true }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Afiliados</h1>
          <p className="text-sm text-slate-600">Gestiona el catálogo de afiliados y sus inventarios.</p>
        </div>
        <Button asChild>
          <Link href="/admin/afiliados/new">Crear afiliado</Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {affiliates.map((affiliate) => (
          <Card key={affiliate.id} className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle>{affiliate.displayName}</CardTitle>
              <CardDescription>{affiliate.serviceType ?? 'Sin categoría'}</CardDescription>
            </CardHeader>
            <div className="space-y-3 p-6 pt-0 text-sm text-slate-600">
              <p>
                <strong>Correo:</strong> {affiliate.user.email}
              </p>
              <p>
                <strong>Ubicación:</strong> {affiliate.location ?? 'N/A'}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant={affiliate.isActive ? 'success' : 'destructive'}>
                  {affiliate.isActive ? 'Activo' : 'Bloqueado'}
                </Badge>
                <Badge variant="neutral">Pedidos: {affiliate.orders.length}</Badge>
                <Badge variant="neutral">Inventario: {affiliate.inventory.length}</Badge>
              </div>
              <Button asChild variant="secondary" className="w-full">
                <Link href={`/admin/afiliados/${affiliate.id}`}>Ver detalle</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
