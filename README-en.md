# wangEditor-next 5

[![codecov](https://codecov.io/gh/wangeditor-next/wangeditor-next-next/branch/master/graph/badge.svg?token=0ZSXFXJPK3)](https://codecov.io/gh/wangeditor-next/wangeditor-next-next)
[![GitHub stars](https://img.shields.io/github/stars/wangeditor-next/wangeditor-next-next)](https://github.com/wangeditor-next/wangEditor-next/stargazers)

[Chinese](./README.md)

## Introduction

The original project [wangeditor-next](https://github.com/wangeditor-next/wangeditor-next) is temporarily not maintained due to the author's [personal reasons](https://juejin.cn/post/7272735633458413602). This project is a forked version that will continue to be maintained with minimal breaking changes.

An open-source web rich text editor that is ready to use out of the box with simple configuration. It supports JS, Vue, and React.

- [Documentation](https://wangeditor-next.github.io/docs/)
- [Demo](https://wangeditor-next.github.io/demo/)

![](./docs/images/editor.png)

## Features

- **Easy to use**: Simple configuration and ready to use out of the box.
- **Multi-framework support**: Works with JS, Vue, and React.
- **Customizable**: Highly customizable to fit your needs.
- **Lightweight**: Minimal footprint with high performance.

## Installation

### For Vue or React
```shell
npm i wangeditor-next/editor
```

### For HTML using CDN resources
```html
<script src="https://unpkg.com/@wangeditor-next/editor@latest/dist/index.js"></script>
```

## Usage Examples

### HTML
Try it on StackBlitz: [HTML Example](https://stackblitz.com/edit/stackblitz-starters-xxqmwl)

### Vue 2
Try it on StackBlitz: [Vue 2 Example](https://stackblitz.com/edit/vue2-vite-starter-hkmsif)

### Vue 3
Try it on StackBlitz: [Vue 3 Example](https://stackblitz.com/edit/vue3-wangeditor-demo-8emmc7)

### React
Try it on StackBlitz: [React Example](https://stackblitz.com/edit/react-4osjqn)

The source of truth for demos in this repository lives under `apps/`:

- `apps/demo-html`
- `apps/demo-react`
- `apps/demo-vue3`
- `apps/demo-yjs-react`
- `apps/demo-yjs-vue3`

Run them locally:

```sh
pnpm demo:html
pnpm demo:react
pnpm demo:vue3
pnpm demo:yjs:react
pnpm demo:yjs:vue3
```

Notes:

- StackBlitz links are for online reproduction and sharing
- The maintained demo sources live in `apps/*`, not inside the remote sandboxes
- Export a template from local source with `pnpm demo:export-template demo-react <output-dir>` or `pnpm demo:export-template demo-vue3 <output-dir>`
- To sync templates automatically, configure the repo variables and secret used by `.github/workflows/export-demo-templates.yml`

## Communication

- [Discuss issues and suggestions](https://github.com/wangeditor-next/wangEditor-next/issues)

## Contribution

We welcome contributions! Please read the [contribution guidelines](https://github.com/wangeditor-next/wangEditor-next/blob/master/docs/contribution-CN.md) and the development guide in the [docs](https://github.com/wangeditor-next/wangEditor-next/tree/master/docs) folder.

## 🌟 Support and Motivation

If you find this project helpful, please give it a ⭐️! Your support is my motivation to maintain and improve this project. Thank you!

## Donation

To donate to the original project, support wangEditor's open-source work at https://opencollective.com/wangeditor (~~though no one donates anyway~~).

## License

[MIT License](https://opensource.org/licenses/MIT)
