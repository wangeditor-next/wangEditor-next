const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
const appsDir = path.join(rootDir, 'apps')
const packagesDir = path.join(rootDir, 'packages')
const ignoredEntries = new Set(['node_modules', 'dist', '.turbo'])
const keptScripts = new Set(['dev', 'build'])

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`)
}

function collectWorkspaceVersions() {
  const versions = new Map()

  fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .forEach(entry => {
      const packageJsonPath = path.join(packagesDir, entry.name, 'package.json')
      if (!fs.existsSync(packageJsonPath)) return

      const packageJson = readJson(packageJsonPath)
      if (packageJson.name && packageJson.version) {
        versions.set(packageJson.name, packageJson.version)
      }
    })

  return versions
}

function copyDir(sourceDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true })

  fs.readdirSync(sourceDir, { withFileTypes: true }).forEach(entry => {
    if (ignoredEntries.has(entry.name)) return

    const sourcePath = path.join(sourceDir, entry.name)
    const targetPath = path.join(targetDir, entry.name)

    if (entry.isDirectory()) {
      copyDir(sourcePath, targetPath)
      return
    }

    fs.copyFileSync(sourcePath, targetPath)
  })
}

function normalizeDeps(versions, deps = {}) {
  return Object.fromEntries(
    Object.entries(deps).map(([name, version]) => {
      if (!version.startsWith('workspace:')) return [name, version]

      const workspaceVersion = versions.get(name)
      if (!workspaceVersion) {
        throw new Error(`Cannot resolve workspace version for "${name}"`)
      }

      return [name, workspaceVersion]
    }),
  )
}

function sanitizePackageJson(packageJson, versions) {
  const scripts = Object.fromEntries(
    Object.entries(packageJson.scripts || {}).filter(([name]) => keptScripts.has(name)),
  )

  return {
    name: packageJson.name,
    version: '0.0.0',
    private: true,
    type: packageJson.type,
    scripts,
    dependencies: normalizeDeps(versions, packageJson.dependencies),
    devDependencies: normalizeDeps(versions, packageJson.devDependencies),
  }
}

function main() {
  const [appName, outputDirArg] = process.argv.slice(2)

  if (!appName || !outputDirArg) {
    console.error('Usage: pnpm demo:export-template <app-name> <output-dir>')
    process.exit(1)
  }

  const appDir = path.join(appsDir, appName)
  if (!fs.existsSync(appDir)) {
    console.error(`App not found: ${appName}`)
    process.exit(1)
  }

  const outputDir = path.resolve(rootDir, outputDirArg)
  fs.rmSync(outputDir, { recursive: true, force: true })
  copyDir(appDir, outputDir)

  const versions = collectWorkspaceVersions()
  const packageJsonPath = path.join(outputDir, 'package.json')
  const packageJson = readJson(packageJsonPath)
  writeJson(packageJsonPath, sanitizePackageJson(packageJson, versions))

  console.log(`Exported ${appName} to ${outputDir}`)
}

main()
