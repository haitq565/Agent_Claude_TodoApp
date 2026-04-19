import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const appRoot = path.resolve(__dirname, '../todo-app');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 1,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Disable CSS animations so Angular Material ripple overlay doesn't block clicks in headed Firefox
    reducedMotion: 'reduce',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: [
    {
      command: 'npx json-server db.json --port 3000',
      cwd: appRoot,
      port: 3000,
      reuseExistingServer: !process.env['CI'],
    },
    {
      command: 'npx ng serve --port 4200',
      cwd: appRoot,
      port: 4200,
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
    },
  ],
});
