#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
const packageDir = path.join(rootDir, 'packages')
const declarationFiles = []
const failures = []
const forbiddenSpecifiers = [
  {
    pattern: /(?:from\s+|import\()['"]packages\//g,
    reason: 'monorepo-only packages/ import',
  },
  {
    pattern: /(?:from\s+|import\()['"]@wangeditor-next\/[^'"]+\/src\//g,
    reason: 'package-internal src/ import',
  },
]

function collectDeclarations(dir) {
  if (!fs.existsSync(dir)) {
    return
  }

  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      collectDeclarations(fullPath)
      return
    }

    if (entry.isFile() && entry.name.endsWith('.d.ts')) {
      declarationFiles.push(fullPath)
    }
  })
}

fs.readdirSync(packageDir, { withFileTypes: true }).forEach(entry => {
  if (!entry.isDirectory()) {
    return
  }
  collectDeclarations(path.join(packageDir, entry.name, 'dist'))
})

if (declarationFiles.length === 0) {
  throw new Error('No built declaration files found. Run package builds before this check.')
}

declarationFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8')

  forbiddenSpecifiers.forEach(({ pattern, reason }) => {
    pattern.lastIndex = 0
    if (pattern.test(content)) {
      failures.push(`${path.relative(rootDir, filePath)}: ${reason}`)
    }
  })
})

if (failures.length > 0) {
  console.error('Published declaration check failed:')
  failures.forEach(failure => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(`Published declaration check passed (${declarationFiles.length} files).`)
