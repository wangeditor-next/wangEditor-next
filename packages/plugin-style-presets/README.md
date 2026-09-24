# wangEditor 命名样式预设插件

[English Documentation](./README-en.md)

## 介绍

`@wangeditor-next/plugin-style-presets` 为 wangEditor v6 提供语义化的文本和块级样式预设。
内容保存稳定的 preset key，实际视觉样式由业务 CSS 控制，因此切换主题时无需修改历史内容。

插件默认不注册到编辑器，不会改变现有工具栏、节点或 HTML 输出。

## 安装

```shell
pnpm add @wangeditor-next/plugin-style-presets
```

## 注册

```ts
import { Boot } from '@wangeditor-next/editor'
import stylePresetsModule from '@wangeditor-next/plugin-style-presets'

// 创建编辑器之前注册，且只能注册一次。
Boot.registerModule(stylePresetsModule)
```

## 配置

```ts
const editorConfig = {
  MENU_CONF: {
    stylePreset: {
      presets: [
        {
          key: 'muted-text',
          title: '提示文字',
          scope: 'text',
          className: 'article-muted',
        },
        {
          key: 'lead-paragraph',
          title: '导语',
          scope: 'block',
          className: 'article-lead',
        },
      ],
    },
  },
}

const toolbarConfig = {
  insertKeys: {
    index: 4,
    keys: ['stylePreset'],
  },
}
```

- `key`：持久化到 JSON 和 HTML 的稳定 kebab-case 标识，不应随主题变化。
- `title`：工具栏菜单展示名称。
- `scope: 'text'`：应用到所选文字或后续输入文字。
- `scope: 'block'`：应用到选区内的段落、标题、列表项等块节点。
- `className`：可选业务 class，支持空格分隔的多个 class。

插件始终额外输出 `w-e-style-preset-${key}`，即使不配置 `className` 也可直接编写 CSS。

## CSS

```css
.article-muted {
  color: var(--article-muted-color, #667085);
  font-size: 0.875rem;
}

.article-lead {
  color: var(--article-lead-color, #344054);
  font-size: 1.125rem;
  line-height: 1.75;
}
```

编辑器区域和独立 HTML 展示区域都需要加载相同的业务 CSS。

## HTML

文本预设：

```html
<span class="w-e-style-preset-muted-text article-muted" data-w-e-style-preset="muted-text"
  >提示内容</span
>
```

块级预设：

```html
<p class="w-e-style-preset-lead-paragraph article-lead" data-w-e-style-preset="lead-paragraph">
  文章导语
</p>
```

导入时优先读取 `data-w-e-style-preset`。没有 data 属性时，也会根据已配置的业务 class
恢复 preset。遇到尚未配置的 data key 时保留数据，后续补回配置即可恢复显示。

## 命令 API

```ts
import {
  applyStylePreset,
  getActiveStylePreset,
  removeStylePreset,
} from '@wangeditor-next/plugin-style-presets'

applyStylePreset(editor, 'muted-text')
getActiveStylePreset(editor) // 'muted-text' | null
removeStylePreset(editor, 'text') // 'text' | 'block' | 'all'
```

## 兼容性

- 支持 `@wangeditor-next/editor >= 6.0.0`。
- 不改变现有 inline/class 样式模式。
- 不会自动加入默认工具栏。
- 支持 `Slate -> HTML -> Slate`、`HTML -> Slate -> HTML` 和 `setHtml(getHtml())` 回环。
