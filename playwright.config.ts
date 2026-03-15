import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://127.0.0.1:8881',
    testIdAttribute: 'data-testid',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm turbo build --filter=@wangeditor-next/editor && pnpm -C packages/editor exec http-server -p 8881 -c-1',
    url: 'http://127.0.0.1:8881/examples/default-mode.html',
    reuseExistingServer: false,
    stdout: 'inherit',
    stderr: 'inherit',
    timeout: 180_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
