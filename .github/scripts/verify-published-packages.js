#!/usr/bin/env node

const { execFile } = require('child_process')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const { parsePublishedPackages } = require('./release-utils')

const execFileAsync = promisify(execFile)
const NPM_COMMAND_TIMEOUT_MS = 60_000
const NPM_VERIFY_TIMEOUT_MS = 5 * 60_000
const NPM_VERIFY_RETRY_DELAY_MS = 5_000

function getPositiveIntegerEnv(name, fallback) {
  const value = process.env[name]
  if (value == null || value === '') return fallback

  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`)
  }

  return parsed
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

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

async function getNpmVersion(packageName, version, options = {}) {
  const {
    command = execFileAsync,
    now = Date.now,
    retryDelayMs = getPositiveIntegerEnv('NPM_VERIFY_RETRY_DELAY_MS', NPM_VERIFY_RETRY_DELAY_MS),
    sleepFn = sleep,
    timeoutMs = getPositiveIntegerEnv('NPM_VERIFY_TIMEOUT_MS', NPM_VERIFY_TIMEOUT_MS),
  } = options
  const deadline = now() + timeoutMs
  let attempt = 0
  let lastError

  while (now() < deadline) {
    attempt += 1

    try {
      const remaining = deadline - now()
      const { stdout } = await command(
        'npm',
        ['view', `${packageName}@${version}`, 'version', '--json'],
        {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
          timeout: Math.min(NPM_COMMAND_TIMEOUT_MS, remaining),
        }
      )
      let reportedVersion
      try {
        reportedVersion = JSON.parse(stdout.trim())
      } catch {
        lastError = new Error(
          `npm returned an invalid version response for ${packageName}@${version}`
        )
      }

      if (Array.isArray(reportedVersion)) [reportedVersion] = reportedVersion
      if (reportedVersion === version) return
      if (reportedVersion !== undefined) {
        throw new Error(
          `npm registry reports ${packageName}@${reportedVersion || 'missing'}, expected ${version}`
        )
      }
    } catch (error) {
      if (/^npm registry reports /.test(error.message)) throw error
      lastError = error
    }

    const remaining = deadline - now()
    if (remaining <= 0) break

    const delay = Math.min(retryDelayMs, remaining)
    console.log(`${packageName}@${version}\tverified=false\tattempt=${attempt}\tretrying=true`)
    await sleepFn(delay)
  }

  const lastMessage = lastError ? `: ${lastError.message}` : ''
  throw new Error(
    `npm registry did not report ${packageName}@${version} within ${timeoutMs}ms${lastMessage}`
  )
}

async function main() {
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
  }

  await Promise.all(
    packages.map(async ({ name, version }) => {
      await getNpmVersion(name, version)
      console.log(`${name}@${version}\tverified=true`)
    })
  )
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.stack || error.message)
    process.exitCode = 1
  })
}

module.exports = {
  getNpmVersion,
  getWorkspacePackage,
  main,
}
