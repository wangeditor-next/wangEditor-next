#!/usr/bin/env node
// Creates the product-level GitHub Release when the editor package is published.
// Usage: node create-consolidated-release.js '<publishedPackagesJSON>'
//   publishedPackagesJSON: JSON array of { name, version } objects (from changesets/action output)

const { execFileSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { getEditorRelease, parsePublishedPackages, writeGitHubOutput } = require('./release-utils')

const publishedPackages = parsePublishedPackages(process.argv[2])

if (publishedPackages.length === 0) {
  console.log('No packages published, skipping release creation.')
  writeGitHubOutput({ editor_published: 'false', tag: '', version: '' })
  process.exit(0)
}

// ── Product release ────────────────────────────────────────────────────────
// Leaf packages have their own @scope/package@version source tags. A product
// release only exists when the public editor package itself is published.
const editorRelease = getEditorRelease(publishedPackages)

if (!editorRelease) {
  console.log('No editor package was published; skip the product-level GitHub Release.')
  writeGitHubOutput({ editor_published: 'false', tag: '', version: '' })
  process.exit(0)
}

const editorPkg = editorRelease
const { tag } = editorRelease

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

const target = process.env.GITHUB_SHA || git(['rev-parse', 'HEAD'])

function resolveLocalTag(tagName) {
  try {
    return git(['rev-parse', `${tagName}^{}`])
  } catch {
    return null
  }
}

function resolveRemoteTag(tagName) {
  const output = git([
    'ls-remote',
    '--tags',
    'origin',
    `refs/tags/${tagName}`,
    `refs/tags/${tagName}^{}`,
  ])

  if (!output) return null

  const entries = output
    .split('\n')
    .map(line => line.split('\t'))
    .filter(parts => parts.length === 2)
  const dereferenced = entries.find(([, ref]) => ref === `refs/tags/${tagName}^{}`)

  return (dereferenced || entries[0])[0]
}

const existingLocalTagTarget = resolveLocalTag(tag)
if (existingLocalTagTarget && existingLocalTagTarget !== target) {
  throw new Error(
    `Local product tag ${tag} points to ${existingLocalTagTarget}, expected ${target}`
  )
}

const existingTagTarget = resolveRemoteTag(tag)
if (existingTagTarget && existingTagTarget !== target) {
  throw new Error(`Product tag ${tag} points to ${existingTagTarget}, expected ${target}`)
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
      const headerVersion = line.match(/^##\s+\[?([^\]\s]+)\]?/)?.[1]
      if (headerVersion === version) {
        inSection = true
        continue
      }
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
const repository = process.env.GITHUB_REPOSITORY || 'wangeditor-next/wangEditor-next'
const versionRows = publishedPackages
  .map(({ name, version }) => {
    const packageTag = `${name}@${version}`
    const encodedTag = encodeURIComponent(packageTag)
    const sourceUrl = `https://github.com/${repository}/tree/${encodedTag}`
    const archiveUrl = `https://github.com/${repository}/archive/refs/tags/${encodedTag}.tar.gz`
    return `| \`${name}\` | \`${version}\` | [Source](${sourceUrl}) ([tar.gz](${archiveUrl})) |`
  })
  .join('\n')

const versionsTable = `| Package | Version | Source |\n` + `| --- | --- | --- |\n` + versionRows

// ── Compose full release body ──────────────────────────────────────────────
const title = `v${editorPkg.version}`

const body = `## What's Changed

${changesSection}

<details>
<summary>Package versions</summary>

${versionsTable}

</details>`

const bodyFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'wangeditor-release-')), 'body.md')
fs.writeFileSync(bodyFile, body)

// ── Create or update GitHub Release ────────────────────────────────────────
function isMissingReleaseError(error) {
  const message = `${error.stdout || ''}\n${error.stderr || ''}`
  return /release not found|could not resolve to a release|http 404/i.test(message)
}

function releaseExists(tagName) {
  try {
    execFileSync('gh', ['release', 'view', tagName, '--json', 'id'], { stdio: 'pipe' })
    return true
  } catch (error) {
    if (isMissingReleaseError(error)) return false
    throw error
  }
}

const releaseArgs = ['--title', title, '--notes-file', bodyFile]
if (editorPkg.version.includes('-')) {
  releaseArgs.push('--prerelease')
}

if (releaseExists(tag)) {
  execFileSync('gh', ['release', 'edit', tag, ...releaseArgs], { stdio: 'inherit' })
  console.log(`\nProduct GitHub release updated: ${tag}`)
} else {
  const createArgs = ['release', 'create', tag]
  if (!existingTagTarget) {
    createArgs.push('--target', target)
  }
  createArgs.push(...releaseArgs)

  execFileSync('gh', createArgs, { stdio: 'inherit' })
  console.log(`\nProduct GitHub release created: ${tag}`)
}

writeGitHubOutput({ editor_published: 'true', tag, version: editorPkg.version })
