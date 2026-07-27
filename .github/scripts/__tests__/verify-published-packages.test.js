const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const editorVersion = require('../../../packages/editor/package.json').version

test('verifies the package version in both the workspace and npm', () => {
  const temporaryBin = fs.mkdtempSync(path.join(os.tmpdir(), 'wangeditor-fake-npm-'))
  const fakeNpm = path.join(temporaryBin, 'npm')
  const scriptPath = path.resolve(__dirname, '../verify-published-packages.js')
  const rootDir = path.resolve(__dirname, '../../..')

  fs.writeFileSync(
    fakeNpm,
    `#!/bin/sh
if [ "$1" = "view" ]; then
  printf '"%s"\\n' "$FAKE_NPM_VERSION"
  exit 0
fi

exit 1
`
  )
  fs.chmodSync(fakeNpm, 0o755)

  try {
    const result = spawnSync(
      process.execPath,
      [scriptPath, JSON.stringify([{ name: '@wangeditor-next/editor', version: editorVersion }])],
      {
        cwd: rootDir,
        encoding: 'utf8',
        env: {
          ...process.env,
          FAKE_NPM_VERSION: editorVersion,
          PATH: `${temporaryBin}:${process.env.PATH}`,
        },
      }
    )

    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, new RegExp(`${editorVersion}\\tverified=true`))
  } finally {
    fs.rmSync(temporaryBin, { recursive: true, force: true })
  }
})

test('rejects an npm version that does not match the release input', () => {
  const temporaryBin = fs.mkdtempSync(path.join(os.tmpdir(), 'wangeditor-fake-npm-'))
  const fakeNpm = path.join(temporaryBin, 'npm')
  const scriptPath = path.resolve(__dirname, '../verify-published-packages.js')
  const rootDir = path.resolve(__dirname, '../../..')

  fs.writeFileSync(
    fakeNpm,
    `#!/bin/sh
printf '"0.0.0"\\n'
`
  )
  fs.chmodSync(fakeNpm, 0o755)

  try {
    const result = spawnSync(
      process.execPath,
      [scriptPath, JSON.stringify([{ name: '@wangeditor-next/editor', version: editorVersion }])],
      {
        cwd: rootDir,
        encoding: 'utf8',
        env: { ...process.env, PATH: `${temporaryBin}:${process.env.PATH}` },
      }
    )

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /npm registry reports/)
  } finally {
    fs.rmSync(temporaryBin, { recursive: true, force: true })
  }
})
