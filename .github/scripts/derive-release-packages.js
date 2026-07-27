#!/usr/bin/env node

const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

function readPackageJsonAtCommit(commit, packageDir) {
  const packageJsonPath = `packages/${packageDir}/package.json`
  try {
    return JSON.parse(git(['show', `${commit}:${packageJsonPath}`]))
  } catch {
    return null
  }
}

function deriveReleasePackages(releaseSha) {
  if (!/^[a-f0-9]{40}$/.test(releaseSha)) {
    throw new Error('release SHA must be a lowercase 40-character commit SHA')
  }

  const target = git(['rev-parse', `${releaseSha}^{commit}`])
  if (target !== releaseSha) {
    throw new Error(`release SHA resolved to ${target}, expected ${releaseSha}`)
  }

  const parent = git(['rev-parse', `${target}^`])
  const packagesDir = path.join(process.cwd(), 'packages')
  const packages = []

  for (const entry of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue

    const packageJsonPath = path.join(packagesDir, entry.name, 'package.json')
    if (!fs.existsSync(packageJsonPath)) continue

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    const parentPackageJson = readPackageJsonAtCommit(parent, entry.name)
    if (parentPackageJson?.version === packageJson.version) continue

    packages.push({ name: packageJson.name, version: packageJson.version })
  }

  if (packages.length === 0) {
    throw new Error(`Release commit ${releaseSha} does not declare any package version changes`)
  }

  return packages.sort((left, right) => left.name.localeCompare(right.name))
}

function main() {
  const releaseSha = process.argv[2] || process.env.RELEASE_SHA
  process.stdout.write(JSON.stringify(deriveReleasePackages(releaseSha)))
}

if (require.main === module) {
  main()
}

module.exports = {
  deriveReleasePackages,
}
