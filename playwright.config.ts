import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const LOCAL_BASE_URL = `http://localhost:${PORT}/studies/`
const REMOTE_BASE_URL = process.env.PLAYWRIGHT_BASE_URL
const BASE_URL = REMOTE_BASE_URL || LOCAL_BASE_URL
const IS_REMOTE = !!REMOTE_BASE_URL

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  outputDir: 'test-results',

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  expect: {
    timeout: 5_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
  ],

  ...(IS_REMOTE
    ? {}
    : {
        webServer: {
          command: `pnpm dev --port ${PORT} --strictPort`,
          url: BASE_URL,
          timeout: 180_000,
          reuseExistingServer: !process.env.CI,
          stdout: 'ignore',
          stderr: 'pipe',
        },
      }),
})
