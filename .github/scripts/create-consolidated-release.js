#!/usr/bin/env node
// Creates a single consolidated GitHub Release from all published packages.
// Usage: node create-consolidated-release.js '<publishedPackagesJSON>'
//   publishedPackagesJSON: JSON array of { name, version } objects (from changesets/action output)

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const publishedPackages = JSON.parse(process.argv[2] || '[]')

if (publishedPackages.length === 0) {
  console.log('No packages published, skipping release creation.')
  process.exit(0)
}

// ── Tag ────────────────────────────────────────────────────────────────────
// Use @wangeditor-next/editor version when available, fall back to core,
// then fall back to a date stamp.
function resolveTag(packages) {
  const priority = ['@wangeditor-next/editor', '@wangeditor-next/core']
  for (const name of priority) {
    const pkg = packages.find(p => p.name === name)
    if (pkg) return `v${pkg.version}`
  }
  return `release/${new Date().toISOString().slice(0, 10)}`
}

let tag = resolveTag(publishedPackages)

// Ensure tag is unique (append -2, -3 … if it already exists on GitHub)
function tagExists(t) {
  try {
    execSync(`gh release view "${t}"`, { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

if (tagExists(tag)) {
  let i = 2
  while (tagExists(`${tag}-${i}`)) i++
  tag = `${tag}-${i}`
}

// ── CHANGELOG extraction ───────────────────────────────────────────────────
function pkgDir(name) {
  // @wangeditor-next/foo  →  packages/foo
  return name.replace('@wangeditor-next/', 'packages/')
}

/**
 * Extract the changelog block for `version` from `changelogPath`.
 * Returns the trimmed body text (without the "## <version>" heading line),
 * or null if not found.
 */
function extractChangelogSection(changelogPath, version) {
  if (!fs.existsSync(changelogPath)) return null
  const lines = fs.readFileSync(changelogPath, 'utf8').split('\n')
  let inSection = false
  const body = []
  for (const line of lines) {
    if (/^## /.test(line)) {
      if (line.includes(version)) {
        inSection = true
        continue
      }
      if (inSection) break
    }
    if (inSection) body.push(line)
  }
  return body.join('\n').trim() || null
}

// ── Build release body ─────────────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10)
const sections = []

for (const { name, version } of publishedPackages) {
  const changelog = path.join(pkgDir(name), 'CHANGELOG.md')
  const notes = extractChangelogSection(changelog, version)
  sections.push(
    notes
      ? `## \`${name}@${version}\`\n\n${notes}`
      : `## \`${name}@${version}\`\n\n_No changelog notes._`,
  )
}

const body = `> Published on ${today}\n\n${sections.join('\n\n---\n\n')}`

const bodyFile = path.join(require('os').tmpdir(), 'release-body.md')
fs.writeFileSync(bodyFile, body)

// ── Create GitHub Release ──────────────────────────────────────────────────
execSync(`gh release create "${tag}" --title "Release ${tag}" --notes-file "${bodyFile}"`, {
  stdio: 'inherit',
})

console.log(`\nConsolidated GitHub release created: ${tag}`)
