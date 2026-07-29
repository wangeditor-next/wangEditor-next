const test = require('node:test')
const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const editorVersion = require('../../../packages/editor/package.json').version

const { getPackageTag, parsePublishedPackages } = require('../push-package-release-tags')

test('formats package source tags with the exact npm package version', () => {
  assert.equal(
    getPackageTag('@wangeditor-next/table-module', '3.0.2'),
    '@wangeditor-next/table-module@3.0.2'
  )
})

test('parses the publishedPackages output from changesets', () => {
  assert.deepEqual(
    parsePublishedPackages('[{"name":"@wangeditor-next/editor","version":"5.7.11"}]'),
    [{ name: '@wangeditor-next/editor', version: '5.7.11' }]
  )
})

test('rejects malformed publishedPackages output', () => {
  assert.throws(() => parsePublishedPackages('{'), /JSON array/)
  assert.throws(
    () => parsePublishedPackages('[{"name":"@wangeditor-next/editor"}]'),
    /non-empty name and version/
  )
})

test('refuses to treat an unverifiable remote tag as absent', () => {
  const temporaryBin = fs.mkdtempSync(path.join(os.tmpdir(), 'wangeditor-fake-git-'))
  const fakeGit = path.join(temporaryBin, 'git')
  const scriptPath = path.resolve(__dirname, '../push-package-release-tags.js')
  const rootDir = path.resolve(__dirname, '../../..')

  fs.writeFileSync(
    fakeGit,
    `#!/bin/sh
if [ "$1" = "rev-parse" ] && [ "$2" = "HEAD" ]; then
  printf '%s\\n' '${'a'.repeat(40)}'
  exit 0
fi

exit 1
`
  )
  fs.chmodSync(fakeGit, 0o755)

  try {
    const result = spawnSync(
      process.execPath,
      [
        scriptPath,
        JSON.stringify([{ name: '@wangeditor-next/editor', version: editorVersion }]),
        '--dry-run',
      ],
      {
        cwd: rootDir,
        encoding: 'utf8',
        env: { ...process.env, PATH: `${temporaryBin}:${process.env.PATH}` },
      }
    )

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /git ls-remote/)
  } finally {
    fs.rmSync(temporaryBin, { recursive: true, force: true })
  }
})

test('continues after pushing a newly created package tag', () => {
  const temporaryBin = fs.mkdtempSync(path.join(os.tmpdir(), 'wangeditor-fake-git-'))
  const fakeGit = path.join(temporaryBin, 'git')
  const gitLog = path.join(temporaryBin, 'git.log')
  const scriptPath = path.resolve(__dirname, '../push-package-release-tags.js')
  const rootDir = path.resolve(__dirname, '../../..')

  fs.writeFileSync(
    fakeGit,
    `#!/bin/sh
if [ "$1" = "rev-parse" ] && [ "$2" = "HEAD" ]; then
  printf '%s\\n' '${'a'.repeat(40)}'
  exit 0
fi

if [ "$1" = "tag" ]; then
  printf '%s\\n' "$*" >> "\${FAKE_GIT_LOG}"
  exit 0
fi

if [ "$1" = "rev-parse" ] || [ "$1" = "ls-remote" ] || [ "$1" = "push" ]; then
  exit 0
fi

exit 1
`
  )
  fs.chmodSync(fakeGit, 0o755)

  try {
    const result = spawnSync(
      process.execPath,
      [scriptPath, JSON.stringify([{ name: '@wangeditor-next/editor', version: editorVersion }])],
      {
        cwd: rootDir,
        encoding: 'utf8',
        env: {
          ...process.env,
          FAKE_GIT_LOG: gitLog,
          GITHUB_SHA: 'b'.repeat(40),
          PATH: `${temporaryBin}:${process.env.PATH}`,
        },
      }
    )

    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /created=true\tpushed=true/)
    assert.match(fs.readFileSync(gitLog, 'utf8'), new RegExp(`${'a'.repeat(40)}`))
    assert.doesNotMatch(fs.readFileSync(gitLog, 'utf8'), new RegExp(`${'b'.repeat(40)}`))
  } finally {
    fs.rmSync(temporaryBin, { recursive: true, force: true })
  }
})
