import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  ],
  // Start both servers before tests
  webServer: [
    {
      command: 'npx json-server ../db.json --port 3000',
      port: 3000,
      reuseExistingServer: !process.env['CI'],
    },
    {
      command: 'npx ng serve --port 4200',
      port: 4200,
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
    },
  ],
});
