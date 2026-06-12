import { test, expect, Page } from '@playwright/test';

/**
 * E2E (smoke test) de Crear OT.
 *
 * SCOPE INTENCIONALMENTE ACOTADO:
 *   - Verifica login + ruta protegida + lazy-load del componente + render del form.
 *   - NO valida el flujo completo de llenado/registro: eso vive en el unit test
 *     `crearot.component.spec.ts` (Jasmine + TestBed), que es mucho más confiable
 *     para lógica de form/validación que un E2E con PrimeNG (dropdowns en portales,
 *     p-calendar, p-inputMask, dependencias entre campos, etc.).
 *
 * Pre-requisitos:
 *   1. Backend en http://localhost:5000.
 *   2. Frontend en http://localhost:4200 (`npm start`).
 *   3. Usuario `erojas` / `123456` válido en el backend.
 *   4. Ejecutar: `npx playwright test`.
 */

const CREDENCIALES = { email: 'erojas', password: '123456' };

// La app usa HashLocationStrategy (`withHashLocation()` en app.config.ts).
const HASH = '/#';

async function signIn(page: Page): Promise<void> {
  await page.goto(`${HASH}/sign-in`);
  await page.locator('#email').fill(CREDENCIALES.email);
  await page.locator('#password').fill(CREDENCIALES.password);
  await page.getByRole('button', { name: /Entrar/i }).click();

  await page.waitForFunction(() => !/#\/sign-in/.test(window.location.href), null, {
    timeout: 30_000,
  });
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
}

test.describe('Crear OT - smoke E2E', () => {
  test('login y carga de la pantalla Crear OT', async ({ page }) => {
    await signIn(page);

    await page.goto(`${HASH}/seguimientoot/crearot`, { waitUntil: 'domcontentloaded' });

    // Si nos rebotó a sign-in, fallamos con mensaje claro.
    expect(page.url(), 'no debería rebotar a sign-in').not.toMatch(/\/sign-in/);

    // El form y los controles clave deben renderizarse.
    await expect(page.getByTestId('ot-form')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('ot-cliente')).toBeVisible();
    await expect(page.getByTestId('ot-vehiculo')).toBeVisible();
    await expect(page.getByTestId('ot-btn-guardar')).toBeVisible();

    // Sanity check: el título "Crear OT" está en pantalla.
    await expect(page.getByRole('heading', { name: /Crear OT/i })).toBeVisible();
  });
});
