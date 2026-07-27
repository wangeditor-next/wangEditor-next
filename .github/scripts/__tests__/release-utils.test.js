const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
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
