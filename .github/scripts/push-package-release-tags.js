#!/usr/bin/env node

const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const { getPackageTag, parsePublishedPackages } = require('./release-utils')

function getWorkspacePackage(rootDir, packageName) {
  const packagesDir = path.join(rootDir, 'packages')

  for (const entry of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue

    const packageJsonPath = path.join(packagesDir, entry.name, 'package.json')
    if (!fs.existsSync(packageJsonPath)) continue

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    if (packageJson.name === packageName) {
      return { packageJson, packageJsonPath }
    }
  }

  throw new Error(`Published package ${packageName} does not exist in packages/`)
}

function git(args, options = {}) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim()
}

function resolveLocalTag(tag) {
  try {
    return git(['rev-parse', `${tag}^{}`]) || null
  } catch {
    return null
  }
}

function resolveRemoteTag(tag) {
  const output = git([
    'ls-remote',
    '--tags',
    'origin',
    `refs/tags/${tag}`,
    `refs/tags/${tag}^{}`,
  ])
  if (!output) return null

  const entries = output
    .split('\n')
    .map(line => line.split('\t'))
    .filter(parts => parts.length === 2)

  const dereferenced = entries.find(([, ref]) => ref === `refs/tags/${tag}^{}`)
  return (dereferenced || entries[0])[0]
}

function ensurePackageTag({ tag, target, dryRun }) {
  const localTarget = resolveLocalTag(tag)
  if (localTarget && localTarget !== target) {
    throw new Error(`Local tag ${tag} points to ${localTarget}, expected ${target}`)
  }

  const remoteTarget = resolveRemoteTag(tag)
  if (remoteTarget && remoteTarget !== target) {
    throw new Error(`Remote tag ${tag} points to ${remoteTarget}, expected ${target}`)
  }

  if (dryRun) {
    return { created: !localTarget && !remoteTarget, pushed: !remoteTarget }
  }

  if (!localTarget && !remoteTarget) {
    git(['tag', '-a', tag, target, '-m', `chore(release): ${tag}`])
  }

  if (!remoteTarget) {
    git(['push', 'origin', `refs/tags/${tag}:refs/tags/${tag}`], { stdio: 'inherit' })
  }

  return { created: !localTarget && !remoteTarget, pushed: !remoteTarget }
}

function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const packagesInput = args.find(arg => arg !== '--dry-run') || process.env.PUBLISHED_PACKAGES
  const packages = parsePublishedPackages(packagesInput)
  if (packages.length === 0) {
    throw new Error('Changesets reported a publish, but no published packages were provided')
  }

  const rootDir = process.cwd()
  const target = process.env.GITHUB_SHA || git(['rev-parse', 'HEAD'])

  for (const publishedPackage of packages) {
    const { packageJson, packageJsonPath } = getWorkspacePackage(rootDir, publishedPackage.name)
    if (packageJson.version !== publishedPackage.version) {
      throw new Error(
        `${publishedPackage.name} is ${packageJson.version} in ${packageJsonPath}, expected ${publishedPackage.version}`
      )
    }

    const tag = getPackageTag(publishedPackage.name, publishedPackage.version)
    const result = ensurePackageTag({ tag, target, dryRun })
    console.log(`${tag}\tcreated=${result.created}\tpushed=${result.pushed}`)
  }
}

if (require.main === module) {
  main()
}

module.exports = {
  getPackageTag,
  parsePublishedPackages,
}
