# Dependency modernization in 6.x

This is a backward-compatible minor update after 6.4.3, not a 7.x migration. The existing
21-package Changesets fixed product group remains unchanged. Upgrade official packages
together. No document-schema migration or new default serialization mode is introduced.
The Rollup-to-tsdown migration already shipped in 6.4.3 and is retained.

## Consumer compatibility

| Integration | Supported peers | Bundled / development version |
| --- | --- | --- |
| Slate | `^0.124.0 \|\| ^0.126.2` | Full editor uses `^0.126.2` |
| Snabbdom | `^3.6.0` | Full editor uses `^3.6.4` |
| Uppy core / xhr-upload | Existing 2.x or 5.x ranges in each package manifest | Full editor continues to use 5.x |
| Vue editor adapter | `^3.0.5` | Development uses `^3.5.43` |
| React adapters | React / React DOM `>=17.0.2` | Development uses React 19 |
| Yjs | `^13.5.29` | Development uses `^13.6.33` |
| Vue collaboration adapter | `>=3.5.18` (unchanged) | Development uses Vue 3.5 |
| Vue 2 editor adapter | `^2.7.16` (unchanged) | Vue 2.7 |
| Nano ID | Modular peers remain `^5.0.0` | Bundled / resolved dependency is `^5.1.16` |

The full editor bundles its engine and upload dependencies. Modular consumers must align a
single supported Slate/Yjs instance across editor packages and custom plugins. Existing
public ESM, UMD, CSS and declaration entrypoints are retained. The table's nullable resize
flags remain accepted, and the Vue editor adapter uses runtime helpers and component
declarations available in Vue 3.0.

**Deferred:** Uppy 6 changes direct utility/plugin integrations and Companion authentication;
i18next 26 changes the upstream API/type contract exposed by the editor's translation API.
Neither upgrade is required for this maintenance release. Uppy remains at 5.x in the full
editor, and i18next remains at 23.x. Modular Uppy 2 integration remains supported under the
existing per-package minimums. This does not promise that arbitrary third-party Uppy plugins
work across different Uppy majors.

Nano ID's peer range is retained for API compatibility, not as a security recommendation.
Modular applications should resolve Nano ID 5.1.16 or newer for the invalid-size and integer
overflow fixes. Legacy dependencies installed under test aliases are development fixtures,
not dependencies bundled into the editor.

## Workspace and collaboration demos

- Node remains `^20.19.0 || ^22.13.0`, and pnpm remains `9.15.0`. The workspace uses Vite 7,
  Vitest 4, TypeScript 5.9 and Playwright 1.63.
- Vitest excludes `.github` tests, which continue to use the separate Node test runner.
- Demos use `y-websocket` 3. The standalone `@y/websocket-server` stays pinned to `0.1.1`
  for Yjs 13. Custom demo servers should replace `y-websocket/bin/utils` imports with
  `@y/websocket-server/utils`.
- UnoCSS replaces WindiCSS in collaboration demos. Import `@unocss/reset/tailwind.css`
  before generated utility CSS and application styles to preserve the reset baseline.
- Faker uses the English locale and `person` API. Version `^10.5.0` includes the
  `helpers.fake` security fix and supports the existing Node versions.

## Validation

Run `pnpm build` before `pnpm test:peer-compat`. The compatibility command runs:

- Core, editor, basic, list, table, image/video upload and Yjs tests using Slate 0.124.0,
  Yjs 13.5.29, Snabbdom 3.6.0 and Uppy core 2.1.1 / xhr-upload 2.0.3.
- Published Vue declarations against Vue 3.0.5 and the current development version.
- Production browser fixtures against legacy and current peers: published React/Vue wrapper
  mounting, editing, controlled updates and disposal; modular inline/class HTML round trips,
  undo/redo; and real multipart upload success/failure with metadata and headers.

The browser matrix selects the modular editor source before bundling so its peer aliases
actually choose the tested Slate/Uppy implementation; wrappers use their published output.
Legacy uses React 17.0.2 and Vue 3.0.5; current uses the workspace's React 19 / Vue 3.5 and
Slate 0.126.2 / Uppy 5. The Vue collaboration adapter is not claimed to support Vue 3.0.

Also run the standard current-version full build, published types/entrypoints, typecheck,
lint, unit tests, production upload E2E, cross-browser smoke and Yjs E2E. CI executes the peer
matrix on Node 22 in addition to the normal Node 20/22 tests. The PR records actual results;
this document is not a claim that an unrun gate passed.

## Risks and rollback

Custom Slate plugins may depend on undocumented behavior, so retain saved-document fixtures
and test extensions when opting into Slate 0.126.2. Existing modular consumers can remain on
Slate 0.124.x. Development-tool major upgrades affect repository contributors, not consumer
framework minimums.

Before release, revert this modernization PR as a unit if integration fails, retaining the
tsdown and release fixes already on master. After release, pin all official packages to
6.4.3 and restore the previous lockfile. Do not split the fixed product group or unpublish
a release to change the version outcome.
