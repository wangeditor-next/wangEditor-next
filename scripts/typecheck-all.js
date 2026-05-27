#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const rootDir = path.resolve(__dirname, '..')
const scanDirs = ['packages']
const ignoredDirs = new Set(['node_modules', 'dist', 'lib', 'coverage', '.turbo', '.git'])
const typecheckCacheDir = path.join(rootDir, '.turbo', 'typecheck')
const disableIncremental = process.env.TYPECHECK_NO_INCREMENTAL === '1'

function collectTsconfigFiles(startDir) {
  const result = []

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const absolutePath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        if (ignoredDirs.has(entry.name)) {
          continue
        }

        walk(absolutePath)
        continue
      }

      if (!entry.isFile()) {
        continue
      }

      if (entry.name !== 'tsconfig.json') {
        continue
      }

      result.push(absolutePath)
    }
  }

  walk(startDir)
  return result
}

function runTypecheck(tsconfigPath) {
  const relativePath = path.relative(rootDir, tsconfigPath).replace(/\\/g, '/')
  const args = ['exec', 'tsc', '--noEmit', '--pretty', 'false', '--skipLibCheck']
  const buildInfoPath = path.join(
    typecheckCacheDir,
    `${relativePath.replace(/[\\/]/g, '__').replace(/\.json$/, '')}.tsbuildinfo`
  )

  console.log(`[typecheck] ${relativePath}`)

  if (!disableIncremental) {
    fs.mkdirSync(path.dirname(buildInfoPath), { recursive: true })
    args.push('--incremental', '--tsBuildInfoFile', path.relative(rootDir, buildInfoPath))
  }

  args.push('-p', relativePath)

  const res = spawnSync('pnpm', args, {
    cwd: rootDir,
    stdio: 'inherit',
  })

  if (res.status !== 0) {
    process.exit(res.status ?? 1)
  }
}

function main() {
  const tsconfigFiles = []

  scanDirs.forEach(dirName => {
    const dirPath = path.join(rootDir, dirName)

    if (!fs.existsSync(dirPath)) {
      return
    }

    tsconfigFiles.push(...collectTsconfigFiles(dirPath))
  })

  const uniqueFiles = Array.from(new Set(tsconfigFiles)).sort((a, b) => a.localeCompare(b))

  uniqueFiles.forEach(runTypecheck)

  console.log(`[typecheck] done, checked ${uniqueFiles.length} projects`)
}

main()
