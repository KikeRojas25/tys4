# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: crearot.e2e.spec.ts >> Crear OT - E2E >> happy path: llena el formulario y registra la OT marcando "sin recojo"
- Location: e2e\crearot.e2e.spec.ts:177:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForTimeout: Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - progressbar [ref=e6]
  - generic [ref=e15]:
    - img "Logo image" [ref=e18]
    - generic [ref=e21] [cursor=pointer]:
      - img [ref=e22]:
        - img [ref=e23]
      - generic [ref=e26]: Comercial
    - generic [ref=e29] [cursor=pointer]:
      - img [ref=e30]:
        - img [ref=e31]
      - generic [ref=e34]: Estación
    - generic [ref=e37] [cursor=pointer]:
      - img [ref=e38]:
        - img [ref=e39]
      - generic [ref=e42]: Planning
    - generic [ref=e45] [cursor=pointer]:
      - img [ref=e46]:
        - img [ref=e47]
      - generic [ref=e50]: Tráfico
    - generic [ref=e53] [cursor=pointer]:
      - img [ref=e54]:
        - img [ref=e55]
      - generic [ref=e59]: Mantenimientos
    - generic [ref=e62] [cursor=pointer]:
      - img [ref=e63]:
        - img [ref=e64]
      - generic [ref=e67]: Seguridad
    - generic [ref=e70] [cursor=pointer]:
      - img [ref=e71]:
        - img [ref=e72]
      - generic [ref=e75]: Facturación
    - generic [ref=e78] [cursor=pointer]:
      - img [ref=e79]:
        - img [ref=e80]
      - generic [ref=e84]: Reportes
    - generic [ref=e87] [cursor=pointer]:
      - img [ref=e88]:
        - img [ref=e89]
      - generic [ref=e92]: Compras
  - generic [ref=e95]:
    - generic [ref=e96]:
      - button [ref=e97] [cursor=pointer]:
        - img [ref=e98]:
          - img [ref=e99]
      - generic [ref=e103]:
        - button [ref=e105] [cursor=pointer]:
          - img [ref=e106]:
            - img [ref=e107]
        - search [ref=e111]:
          - button [ref=e112] [cursor=pointer]:
            - img [ref=e113]:
              - img [ref=e114]
        - button [ref=e119] [cursor=pointer]:
          - img [ref=e120]:
            - img [ref=e121]
        - button [ref=e126] [cursor=pointer]:
          - img [ref=e127]:
            - img [ref=e128]
        - button [ref=e133] [cursor=pointer]:
          - img [ref=e136]:
            - img [ref=e137]
    - generic [ref=e145]:
      - generic [ref=e147]:
        - generic [ref=e148]:
          - generic [ref=e149]: TMS
          - generic [ref=e150]:
            - img [ref=e151]:
              - img [ref=e152]
            - generic [ref=e154]: Tráfico
          - generic [ref=e155]:
            - img [ref=e156]:
              - img [ref=e157]
            - link "Ordén de Transporte" [ref=e159] [cursor=pointer]:
              - /url: "#/trafico/integrado"
        - heading "Crear OT" [level=2] [ref=e161]
      - generic [ref=e163]:
        - generic [ref=e165]:
          - generic [ref=e167]: Datos generales
          - region "Datos generales" [ref=e168]:
            - generic [ref=e170]:
              - generic [ref=e171]:
                - generic [ref=e172]: Cliente (*)
                - generic [ref=e174] [cursor=pointer]:
                  - combobox "Seleccione un cliente" [active] [ref=e175]
                  - button "dropdown trigger" [ref=e176]:
                    - img [ref=e178]
                - generic [ref=e181]: Requiere seleccionar un cliente.
              - generic [ref=e182]:
                - generic [ref=e183]:
                  - text: Remitente (*)
                  - link "Elegir otro" [ref=e184] [cursor=pointer]:
                    - /url: "#"
                - generic [ref=e186] [cursor=pointer]:
                  - combobox "Seleccione un remitente" [ref=e187]
                  - button "dropdown trigger" [ref=e188]:
                    - img [ref=e190]
              - generic [ref=e192]:
                - generic [ref=e193]:
                  - generic [ref=e194]: "Destinatario (*) :"
                  - link "Elegir otro" [ref=e195] [cursor=pointer]:
                    - /url: "#"
                  - button "Nuevo Destinatario" [ref=e197] [cursor=pointer]:
                    - generic [ref=e198]: Nuevo Destinatario
                - generic [ref=e200] [cursor=pointer]:
                  - combobox "Seleccione un destinatario" [ref=e201]
                  - button "dropdown trigger" [ref=e202]:
                    - img [ref=e204]
              - generic [ref=e206]:
                - generic [ref=e207]: "Origen (*) :"
                - generic [ref=e209] [cursor=pointer]:
                  - combobox [ref=e210]
                  - button "dropdown trigger" [ref=e211]:
                    - img [ref=e213]
              - generic [ref=e215]:
                - generic [ref=e216]: Dirección (*)
                - textbox [ref=e217]
              - generic [ref=e218]:
                - generic [ref=e219]: "Destino :"
                - generic [ref=e221] [cursor=pointer]:
                  - combobox [ref=e222]
                  - button "dropdown trigger" [ref=e223]:
                    - img [ref=e225]
              - generic [ref=e227]:
                - generic [ref=e228]: Dirección
                - textbox [ref=e229]
        - generic [ref=e231]:
          - generic [ref=e233]: Datos del portador
          - region "Datos del portador" [ref=e234]:
            - generic [ref=e236]:
              - generic [ref=e237]:
                - generic [ref=e238]: "Placa de recojo :"
                - generic [ref=e240] [cursor=pointer]:
                  - combobox [ref=e241]
                  - button "dropdown trigger" [ref=e242]:
                    - img [ref=e244]
              - generic [ref=e246]:
                - generic [ref=e247]: "Conductor de recojo :"
                - generic [ref=e249] [cursor=pointer]:
                  - combobox [ref=e250]
                  - button "dropdown trigger" [ref=e251]:
                    - img [ref=e253]
              - generic [ref=e255]:
                - generic [ref=e256]: "Fecha de recojo :"
                - generic [ref=e258]:
                  - combobox [ref=e259]
                  - generic:
                    - img
              - generic [ref=e260]:
                - generic [ref=e261]: "Hora de recojo (*) :"
                - textbox [ref=e263]
              - generic [ref=e264]:
                - generic [ref=e265]: "Guía de recojo (*) :"
                - listbox [ref=e269]:
                  - option [ref=e270]:
                    - textbox [ref=e271]
              - generic [ref=e272]:
                - generic [ref=e273]:
                  - generic [ref=e274]: Orden de Recojo (OR) *
                  - generic [ref=e275]:
                    - generic [ref=e278] [cursor=pointer]:
                      - checkbox "Sin recojo"
                    - generic [ref=e280] [cursor=pointer]: Sin recojo
                - generic [ref=e281]:
                  - textbox "Buscar OR..." [ref=e282]
                  - button [ref=e283] [cursor=pointer]:
                    - generic [ref=e284]: 
        - generic [ref=e286]:
          - generic [ref=e288]: Datos complementarios
          - region "Datos complementarios" [ref=e289]:
            - generic [ref=e291]:
              - generic [ref=e292]:
                - generic [ref=e293]: Cant. Bultos
                - spinbutton [ref=e296]
              - generic [ref=e297]:
                - generic [ref=e298]: Peso Kg.
                - spinbutton [ref=e301]
              - generic [ref=e302]:
                - generic [ref=e303]: Volumen m3
                - spinbutton [ref=e306]
              - generic [ref=e307]:
                - generic [ref=e308]: Peso Vol
                - spinbutton [ref=e311]
              - generic [ref=e312]:
                - generic [ref=e313]: "Fórmula :"
                - generic [ref=e315] [cursor=pointer]:
                  - combobox [ref=e316]
                  - button "dropdown trigger" [ref=e317]:
                    - img [ref=e319]
              - generic [ref=e321]:
                - generic [ref=e322]: "Medio de transporte :"
                - generic [ref=e324] [cursor=pointer]:
                  - combobox [ref=e325]
                  - button "dropdown trigger" [ref=e326]:
                    - img [ref=e328]
              - generic [ref=e330]:
                - generic [ref=e331]: "Concepto de cobro :"
                - generic [ref=e333] [cursor=pointer]:
                  - combobox [ref=e334]
                  - button "dropdown trigger" [ref=e335]:
                    - img [ref=e337]
              - generic [ref=e339]:
                - generic [ref=e340]: "Mercadería especial :"
                - generic [ref=e342] [cursor=pointer]:
                  - combobox [ref=e343]
                  - button "dropdown trigger" [ref=e344]:
                    - img [ref=e346]
              - generic [ref=e348]:
                - generic [ref=e349]: "Referencia :"
                - textbox [ref=e350]
              - generic [ref=e351]:
                - generic [ref=e352]: "Descripción de Mercadería :"
                - textbox [ref=e353]
              - generic [ref=e354]:
                - generic [ref=e355]: "GRR (Guías de remitente) :"
                - button "Generar GRRs Masivas..." [ref=e359] [cursor=pointer]:
                  - generic [ref=e360]: Generar GRRs Masivas...
        - generic [ref=e362]:
          - generic [ref=e364]: ¿Como lo almaceno?
          - region "¿Como lo almaceno?" [ref=e365]:
            - generic [ref=e367]:
              - button "Agregar etiqueta" [ref=e370] [cursor=pointer]:
                - generic [ref=e371]: Agregar etiqueta
              - table [ref=e376]:
                - rowgroup [ref=e377]:
                  - row "Acc Tipo Cantidad" [ref=e378]:
                    - columnheader "Acc" [ref=e379]
                    - columnheader "Tipo" [ref=e380]
                    - columnheader "Cantidad" [ref=e381]
                - rowgroup
        - generic [ref=e383]:
          - generic [ref=e385]: Valorizado
          - region "Valorizado" [ref=e386]:
            - generic [ref=e387]:
              - generic [ref=e388]:
                - button "Refrescar" [ref=e390] [cursor=pointer]:
                  - generic [ref=e391]: Refrescar
                - generic [ref=e394]:
                  - generic [ref=e395]: Subtotal
                  - generic [ref=e396]: S/.
              - paragraph [ref=e399]:
                - generic:
                  - button "Guardar" [disabled]
                - button "Cancel" [ref=e401] [cursor=pointer]
    - generic [ref=e403]: TYS © 2026
```

# Test source

```ts
  1   | import { test, expect, Page, Route } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * E2E del caso de uso: Crear OT.
  5   |  *
  6   |  * Pre-requisitos:
  7   |  *   1. Backend corriendo en http://localhost:5000 (ver src/environments/environment.ts).
  8   |  *   2. Frontend corriendo en http://localhost:4200 (`npm start`).
  9   |  *   3. Ejecutar: `npx playwright test`
  10  |  *
  11  |  * El test hace login REAL contra el backend con las credenciales `erojas` / `123456`,
  12  |  * usa los dropdowns reales (selecciona la primera opción disponible para no atarse a IDs)
  13  |  * y mockea SOLO `registerOT` para no crear órdenes reales en cada corrida.
  14  |  *
  15  |  * Si querés que el registro vaya al backend real, comentá el `page.route(/registerOT/...)`.
  16  |  */
  17  | 
  18  | const CREDENCIALES = {
  19  |   email: 'erojas',
  20  |   password: '123456',
  21  | };
  22  | 
  23  | // La app usa HashLocationStrategy (`withHashLocation()` en app.config.ts).
  24  | // Por eso TODA navegación tiene que ir con `/#/...`. Sin el `#`, el router de Angular
  25  | // no detecta el path y termina cayendo en la ruta default `''` → `/example`.
  26  | const HASH = '/#';
  27  | 
  28  | /** Devuelve si la URL actual apunta al sign-in (con hash o sin hash, por las dudas). */
  29  | function isAtSignIn(url: string): boolean {
  30  |   return /\/#\/sign-in|\/sign-in/.test(url);
  31  | }
  32  | 
  33  | /** Hace login vía UI y deja la sesión lista para navegar a páginas autenticadas. */
  34  | async function signIn(page: Page): Promise<void> {
  35  |   await page.goto(`${HASH}/sign-in`);
  36  |   await page.locator('#email').fill(CREDENCIALES.email);
  37  |   await page.locator('#password').fill(CREDENCIALES.password);
  38  |   await page.getByRole('button', { name: /Entrar/i }).click();
  39  | 
  40  |   // Tras login, el AuthService hace `navigateByUrl('/signed-in-redirect')` → `/example`.
  41  |   // Con hash routing, esperamos que el hash deje de ser `#/sign-in`.
  42  |   await page.waitForFunction(() => !/#\/sign-in/.test(window.location.href), null, {
  43  |     timeout: 30_000,
  44  |   });
  45  | 
  46  |   // Esperar a que la app post-login termine la carga inicial.
  47  |   await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
  48  | }
  49  | 
  50  | /** Navega al CrearOT, espera el formulario y a que la carga de dropdowns termine. */
  51  | async function gotoCrearOT(page: Page): Promise<void> {
  52  |   // Suscribimos al response ANTES de navegar — `cargarDropDows()` dispara estas
  53  |   // llamadas en paralelo en ngOnInit y necesitamos saber cuándo terminan para que
  54  |   // los dropdowns tengan opciones cuando el test las clickea.
  55  |   const waitForClientes = page
  56  |     .waitForResponse(
  57  |       (resp) => /GetAllClientes/.test(resp.url()) && resp.status() < 400,
  58  |       { timeout: 30_000 },
  59  |     )
  60  |     .catch(() => null);
  61  | 
  62  |   await page.goto(`${HASH}/seguimientoot/crearot`, { waitUntil: 'domcontentloaded' });
  63  | 
  64  |   // Si nos rebotó a sign-in, fallamos con mensaje claro.
  65  |   const url = page.url();
  66  |   if (isAtSignIn(url)) {
  67  |     throw new Error(
  68  |       `Tras navegar a /#/seguimientoot/crearot la app rebotó a ${url}. ` +
  69  |         `Probablemente el AuthGuard rechazó la sesión (token expirado o no persistido).`,
  70  |     );
  71  |   }
  72  | 
  73  |   await expect(page.getByTestId('ot-form')).toBeVisible({ timeout: 30_000 });
  74  | 
  75  |   // Esperar a que GetAllClientes responda — buena señal de que el forkJoin terminó.
  76  |   await waitForClientes;
  77  |   // Margen extra para que Angular procese la respuesta y rellene los dropdowns.
  78  |   await page.waitForTimeout(500);
  79  | }
  80  | 
  81  | /**
  82  |  * Selecciona la primera opción disponible de un p-dropdown identificado por data-testid.
  83  |  * Defensivo: si al abrir el panel no hay opciones aún (data del backend en vuelo), cierra,
  84  |  * espera y reintenta hasta `timeout`.
  85  |  */
  86  | async function selectFirstOption(page: Page, testId: string, timeout = 30_000): Promise<void> {
  87  |   const dropdown = page.getByTestId(testId);
  88  |   const items = page.locator('.p-dropdown-items .p-dropdown-item');
  89  |   const start = Date.now();
  90  | 
  91  |   while (Date.now() - start < timeout) {
  92  |     await dropdown.click();
  93  |     // Esperar un instante a que el panel se renderice.
  94  |     try {
  95  |       await items.first().waitFor({ state: 'visible', timeout: 1500 });
  96  |       await items.first().click();
  97  |       return;
  98  |     } catch {
  99  |       // Sin opciones todavía: cerrar el panel y reintentar.
  100 |       await page.keyboard.press('Escape');
> 101 |       await page.waitForTimeout(500);
      |                  ^ Error: page.waitForTimeout: Test timeout of 30000ms exceeded.
  102 |     }
  103 |   }
  104 |   throw new Error(`El dropdown "${testId}" no se pobló en ${timeout}ms.`);
  105 | }
  106 | 
  107 | /**
  108 |  * Setea valores del FormGroup vía la API de debug de Angular (`window.ng.getComponent`).
  109 |  * Útil para controles que son frágiles desde el DOM (p-calendar, p-inputMask), donde
  110 |  * tipear strings no siempre logra disparar el parseo a Date / aplicar la máscara.
  111 |  */
  112 | async function patchForm(page: Page, values: Record<string, unknown>): Promise<void> {
  113 |   const ok = await page.evaluate((vals) => {
  114 |     const ng = (window as any).ng;
  115 |     const host = document.querySelector('app-crearot');
  116 |     const cmp = ng?.getComponent?.(host);
  117 |     if (!cmp?.form) return false;
  118 |     cmp.form.patchValue(vals);
  119 |     Object.keys(vals).forEach((k) => cmp.form.get(k)?.markAsDirty());
  120 |     return true;
  121 |   }, values);
  122 |   if (!ok) {
  123 |     throw new Error('No se pudo patchear el FormGroup vía window.ng — ¿la app está en modo prod?');
  124 |   }
  125 | }
  126 | 
  127 | /**
  128 |  * Si el botón Guardar sigue disabled tras llenar el form, lanza un error con la lista
  129 |  * de campos que aún están en estado inválido. Útil para diagnosticar qué falta.
  130 |  */
  131 | async function assertFormValido(page: Page): Promise<void> {
  132 |   const enabled = await page.getByTestId('ot-btn-guardar').isEnabled();
  133 |   if (enabled) return;
  134 | 
  135 |   const invalidos = await page.evaluate(() => {
  136 |     const form = (window as any).ng?.getComponent?.(document.querySelector('app-crearot'))?.form;
  137 |     if (!form) return ['(no se pudo acceder al FormGroup vía window.ng)'];
  138 |     return Object.keys(form.controls).filter((k) => form.controls[k].invalid);
  139 |   });
  140 |   throw new Error(
  141 |     `El botón "Guardar" sigue disabled — el form no es válido. Campos inválidos: ${invalidos.join(', ')}`,
  142 |   );
  143 | }
  144 | 
  145 | /** Mockea el endpoint registerOT para no crear órdenes reales. Devuelve los payloads capturados. */
  146 | async function mockRegisterOT(
  147 |   page: Page,
  148 |   response: { validado: boolean; idordentrabajo: number; numcp: string; mensaje?: string },
  149 | ): Promise<{ calls: any[] }> {
  150 |   const calls: any[] = [];
  151 |   await page.route(/\/api\/Orden\/registerOT/, async (route: Route) => {
  152 |     calls.push(route.request().postDataJSON());
  153 |     await route.fulfill({
  154 |       status: 200,
  155 |       contentType: 'application/json',
  156 |       headers: { 'Access-Control-Allow-Origin': '*' },
  157 |       body: JSON.stringify(response),
  158 |     });
  159 |   });
  160 |   return { calls };
  161 | }
  162 | 
  163 | test.describe('Crear OT - E2E', () => {
  164 |   test.beforeEach(async ({ page }) => {
  165 |     // Cerrar las ventanas de reportes que abre el componente al registrar (window.open).
  166 |     page.on('popup', (popup) => popup.close().catch(() => {}));
  167 |   });
  168 | 
  169 |   test('login y carga de la pantalla Crear OT', async ({ page }) => {
  170 |     await signIn(page);
  171 |     await gotoCrearOT(page);
  172 | 
  173 |     await expect(page.getByTestId('ot-cliente')).toBeVisible();
  174 |     await expect(page.getByTestId('ot-btn-guardar')).toBeVisible();
  175 |   });
  176 | 
  177 |   test('happy path: llena el formulario y registra la OT marcando "sin recojo"', async ({ page }) => {
  178 |     await signIn(page);
  179 | 
  180 |     const { calls: registerCalls } = await mockRegisterOT(page, {
  181 |       validado: true,
  182 |       idordentrabajo: 1234,
  183 |       numcp: 'OT-1234',
  184 |     });
  185 | 
  186 |     await gotoCrearOT(page);
  187 | 
  188 |     // ----- Datos generales -----
  189 |     // Cliente: primera opción disponible. `cargarDestinatario()` lo copiará a remitente/destinatario.
  190 |     await selectFirstOption(page, 'ot-cliente');
  191 | 
  192 |     await selectFirstOption(page, 'ot-origen');
  193 |     await page.getByTestId('ot-puntopartida').fill('Av. Argentina 123');
  194 | 
  195 |     await selectFirstOption(page, 'ot-destino');
  196 |     await page.getByTestId('ot-puntollegada').fill('Calle Lima 456');
  197 | 
  198 |     // ----- Datos del portador -----
  199 |     await selectFirstOption(page, 'ot-vehiculo');
  200 |     await selectFirstOption(page, 'ot-chofer');
  201 | 
```