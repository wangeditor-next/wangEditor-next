#!/usr/bin/env node

const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const { parsePublishedPackages } = require('./release-utils')

const NPM_TIMEOUT_MS = 60_000

function getWorkspacePackage(rootDir, packageName) {
  const packagesDir = path.join(rootDir, 'packages')

  for (const entry of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue

    const packageJsonPath = path.join(packagesDir, entry.name, 'package.json')
    if (!fs.existsSync(packageJsonPath)) continue

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    if (packageJson.name === packageName) return { packageJson, packageJsonPath }
  }

  throw new Error(`Published package ${packageName} does not exist in packages/`)
}

function getNpmVersion(packageName, version) {
  const output = execFileSync('npm', ['view', `${packageName}@${version}`, 'version', '--json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: NPM_TIMEOUT_MS,
  }).trim()

  let reportedVersion
  try {
    reportedVersion = JSON.parse(output)
  } catch {
    throw new Error(`npm returned an invalid version response for ${packageName}@${version}`)
  }

  if (Array.isArray(reportedVersion)) [reportedVersion] = reportedVersion
  if (reportedVersion !== version) {
    throw new Error(
      `npm registry reports ${packageName}@${reportedVersion || 'missing'}, expected ${version}`
    )
  }
}

function main() {
  const packagesInput = process.argv[2] || process.env.PUBLISHED_PACKAGES
  const packages = parsePublishedPackages(packagesInput)
  if (packages.length === 0) {
    throw new Error('At least one published package is required')
  }

  const rootDir = process.cwd()
  for (const { name, version } of packages) {
    const { packageJson, packageJsonPath } = getWorkspacePackage(rootDir, name)
    if (packageJson.version !== version) {
      throw new Error(
        `${name} is ${packageJson.version} in ${packageJsonPath}, expected ${version}`
      )
    }

    getNpmVersion(name, version)
    console.log(`${name}@${version}\tverified=true`)
  }
}

if (require.main === module) {
  main()
}

module.exports = {
  getNpmVersion,
  getWorkspacePackage,
}
