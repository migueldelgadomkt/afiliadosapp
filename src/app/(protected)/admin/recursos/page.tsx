import { prisma } from '@/lib/prisma';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function AdminResourcesPage() {
  const resources = await prisma.resource.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Recursos de marketing</h1>
          <p className="text-sm text-slate-600">Carga y comparte materiales con los afiliados.</p>
        </div>
        <Button variant="secondary" disabled>
          Nuevo recurso (próximamente)
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recursos disponibles</CardTitle>
          <CardDescription>Archivos y enlaces listos para descargar</CardDescription>
        </CardHeader>
        <div className="space-y-2 p-6 pt-0 text-sm">
          {resources.map((resource) => (
            <div key={resource.id} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
              <div>
                <p className="font-medium text-slate-700">{resource.title}</p>
                <p className="text-xs text-slate-500">{resource.description}</p>
              </div>
              <a href={resource.url} className="text-brand-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Descargar
              </a>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
