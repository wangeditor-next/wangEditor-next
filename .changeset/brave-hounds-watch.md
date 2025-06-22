---
"@wangeditor-next/basic-modules": patch
"@wangeditor-next/core": patch
"@wangeditor-next/table-module": patch
---

修复表格批量选择功能中的样式和变换操作

- 修复了表格批量选择时 addMark 和 removeMark 方法的处理逻辑
- 修复了 Transforms.setNodes 在表格批量选择场景下的行为
- 改进了基础模块（颜色、对齐、行高等）与表格批量选择的集成
- 添加了完整的测试覆盖，确保功能稳定性
- 扩展了编辑器接口，支持 getTableSelection 方法
