import { describe, expect, it } from 'vitest';
import { affiliateUpsertSchema } from '@/lib/server-actions';

describe('affiliateUpsertSchema', () => {
  it('valida datos mínimos', () => {
    const result = affiliateUpsertSchema.safeParse({
      email: 'test@example.com',
      displayName: 'Afiliado Demo'
    });

    expect(result.success).toBe(true);
  });

  it('rechaza email inválido', () => {
    const result = affiliateUpsertSchema.safeParse({
      email: 'invalid-email',
      displayName: 'Afiliado Demo'
    });

    expect(result.success).toBe(false);
  });
});
