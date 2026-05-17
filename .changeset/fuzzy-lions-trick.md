---
'@wangeditor-next/core': patch
'@wangeditor-next/editor': patch
---

Fix IME composition stability for long-text Chinese input (issue #793) by
capturing native DOM selection containers directly during composition
boundaries instead of converting Slate ranges in transient sync windows.

Align the composition flow with Slate-style handling to avoid
`Cannot resolve a DOM point from Slate point` errors, and add regression
coverage for repeated composition commits on long text.
