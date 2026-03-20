# Slate Upgrade Audit

## Baseline

- Audit branch: `chore/core/slate-upgrade-audit`
- Audit worktree: `/home/cycleccc/workspace/wangEditor-next-slate-upgrade-20260316`
- Base commit: `origin/master@b54e4873`
- Upstream Slate clone for comparison: `/tmp/slate-upstream`
- Upstream Slate head used in this audit: `91321bd`

## Current Dependency State

- Current local `slate`: `^0.82.0` in `packages/core`, `packages/editor`, `packages/basic-modules`, `packages/list-module`, `packages/table-module`, `packages/video-module`, `packages/upload-image-module`, `packages/plugin-*`, `packages/yjs*`
- Current lockfile-resolved `slate`: `0.82.1`
- Current local `slate-history`: `^0.109.0` in `packages/core`
- Upstream comparison baseline:
  - `slate@0.123.0`
  - `slate-dom@0.123.1`
  - `slate-react@0.123.0`
  - `slate-history@0.115.0`

## Recommendation

- Upgrade `slate` and `slate-history` as a dedicated effort.
- Use `slate-dom` and `slate-react` as source references, not as direct runtime dependencies of `@wangeditor-next/core`.
- Do not try to solve this by a version bump alone. The local DOM bridge and selection/composition pipeline must be realigned with upstream behavior.
- Prefer targeting the current upstream line directly instead of stepping through every intermediate beta version.

## Progress

- Environment aligned to `Node 22.13.0` for audit and validation work.
- Workspace dependencies bumped:
  - `slate` moved to `^0.123.0` across `packages/core`, `packages/editor`, built-in modules, plugins, and `yjs*`.
  - `slate-history` moved to `^0.115.0` in `packages/core`.
- Completed in local `dom-editor`:
  - `toSlateRange` now forwards search direction into `toSlatePoint`.
  - `toSlatePoint` now searches across `contenteditable="false"` neighbors.
  - `toSlatePoint(..., { suppressThrow: true })` no longer crashes on stale `findPath`.
- Completed in local selection sync:
  - `selectionchange` now uses `suppressThrow: true` and skips `Transforms.select` when range resolution fails.
  - `selectionchange` listener now binds to the actual editor root (`Document | ShadowRoot`), not only `window.document`.
  - `selectionchange` now matches upstream target classification more closely: anchor uses `hasSelectableTarget`, focus only needs to remain inside the editor.
  - `selectionchange` ignores native `input` and `textarea` sources before entering the sync pipeline.
- Completed in local `beforeinput` / composition flow:
  - pending DOM selection sync is flushed before handling `beforeinput`.
  - `insertFromComposition` is handled explicitly.
  - `compositionend` skips duplicate insertion when the commit was already applied through `beforeinput`.
  - selection changes that happen while composing are ignored so IME composition does not restore stale Slate selections on commit.
- Regression coverage added for:
  - stale path resolution in `dom-editor`
  - non-editable neighbor point resolution
  - `selectionchange` null-range safety
  - `beforeinput` selection flush
  - duplicate composition commit prevention
  - `TextArea` root-level `selectionchange` binding
- Slate 0.123 API compatibility fixes landed:
  - local render pipeline now consumes `Text.decorations()` as `{ leaf, position }[]`
  - selection helpers now wrap original editor methods instead of recursing through `Transforms.select` / `Transforms.move` / `Transforms.deselect`
  - local `IDomEditor.move` typing now supports both legacy `move(distance, reverse?)` and upstream `move(options?)`
  - workspace packages using `Editor.isVoid` / `Editor.isBlock` now guard with `Element.isElement(...)` where Slate tightened types
- Validation completed on this branch:
  - `pnpm --filter @wangeditor-next/core test`
  - `pnpm --filter @wangeditor-next/basic-modules test -- __tests__/color/color-menus.test.ts __tests__/emotion/emotion-menu.test.ts __tests__/font-size-family/menu/font-size-menu.test.ts __tests__/font-size-family/menu/font-family-menu.test.ts __tests__/image/helper.test.ts __tests__/justify/menus.test.ts __tests__/text-style/menu/menus.test.ts`
  - `pnpm build`
  - full workspace `pnpm test`
  - `pnpm e2e`
- Validation still pending:
  - manual browser verification for IME, ShadowRoot, table selection, and Android/WebView paths

## Why This Needs a Dedicated Track

- The issue tracker shows repeated failures in the same areas:
  - IME / Android / WebView / Sogou / composition:
    - `#12`, `#254`, `#298`, `#733`
  - DOM point / selection mapping crashes:
    - `#614`, `#714`, `#733`
  - Shadow DOM / micro-frontend cursor drift:
    - `#409`
  - Non-editable or custom element cursor behavior:
    - `#249`, `#568`
  - Mobile selection / keyboard re-open behavior:
    - `#750`
- The current local implementations are exactly where upstream Slate has kept patching:
  - `packages/core/src/editor/dom-editor.ts`
  - `packages/core/src/text-area/syncSelection.ts`
  - `packages/core/src/text-area/TextArea.ts`
  - `packages/core/src/text-area/event-handlers/composition.ts`
  - `packages/core/src/text-area/event-handlers/beforeInput.ts`
  - `packages/core/src/text-area/helpers.ts`

## Do Not Adopt Blindly

- Do not import `slate-react` into non-React packages.
- Do not replace the current editor event system wholesale with React `Editable`.
- Do not assume upstream fixes will automatically solve table-module logic bugs. Some failures are local overrides, not upstream Slate bugs.

## Upstream Signals Worth Porting

- `slate-dom@0.123.1`
  - `findPath` should not throw during `toSlatePoint(..., { suppressThrow: true })` after unmount or stale node references.
  - File: `/tmp/slate-upstream/packages/slate-dom/CHANGELOG.md`
  - File: `/tmp/slate-upstream/packages/slate-dom/src/plugin/dom-editor.ts`
- `slate-dom@0.119.0`
  - Shadow DOM Android typing crash fix.
- `slate-dom@0.118.1`
  - Search backward and forward for leaf nodes in non-contenteditable elements inside `toSlatePoint`.
- `slate-react`
  - Ignore `selectionchange` events coming from native `input` and `textarea`.
  - Keep `isComposing` state accurate on `compositionend`.
  - Flush pending `selectionchange` work before `beforeinput`.
  - Restore selection after applying `beforeinput` target ranges.
  - Android-specific pending diff handling around `beforeinput` and selection updates.

## Local To Upstream Mapping

| Local area | Local files | Upstream reference |
| --- | --- | --- |
| DOM node/point/range conversion | `packages/core/src/editor/dom-editor.ts` | `/tmp/slate-upstream/packages/slate-dom/src/plugin/dom-editor.ts` |
| DOM-specific editor plugin behavior | `packages/core/src/editor/plugins/with-dom.ts` | `/tmp/slate-upstream/packages/slate-dom/src/plugin/with-dom.ts` |
| Selection sync loop | `packages/core/src/text-area/syncSelection.ts` | `/tmp/slate-upstream/packages/slate-react/src/components/editable.tsx` |
| Selectionchange wiring | `packages/core/src/text-area/TextArea.ts` | `/tmp/slate-upstream/packages/slate-react/src/components/editable.tsx` |
| IME/composition handling | `packages/core/src/text-area/event-handlers/composition.ts` | `/tmp/slate-upstream/packages/slate-react/src/components/editable.tsx` |
| Beforeinput handling | `packages/core/src/text-area/event-handlers/beforeInput.ts` | `/tmp/slate-upstream/packages/slate-react/src/components/editable.tsx` |
| Target classification helpers | `packages/core/src/text-area/helpers.ts` | `/tmp/slate-upstream/packages/slate-dom/src/plugin/dom-editor.ts` |
| Android-specific deferred input behavior | none today | `/tmp/slate-upstream/packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts` |

## Mandatory Checklist

### 1. Freeze Regression Coverage Before Bumping Versions

- Add characterization tests for the currently reported bug shapes before changing behavior.
- Minimum regression cases:
  - Android / IME autocorrect replacement
  - Chinese IME after `Ctrl+A` then `Enter`
  - Cursor crossing mark/plain-text boundary
  - Selection inside table then `Enter`
  - Selection inside ShadowRoot / micro-frontend host
  - Non-editable inline or void node cursor movement
  - Readonly selection behavior
  - DOM node unmount while selectionchange is still in flight
- Add unit tests where possible under `packages/core/__tests__/text-area` and `packages/core/__tests__/editor`.
- Add at least one browser-level regression in `tests/e2e` for IME-adjacent and table selection behavior.

### 2. Realign Target Classification APIs

- Add a local equivalent of `hasSelectableTarget`.
- Re-audit `hasEditableTarget`, `hasTarget`, and `isTargetInsideNonReadonlyVoid`.
- Ensure readonly mode still allows valid selection detection without treating random external nodes as selectable.
- Review local code paths still assuming "editable" and "selectable" mean the same thing.
- Expected local touch points:
  - `packages/core/src/text-area/helpers.ts`
  - `packages/core/src/text-area/syncSelection.ts`
  - `packages/core/src/text-area/event-handlers/*`

### 3. Rewrite `toSlatePoint` to Match Current Upstream Behavior

- Port the non-contenteditable branch search logic.
- Port nested editor / nested void safety checks.
- Port `searchDirection` handling.
- Port Android zero-width composition adjustments.
- Wrap stale `findPath` resolution in `try/catch` when `suppressThrow` is enabled.
- Expected local touch point:
  - `packages/core/src/editor/dom-editor.ts`

### 4. Rewrite `toSlateRange` to Match Current Upstream Behavior

- Port `focusBeforeAnchor` search direction handling.
- Review ShadowRoot `isCollapsed` compatibility logic.
- Review Firefox-specific table range handling.
- Keep `suppressThrow: true` on selectionchange and readonly safety paths.
- Expected local touch point:
  - `packages/core/src/editor/dom-editor.ts`

### 5. Rebuild the Selectionchange Pipeline

- Re-check the current throttle-only approach in `TextArea.onDOMSelectionChange`.
- Add upstream-style guards for:
  - composing state
  - internal drag state
  - updating-selection state
  - Android pending changes
  - dirty node map / stale DOM mapping
  - events originating from native `input` and `textarea`
- Revisit deselect behavior in readonly mode.
- Expected local touch points:
  - `packages/core/src/text-area/TextArea.ts`
  - `packages/core/src/text-area/syncSelection.ts`

### 6. Rebuild `beforeinput` / composition Coordination

- Flush pending selection synchronization before handling `beforeinput`.
- Re-check whether target ranges should update selection before applying edits.
- Review whether the current composition pipeline should still do manual DOM repair after upstream-aligned selection handling is introduced.
- Preserve wangEditor-specific handling only where upstream behavior does not cover custom rendering constraints.
- Expected local touch points:
  - `packages/core/src/text-area/event-handlers/beforeInput.ts`
  - `packages/core/src/text-area/event-handlers/composition.ts`

### 7. Decide How Much Android Input Manager Logic to Borrow

- Do not port the whole upstream Android input manager blindly.
- Do evaluate whether the current local implementation needs:
  - pending diff buffering
  - deferred flush after non-contenteditable deletion
  - user selection handoff while composing
- This is the main area connected to:
  - `#12`
  - `#254`
  - `#298`
  - `#750`

### 8. Audit Local Overrides That Can Still Break After Upstream Alignment

- Review editor overrides in modules that mutate selection or `insertBreak`.
- Highest risk modules:
  - `packages/table-module/src/module/plugin.ts`
  - `packages/list-module/src/module/plugin.ts`
  - `packages/plugin-markdown/src/module/plugin.ts`
  - `packages/basic-modules/src/modules/link/helper.ts`
- Confirm these still behave correctly after `slate` API and selection semantics shift.

### 9. Upgrade Dependencies

- Update workspace packages from `slate@^0.82.0` to the target range.
- Update `slate-history` in `packages/core`.
- Re-run install and rebuild lockfile.
- Fix compile-time breakages package by package.
- Rebuild all affected packages after `packages/core` changes.

### 10. Re-run Full Validation

- `pnpm install`
- `pnpm build`
- `pnpm test`
- `pnpm e2e`
- Manual validation in:
  - Chrome desktop
  - Firefox desktop
  - Safari desktop if available
  - Android Chrome / WebView
  - Shadow DOM or micro-frontend host

## Suggested Execution Order

1. Add regression tests first.
2. Align local DOM bridge behavior with upstream `slate-dom`.
3. Align selectionchange / beforeinput / composition flow with upstream `slate-react`.
4. Upgrade `slate` and `slate-history`.
5. Fix compile and behavior regressions in `table-module`, `list-module`, markdown, and link handling.
6. Run full build and cross-browser validation.

## High-Risk Local Files

- `packages/core/src/editor/dom-editor.ts`
- `packages/core/src/text-area/syncSelection.ts`
- `packages/core/src/text-area/TextArea.ts`
- `packages/core/src/text-area/event-handlers/composition.ts`
- `packages/core/src/text-area/event-handlers/beforeInput.ts`
- `packages/table-module/src/module/plugin.ts`
- `packages/list-module/src/module/plugin.ts`
- `packages/basic-modules/src/modules/link/helper.ts`
- `packages/plugin-markdown/src/module/plugin.ts`

## Compare Commands

- Compare local DOM bridge against upstream:
  - `git diff --no-index packages/core/src/editor/dom-editor.ts /tmp/slate-upstream/packages/slate-dom/src/plugin/dom-editor.ts`
- Compare local selection sync against upstream editable handling:
  - `git diff --no-index packages/core/src/text-area/syncSelection.ts /tmp/slate-upstream/packages/slate-react/src/components/editable.tsx`
- Search all local Slate integration points:
  - `rg -n "from 'slate'|from 'slate-history'|selectionchange|beforeinput|composition|contenteditable|data-slate" packages -g '!**/dist/**'`

## Deliverable Definition

- The upgrade effort is not done when the code compiles.
- The effort is done when:
  - the dependency bump lands,
  - the issue clusters above have regression coverage,
  - cursor / IME / readonly / table / shadow-root behavior is revalidated,
  - and the local DOM bridge no longer diverges from upstream in the known failure areas without an explicit reason.
