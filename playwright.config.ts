import { defineConfig, devices } from '@playwright/test'

let webServerCommand = 'pnpm turbo build --filter=@wangeditor-next/editor --filter=@wangeditor-next/plugin-markdown && pnpm --filter @wangeditor-next/demo-html run serve'
const reactDemoDevCommand = 'pnpm --filter @wangeditor-next/demo-react exec vite --host 127.0.0.1 --port 3102 --strictPort'
const vue3DemoDevCommand = 'pnpm --filter @wangeditor-next/demo-vue3 exec vite --force --host 127.0.0.1 --port 3103 --strictPort'
const reactDemoPreviewCommand = 'pnpm turbo build --filter=@wangeditor-next/editor-for-react --filter=@wangeditor-next/demo-react && pnpm --filter @wangeditor-next/demo-react exec vite preview --host 127.0.0.1 --port 3102 --strictPort'
const vue3DemoPreviewCommand = 'pnpm turbo build --filter=@wangeditor-next/demo-vue3 && pnpm --filter @wangeditor-next/demo-vue3 exec vite preview --host 127.0.0.1 --port 3103 --strictPort'
let reactDemoCommand = reactDemoDevCommand
let vue3DemoCommand = vue3DemoDevCommand

if (process.env.PLAYWRIGHT_SKIP_BUILD) {
  // CI e2e sets PLAYWRIGHT_SKIP_BUILD=1 and prebuilds only part of packages.
  // Keep this lightweight but ensure plugin-markdown dist exists for markdown demos.
  webServerCommand = 'pnpm turbo build --filter=@wangeditor-next/plugin-markdown && pnpm --filter @wangeditor-next/demo-html run serve'
} else if (process.env.CI) {
  webServerCommand = 'pnpm turbo build --force --filter=@wangeditor-next/editor --filter=@wangeditor-next/plugin-markdown && pnpm --filter @wangeditor-next/demo-html run serve'
}

if (process.env.PLAYWRIGHT_WRAPPER_PREVIEW === '1') {
  reactDemoCommand = reactDemoPreviewCommand
  vue3DemoCommand = vue3DemoPreviewCommand
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
  webServer: [
    {
      command: webServerCommand,
      url: 'http://127.0.0.1:8881/examples/default-mode.html',
      reuseExistingServer: true,
      stdout: 'inherit',
      stderr: 'inherit',
      timeout: 180_000,
    },
    {
      command: reactDemoCommand,
      url: 'http://127.0.0.1:3102',
      reuseExistingServer: true,
      stdout: 'inherit',
      stderr: 'inherit',
      timeout: process.env.CI ? 180_000 : 120_000,
    },
    {
      command: vue3DemoCommand,
      url: 'http://127.0.0.1:3103',
      reuseExistingServer: true,
      stdout: 'inherit',
      stderr: 'inherit',
      timeout: process.env.CI ? 180_000 : 120_000,
    },
  ],
  projects: (() => {
    const projects: any[] = [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
        testIgnore: ['**/*.smoke.spec.ts', '**/*.perf.spec.ts'],
      },
    ]

    if (process.env.PLAYWRIGHT_CROSS_BROWSER) {
      projects.push(
        {
          name: 'chromium-smoke',
          use: { ...devices['Desktop Chrome'] },
          testMatch: '**/*.smoke.spec.ts',
        },
        {
          name: 'firefox-smoke',
          use: { ...devices['Desktop Firefox'] },
          testMatch: '**/*.smoke.spec.ts',
        },
        {
          name: 'webkit-smoke',
          use: { ...devices['Desktop Safari'] },
          testMatch: '**/*.smoke.spec.ts',
        },
      )
    }

    if (process.env.PLAYWRIGHT_INCLUDE_PERF) {
      projects.push({
        name: 'chromium-perf',
        use: { ...devices['Desktop Chrome'] },
        testMatch: '**/*.perf.spec.ts',
      })
    }

    return projects
  })(),
})
