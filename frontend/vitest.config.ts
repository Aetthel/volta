import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // `.next/**` incluye el bundle standalone, que trae dentro los tests de
    // dependencias como pg-protocol o la telemetría de Next: sin excluirlo, la
    // suite falla en cuanto alguien ha ejecutado `next build`.
    exclude: ["e2e/**", "node_modules/**", ".next/**", "playwright-report/**"],
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
