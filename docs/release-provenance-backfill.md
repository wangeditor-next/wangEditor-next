# Historical Release Provenance Backfill

Use this process only for packages published before the current release workflow, or when the
original GitHub Actions run is no longer available. Do not weaken `Repair Release Provenance` to
accept these releases.

Create one reviewed PR per historical release and include the following manifest in the PR body or
an attached Markdown file:

```md
## Release Provenance Backfill

- Source repository: `owner/repository`
- Source commit: `<full 40-character SHA>`
- Package: `@scope/package@<version>`
- npm evidence: `https://www.npmjs.com/package/@scope/package/v/<version>`
- Immutable source tag: `@scope/package@<version>`
- Product Release: `v<version>` or `not applicable`
- Reason the automated recovery workflow cannot be used: `<missing run / pre-workflow release>`
- Reviewer evidence: `<two maintainer approvals>`
```

Before creating a source tag or GitHub Release, both reviewers must independently verify that:

1. `npm view @scope/package@<version> version` returns the recorded version.
2. The package manifest at the recorded source commit has the exact package name and version.
3. An existing source tag, if present, resolves to that exact commit.
4. The proposed product Release is only created for `@wangeditor-next/editor`; leaf packages use
   their immutable package source tag instead.

The tag creator must use an annotated tag at the recorded commit. Tag update or deletion is not a
repair mechanism: a mismatched immutable tag is a stop condition that requires a new review.

Issue #950 was handled through this path for
`@wangeditor-next/editor-for-vue@5.1.14`: its npm tarball, source commit, immutable tag, and
historical GitHub Release were recorded before the issue was closed.
