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
// Prefer @wangeditor-next/editor version as the release tag.
function resolveTag(packages) {
  const priority = ['@wangeditor-next/editor', '@wangeditor-next/core']
  for (const name of priority) {
    const pkg = packages.find(p => p.name === name)
    if (pkg) return `v${pkg.version}`
  }
  return `release/${new Date().toISOString().slice(0, 10)}`
}

let tag = resolveTag(publishedPackages)

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

// ── CHANGELOG helpers ──────────────────────────────────────────────────────
function pkgDir(name) {
  return name.replace('@wangeditor-next/', 'packages/')
}

/**
 * Parse a CHANGELOG.md section for `version`.
 * Returns:
 *   changes  – deduplicated actual changes (not "Updated dependencies" lines)
 *              each entry: { hash, description, pkg }
 *   hasDirect – true if this package has its own changes (vs. only dep bumps)
 */
function parseChangelogSection(changelogPath, version, pkgName) {
  if (!fs.existsSync(changelogPath)) return { changes: [], hasDirect: false }

  const lines = fs.readFileSync(changelogPath, 'utf8').split('\n')
  let inSection = false
  let inUpdatedDeps = false
  const changes = []
  let hasDirect = false
  let currentEntry = null

  for (const line of lines) {
    if (/^## /.test(line)) {
      if (line.includes(version)) { inSection = true; continue }
      if (inSection) break
    }
    if (!inSection) continue

    // Detect "Updated dependencies" sub-section
    if (/^-\s+Updated dependencies/.test(line)) {
      inUpdatedDeps = true
      currentEntry = null
      continue
    }
    // Next top-level bullet ends the "Updated dependencies" block
    if (inUpdatedDeps && /^-\s+[^-\s]/.test(line)) {
      inUpdatedDeps = false
    }
    if (inUpdatedDeps) continue

    // Actual change bullet: "- <hash>: <description>"
    const m = line.match(/^-\s+([a-f0-9]{7,}): (.+)/)
    if (m) {
      hasDirect = true
      currentEntry = { hash: m[1], description: m[2], subBullets: [], pkg: pkgName }
      changes.push(currentEntry)
      continue
    }

    // Indented sub-bullet under a change entry: "  - <text>"
    if (currentEntry) {
      const sm = line.match(/^\s{2,}-\s+(.+)/)
      if (sm) currentEntry.subBullets.push(sm[1])
    }
  }

  return { changes, hasDirect }
}

// ── Collect changes across all packages ───────────────────────────────────
// Deduplicate by commit hash so the same fix isn't listed multiple times
// (changesets repeats dep-update hashes in child packages).
const seenHashes = new Set()
// allChanges: { description, pkg }  (hash used only for dedup)
const allChanges = []

for (const { name, version } of publishedPackages) {
  const changelog = path.join(pkgDir(name), 'CHANGELOG.md')
  const { changes } = parseChangelogSection(changelog, version, name)
  for (const c of changes) {
    if (seenHashes.has(c.hash)) continue
    seenHashes.add(c.hash)

    if (c.subBullets.length > 0) {
      // Expand sub-bullets as individual flat items
      for (const sub of c.subBullets) {
        allChanges.push({ description: sub, pkg: c.pkg })
      }
    } else {
      allChanges.push({ description: c.description, pkg: c.pkg })
    }
  }
}

// ── Build "What's Changed" section ────────────────────────────────────────
// Group by source package, but only show package label when there are
// changes from multiple packages to keep it readable.
const byPkg = {}
for (const c of allChanges) {
  ;(byPkg[c.pkg] = byPkg[c.pkg] || []).push(c)
}

const multiPkg = Object.keys(byPkg).length > 1

let changesSection = ''
if (allChanges.length === 0) {
  changesSection = '_No user-facing changes in this release._'
} else if (!multiPkg) {
  changesSection = allChanges.map(c => `- ${c.description}`).join('\n')
} else {
  // Show short package label (strip scope prefix) before each group
  changesSection = Object.entries(byPkg)
    .map(([pkg, items]) => {
      const label = pkg.replace('@wangeditor-next/', '')
      return items.map(c => `- **[${label}]** ${c.description}`).join('\n')
    })
    .join('\n')
}

// ── Build package versions table ──────────────────────────────────────────
const versionRows = publishedPackages
  .map(({ name, version }) => `| \`${name}\` | \`${version}\` |`)
  .join('\n')

const versionsTable =
  `| Package | Version |\n` +
  `| --- | --- |\n` +
  versionRows

// ── Compose full release body ──────────────────────────────────────────────
const editorPkg = publishedPackages.find(p => p.name === '@wangeditor-next/editor')
const title = editorPkg ? `v${editorPkg.version}` : tag

const body = `## What's Changed

${changesSection}

<details>
<summary>Package versions</summary>

${versionsTable}

</details>`

const bodyFile = path.join(require('os').tmpdir(), 'release-body.md')
fs.writeFileSync(bodyFile, body)

// ── Create GitHub Release ──────────────────────────────────────────────────
execSync(
  `gh release create "${tag}" --title "${title}" --notes-file "${bodyFile}"`,
  { stdio: 'inherit' },
)

console.log(`\nConsolidated GitHub release created: ${tag}`)
