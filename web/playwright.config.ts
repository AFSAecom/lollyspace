import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  use: { baseURL: 'http://localhost:4173', headless: true },
  webServer: { command: 'npm run preview', port: 4173, reuseExistingServer: !process.env.CI, timeout: 60_000 },
  reporter: [['line'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
});
