import { test, expect } from "@playwright/test";

// Captura temporal para revisar la maquetación de Ajustes > Negocio.
test("captura de disponibilidad", async ({ page }) => {
  await page.setViewportSize({ width: 1500, height: 1100 });

  await page.goto("/login");
  await page.fill('input[type="email"]', process.env.ADMIN_EMAIL!);
  await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD!);
  await page.click('button[type="submit"]');

  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30000 });

  await page.goto("/ajustes");
  await page.waitForLoadState("networkidle");

  // La tarjeta nueva
  const card = page.getByText("Disponibilidad", { exact: true });
  await card.waitFor({ timeout: 20000 });
  await page.waitForTimeout(1500);

  const container = page.locator("div").filter({ hasText: /^Disponibilidad/ }).first();
  await container.screenshot({ path: "disponibilidad.png" });

  // Alturas reales de cada columna, para comprobar el reparto
  const heights = await page.evaluate(() => {
    const grid = document.querySelector(".lg\\:grid-cols-2");
    if (!grid) return null;
    return Array.from(grid.children).map((c) => Math.round(c.getBoundingClientRect().height));
  });
  console.log("ALTURAS_COLUMNAS=" + JSON.stringify(heights));
});
