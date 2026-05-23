#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const rootDir = path.resolve(__dirname, '..')
const editorDir = path.join(rootDir, 'packages', 'editor')

const MAX_TARBALL_SIZE = Number(process.env.EDITOR_PACK_TARBALL_MAX || 1500000)
const MAX_UNPACKED_SIZE = Number(process.env.EDITOR_PACK_UNPACKED_MAX || 3500000)
const MAX_MAP_SIZE = Number(process.env.EDITOR_PACK_MAP_MAX || 0)

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`
}

function run() {
  const output = execFileSync('npm', ['pack', '--json'], {
    cwd: editorDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  const result = JSON.parse(output)[0]
  const files = result.files || []
  const mapBytes = files
    .filter(file => file.path.endsWith('.map'))
    .reduce((sum, file) => sum + (file.size || 0), 0)

  const summary = {
    tarball: result.size || 0,
    unpacked: result.unpackedSize || 0,
    mapBytes,
    entryCount: result.entryCount || files.length,
  }

  // Clean the generated tgz to avoid dirty workspace artifacts.
  const tgzPath = path.join(editorDir, result.filename || '')

  if (result.filename && fs.existsSync(tgzPath)) {
    fs.unlinkSync(tgzPath)
  }

  console.log('[check-editor-pack-size] summary')
  console.log(
    JSON.stringify(
      {
        ...summary,
        human: {
          tarball: formatBytes(summary.tarball),
          unpacked: formatBytes(summary.unpacked),
          mapBytes: formatBytes(summary.mapBytes),
        },
      },
      null,
      2,
    ),
  )

  const failedReasons = []

  if (summary.tarball > MAX_TARBALL_SIZE) {
    failedReasons.push(
      `tarball size ${summary.tarball} exceeds limit ${MAX_TARBALL_SIZE}`,
    )
  }
  if (summary.unpacked > MAX_UNPACKED_SIZE) {
    failedReasons.push(
      `unpacked size ${summary.unpacked} exceeds limit ${MAX_UNPACKED_SIZE}`,
    )
  }
  if (summary.mapBytes > MAX_MAP_SIZE) {
    failedReasons.push(`.map bytes ${summary.mapBytes} exceeds limit ${MAX_MAP_SIZE}`)
  }

  if (failedReasons.length > 0) {
    failedReasons.forEach(reason => console.error(`[check-editor-pack-size] ${reason}`))
    process.exit(1)
  }
}

run()
