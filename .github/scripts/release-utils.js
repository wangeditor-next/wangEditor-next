const fs = require('fs')

const EDITOR_PACKAGE_NAME = '@wangeditor-next/editor'

function parsePublishedPackages(value) {
  let packages

  try {
    packages = JSON.parse(value || '[]')
  } catch {
    throw new Error('Published packages must be a JSON array')
  }

  if (!Array.isArray(packages)) {
    throw new Error('Published packages must be a JSON array')
  }

  const names = new Set()

  return packages.map(pkg => {
    if (
      typeof pkg?.name !== 'string' ||
      typeof pkg?.version !== 'string' ||
      !pkg.name ||
      !pkg.version ||
      /[\r\n]/.test(pkg.name) ||
      /[\r\n]/.test(pkg.version)
    ) {
      throw new Error('Each published package must include a non-empty name and version')
    }

    if (names.has(pkg.name)) {
      throw new Error(`Published package ${pkg.name} appears more than once`)
    }
    names.add(pkg.name)

    return { name: pkg.name, version: pkg.version }
  })
}

function getPackageTag(name, version) {
  return `${name}@${version}`
}

function getEditorRelease(packages) {
  const editorPkg = packages.find(pkg => pkg.name === EDITOR_PACKAGE_NAME)
  if (!editorPkg) return null

  return {
    ...editorPkg,
    tag: `v${editorPkg.version}`,
  }
}

function writeGitHubOutput(values) {
  if (!process.env.GITHUB_OUTPUT) return

  const output = Object.entries(values)
    .map(([name, value]) => `${name}=${value ?? ''}`)
    .join('\n')

  fs.appendFileSync(process.env.GITHUB_OUTPUT, `${output}\n`)
}

module.exports = {
  EDITOR_PACKAGE_NAME,
  getEditorRelease,
  getPackageTag,
  parsePublishedPackages,
  writeGitHubOutput,
}
