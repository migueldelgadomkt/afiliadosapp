import { test, expect } from '@playwright/test';

test.describe('Flujo de login', () => {
  test.skip(true, 'Las pruebas E2E requieren entorno desplegado con dependencias.');

  test('permite iniciar sesión con superadmin', async ({ page }) => {
    await page.goto(process.env.E2E_BASE_URL ?? 'http://localhost:3000/login');
    await page.fill('input[name="email"]', 'admin@invitado.mx');
    await page.fill('input[name="password"]', 'Passw0rd!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
  });
});
