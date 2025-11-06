import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AffiliateProfilePage() {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    throw new Error('No autorizado');
  }

  const affiliate = await prisma.affiliateProfile.findUnique({
    where: { userId: session.user.id },
    include: { socialLinks: true }
  });

  if (!affiliate) {
    throw new Error('Afiliado no encontrado');
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Actualiza tus datos de contacto</CardDescription>
        </CardHeader>
        <div className="space-y-3 p-6 pt-0 text-sm text-slate-600">
          <p>
            <strong>Nombre público:</strong> {affiliate.displayName}
          </p>
          <p>
            <strong>Ubicación:</strong> {affiliate.location ?? 'N/A'}
          </p>
          <p>
            <strong>Tipo de servicio:</strong> {affiliate.serviceType ?? 'N/A'}
          </p>
          <p>
            <strong>WhatsApp:</strong> {affiliate.whatsapp ?? 'N/A'}
          </p>
          <p>
            <strong>Correo público:</strong> {affiliate.emailPublic ?? 'N/A'}
          </p>
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Redes sociales</CardTitle>
          <CardDescription>Comparte tus enlaces principales</CardDescription>
        </CardHeader>
        <div className="space-y-2 p-6 pt-0 text-sm">
          {affiliate.socialLinks.map((link) => (
            <div key={link.id} className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span className="font-medium text-slate-600">{link.platform}</span>
              <a href={link.url} className="text-brand-600 hover:underline">
                {link.url}
              </a>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
