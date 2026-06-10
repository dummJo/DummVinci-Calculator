import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Native tsconfig "paths" resolution (Vite ≥ 7) — replaces the deprecated
    // vite-tsconfig-paths plugin that printed a warning on every test run.
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
  },
});
