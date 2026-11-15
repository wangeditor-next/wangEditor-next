---
'@wangeditor-next/core': patch
---

修复文本 HTML 实体转义和解析的重复解码问题，确保 `getHtml`、`setHtml` 与代码块中的字面量实体可以往返保留。
