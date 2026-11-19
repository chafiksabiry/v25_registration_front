import { defineConfig } from '@playwright/test';

// Port dédié aux tests (modifiable par E2E_PORT). Le serveur est lancé et arrêté par Playwright lui-même.
const PORT = Number(process.env.E2E_PORT || 5291);

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH, args: ['--no-sandbox'] } : undefined,
  },
  webServer: {
    command: `npx vite build --outDir dist-e2e && npx vite preview --outDir dist-e2e --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/auth/signin`,
    reuseExistingServer: false,
    timeout: 240_000,
    env: {
      // Le paquet doit être servi par ce serveur local, pas par un site Netlify distant.
      VITE_MF_BASE_URL: `http://localhost:${PORT}`,
      VITE_API_URL: 'http://reg.test/api',
      VITE_COMPANY_API_URL: 'http://company.test/api',
      VITE_COMPORCHESTRATOR_BACK_URL: 'http://company.test',
    },
  },
});
