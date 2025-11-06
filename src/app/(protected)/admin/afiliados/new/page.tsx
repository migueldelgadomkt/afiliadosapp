import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NewAffiliatePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Alta de afiliado</CardTitle>
          <CardDescription>Completa los datos del nuevo afiliado.</CardDescription>
        </CardHeader>
        <form className="space-y-4 p-6 pt-0">
          <div>
            <label className="text-sm font-medium text-slate-700">Nombre público</label>
            <Input name="displayName" placeholder="Ej. Eventos Luna" required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Correo electrónico</label>
            <Input name="email" type="email" placeholder="afiliado@correo.com" required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Ubicación</label>
            <Input name="location" placeholder="Ciudad" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Tipo de servicio</label>
            <Input name="serviceType" placeholder="Planner, Fotógrafo, etc." />
          </div>
          <Button type="submit" disabled>
            Guardar (conectar API)
          </Button>
        </form>
      </Card>
    </div>
  );
}
