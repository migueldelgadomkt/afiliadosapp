import { describe, expect, it } from 'vitest';
import { toCsv } from '@/lib/csv';

describe('toCsv', () => {
  it('convierte objetos en CSV', () => {
    const csv = toCsv([
      { id: 1, nombre: 'Ana', estado: 'Activo' },
      { id: 2, nombre: 'Luis', estado: 'Inactivo' }
    ]);

    expect(csv).toContain('id,nombre,estado');
    expect(csv).toContain('1,Ana,Activo');
  });

  it('escapa comas y saltos de línea', () => {
    const csv = toCsv([{ descripcion: 'Linea 1, con coma\ny salto' }]);
    expect(csv).toBe('descripcion\n"Linea 1, con coma\ny salto"');
  });
});
