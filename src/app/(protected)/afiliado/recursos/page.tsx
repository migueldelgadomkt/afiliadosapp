import { prisma } from '@/lib/prisma';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AffiliateResourcesPage() {
  const resources = await prisma.resource.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Recursos</h1>
        <p className="text-sm text-slate-600">Descarga materiales oficiales de Invitado.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Biblioteca</CardTitle>
          <CardDescription>Logos, guías y archivos listos para usar</CardDescription>
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
