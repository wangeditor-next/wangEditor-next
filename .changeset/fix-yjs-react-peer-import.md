---
'@wangeditor-next/yjs-for-react': patch
---

Fix browser ESM and UMD bundles calling require('react') from the bundled external-store shim. Reuse the consumer's React without adding new browser globals.
