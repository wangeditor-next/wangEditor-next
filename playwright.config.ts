import { defineConfig, devices } from '@playwright/test'

let webServerCommand = 'pnpm turbo build --filter=@wangeditor-next/editor && pnpm --filter @wangeditor-next/demo-html run serve'

if (process.env.PLAYWRIGHT_SKIP_BUILD) {
  webServerCommand = 'pnpm --filter @wangeditor-next/demo-html run serve'
} else if (process.env.CI) {
  webServerCommand = 'pnpm turbo build --force --filter=@wangeditor-next/editor && pnpm --filter @wangeditor-next/demo-html run serve'
}

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
    command: webServerCommand,
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
