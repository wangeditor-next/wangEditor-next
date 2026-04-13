# wangEditor-next 5


[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]
[![codecov](https://codecov.io/gh/wangeditor-next/wangeditor-next/graph/badge.svg?token=0ZSXFXJPK3)](https://codecov.io/gh/wangeditor-next/wangeditor-next)

🌍 [English](./README-en.md) | 中文

## 介绍

原项目 [wangeditor](https://github.com/wangeditor-team/wangEditor) 因作者[个人原因](https://juejin.cn/post/7272735633458413602)短期不再维护，本项目为 fork 版本,将在尽量不 Breaking Change 的前提下继续维护。

开源 Web 富文本编辑器，开箱即用，配置简单。支持 JS Vue React 。

- [文档](https://wangeditor-next.github.io/docs/)
- [Demo](https://wangeditor-next.github.io/demo/)

![](./docs/images/editor.png)

## 特点

- **易于使用**：简单配置，开箱即用。
- **多框架支持**：支持 JS、Vue 和 React。
- **可定制**：高度可定制，满足您的需求。
- **轻量级**：占用空间小，性能高。

## CSP 严格模式（class 样式输出）

在禁止内联样式的 CSP 场景，可开启 `textStyleMode: 'class'`：

```ts
const editorConfig = {
  textStyleMode: 'class',
  classStylePolicy: 'preserve-data', // preserve-data | fallback-inline | strict
  styleClassTokens: {
    color: ['rgb(1, 2, 3)'],
  },
  onClassStyleUnsupported(payload) {
    // 记录日志或上报监控
  },
}
```

- 默认仍是 `inline`，现有项目无须改动即可继续使用。
- class 模式下，默认 token 的 class 样式由内置样式表提供。
- 若扩展了 `styleClassTokens`，需业务侧补充对应 CSS。
- 详细行为和兼容性说明见 [docs/class-style-mode.md](./docs/class-style-mode.md)。

## 安装

### 对于 Vue 或 React
```shell
npm install @wangeditor-next/editor --save
// vue3 需要额外下载
npm install @wangeditor-next/editor-for-vue --save
// vue2 需要额外下载
npm install @wangeditor-next/editor-for-vue2 --save
// react 需要额外下载
npm install @wangeditor-next/editor-for-react --save
```

### 对于 HTML 使用 CDN 资源
```html
<script src="https://unpkg.com/@wangeditor-next/editor@latest/dist/index.js"></script>
```

## 使用示例

| 示例 | 在线 demo 链接 |
|------|------|
| HTML | [在 StackBlitz 上试用](https://stackblitz.com/edit/stackblitz-starters-xxqmwl) |
| Vue 2 | [在 StackBlitz 上试用](https://stackblitz.com/edit/vue2-vite-starter-hkmsif) |
| Vue 3 | [在 StackBlitz 上试用](https://stackblitz.com/fork/github/wangeditor-next/demo-templates/tree/main/demo-vue3?title=wangEditor%20Vue%203%20Demo&startScript=dev) |
| React | [在 StackBlitz 上试用](https://stackblitz.com/fork/github/wangeditor-next/demo-templates/tree/main/demo-react?title=wangEditor%20React%20Demo&startScript=dev) |

仓库内 demo 的真实源码统一维护在 `apps/`：

- `apps/demo-html`
- `apps/demo-react`
- `apps/demo-vue3`
- `apps/demo-yjs-react`
- `apps/demo-yjs-vue3`

本地运行：

```sh
pnpm demo:html
pnpm demo:react
pnpm demo:vue3
pnpm demo:yjs:react
pnpm demo:yjs:vue3
```

说明：

- README 中的 StackBlitz 链接用于在线复现和分享
- 仓库内实际维护以 `apps/*` 为准，不建议直接把沙盒代码当成长期维护源
- 如需导出模板，可使用 `pnpm demo:export-template demo-react <output-dir>` 或 `pnpm demo:export-template demo-vue3 <output-dir>`
- 如需自动同步模板仓库，可配置 `.github/workflows/export-demo-templates.yml` 所需的 repo variables / secret


## 交流

- [讨论问题和建议](https://github.com/wangeditor-next/wangEditor-next/issues)

## 贡献

我们欢迎所有贡献！请阅读[贡献指南](https://github.com/wangeditor-next/wangEditor-next/blob/master/docs/contribution-CN.md)及 [docs](https://github.com/wangeditor-next/wangEditor-next/tree/master/docs) 文件夹内的开发指南。

## 🌟 支持与鼓励

如果你觉得这个项目对你有帮助，请不要忘记给它一个 ⭐️！你的支持是我持续维护和改进这个项目的动力。感谢你的支持！

## 捐赠

对原项目捐赠即可，支持 wangEditor 开源工作：https://opencollective.com/wangeditor (~~虽然也没人捐赠~~)。

## 贡献者

<a href="https://github.com/wangeditor-next/wangEditor-next/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=wangeditor-next/wangeditor-next" />
</a>

## License

[MIT](./LICENSE) License © 2024-PRESENT [cycleccc](https://github.com/cycleccc)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@wangeditor-next/editor?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/@wangeditor-next/editor
[npm-downloads-src]: https://img.shields.io/npm/dm/@wangeditor-next/core?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/@wangeditor-next/editor
[bundle-src]: https://img.shields.io/bundlephobia/minzip/@wangeditor-next/editor?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=@wangeditor-next/editor
[license-src]: https://img.shields.io/github/license/wangeditor-next/wangeditor-next.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/wangeditor-next/wangEditor-next/blob/master/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/@wangeditor-next/editor
