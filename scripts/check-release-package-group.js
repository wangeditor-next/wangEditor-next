#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
const packagesDir = path.join(rootDir, 'packages')
const changesetConfigPath = path.join(rootDir, '.changeset', 'config.json')
const config = JSON.parse(fs.readFileSync(changesetConfigPath, 'utf8'))

const internalDependencyRanges = []
const publicRuntimePackages = fs
  .readdirSync(packagesDir, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .flatMap(entry => {
    const packageJsonPath = path.join(packagesDir, entry.name, 'package.json')

    if (!fs.existsSync(packageJsonPath)) {
      return []
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

    if (packageJson.private || !packageJson.name?.startsWith('@wangeditor-next/')) {
      return []
    }

    for (const dependencyType of [
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'optionalDependencies',
    ]) {
      for (const [name, range] of Object.entries(packageJson[dependencyType] || {})) {
        if (name.startsWith('@wangeditor-next/')) {
          internalDependencyRanges.push({
            dependencyType,
            name,
            packageName: packageJson.name,
            range,
          })
        }
      }
    }

    return [packageJson.name]
  })
  .sort()

const fixedGroups = Array.isArray(config.fixed) ? config.fixed : []
const fixedPackages = fixedGroups.flat()
const fixedSet = new Set(fixedPackages)
const expectedSet = new Set(publicRuntimePackages)
const errors = []

if (fixedGroups.length === 0) {
  errors.push('Changesets must define at least one fixed group for public runtime packages')
}

if (fixedSet.size !== fixedPackages.length) {
  errors.push('The fixed release group contains duplicate package names')
}

const missing = publicRuntimePackages.filter(name => !fixedSet.has(name))
const unexpected = fixedPackages.filter(name => !expectedSet.has(name))

const packageGroupCounts = new Map()

for (const packageName of fixedPackages) {
  packageGroupCounts.set(packageName, (packageGroupCounts.get(packageName) || 0) + 1)
}

const duplicateGroups = [...packageGroupCounts]
  .filter(([, count]) => count > 1)
  .map(([name]) => name)

if (missing.length > 0) {
  errors.push(`Public runtime packages missing from the fixed group: ${missing.join(', ')}`)
}

if (unexpected.length > 0) {
  errors.push(`Non-runtime packages in the fixed group: ${unexpected.join(', ')}`)
}

if (duplicateGroups.length > 0) {
  errors.push(`Public runtime packages must belong to only one fixed group: ${duplicateGroups.join(', ')}`)
}

for (const { packageName, dependencyType, name, range } of internalDependencyRanges) {
  if (expectedSet.has(name) && range !== 'workspace:^') {
    errors.push(`${packageName} ${dependencyType}.${name} must use workspace:^, found ${range}`)
  }
}

if (errors.length > 0) {
  console.error(`Release package group check failed:\n- ${errors.join('\n- ')}`)
  process.exit(1)
}

process.stdout.write(
  `Release package group check passed (${publicRuntimePackages.length} packages).\n`
)
