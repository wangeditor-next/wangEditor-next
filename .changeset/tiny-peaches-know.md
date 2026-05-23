---
'@wangeditor-next/editor': patch
---

Optimize `@wangeditor-next/editor` package distribution and lightweight entry ergonomics:

- Exclude `.map` files from npm publish artifacts to reduce install size.
- Upload editor sourcemaps as GitHub Release assets for debugging workflows.
- Add a package-size CI guard (`pnpm run check:editor:pack-size`) to prevent regressions.
