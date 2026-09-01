# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: zz-shot.spec.ts >> captura de disponibilidad
- Location: e2e\zz-shot.spec.ts:4:5

# Error details

```
TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
Call log:
  - waiting for getByText('Disponibilidad', { exact: true }) to be visible

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]
  - generic [ref=e12]:
    - complementary [ref=e13]:
      - generic "Mi Negocio" [ref=e15] [cursor=pointer]:
        - generic [ref=e16]:
          - generic [ref=e18]: M
          - generic [ref=e19]:
            - generic [ref=e20]: Mi Negocio
            - generic [ref=e21]: Plan Pro
        - img [ref=e22]
      - generic [ref=e24]:
        - generic [ref=e25]:
          - generic [ref=e26]: Principal
          - generic [ref=e28] [cursor=pointer]:
            - generic [ref=e29]:
              - img [ref=e31]
              - generic [ref=e34]: Buscar
            - generic [ref=e36]: Nuevo
          - link "Control Global" [ref=e38] [cursor=pointer]:
            - /url: /admin
            - generic [ref=e40]:
              - img [ref=e42]
              - generic [ref=e44]: Control Global
          - link "Locales" [ref=e46] [cursor=pointer]:
            - /url: /sedes
            - generic [ref=e48]:
              - img [ref=e50]
              - generic [ref=e54]: Locales
        - generic [ref=e55]:
          - generic [ref=e56]: Ajustes
          - link "Preferencias" [ref=e58] [cursor=pointer]:
            - /url: /ajustes
            - generic [ref=e60]:
              - img [ref=e62]
              - generic [ref=e65]: Preferencias
    - main [ref=e69]:
      - generic [ref=e70]:
        - generic [ref=e72]:
          - generic [ref=e73]:
            - heading "Preferencias" [level=1] [ref=e75]
            - generic [ref=e76]: Selecciona una sección para configurar tu cuenta, personalizar el sistema o gestionar tu negocio.
          - generic [ref=e79]:
            - button "Notificaciones" [ref=e81] [cursor=pointer]:
              - img [ref=e82]
            - button "Ayuda" [ref=e85] [cursor=pointer]:
              - img [ref=e86]
            - button [ref=e90] [cursor=pointer]:
              - img [ref=e92]
        - generic [ref=e95]:
          - button "Cuenta de Usuario Perfil y Seguridad Datos personales, correo electrónico, foto de perfil y actualización de contraseña. Nombre y correo electrónico Foto y avatar de usuario Actualización de contraseña" [ref=e96] [cursor=pointer]:
            - generic [ref=e98]:
              - generic [ref=e99]:
                - img [ref=e101]
                - generic [ref=e104]: Cuenta de Usuario
              - heading "Perfil y Seguridad" [level=2] [ref=e105]:
                - generic [ref=e106]: Perfil y Seguridad
              - paragraph [ref=e107]: Datos personales, correo electrónico, foto de perfil y actualización de contraseña.
              - generic [ref=e108]:
                - generic [ref=e109]:
                  - img [ref=e110]
                  - generic [ref=e113]: Nombre y correo electrónico
                - generic [ref=e114]:
                  - img [ref=e115]
                  - generic [ref=e118]: Foto y avatar de usuario
                - generic [ref=e119]:
                  - img [ref=e120]
                  - generic [ref=e123]: Actualización de contraseña
          - button "Planes y Pagos Facturación y Suscripción Plan activo, detalles del ciclo de suscripción, métodos de pago y facturas descargables. Gestión de Plan Básico y Plan Pro Método de pago vinculado Historial de facturas descargables en PDF" [ref=e124] [cursor=pointer]:
            - generic [ref=e126]:
              - generic [ref=e127]:
                - img [ref=e129]
                - generic [ref=e131]: Planes y Pagos
              - heading "Facturación y Suscripción" [level=2] [ref=e132]:
                - generic [ref=e133]: Facturación y Suscripción
              - paragraph [ref=e134]: Plan activo, detalles del ciclo de suscripción, métodos de pago y facturas descargables.
              - generic [ref=e135]:
                - generic [ref=e136]:
                  - img [ref=e137]
                  - generic [ref=e140]: Gestión de Plan Básico y Plan Pro
                - generic [ref=e141]:
                  - img [ref=e142]
                  - generic [ref=e145]: Método de pago vinculado
                - generic [ref=e146]:
                  - img [ref=e147]
                  - generic [ref=e150]: Historial de facturas descargables en PDF
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | // Captura temporal para revisar la maquetación de Ajustes > Negocio.
  4  | test("captura de disponibilidad", async ({ page }) => {
  5  |   await page.setViewportSize({ width: 1500, height: 1100 });
  6  | 
  7  |   await page.goto("/login");
  8  |   await page.fill('input[type="email"]', process.env.ADMIN_EMAIL!);
  9  |   await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD!);
  10 |   await page.click('button[type="submit"]');
  11 | 
  12 |   await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30000 });
  13 | 
  14 |   await page.goto("/ajustes");
  15 |   await page.waitForLoadState("networkidle");
  16 | 
  17 |   // La tarjeta nueva
  18 |   const card = page.getByText("Disponibilidad", { exact: true });
> 19 |   await card.waitFor({ timeout: 20000 });
     |              ^ TimeoutError: locator.waitFor: Timeout 20000ms exceeded.
  20 |   await page.waitForTimeout(1500);
  21 | 
  22 |   const container = page.locator("div").filter({ hasText: /^Disponibilidad/ }).first();
  23 |   await container.screenshot({ path: "disponibilidad.png" });
  24 | 
  25 |   // Alturas reales de cada columna, para comprobar el reparto
  26 |   const heights = await page.evaluate(() => {
  27 |     const grid = document.querySelector(".lg\\:grid-cols-2");
  28 |     if (!grid) return null;
  29 |     return Array.from(grid.children).map((c) => Math.round(c.getBoundingClientRect().height));
  30 |   });
  31 |   console.log("ALTURAS_COLUMNAS=" + JSON.stringify(heights));
  32 | });
  33 | 
```