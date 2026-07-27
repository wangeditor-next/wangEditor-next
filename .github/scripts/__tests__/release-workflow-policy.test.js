const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const rootDir = path.resolve(__dirname, '../../..')
const releaseWorkflow = fs.readFileSync(path.join(rootDir, '.github/workflows/release.yml'), 'utf8')
const repairWorkflow = fs.readFileSync(
  path.join(rootDir, '.github/workflows/repair-release-provenance.yml'),
  'utf8'
)

function getReleaseSubjectPattern(workflow) {
  const match = workflow.match(
    /release_subject_pattern='([^']+)'\n\s+release_subject_pattern\+='([^']+)'/
  )

  assert.ok(match, 'workflow must define a release subject pattern')
  return new RegExp(`${match[1]}${match[2]}`)
}

test('release only publishes from master through the protected automation environment', () => {
  assert.match(releaseWorkflow, /push:\n\s+branches:\n\s+- master\n/)
  assert.doesNotMatch(releaseWorkflow, /workflow_dispatch:/)
  assert.match(releaseWorkflow, /id: release_work/)
  assert.match(releaseWorkflow, /needs: validate/)
  assert.match(releaseWorkflow, /if: needs\.validate\.outputs\.requires_release == 'true'/)
  assert.match(releaseWorkflow, /environment: release-automation/)
  assert.match(releaseWorkflow, /contents: read/)
  assert.match(releaseWorkflow, /pull-requests: read/)
  assert.doesNotMatch(releaseWorkflow, /id-token: write/)
  assert.match(releaseWorkflow, /secrets\.NPM_RELEASE_TOKEN/)
  assert.match(releaseWorkflow, /secrets\.RELEASE_AUTOMATION_TOKEN/)
  assert.doesNotMatch(releaseWorkflow, /secrets\.NPM_TOKEN/)
  assert.doesNotMatch(releaseWorkflow, /secrets\.DOCS_REPO_DISPATCH_TOKEN/)
  assert.doesNotMatch(releaseWorkflow, /secrets\.GITHUB_TOKEN/)
})

test('release detection recognizes the Changesets merge commit subject', () => {
  const pattern = getReleaseSubjectPattern(releaseWorkflow)

  assert.match('chore(release): publish a new release version (#949)', pattern)
  assert.doesNotMatch('chore(release): publish a new release version forged', pattern)
})

test('repair trusts master runs and uses the protected automation token', () => {
  assert.match(repairWorkflow, /workflow_dispatch:/)
  assert.match(repairWorkflow, /if: github\.ref == 'refs\/heads\/master'/)
  assert.match(repairWorkflow, /\[ "\$\{run_branch\}" != 'master' \]/)
  assert.match(repairWorkflow, /environment: release-automation/)
  assert.match(repairWorkflow, /contents: read/)
  assert.match(repairWorkflow, /GH_TOKEN: \$\{\{ secrets\.RELEASE_AUTOMATION_TOKEN \}\}/)
  assert.doesNotMatch(repairWorkflow, /secrets\.DOCS_REPO_DISPATCH_TOKEN/)
  const pattern = getReleaseSubjectPattern(repairWorkflow)

  assert.match('chore(release): publish a new release version (#949)', pattern)
})
