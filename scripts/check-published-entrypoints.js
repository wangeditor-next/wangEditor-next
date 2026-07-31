#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const rootDir = path.resolve(__dirname, '..')
const packageDir = path.join(rootDir, 'packages')
const entrypointFields = ['main', 'module', 'types', 'typings', 'unpkg', 'jsdelivr', 'browser']
const failures = []
const packageRecords = []
let checked = 0

function isLocalTarget(target) {
  return typeof target === 'string' && target.length > 0 && !target.includes('://')
}

function isInsidePackage(packagePath, targetPath) {
  const relativePath = path.relative(packagePath, targetPath)

  return (
    relativePath.length > 0 && !relativePath.startsWith(`..${path.sep}`) && relativePath !== '..'
  )
}

function checkTarget(packagePath, packageName, label, target, requiresDotPrefix = false) {
  if (!isLocalTarget(target)) {
    return
  }

  checked += 1

  if (requiresDotPrefix && !target.startsWith('.')) {
    failures.push(`${packageName} ${label} must start with ".": ${target}`)
    return
  }

  const targetPath = path.resolve(packagePath, target)

  if (!isInsidePackage(packagePath, targetPath)) {
    failures.push(`${packageName} ${label} points outside the package: ${target}`)
    return
  }

  if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
    failures.push(`${packageName} ${label} does not exist: ${target}`)
  }
}

function checkExports(packagePath, packageName, value, label = 'exports') {
  if (typeof value === 'string') {
    checkTarget(packagePath, packageName, label, value, true)
    return
  }

  if (Array.isArray(value)) {
    value.forEach((child, index) => {
      checkExports(packagePath, packageName, child, `${label}[${index}]`)
    })
    return
  }

  if (!value || typeof value !== 'object') {
    return
  }

  Object.entries(value).forEach(([key, child]) => {
    checkExports(packagePath, packageName, child, `${label}.${key}`)
  })
}

function hasTypesEntrypoint(value) {
  if (Array.isArray(value)) {
    return value.some(hasTypesEntrypoint)
  }

  if (!value || typeof value !== 'object') {
    return false
  }

  return Object.entries(value).some(([key, child]) => key === 'types' || hasTypesEntrypoint(child))
}

function checkNodeNextTypes() {
  const consumerPath = path.join(
    rootDir,
    'tests',
    'fixtures',
    'published-package-consumer',
    'index.ts'
  )
  const compilerOptions = {
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
  }

  packageRecords.forEach(({ packageName, packageJson }) => {
    if (!packageJson.types && !packageJson.typings && !hasTypesEntrypoint(packageJson.exports)) {
      return
    }

    checked += 1
    const { resolvedModule } = ts.resolveModuleName(
      packageName,
      consumerPath,
      compilerOptions,
      ts.sys
    )

    if (!resolvedModule) {
      failures.push(`${packageName} cannot be resolved by a NodeNext consumer`)
      return
    }

    if (!/\.d\.(?:ts|mts|cts)$/.test(resolvedModule.resolvedFileName)) {
      failures.push(
        `${packageName} resolves to JavaScript instead of declarations: ${resolvedModule.resolvedFileName}`
      )
    }
  })
}

fs.readdirSync(packageDir, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .sort((first, second) => first.name.localeCompare(second.name))
  .forEach(entry => {
    const packagePath = path.join(packageDir, entry.name)
    const packageJsonPath = path.join(packagePath, 'package.json')

    if (!fs.existsSync(packageJsonPath)) {
      return
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

    if (!packageJson.name) {
      return
    }

    packageRecords.push({
      packageName: packageJson.name,
      packageJson,
    })

    entrypointFields.forEach(field => {
      checkTarget(packagePath, packageJson.name, field, packageJson[field])
    })
    checkExports(packagePath, packageJson.name, packageJson.exports)
  })

checkNodeNextTypes()

if (failures.length > 0) {
  console.error('Published package entrypoint check failed:')
  failures.forEach(failure => console.error(`- ${failure}`))
  process.exit(1)
}

// eslint-disable-next-line no-console
console.log(`Published package entrypoint check passed (${checked} paths checked).`)
