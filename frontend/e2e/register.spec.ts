import { test, expect } from "@playwright/test";

test.describe("Registration E2E Flow", () => {
  test("user can navigate through register steps 1 to 4", async ({ page }) => {
    await page.goto("/register");

    // Step 1: Sector selection
    await expect(
      page.getByRole("heading", { name: /¿A qué sector pertenece tu negocio\?/i })
    ).toBeVisible();
    await page.getByText("Peluquería").click();
    await page.getByRole("button", { name: "Siguiente" }).click();

    // Step 2: Business details
    await expect(
      page.getByRole("heading", { name: /Detalles de tu establecimiento/i })
    ).toBeVisible();
    await page.getByPlaceholder(/Salón Volta/i).fill("Estudio E2E Volta");
    await page.getByPlaceholder(/600 000 000/i).fill("+34600111222");
    await page.getByRole("button", { name: "Siguiente" }).click();

    // Step 3: Account details
    await expect(
      page.getByRole("heading", { name: /Crea tu cuenta de administrador/i })
    ).toBeVisible();
    await page.getByPlaceholder(/Laura García/i).fill("Usuario Test E2E");
    await page.getByPlaceholder(/ejemplo@negocio.com/i).fill(`test.e2e.${Date.now()}@volta.es`);
    await page.getByPlaceholder("••••••••").first().fill("Password123!");
    await page.getByPlaceholder("••••••••").nth(1).fill("Password123!");
  });
});
