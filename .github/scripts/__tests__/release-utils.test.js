const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const editorVersion = require('../../../packages/editor/package.json').version
const test = require('node:test')

const { getEditorRelease, parsePublishedPackages } = require('../release-utils')

test('identifies an editor product release only when editor was published', () => {
  const leafPackages = parsePublishedPackages(
    '[{"name":"@wangeditor-next/core","version":"1.9.8"}]'
  )
  const editorPackages = parsePublishedPackages(
    '[{"name":"@wangeditor-next/core","version":"1.9.8"},{"name":"@wangeditor-next/editor","version":"6.0.2"}]'
  )

  assert.equal(getEditorRelease(leafPackages), null)
  assert.deepEqual(getEditorRelease(editorPackages), {
    name: '@wangeditor-next/editor',
    version: '6.0.2',
    tag: 'v6.0.2',
  })
})

test('rejects duplicate package entries from a publish result', () => {
  assert.throws(
    () =>
      parsePublishedPackages(
        '[{"name":"@wangeditor-next/editor","version":"6.0.2"},{"name":"@wangeditor-next/editor","version":"6.0.2"}]'
      ),
    /appears more than once/
  )
})

test('leaf-only publishes explicitly mark the product release as skipped', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wangeditor-release-test-'))
  const outputPath = path.join(tempDir, 'github-output')
  const scriptPath = path.resolve(__dirname, '../create-consolidated-release.js')

  try {
    const result = spawnSync(
      process.execPath,
      [scriptPath, '[{"name":"@wangeditor-next/core","version":"1.9.8"}]'],
      {
        encoding: 'utf8',
        env: { ...process.env, GITHUB_OUTPUT: outputPath },
      }
    )

    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /No editor package was published/)
    assert.equal(fs.readFileSync(outputPath, 'utf8'), 'editor_published=false\ntag=\nversion=\n')
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
})

test('reads published packages from the environment', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wangeditor-release-test-'))
  const outputPath = path.join(tempDir, 'github-output')
  const scriptPath = path.resolve(__dirname, '../create-consolidated-release.js')

  try {
    const result = spawnSync(process.execPath, [scriptPath], {
      encoding: 'utf8',
      env: {
        ...process.env,
        GITHUB_OUTPUT: outputPath,
        PUBLISHED_PACKAGES: '[{"name":"@wangeditor-next/core","version":"1.9.8"}]',
      },
    })

    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /No editor package was published/)
    assert.equal(fs.readFileSync(outputPath, 'utf8'), 'editor_published=false\ntag=\nversion=\n')
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
})

test('creates a product release from the checked-out commit', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wangeditor-release-test-'))
  const temporaryBin = path.join(tempDir, 'bin')
  const fakeGit = path.join(temporaryBin, 'git')
  const fakeGh = path.join(temporaryBin, 'gh')
  const ghLog = path.join(tempDir, 'gh.log')
  const outputPath = path.join(tempDir, 'github-output')
  const scriptPath = path.resolve(__dirname, '../create-consolidated-release.js')
  const rootDir = path.resolve(__dirname, '../../..')

  fs.mkdirSync(temporaryBin)
  fs.writeFileSync(
    fakeGit,
    `#!/bin/sh
if [ "$1" = "rev-parse" ] && [ "$2" = "HEAD" ]; then
  printf '%s\\n' '${'a'.repeat(40)}'
  exit 0
fi

if [ "$1" = "ls-remote" ]; then
  exit 0
fi

exit 1
`
  )
  fs.writeFileSync(
    fakeGh,
    `#!/bin/sh
if [ "$1" = "release" ] && [ "$2" = "view" ]; then
  echo 'release not found' >&2
  exit 1
fi

if [ "$1" = "release" ] && [ "$2" = "create" ]; then
  printf '%s\\n' "$*" >> "\${FAKE_GH_LOG}"
  exit 0
fi

exit 1
`
  )
  fs.chmodSync(fakeGit, 0o755)
  fs.chmodSync(fakeGh, 0o755)

  try {
    const result = spawnSync(
      process.execPath,
      [scriptPath, JSON.stringify([{ name: '@wangeditor-next/editor', version: editorVersion }])],
      {
        cwd: rootDir,
        encoding: 'utf8',
        env: {
          ...process.env,
          FAKE_GH_LOG: ghLog,
          GITHUB_OUTPUT: outputPath,
          GITHUB_SHA: 'b'.repeat(40),
          PATH: `${temporaryBin}:${process.env.PATH}`,
        },
      }
    )

    assert.equal(result.status, 0, result.stderr)
    assert.match(fs.readFileSync(ghLog, 'utf8'), new RegExp(`--target ${'a'.repeat(40)}`))
    assert.doesNotMatch(fs.readFileSync(ghLog, 'utf8'), new RegExp(`${'b'.repeat(40)}`))
    assert.match(fs.readFileSync(outputPath, 'utf8'), /editor_published=true/)
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
})
