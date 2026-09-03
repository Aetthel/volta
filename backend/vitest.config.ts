import { defineConfig } from "vitest/config";

import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    alias: {
      "@jest/globals": path.resolve(__dirname, "./src/tests/jest-globals-compat.ts"),
    },
  },
});
