import { defineConfig } from "@playwright/test";

/**
 * Pruebas e2e del Modo aventura. Usa el Chrome instalado (sin descargar
 * navegadores) y el servidor de desarrollo, que expone los ganchos de
 * depuración (window.__ADVENTURE__) solo fuera de producción.
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3101",
    channel: "chrome",
    headless: true,
  },
  webServer: {
    command: "npx next dev -p 3101",
    url: "http://localhost:3101",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
