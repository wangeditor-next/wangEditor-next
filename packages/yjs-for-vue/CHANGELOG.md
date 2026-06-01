# @wangeditor-next/yjs-for-vue

## 2.0.2

### Patch Changes

- a341fd2: chore: relax internal peer dependency ranges to reduce forced lockstep upgrades.
- Updated dependencies [a341fd2]
  - @wangeditor-next/yjs@2.0.2
  - @wangeditor-next/editor@5.7.8

## 2.0.1

### Patch Changes

- Updated dependencies [8a8ae86]
  - @wangeditor-next/editor@5.7.7
  - @wangeditor-next/yjs@2.0.1

## 2.0.0

### Patch Changes

- f8d9577: Align Slate to `^0.124.0` across the monorepo to avoid mixed Slate type sources.
  - upgrade all internal `slate` dependency and peer dependency ranges from `^0.123.0` to `^0.124.0`
  - remove dual installation of `slate@0.123.x` and `slate@0.124.x` in workspace builds
  - fix `@wangeditor-next/yjs-for-react` build failures caused by cross-version Slate type incompatibilities

- Updated dependencies [f8d9577]
- Updated dependencies [0459fb2]
  - @wangeditor-next/editor@5.7.6
  - @wangeditor-next/yjs@2.0.0

## 1.0.5

### Patch Changes

- Updated dependencies [42d5803]
  - @wangeditor-next/editor@5.7.5
  - @wangeditor-next/yjs@1.0.5

## 1.0.4

### Patch Changes

- Updated dependencies [0b21edf]
- Updated dependencies [008047e]
- Updated dependencies [438ab1c]
  - @wangeditor-next/editor@5.7.4
  - @wangeditor-next/yjs@1.0.4

## 1.0.3

### Patch Changes

- Updated dependencies [d311c7a]
- Updated dependencies [6641948]
- Updated dependencies [edc17af]
- Updated dependencies [b2c0fa7]
- Updated dependencies [e90bd5b]
  - @wangeditor-next/editor@5.7.3
  - @wangeditor-next/yjs@1.0.3

## 1.0.2

### Patch Changes

- Updated dependencies [38532c2]
- Updated dependencies [ff0ba6a]
  - @wangeditor-next/editor@5.7.2
  - @wangeditor-next/yjs@1.0.2

## 1.0.1

### Patch Changes

- Updated dependencies [148253e]
- Updated dependencies [0c091d0]
  - @wangeditor-next/editor@5.7.1
  - @wangeditor-next/yjs@1.0.1

## 1.0.0

### Patch Changes

- Updated dependencies [fe22817]
- Updated dependencies [d51d961]
  - @wangeditor-next/editor@5.7.0
  - @wangeditor-next/yjs@1.0.0

## 0.1.10

### Patch Changes

- @wangeditor-next/editor@5.6.56
- @wangeditor-next/yjs@0.1.50

## 0.1.9

### Patch Changes

- @wangeditor-next/editor@5.6.55

## 0.1.8

### Patch Changes

- Updated dependencies [2da282d]
- Updated dependencies [3bdc0b7]
- Updated dependencies [2c68112]
  - @wangeditor-next/editor@5.6.54
  - @wangeditor-next/yjs@0.1.49

## 0.1.7

### Patch Changes

- Updated dependencies [00d1de8]
  - @wangeditor-next/editor@5.6.53
  - @wangeditor-next/yjs@0.1.48

## 0.1.6

### Patch Changes

- Updated dependencies [2d02268]
  - @wangeditor-next/editor@5.6.52
  - @wangeditor-next/yjs@0.1.47

## 0.1.5

### Patch Changes

- 5150062: Upgrade the Slate dependency line to `slate@^0.123.0` and `slate-history@^0.115.0`, and realign wangEditor's DOM bridge, selection sync, and composition handling with current Slate behavior.

  This release also fixes regressions around full-document delete normalization, selectionchange handling in `Document | ShadowRoot`, and related list / paste / image / code-block flows covered by the workspace E2E suite.

- Updated dependencies [015c192]
- Updated dependencies [5150062]
  - @wangeditor-next/editor@5.6.51
  - @wangeditor-next/yjs@0.1.46

## 0.1.4

### Patch Changes

- Updated dependencies [160e5a3]
  - @wangeditor-next/editor@5.6.50

## 0.1.3

### Patch Changes

- Updated dependencies [dd1b701]
  - @wangeditor-next/editor@5.6.49

## 0.1.2

### Patch Changes

- Updated dependencies [6b823fa]
  - @wangeditor-next/editor@5.6.48

## 0.1.1

### Patch Changes

- 5aeb10f: feat(yjs): add yjs-for-vue(#165)
- Updated dependencies [5aeb10f]
  - @wangeditor-next/yjs@0.1.44
  - @wangeditor-next/editor@5.6.47
