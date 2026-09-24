import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

// eslint-disable-next-line import/extensions
import { INTERNAL_UMD_GLOBALS } from '../shared/rollup-config/index.js'

const packagesDir = path.resolve('packages')
const packageDirs = fs
  .readdirSync(packagesDir, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .sort()
const errors = []

for (const packageDir of packageDirs) {
  const packagePath = path.join(packagesDir, packageDir, 'package.json')
  const rollupConfigPath = path.join(packagesDir, packageDir, 'rollup.config.js')
  const tsdownConfigPath = path.join(packagesDir, packageDir, 'tsdown.config.js')

  if (!fs.existsSync(packagePath) || (!fs.existsSync(rollupConfigPath) && !fs.existsSync(tsdownConfigPath))) {
    continue
  }

  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  const internalPeers = Object.keys(pkg.peerDependencies || {}).filter(name =>
    name.startsWith('@wangeditor-next/')
  )

  if (internalPeers.length === 0) {
    continue
  }

  const configUrl = pathToFileURL(fs.existsSync(rollupConfigPath) ? rollupConfigPath : tsdownConfigPath).href
  const { default: rollupConfigs } = await import(configUrl)
  const configs = Array.isArray(rollupConfigs) ? rollupConfigs : [rollupConfigs]
  const umdConfigs = configs.filter(config => {
    if (config.output?.format === 'umd') {
      return true
    }
    return config.format === 'umd'
  })

  if (umdConfigs.length === 0) {
    errors.push(`${pkg.name}: no UMD output found`)
    continue
  }

  for (const dependency of internalPeers) {
    const expectedGlobal = INTERNAL_UMD_GLOBALS[dependency]

    if (!expectedGlobal) {
      errors.push(`${pkg.name}: ${dependency} is missing from INTERNAL_UMD_GLOBALS`)
      continue
    }

    for (const config of umdConfigs) {
      const actualGlobal = config.output?.globals?.[dependency] || config.outputOptions?.globals?.[dependency]

      if (actualGlobal !== expectedGlobal) {
        errors.push(
          `${pkg.name}: ${dependency} resolves to ${actualGlobal || 'undefined'}, expected ${expectedGlobal}`
        )
      }
    }
  }
}

if (errors.length > 0) {
  throw new Error(`Invalid internal UMD globals:\n${errors.join('\n')}`)
}

process.stdout.write(`Validated internal UMD globals for ${packageDirs.length} packages.\n`)
