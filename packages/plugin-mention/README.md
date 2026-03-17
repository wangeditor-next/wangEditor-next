# wangEditor mention 插件

[English Documentation](./README-en.md)

## 介绍

[wangeditor-next](https://github.com/cycleccc/wangEditor-next) mention 插件，如 `@张三`。

![](./_img/demo.png)

## 安装

```shell
pnpm add @wangeditor-next/plugin-mention
```

## 使用

[Vue 示例源码](https://github.com/wangfupeng1988/vue2-wangeditor-demo/blob/master/src/components/MyEditorWithMention.vue)

### 注册到编辑器

```ts
import { IDomEditor, Boot, IEditorConfig } from '@wangeditor-next/editor'
import mentionModule, { MentionElement } from '@wangeditor-next/plugin-mention'

// 注册。要在创建编辑器之前注册，且只能注册一次，不可重复注册。
Boot.registerModule(mentionModule)

// 显示弹框
function showModal(editor: IDomEditor) {
  // 获取光标位置，定位 modal
  const domSelection = document.getSelection()
  const domRange = domSelection.getRangeAt(0)
  if (domRange == null) return
  const selectionRect = domRange.getBoundingClientRect()

  // 获取编辑区域 DOM 节点的位置，以辅助定位
  const containerRect = editor.getEditableContainer().getBoundingClientRect()

  // 显示 modal 弹框，并定位
  // PS：modal 需要自定义，如 <div> 或 Vue React 组件


  // 当触发某事件（如点击一个按钮）时，插入 mention 节点
  function insertMention() {
    const mentionNode: MentionElement = {
      type: 'mention', // 必须是 'mention'
      value: '张三', // 文本
      info: { x: 1, y: 2 }, // 其他信息，自定义
      children: [{ text: '' }], // 必须有一个空 text 作为 children
    }

    editor.restoreSelection() // 恢复选区
    editor.deleteBackward('character') // 删除 '@'
    editor.insertNode(mentionNode) // 插入 mention
    editor.move(1) // 移动光标
  }
}

// 隐藏弹框
function hideModal(editor: IDomEditor) {
  // 隐藏 modal
}

// 编辑器配置
const editorConfig: Partial<IEditorConfig> = {
  EXTEND_CONF: {
    mentionConfig: {
      showModal, // 必须
      hideModal, // 必须
    },
  },

  // 其他...
}

// 创建创建和工具栏，会用到 editorConfig 。具体查看 wangEditor 文档
```

### 显示 HTML

mention 节点返回的 HTML 格式如下，其中 `data-info` 的值需要 `decodeURIComponent` 解析。

```html
<span data-w-e-type="mention" data-w-e-is-void data-w-e-is-inline data-value="张三" data-info="%7B%22x%22%3A10%7D">@张三</span>
```
