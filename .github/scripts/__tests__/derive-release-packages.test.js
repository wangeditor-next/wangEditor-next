const assert = require('node:assert/strict')
const { execFileSync, spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const scriptPath = path.resolve(__dirname, '../derive-release-packages.js')

function git(rootDir, args) {
  return execFileSync('git', args, { cwd: rootDir, encoding: 'utf8' }).trim()
}

function writePackage(rootDir, directory, name, version) {
  const packageDir = path.join(rootDir, 'packages', directory)
  fs.mkdirSync(packageDir, { recursive: true })
  fs.writeFileSync(
    path.join(packageDir, 'package.json'),
    `${JSON.stringify({ name, version }, null, 2)}\n`
  )
}

test('derives all package versions changed by a release commit', () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wangeditor-release-source-'))

  try {
    git(rootDir, ['init', '-q'])
    git(rootDir, ['config', 'user.name', 'Test User'])
    git(rootDir, ['config', 'user.email', 'test@example.com'])
    writePackage(rootDir, 'editor', '@wangeditor-next/editor', '1.0.0')
    writePackage(rootDir, 'core', '@wangeditor-next/core', '1.0.0')
    git(rootDir, ['add', '.'])
    git(rootDir, ['commit', '-m', 'chore: initial packages'])

    writePackage(rootDir, 'editor', '@wangeditor-next/editor', '1.1.0')
    writePackage(rootDir, 'table-module', '@wangeditor-next/table-module', '1.0.0')
    git(rootDir, ['add', '.'])
    git(rootDir, ['commit', '-m', 'chore: release packages'])
    const releaseSha = git(rootDir, ['rev-parse', 'HEAD'])

    const result = spawnSync(process.execPath, [scriptPath, releaseSha], {
      cwd: rootDir,
      encoding: 'utf8',
    })

    assert.equal(result.status, 0, result.stderr)
    assert.deepEqual(JSON.parse(result.stdout), [
      { name: '@wangeditor-next/editor', version: '1.1.0' },
      { name: '@wangeditor-next/table-module', version: '1.0.0' },
    ])
    assert.equal(result.stderr, '')
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true })
  }
})

test('rejects a commit without package version changes', () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wangeditor-release-source-'))

  try {
    git(rootDir, ['init', '-q'])
    git(rootDir, ['config', 'user.name', 'Test User'])
    git(rootDir, ['config', 'user.email', 'test@example.com'])
    writePackage(rootDir, 'editor', '@wangeditor-next/editor', '1.0.0')
    git(rootDir, ['add', '.'])
    git(rootDir, ['commit', '-m', 'chore: initial package'])
    fs.writeFileSync(path.join(rootDir, 'README.md'), 'no package version change\n')
    git(rootDir, ['add', 'README.md'])
    git(rootDir, ['commit', '-m', 'docs: update readme'])
    const releaseSha = git(rootDir, ['rev-parse', 'HEAD'])

    const result = spawnSync(process.execPath, [scriptPath, releaseSha], {
      cwd: rootDir,
      encoding: 'utf8',
    })

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /does not declare any package version changes/)
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true })
  }
})
