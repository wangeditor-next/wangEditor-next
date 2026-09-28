# Dependency modernization migration

This change targets the next major product release after 6.4.3. The official runtime packages
remain in the existing Changesets fixed group; upgrade them together. The Rollup-to-tsdown
migration already shipped in 6.4.3 and is retained here.

## Consumer requirements

| Integration                 | Required version                             | Action                                                                                                          |
| --------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Modular editor / plugins    | Slate `^0.126.2`, Snabbdom `^3.6.4`          | Align these peers across the editor and custom plugins; check custom Slate element types.                       |
| Built-in image/video upload | `@uppy/core` and `@uppy/xhr-upload` `^6.0.0` | Remove older Uppy peers. Review any direct Uppy API use or `uppyConfig` / `xhrConfig` overrides against Uppy 6. |
| Vue 3 adapter               | Vue `^3.5.43`                                | Upgrade the application's Vue runtime before adopting this release.                                             |
| Yjs adapters                | Yjs `^13.6.33` and Slate `^0.126.2`          | Keep one compatible Yjs instance across providers and adapters.                                                 |
| React adapters              | React / React DOM `>=17.0.2`                 | The peer range is unchanged; the repository now develops and tests on React 19 with `createRoot`.               |
| Vue 2 adapter               | Vue `^2.7.16`                                | The runtime requirement is unchanged; its build tooling is updated.                                             |

The full editor bundles its upload dependencies. Applications importing individual packages must
satisfy their declared peers. Existing public ESM, UMD, CSS and declaration entrypoints are retained.
The editor's upload adapter and callbacks remain available; applications that use Uppy-specific
APIs must account for Uppy breaking changes. Custom upload adapters remain supported.

## Workspace and collaboration demos

- Keep Node `^20.19.0 || ^22.13.0` and pnpm `9.15.0`. The workspace uses Vite 7, Vitest 4,
  TypeScript 5.9 and Playwright 1.63; install the corresponding Playwright browser binaries.
- Vitest excludes `.github` tests, which use the separate Node test runner. This preserves the
  test discovery boundary from Vitest 3; it does not convert release scripts to jsdom tests.
- Yjs demos use `y-websocket` 3. Its server is a separate package:
  `@y/websocket-server` is pinned to `0.1.1` for compatibility with Yjs 13.
  Replace imports from `y-websocket/bin/utils` with `@y/websocket-server/utils` in custom demo servers.
- UnoCSS replaces WindiCSS in both collaboration demos. Import `@unocss/reset/tailwind.css`
  before generated utility CSS and application styles to retain the preflight baseline.

## Validation and rollback

Validate a clean frozen install, full build, published entrypoints/types, typecheck, lint and
unit tests. Browser checks should cover upload success/failure, editing and HTML round trips,
React/Vue wrappers, cross-browser smoke, and Yjs synchronization/cursors using production bundles.
The PR records actual results; this document is not a claim that a gate has passed.

Before release, revert the dependency modernization PR as a unit if integration fails, retaining
the tsdown and release fixes already on master. After release, consumers can pin **all** official
packages to `6.4.3` and restore their previous peer versions and lockfile. Do not mix product
generations or unpublish a released version. No content schema migration is introduced here;
retain saved-document regression fixtures when testing custom plugins.
