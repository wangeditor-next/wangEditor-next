#!/usr/bin/env node

const { spawnSync } = require('node:child_process')

const buildCommands = [
  ['--filter', '@wangeditor-next/core', 'build'],
  ['--filter', '@wangeditor-next/editor', 'build'],
  ['--filter', '@wangeditor-next/editor-for-react', 'build'],
  ['--filter', '@wangeditor-next/editor-for-vue', 'build'],
  ['--filter', '@wangeditor-next/yjs', 'build'],
  ['--filter', '@wangeditor-next/yjs-for-react', 'build'],
  ['--filter', '@wangeditor-next/yjs-for-vue', 'build'],
  ['--filter', '@wangeditor-next/demo-yjs-react', 'build'],
  ['--filter', '@wangeditor-next/demo-yjs-vue3', 'build'],
  ['exec', 'vite', 'build', 'tests/fixtures/yjs-native'],
]

function run(args) {
  // Invoke pnpm's JS entrypoint directly; Windows cannot spawn pnpm.cmd without a shell.
  const pnpmPath = process.env.npm_execpath
  const result = spawnSync(
    pnpmPath ? process.execPath : 'pnpm',
    pnpmPath ? [pnpmPath, ...args] : args,
    {
      env: process.env,
      stdio: 'inherit',
    }
  )

  if (result.error) {
    console.error(result.error)
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

if (process.env.PLAYWRIGHT_SKIP_BUILD !== '1') {
  buildCommands.forEach(run)
}

run(['exec', 'playwright', 'test', '--config', 'playwright.yjs.config.ts'])
