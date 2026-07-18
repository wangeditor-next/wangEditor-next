import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e/yjs',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  workers: 1,
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'pnpm --filter @wangeditor-next/demo-yjs-react run dev:server',
      url: 'http://127.0.0.1:1234',
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command:
        'pnpm --filter @wangeditor-next/demo-yjs-react exec vite preview --host 127.0.0.1 --port 3111 --strictPort',
      url: 'http://127.0.0.1:3111',
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command:
        'pnpm --filter @wangeditor-next/demo-yjs-vue3 exec vite preview --host 127.0.0.1 --port 3112 --strictPort',
      url: 'http://127.0.0.1:3112',
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command:
        'pnpm exec vite preview tests/fixtures/yjs-native --host 127.0.0.1 --port 3110 --strictPort',
      url: 'http://127.0.0.1:3110',
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
  projects: [
    {
      name: 'chromium-yjs',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
