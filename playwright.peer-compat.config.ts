import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/peer-compat',
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  use: { ...devices['Desktop Chrome'], trace: 'retain-on-failure' },
  projects: ['legacy', 'current'].map((name, index) => ({
    name,
    use: { baseURL: `http://127.0.0.1:${3130 + index}` },
  })),
  webServer: ['legacy', 'current'].map((name, index) => ({
    command: `node scripts/serve-peer-compat.mjs ${name}`,
    url: `http://127.0.0.1:${3130 + index}`,
    timeout: 120_000,
    reuseExistingServer: false,
  })),
})
