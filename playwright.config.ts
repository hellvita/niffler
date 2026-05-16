import { defineConfig, devices } from '@playwright/test';

// In WSL2, the Windows-hosted Next.js server is accessible at the WSL2 gateway
// rather than localhost. Set PLAYWRIGHT_BASE_URL to override (e.g. http://192.168.240.1:3000).
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const usingExternalServer = BASE_URL !== 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  ...(usingExternalServer
    ? {}
    : {
        webServer: {
          command: 'npm run dev',
          url: 'http://localhost:3000',
          reuseExistingServer: true,
          timeout: 60_000,
        },
      }),
});
