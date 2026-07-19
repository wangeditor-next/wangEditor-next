const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
const inventoryPath = path.join(rootDir, 'docs/v6-compatibility-inventory.json')
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'))
const categories = new Set(['public-api', 'stored-data', 'runtime-environment'])
const statuses = new Set(['deprecated', 'retained'])
const errors = []
const ids = new Set()

if (inventory.schemaVersion !== 1) {
  errors.push('schemaVersion must be 1')
}

if (!Array.isArray(inventory.entries) || inventory.entries.length === 0) {
  errors.push('entries must be a non-empty array')
}

for (const [index, entry] of (inventory.entries || []).entries()) {
  const label = entry.id || `entry #${index + 1}`

  for (const field of ['id', 'category', 'package', 'behavior', 'status', 'migration']) {
    if (typeof entry[field] !== 'string' || entry[field].trim() === '') {
      errors.push(`${label}: ${field} must be a non-empty string`)
    }
  }

  if (ids.has(entry.id)) {
    errors.push(`${label}: id must be unique`)
  }
  ids.add(entry.id)

  if (!categories.has(entry.category)) {
    errors.push(`${label}: unsupported category ${entry.category}`)
  }
  if (!statuses.has(entry.status)) {
    errors.push(`${label}: unsupported status ${entry.status}`)
  }
  if (
    entry.category === 'public-api' &&
    (!Number.isInteger(entry.removalMajor) || entry.removalMajor < 1)
  ) {
    errors.push(`${label}: public-api entries require a positive removalMajor`)
  }
  if (!Array.isArray(entry.paths) || entry.paths.length === 0) {
    errors.push(`${label}: paths must be a non-empty array`)
    continue
  }

  for (const relativePath of entry.paths) {
    if (typeof relativePath !== 'string' || path.isAbsolute(relativePath)) {
      errors.push(`${label}: paths must be relative strings`)
      continue
    }
    if (!fs.existsSync(path.join(rootDir, relativePath))) {
      errors.push(`${label}: missing path ${relativePath}`)
    }
  }
}

if (errors.length > 0) {
  console.error(`Compatibility inventory check failed:\n- ${errors.join('\n- ')}`)
  process.exitCode = 1
} else {
  process.stdout.write(
    `Compatibility inventory check passed (${inventory.entries.length} entries).\n`
  )
}
