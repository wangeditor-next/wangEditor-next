# Change Log

## 1.5.38

### Patch Changes

- 5e7bfdf: 修复表格批量选择时使用选择范围+标准API替代直接节点操作，解决工具栏状态和格式延续问题
- Updated dependencies [5e7bfdf]
  - @wangeditor-next/core@1.7.38

## 1.5.37

### Patch Changes

- 8c91da0: 修复表格批量选择功能中的样式和变换操作
  - 修复了表格批量选择时 addMark 和 removeMark 方法的处理逻辑
  - 修复了 Transforms.setNodes 在表格批量选择场景下的行为
  - 改进了基础模块（颜色、对齐、行高等）与表格批量选择的集成
  - 添加了完整的测试覆盖，确保功能稳定性
  - 扩展了编辑器接口，支持 getTableSelection 方法

- Updated dependencies [8c91da0]
  - @wangeditor-next/core@1.7.37

## 1.5.36

### Patch Changes

- Updated dependencies [54e958e]
  - @wangeditor-next/core@1.7.36

## 1.5.35

### Patch Changes

- Updated dependencies [e6f4533]
  - @wangeditor-next/core@1.7.35

## 1.5.34

### Patch Changes

- Updated dependencies [1450d35]
  - @wangeditor-next/core@1.7.34

## 1.5.33

### Patch Changes

- Updated dependencies [71397d4]
  - @wangeditor-next/core@1.7.33

## 1.5.32

### Patch Changes

- Updated dependencies [c60e0e2]
  - @wangeditor-next/core@1.7.32

## 1.5.31

### Patch Changes

- Updated dependencies [76fb46e]
  - @wangeditor-next/core@1.7.31

## 1.5.30

### Patch Changes

- Updated dependencies [53fcee8]
  - @wangeditor-next/core@1.7.30

## 1.5.29

### Patch Changes

- Updated dependencies [d1d8246]
  - @wangeditor-next/core@1.7.29

## 1.5.28

### Patch Changes

- Updated dependencies [7225111]
  - @wangeditor-next/core@1.7.28

## 1.5.27

### Patch Changes

- Updated dependencies [2099e64]
  - @wangeditor-next/core@1.7.27

## 1.5.26

### Patch Changes

- 8c762a9: feat(code block): add code block handletab

## 1.5.25

### Patch Changes

- Updated dependencies [5fa2a72]
  - @wangeditor-next/core@1.7.26

## 1.5.24

### Patch Changes

- 5bbff78: fix: add more font style
- Updated dependencies [7b80f5d]
  - @wangeditor-next/core@1.7.25

## 1.5.23

### Patch Changes

- Updated dependencies [af6b10e]
  - @wangeditor-next/core@1.7.24

## 1.5.22

### Patch Changes

- Updated dependencies [9fb698d]
  - @wangeditor-next/core@1.7.23

## 1.5.21

### Patch Changes

- Updated dependencies [fa8b969]
  - @wangeditor-next/core@1.7.22

## 1.5.20

### Patch Changes

- Updated dependencies [258e365]
  - @wangeditor-next/core@1.7.21

## 1.5.19

### Patch Changes

- Updated dependencies [58022b2]
  - @wangeditor-next/core@1.7.20

## 1.5.18

### Patch Changes

- Updated dependencies [85c2579]
  - @wangeditor-next/core@1.7.19

## 1.5.17

### Patch Changes

- Updated dependencies [1e70838]
  - @wangeditor-next/core@1.7.18

## 1.5.16

### Patch Changes

- Updated dependencies [f1848d5]
  - @wangeditor-next/core@1.7.17

## 1.5.15

### Patch Changes

- Updated dependencies [a9982a5]
  - @wangeditor-next/core@1.7.16

## 1.5.14

### Patch Changes

- Updated dependencies [dc5dea1]
  - @wangeditor-next/core@1.7.15

## 1.5.13

### Patch Changes

- Updated dependencies [3ed8ab9]
  - @wangeditor-next/core@1.7.14

## 1.5.12

### Patch Changes

- Updated dependencies [c18aa53]
  - @wangeditor-next/core@1.7.13

## 1.5.11

### Patch Changes

- c0cfd9c: 254 在windows上搭建webview2或者electron客户端使用wangeditor和搜狗输入法执行特定步骤会出现异常
- Updated dependencies [c0cfd9c]
  - @wangeditor-next/core@1.7.12

## 1.5.10

### Patch Changes

- ceeb138: fix path resolve warning
- Updated dependencies [ceeb138]
  - @wangeditor-next/core@1.7.11

## 1.5.9

### Patch Changes

- Updated dependencies [3dbff77]
  - @wangeditor-next/core@1.7.10

## 1.5.8

### Patch Changes

- eea16b2: perf: added menu config ts type
- Updated dependencies [eea16b2]
  - @wangeditor-next/core@1.7.9

## 1.5.7

### Patch Changes

- f111276: Fix test error
- Updated dependencies [f111276]
  - @wangeditor-next/core@1.7.8

## 1.5.6

### Patch Changes

- ac57da1: refactor test and build depts
- Updated dependencies [ac57da1]
  - @wangeditor-next/core@1.7.7

## 1.5.5

### Patch Changes

- c7ef2d0: refactor by new eslint rule
- Updated dependencies [c7ef2d0]
  - @wangeditor-next/core@1.7.6

## 1.5.4

### Patch Changes

- 7d067a0: Improved compatibility with styles of nested tags (e.g., <b>, <strong>, <sup>) to ensure correct rendering within the editor
- Updated dependencies [7d067a0]
  - @wangeditor-next/core@1.7.5

## 1.5.3

### Patch Changes

- 52340bc: refactor workflow
- Updated dependencies [52340bc]
  - @wangeditor-next/core@1.7.4

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.5.2](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/basic-modules@1.5.1...@wangeditor-next/basic-modules@1.5.2) (2024-08-29)

### Reverts

- Revert "chore: modify package publish config" ([7e2785e](https://github.com/wangeditor-next/wangeditor-next/commit/7e2785ede4512e19f8a337e745440e7bf9de2f30))

## [1.5.1](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/basic-modules@1.5.0...@wangeditor-next/basic-modules@1.5.1) (2024-08-25)

**Note:** Version bump only for package @wangeditor-next/basic-modules

# [1.5.0](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/basic-modules@1.4.2...@wangeditor-next/basic-modules@1.5.0) (2024-08-18)

### Bug Fixes

- **format painter:** modify import name ([0cb36dd](https://github.com/wangeditor-next/wangeditor-next/commit/0cb36dd2422a27d20cbc0a677c861d3d321af8eb))
- **link:** typo error ([6a463ad](https://github.com/wangeditor-next/wangeditor-next/commit/6a463ad4df50c53c77503c593bdbc4421669a3b3))

### Features

- **format painter menu:** add format painter menu ([93a2d4b](https://github.com/wangeditor-next/wangeditor-next/commit/93a2d4b4da3632eb15ed7d4aa65499ab3249cdbd))

## [1.4.2](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/basic-modules@1.4.1...@wangeditor-next/basic-modules@1.4.2) (2024-08-15)

### Bug Fixes

- **header:** add h6 header ([30ced5f](https://github.com/wangeditor-next/wangeditor-next/commit/30ced5f5f82a2fac80e014673ace925622cc9ff6))

### Reverts

- **image:** set image height ([1eb29f3](https://github.com/wangeditor-next/wangeditor-next/commit/1eb29f3447d67c8bfc536569ebbe8e6ec2e84b1b))

# [1.4.0](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/basic-modules@1.3.7...@wangeditor-next/basic-modules@1.4.0) (2024-08-11)

### Features

- add cancel full screen ([1efee3f](https://github.com/wangeditor-next/wangeditor-next/commit/1efee3fa01664cf730718949db6a3cbce830b8f0))

## [1.3.8](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/basic-modules@1.3.7...@wangeditor-next/basic-modules@1.3.8) (2024-08-08)

**Note:** Version bump only for package @wangeditor-next/basic-modules

## [1.3.7](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/basic-modules@1.3.6...@wangeditor-next/basic-modules@1.3.7) (2024-08-03)

### Bug Fixes

- **image module:** incorrect conversion ([00bdd92](https://github.com/wangeditor-next/wangeditor-next/commit/00bdd921600a0ec8b7f7c71000f6859e8378fb56))

## [1.3.6](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/basic-modules@1.3.5...@wangeditor-next/basic-modules@1.3.6) (2024-07-27)

### Bug Fixes

- **divider table:** delete empty paragraph ([0df585e](https://github.com/wangeditor-next/wangeditor-next/commit/0df585ef4fdf19f4b4f3207c281e53d7cd7af6bb))

## [1.3.5](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/basic-modules@1.3.3...@wangeditor-next/basic-modules@1.3.5) (2024-07-21)

### Bug Fixes

- **img link:** image incorrectly converted to link ([d0ed194](https://github.com/wangeditor-next/wangeditor-next/commit/d0ed194639960260dd5f983312fe7e62a5a46427))

## [1.3.4](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/basic-modules@1.3.3...@wangeditor-next/basic-modules@1.3.4) (2024-07-21)

### Bug Fixes

- **img link:** image incorrectly converted to link ([d0ed194](https://github.com/wangeditor-next/wangeditor-next/commit/d0ed194639960260dd5f983312fe7e62a5a46427))

## [1.3.3](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/basic-modules@1.3.2...@wangeditor-next/basic-modules@1.3.3) (2024-07-17)

### Bug Fixes

- **blockquote:** handle missing path on paste causing findPath error ([af2d3a4](https://github.com/wangeditor-next/wangeditor-next/commit/af2d3a4d15d8a1129c68f73e7ca38fb9c3d84f71))

## [1.3.2](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/basic-modules@1.3.0...@wangeditor-next/basic-modules@1.3.2) (2024-07-15)

**Note:** Version bump only for package @wangeditor-next/basic-modules

## [1.3.1](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/basic-modules@1.3.0...@wangeditor-next/basic-modules@1.3.1) (2024-07-14)

**Note:** Version bump only for package @wangeditor-next/basic-modules

# [1.3.0](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/basic-modules@1.2.7...@wangeditor-next/basic-modules@1.3.0) (2024-07-11)

### Bug Fixes

- lint —fix & test tuning ([26c254b](https://github.com/wangeditor-next/wangeditor-next/commit/26c254bbc5b1736bb636766f2fbf1c67e5815a38))

### Features

- Table add merge / split cell ([26250fa](https://github.com/wangeditor-next/wangeditor-next/commit/26250faaa6fbbbdd39a4d5c28364df9d944596bd))

## [1.2.7](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/basic-modules@1.2.6...@wangeditor-next/basic-modules@1.2.7) (2024-06-29)

### Performance Improvements

- **insert link:** add length restriction when maxlength is set ([b857dfb](https://github.com/wangeditor-next/wangeditor-next/commit/b857dfb9f99532cb13c29218fc6a8cd7de956f14))

## [1.2.6](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/basic-modules@1.2.5...@wangeditor-next/basic-modules@1.2.6) (2024-06-24)

### Bug Fixes

- **edit size:** input content show default value ([6418903](https://github.com/wangeditor-next/wangeditor-next/commit/641890329a06cade7ad70abb9093719afce1811d))

## [1.2.5](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/basic-modules@1.2.4...@wangeditor-next/basic-modules@1.2.5) (2024-06-22)

**Note:** Version bump only for package @wangeditor-next/basic-modules

## [1.2.4](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/basic-modules@1.2.3...@wangeditor-next/basic-modules@1.2.4) (2024-06-22)

### Performance Improvements

- **video:** modify video position by toolbar ([b0c5f0a](https://github.com/wangeditor-next/wangeditor-next/commit/b0c5f0a0fe8e0b0db4456f8777430a1610f700b7))

## [1.2.3](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/basic-modules@1.2.2...@wangeditor-next/basic-modules@1.2.3) (2024-06-17)

### Performance Improvements

- add width and height attr ([353036a](https://github.com/wangeditor-next/wangeditor-next/commit/353036a5b0697472a92e93bcf2a166d1bf9e214a))

## [1.2.2](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/basic-modules@1.2.1...@wangeditor-next/basic-modules@1.2.2) (2024-06-14)

### Performance Improvements

- remove unused code ([5b2452a](https://github.com/wangeditor-next/wangeditor-next/commit/5b2452ad6f659bc53880ad360644b6a4a4946ce6))

## [1.2.1](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/basic-modules@1.2.0...@wangeditor-next/basic-modules@1.2.1) (2024-06-13)

### Performance Improvements

- add edit image and video width height menu ([f0a9ce6](https://github.com/wangeditor-next/wangeditor-next/commit/f0a9ce6a24107e6e4865f38dd8cd1c7f048551f2))

# 1.2.0 (2024-05-19)

### Bug Fixes

- **font family menu:** 处理 setHtml 的时候字体样式回显失败的问题 ([b941bab](https://github.com/wangeditor-next/wangeditor-next/commit/b941babbdc6bd5bf7da0cce826803a8fde011e07))
- **indent menu:** 修复了因为设置 fontSize 导致 text-indent 没法对齐的问题 ([a431d46](https://github.com/wangeditor-next/wangeditor-next/commit/a431d465ff929b331ebc2545aeb52e7ca3eba2d2))
- 部分菜单 disabled ([87f1233](https://github.com/wangeditor-next/wangeditor-next/commit/87f12332a087072406c1988dc5cef2eae8335375))
- 插入表格会删掉去掉 issue 4711 ([d4fac4e](https://github.com/wangeditor-next/wangeditor-next/commit/d4fac4efd06480457a95c2b06e7472cf6204de58))
- 插入图片的 < > 替换 ([5721560](https://github.com/wangeditor-next/wangeditor-next/commit/57215609ada8b9d15f5505d1ba52e49707b5b183))
- 错别字 alwaysEnable ([82c5136](https://github.com/wangeditor-next/wangeditor-next/commit/82c5136f8496be420dfa26b0f30522e19924a907))
- 分割线后无法输入内容 ([146fd05](https://github.com/wangeditor-next/wangeditor-next/commit/146fd05108592d50d036d0f37a2e29fcdd2a97be))
- 更新各包之间依赖版本 ([75c552c](https://github.com/wangeditor-next/wangeditor-next/commit/75c552cc8ed54765bebb86a7ec5329a7fc79e85f))
- 更新了 basic-module 依赖版本 ([20c9543](https://github.com/wangeditor-next/wangeditor-next/commit/20c9543dc9249af6fc7e3a9895ed7f64709ca6ee))
- 兼容 word 文字背景色 ([e820b26](https://github.com/wangeditor-next/wangeditor-next/commit/e820b26730d34480994a343ab262c043c30a4495))
- 禁用时 image 的样式 ([42c993a](https://github.com/wangeditor-next/wangeditor-next/commit/42c993a7668d90ce049b88a01df21b28912c679f))
- 全选设置字体报错 ([cdb14d1](https://github.com/wangeditor-next/wangeditor-next/commit/cdb14d10330b5736534e7aaf3a070df2804a8be2))
- 上下标文案显示 ([0e97da1](https://github.com/wangeditor-next/wangeditor-next/commit/0e97da18279cee6ea06c217972fee4faf9e4758f))
- 添加链接,空格也会在链接中的问题 ([c656827](https://github.com/wangeditor-next/wangeditor-next/commit/c65682743bd49eba9ab64be847f1f9527fb6170b))
- 图片 100% 有横向滚动条 ([d21322a](https://github.com/wangeditor-next/wangeditor-next/commit/d21322a1a9f2e3172a1bd5e175f5ebbb5f2ed074))
- 修复 pnpm 安装 @wangeditor/editor 出现警告的问题 ([4087fbe](https://github.com/wangeditor-next/wangeditor-next/commit/4087fbee01c76bdd55e747a5e86c5e4a8d6a8353))
- 修复多选文字且选择空白行无法修改文字样式 ([99a9150](https://github.com/wangeditor-next/wangeditor-next/commit/99a91509c6e12220bb105cc6d15a0f0a4b375cea))
- 修复光标状态下设置文字样式,菜单不 active 的问题 ([b1b2dba](https://github.com/wangeditor-next/wangeditor-next/commit/b1b2dbaaae11f74bd36ec79ff50de336c252fef5))
- 修复清除格式不完全的问题 ([1181a23](https://github.com/wangeditor-next/wangeditor-next/commit/1181a23e6de71162dc490d9b348379c9b2ef4251))
- 修复设置文字颜色与背景色行为与预期不一致的问题 ([25d3381](https://github.com/wangeditor-next/wangeditor-next/commit/25d3381aa65ce8fe862617e7b1b03cfa5370715d))
- 修复在空字符上插入 link 报错的问题 ([e838f06](https://github.com/wangeditor-next/wangeditor-next/commit/e838f069f556a5d3206e48a5ed76f8d1e0ae3d05))
- 修复html回显时，部分字体回显问题 ([c83ffa7](https://github.com/wangeditor-next/wangeditor-next/commit/c83ffa70da655d03bfd639f2d1fd04986440ead2))
- 选中文字，创建链接（同时修改文字） ([5fdf6ae](https://github.com/wangeditor-next/wangeditor-next/commit/5fdf6ae33b1bebe9b7373e4b7ee8c568480a3c08))
- 移除了每个包下的 publishConfig directory 配置 ([16559f0](https://github.com/wangeditor-next/wangeditor-next/commit/16559f052545c111318be760e64291a521bdcc65))
- 优化 custom-types.d.ts 中类型声明，修复测试文件 ts 报错 ([3a6c455](https://github.com/wangeditor-next/wangeditor-next/commit/3a6c4553245bc734dae1e17d605af389971782a2))
- 有内联元素时对齐失败 ([076c694](https://github.com/wangeditor-next/wangeditor-next/commit/076c694a4b3474080b89f52692595b84bf4d8207))
- 粘贴 HTML 后 font-size font-family line-height 不显示 ([2281957](https://github.com/wangeditor-next/wangeditor-next/commit/2281957020a30de9cda1c5e9d5e20c6668b7f592))
- blockquote & header insertBreak ([06678c9](https://github.com/wangeditor-next/wangeditor-next/commit/06678c963e8c8421ecded448de7510b254117550))
- code node 顶层 ([a927938](https://github.com/wangeditor-next/wangeditor-next/commit/a9279388f14212319505f6a5da300cd15e81c214))
- code-block 换行 - 自动加入前面的空格 ([c214032](https://github.com/wangeditor-next/wangeditor-next/commit/c2140327842d803cd18a9acf47ec3225182bf940))
- color toHtml ([2c9718c](https://github.com/wangeditor-next/wangeditor-next/commit/2c9718cb2feb4dd0a7bf39238598707fa6d2bb21))
- delete divider ([f04cbd6](https://github.com/wangeditor-next/wangeditor-next/commit/f04cbd6009099629e3cd41be19d20b6788fe7f28))
- disabled - img 和 todo 可编辑 ([cf6a3f2](https://github.com/wangeditor-next/wangeditor-next/commit/cf6a3f2a1e05b6231f46aa74c422561e4147f7ae))
- divider - 键盘删除 ([31db059](https://github.com/wangeditor-next/wangeditor-next/commit/31db0593dbc77fba9b4a719bc0f48f1223afd680))
- editor.focus() 参数语法错误 ([334fa21](https://github.com/wangeditor-next/wangeditor-next/commit/334fa217d43fdaa95454e7c85a53526b7b777fda))
- emptyP toHtml 增加 br ([c347c29](https://github.com/wangeditor-next/wangeditor-next/commit/c347c2916416edc96a99d1bf53c0e18cd22d80f9))
- font-size - 支持配置 name value ([206ebd9](https://github.com/wangeditor-next/wangeditor-next/commit/206ebd994d2635704d93ef9ebe0022d7d72ddea8))
- getHtml API ([c0b60cf](https://github.com/wangeditor-next/wangeditor-next/commit/c0b60cf47d8eaae4292265906fbe07875e1564c9))
- header 不禁用 bold ([f4cd3d0](https://github.com/wangeditor-next/wangeditor-next/commit/f4cd3d0b85725701c3ec650e4d6ae7d8831f5105))
- hoverbar 被点击多次隐藏 ([bf4fc19](https://github.com/wangeditor-next/wangeditor-next/commit/bf4fc193847e8caba3a67c8dd152eae4f1950c4f))
- hoverbar modal 重复创建 ([70d2b61](https://github.com/wangeditor-next/wangeditor-next/commit/70d2b618a0662c88cd5e6691f513009726ce1b9b))
- hoverbar show/hide ([c96bc83](https://github.com/wangeditor-next/wangeditor-next/commit/c96bc8378939fecd78807fea4f2b7e1eec2a9ea0))
- image 拖拽，设置最小值 ([0205023](https://github.com/wangeditor-next/wangeditor-next/commit/0205023d8c1ec3fafcba3a950afcaef9f5f5170f))
- insert link ([a104682](https://github.com/wangeditor-next/wangeditor-next/commit/a10468279f730c9a4216474cf3d44d41f124cb6b))
- insertHtml - 空行 ([53a8fbb](https://github.com/wangeditor-next/wangeditor-next/commit/53a8fbb5cf665ef0d6f7fd1c2fee73dba0d98e32))
- insertHtml - 空行 ([c61f415](https://github.com/wangeditor-next/wangeditor-next/commit/c61f415c41d393f203ae5e5c17d9167ec60a1824))
- issue 4308 - 自定义字号、字体无法回显 ([ad38b8c](https://github.com/wangeditor-next/wangeditor-next/commit/ad38b8ce6dbcff1d65785c8d6701238ad351f562))
- justify - disable ([3a4b24e](https://github.com/wangeditor-next/wangeditor-next/commit/3a4b24e8e628024de248f0b52bb4066f626e7480))
- justify indent ([5a81e52](https://github.com/wangeditor-next/wangeditor-next/commit/5a81e527a45e7a92eb36a2aefa50d93e20c4cec2))
- justify menu disabled ([19e2f80](https://github.com/wangeditor-next/wangeditor-next/commit/19e2f8008a435101c6ecd4d4a7eadd423cb1070f))
- link 无文本 ([af4fb32](https://github.com/wangeditor-next/wangeditor-next/commit/af4fb3218bd4651763f66c804fec2b872e99e8f3))
- link, text hoverbar 选区问题 ([e0b7438](https://github.com/wangeditor-next/wangeditor-next/commit/e0b7438c89a347f1b0b940d9c11150b72d595529))
- lodash.throttle 引用 bug ([50aeff9](https://github.com/wangeditor-next/wangeditor-next/commit/50aeff94859bf328346cb9cfe89d0abd57c3b641))
- maxLength - 拼音 + 粘贴 ([3ac4db6](https://github.com/wangeditor-next/wangeditor-next/commit/3ac4db6d78cbe7a8d1fe19747deb0a17edd9b552))
- menu active ([10829e2](https://github.com/wangeditor-next/wangeditor-next/commit/10829e2e9e1d864d4900821ee3d5fa516b8cca2a))
- parse html - 有些 elem children 需要过滤 ([63cbb80](https://github.com/wangeditor-next/wangeditor-next/commit/63cbb804c8c7a778a4ee1f4ba8717a11b4b6b5a3))
- parse indent style 负数 ([c8d746e](https://github.com/wangeditor-next/wangeditor-next/commit/c8d746e0464bdda626313c17af4d015681ccc3e8))
- parse-html - sub sup ([2c15a5f](https://github.com/wangeditor-next/wangeditor-next/commit/2c15a5f9c9c2de8b34770a6bebfe765d203a03f6))
- parse-html pre/code ([d9bd773](https://github.com/wangeditor-next/wangeditor-next/commit/d9bd773f9a40f9531d9163700253d0b5f717afb8))
- rename es module filename ([1821d4e](https://github.com/wangeditor-next/wangeditor-next/commit/1821d4eef49e64efcb41b848849ca7a5e6472044))
- shadow dom 中 modal 输入框异常 ([ef3b199](https://github.com/wangeditor-next/wangeditor-next/commit/ef3b199a3e74c6b8ba61ed781e1aa13a1c5acfde))
- style-to-html - 输入 a 会删除外部的 <a> 标签 ([af1f523](https://github.com/wangeditor-next/wangeditor-next/commit/af1f523983f2bc4b7eaf9726d4b8a35227ab27dc))
- table - elemToHtml ([e36e609](https://github.com/wangeditor-next/wangeditor-next/commit/e36e6092ef721723169afc8bf0560a47ac9f4dfc))
- tableCell 中 br 报错 ([8604db7](https://github.com/wangeditor-next/wangeditor-next/commit/8604db751b622c01fa5391af59328236cf13effc))

### Features

- 两端对齐 ([e5080d3](https://github.com/wangeditor-next/wangeditor-next/commit/e5080d3dd102f7a951d8e1f370db834778ecbdfa))
- 上标 下标 ([40dab08](https://github.com/wangeditor-next/wangeditor-next/commit/40dab085a061ea3e838f0cfa86260c6c6f894c69))
- 增加 enable disable API（删除 setConfig setMenuConfig API） ([984fc50](https://github.com/wangeditor-next/wangeditor-next/commit/984fc50520061fc34ea08f4136bdeb93dee46564))
- 增加 header4 header5 ([cc48734](https://github.com/wangeditor-next/wangeditor-next/commit/cc4873412ce3f4de1ecc1dbf4c313094dceb5a77))
- 支持 nodejs 环境 ([484f18c](https://github.com/wangeditor-next/wangeditor-next/commit/484f18c3abc70d19e51c556f48491c18d390b1e1))
- basic text paste ([f0a5b98](https://github.com/wangeditor-next/wangeditor-next/commit/f0a5b980c95fa1e2fc59a898c6e0d0723c276c28))
- clearStyle menu ([8002f70](https://github.com/wangeditor-next/wangeditor-next/commit/8002f707ed04b914180ec36fdca0edf48c815e01))
- drag resize image ([cd72028](https://github.com/wangeditor-next/wangeditor-next/commit/cd72028f1786e2e53079ad5cbef1b8569731ca79))
- editor 生命周期，自定义事件 ([00e9bc2](https://github.com/wangeditor-next/wangeditor-next/commit/00e9bc2cfcb8b622764db1c76394491d72ffd93e))
- enter menu ([988fc31](https://github.com/wangeditor-next/wangeditor-next/commit/988fc31f31de3d37dffbf54abb784cceb8e6118d))
- focus支持focus到文档末尾 ([628830e](https://github.com/wangeditor-next/wangeditor-next/commit/628830ef06ff85b3e67001ce30dd9e0557b0aa28))
- fullScreen ([e7ccd88](https://github.com/wangeditor-next/wangeditor-next/commit/e7ccd88a7dd58f64b7bd484de428e3a76cc994f7))
- getHeaders & editor.srcollToElem ([2bfb813](https://github.com/wangeditor-next/wangeditor-next/commit/2bfb813e4957f080c6676ec38f8f051275cdf44a))
- groupButton disabled ([8ffd44c](https://github.com/wangeditor-next/wangeditor-next/commit/8ffd44c9a44758e951ca7bd02dd46746fcac1c03))
- header button menu ([6413135](https://github.com/wangeditor-next/wangeditor-next/commit/64131354d54705e11fd6992fcf5a4389371c3560))
- i18n ([c11b244](https://github.com/wangeditor-next/wangeditor-next/commit/c11b2440f91b99d40bca18b675c66a22b6e160c9))
- image menu - width 50% 100% ([f9b4c68](https://github.com/wangeditor-next/wangeditor-next/commit/f9b4c68dff3232b50491b07949c20eb4c18baa6b))
- image menu config ([bb18774](https://github.com/wangeditor-next/wangeditor-next/commit/bb187740e9703b4a76cde4f5e4d32ac714aa793a))
- insertHtml - text style ([6f303c5](https://github.com/wangeditor-next/wangeditor-next/commit/6f303c5be81dc8763a28bc982928e5bc9f2936d9))
- link menu config ([fe6b6db](https://github.com/wangeditor-next/wangeditor-next/commit/fe6b6db62086a5014c25ea96aa9308c2028a5b60))
- parse html ([2a5eace](https://github.com/wangeditor-next/wangeditor-next/commit/2a5eace00f33cded50b68e8164748ec2480213fd))
- parse src (link image video) ([715a841](https://github.com/wangeditor-next/wangeditor-next/commit/715a841fc6c730ee2b448a1799a07ce778128aad))
- placeholder ([a3e4cdc](https://github.com/wangeditor-next/wangeditor-next/commit/a3e4cdcd474063e4f436327aaf4074bb2126d941))
- react 组件 ([448fc83](https://github.com/wangeditor-next/wangeditor-next/commit/448fc838d64dbef52cbcddde0e98eb021d8a9122))
- todo ([9608fef](https://github.com/wangeditor-next/wangeditor-next/commit/9608fef2ff86368cdcbb950a74af1246a58709de))
- toHtml 机制 ([1c4d872](https://github.com/wangeditor-next/wangeditor-next/commit/1c4d8729f84aaab6a448f23064b34a20596305e9))
- upload video ([ac8e6f8](https://github.com/wangeditor-next/wangeditor-next/commit/ac8e6f8b5258e593714676a6f6be359ba525833c))
- video menu config ([7fa3783](https://github.com/wangeditor-next/wangeditor-next/commit/7fa3783c42aa83f7d53c8be34be3c8b7c8a64754))

### Performance Improvements

- 优化较大的svg图片 ([2c360e7](https://github.com/wangeditor-next/wangeditor-next/commit/2c360e7628eb655e8df67cc7b764f4981b283a2f))

## [1.1.7](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/basic-modules@1.1.6...@wangeditor/basic-modules@1.1.7) (2022-11-14)

### Bug Fixes

- **font family menu:** 处理 setHtml 的时候字体样式回显失败的问题 ([b941bab](https://github.com/wangeditor-next/wangeditor-next/commit/b941babbdc6bd5bf7da0cce826803a8fde011e07))

## [1.1.6](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/basic-modules@1.1.5...@wangeditor/basic-modules@1.1.6) (2022-09-27)

**Note:** Version bump only for package @wangeditor/basic-modules

## [1.1.5](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/basic-modules@1.1.4...@wangeditor/basic-modules@1.1.5) (2022-09-15)

### Bug Fixes

- 图片 100% 有横向滚动条 ([d21322a](https://github.com/wangeditor-next/wangeditor-next/commit/d21322a1a9f2e3172a1bd5e175f5ebbb5f2ed074))
- 插入表格会删掉去掉 issue 4711 ([d4fac4e](https://github.com/wangeditor-next/wangeditor-next/commit/d4fac4efd06480457a95c2b06e7472cf6204de58))

## [1.1.4](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/basic-modules@1.1.3...@wangeditor/basic-modules@1.1.4) (2022-09-14)

### Bug Fixes

- font-size - 支持配置 name value ([206ebd9](https://github.com/wangeditor-next/wangeditor-next/commit/206ebd994d2635704d93ef9ebe0022d7d72ddea8))

## [1.1.3](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/basic-modules@1.1.2...@wangeditor/basic-modules@1.1.3) (2022-07-13)

### Bug Fixes

- parse indent style 负数 ([c8d746e](https://github.com/wangeditor-next/wangeditor-next/commit/c8d746e0464bdda626313c17af4d015681ccc3e8))
- 兼容 word 文字背景色 ([e820b26](https://github.com/wangeditor-next/wangeditor-next/commit/e820b26730d34480994a343ab262c043c30a4495))

## [1.1.2](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/basic-modules@1.1.1...@wangeditor/basic-modules@1.1.2) (2022-07-11)

### Bug Fixes

- editor.focus() 参数语法错误 ([334fa21](https://github.com/wangeditor-next/wangeditor-next/commit/334fa217d43fdaa95454e7c85a53526b7b777fda))
- 修复html回显时，部分字体回显问题 ([c83ffa7](https://github.com/wangeditor-next/wangeditor-next/commit/c83ffa70da655d03bfd639f2d1fd04986440ead2))

## [1.1.1](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/basic-modules@1.1.0...@wangeditor/basic-modules@1.1.1) (2022-06-02)

### Bug Fixes

- issue 4308 - 自定义字号、字体无法回显 ([ad38b8c](https://github.com/wangeditor-next/wangeditor-next/commit/ad38b8ce6dbcff1d65785c8d6701238ad351f562))
- 修复在空字符上插入 link 报错的问题 ([e838f06](https://github.com/wangeditor-next/wangeditor-next/commit/e838f069f556a5d3206e48a5ed76f8d1e0ae3d05))

# [1.1.0](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/basic-modules@1.0.1...@wangeditor/basic-modules@1.1.0) (2022-05-25)

### Bug Fixes

- 粘贴 HTML 后 font-size font-family line-height 不显示 ([2281957](https://github.com/wangeditor-next/wangeditor-next/commit/2281957020a30de9cda1c5e9d5e20c6668b7f592))

### Features

- enter menu ([988fc31](https://github.com/wangeditor-next/wangeditor-next/commit/988fc31f31de3d37dffbf54abb784cceb8e6118d))

## 1.0.1 (2022-04-18)

### Bug Fixes

- 部分菜单 disabled ([87f1233](https://github.com/wangeditor-next/wangeditor-next/commit/87f12332a087072406c1988dc5cef2eae8335375))
- 插入图片的 < > 替换 ([5721560](https://github.com/wangeditor-next/wangeditor-next/commit/57215609ada8b9d15f5505d1ba52e49707b5b183))
- 错别字 alwaysEnable ([82c5136](https://github.com/wangeditor-next/wangeditor-next/commit/82c5136f8496be420dfa26b0f30522e19924a907))
- 分割线后无法输入内容 ([146fd05](https://github.com/wangeditor-next/wangeditor-next/commit/146fd05108592d50d036d0f37a2e29fcdd2a97be))
- 更新各包之间依赖版本 ([75c552c](https://github.com/wangeditor-next/wangeditor-next/commit/75c552cc8ed54765bebb86a7ec5329a7fc79e85f))
- 更新了 basic-module 依赖版本 ([20c9543](https://github.com/wangeditor-next/wangeditor-next/commit/20c9543dc9249af6fc7e3a9895ed7f64709ca6ee))
- 禁用时 image 的样式 ([42c993a](https://github.com/wangeditor-next/wangeditor-next/commit/42c993a7668d90ce049b88a01df21b28912c679f))
- 全选设置字体报错 ([cdb14d1](https://github.com/wangeditor-next/wangeditor-next/commit/cdb14d10330b5736534e7aaf3a070df2804a8be2))
- 上下标文案显示 ([0e97da1](https://github.com/wangeditor-next/wangeditor-next/commit/0e97da18279cee6ea06c217972fee4faf9e4758f))
- 添加链接,空格也会在链接中的问题 ([c656827](https://github.com/wangeditor-next/wangeditor-next/commit/c65682743bd49eba9ab64be847f1f9527fb6170b))
- 修复 pnpm 安装 @wangeditor/editor 出现警告的问题 ([4087fbe](https://github.com/wangeditor-next/wangeditor-next/commit/4087fbee01c76bdd55e747a5e86c5e4a8d6a8353))
- 修复多选文字且选择空白行无法修改文字样式 ([99a9150](https://github.com/wangeditor-next/wangeditor-next/commit/99a91509c6e12220bb105cc6d15a0f0a4b375cea))
- 修复光标状态下设置文字样式,菜单不 active 的问题 ([b1b2dba](https://github.com/wangeditor-next/wangeditor-next/commit/b1b2dbaaae11f74bd36ec79ff50de336c252fef5))
- 修复清除格式不完全的问题 ([1181a23](https://github.com/wangeditor-next/wangeditor-next/commit/1181a23e6de71162dc490d9b348379c9b2ef4251))
- 修复设置文字颜色与背景色行为与预期不一致的问题 ([25d3381](https://github.com/wangeditor-next/wangeditor-next/commit/25d3381aa65ce8fe862617e7b1b03cfa5370715d))
- 选中文字，创建链接（同时修改文字） ([5fdf6ae](https://github.com/wangeditor-next/wangeditor-next/commit/5fdf6ae33b1bebe9b7373e4b7ee8c568480a3c08))
- 移除了每个包下的 publishConfig directory 配置 ([16559f0](https://github.com/wangeditor-next/wangeditor-next/commit/16559f052545c111318be760e64291a521bdcc65))
- 优化 custom-types.d.ts 中类型声明，修复测试文件 ts 报错 ([3a6c455](https://github.com/wangeditor-next/wangeditor-next/commit/3a6c4553245bc734dae1e17d605af389971782a2))
- 有内联元素时对齐失败 ([076c694](https://github.com/wangeditor-next/wangeditor-next/commit/076c694a4b3474080b89f52692595b84bf4d8207))
- blockquote & header insertBreak ([06678c9](https://github.com/wangeditor-next/wangeditor-next/commit/06678c963e8c8421ecded448de7510b254117550))
- code node 顶层 ([a927938](https://github.com/wangeditor-next/wangeditor-next/commit/a9279388f14212319505f6a5da300cd15e81c214))
- code-block 换行 - 自动加入前面的空格 ([c214032](https://github.com/wangeditor-next/wangeditor-next/commit/c2140327842d803cd18a9acf47ec3225182bf940))
- color toHtml ([2c9718c](https://github.com/wangeditor-next/wangeditor-next/commit/2c9718cb2feb4dd0a7bf39238598707fa6d2bb21))
- delete divider ([f04cbd6](https://github.com/wangeditor-next/wangeditor-next/commit/f04cbd6009099629e3cd41be19d20b6788fe7f28))
- disabled - img 和 todo 可编辑 ([cf6a3f2](https://github.com/wangeditor-next/wangeditor-next/commit/cf6a3f2a1e05b6231f46aa74c422561e4147f7ae))
- divider - 键盘删除 ([31db059](https://github.com/wangeditor-next/wangeditor-next/commit/31db0593dbc77fba9b4a719bc0f48f1223afd680))
- emptyP toHtml 增加 br ([c347c29](https://github.com/wangeditor-next/wangeditor-next/commit/c347c2916416edc96a99d1bf53c0e18cd22d80f9))
- getHtml API ([c0b60cf](https://github.com/wangeditor-next/wangeditor-next/commit/c0b60cf47d8eaae4292265906fbe07875e1564c9))
- header 不禁用 bold ([f4cd3d0](https://github.com/wangeditor-next/wangeditor-next/commit/f4cd3d0b85725701c3ec650e4d6ae7d8831f5105))
- hoverbar 被点击多次隐藏 ([bf4fc19](https://github.com/wangeditor-next/wangeditor-next/commit/bf4fc193847e8caba3a67c8dd152eae4f1950c4f))
- hoverbar modal 重复创建 ([70d2b61](https://github.com/wangeditor-next/wangeditor-next/commit/70d2b618a0662c88cd5e6691f513009726ce1b9b))
- hoverbar show/hide ([c96bc83](https://github.com/wangeditor-next/wangeditor-next/commit/c96bc8378939fecd78807fea4f2b7e1eec2a9ea0))
- image 拖拽，设置最小值 ([0205023](https://github.com/wangeditor-next/wangeditor-next/commit/0205023d8c1ec3fafcba3a950afcaef9f5f5170f))
- insert link ([a104682](https://github.com/wangeditor-next/wangeditor-next/commit/a10468279f730c9a4216474cf3d44d41f124cb6b))
- insertHtml - 空行 ([53a8fbb](https://github.com/wangeditor-next/wangeditor-next/commit/53a8fbb5cf665ef0d6f7fd1c2fee73dba0d98e32))
- insertHtml - 空行 ([c61f415](https://github.com/wangeditor-next/wangeditor-next/commit/c61f415c41d393f203ae5e5c17d9167ec60a1824))
- justify - disable ([3a4b24e](https://github.com/wangeditor-next/wangeditor-next/commit/3a4b24e8e628024de248f0b52bb4066f626e7480))
- justify indent ([5a81e52](https://github.com/wangeditor-next/wangeditor-next/commit/5a81e527a45e7a92eb36a2aefa50d93e20c4cec2))
- justify menu disabled ([19e2f80](https://github.com/wangeditor-next/wangeditor-next/commit/19e2f8008a435101c6ecd4d4a7eadd423cb1070f))
- link 无文本 ([af4fb32](https://github.com/wangeditor-next/wangeditor-next/commit/af4fb3218bd4651763f66c804fec2b872e99e8f3))
- link, text hoverbar 选区问题 ([e0b7438](https://github.com/wangeditor-next/wangeditor-next/commit/e0b7438c89a347f1b0b940d9c11150b72d595529))
- lodash.throttle 引用 bug ([50aeff9](https://github.com/wangeditor-next/wangeditor-next/commit/50aeff94859bf328346cb9cfe89d0abd57c3b641))
- maxLength - 拼音 + 粘贴 ([3ac4db6](https://github.com/wangeditor-next/wangeditor-next/commit/3ac4db6d78cbe7a8d1fe19747deb0a17edd9b552))
- menu active ([10829e2](https://github.com/wangeditor-next/wangeditor-next/commit/10829e2e9e1d864d4900821ee3d5fa516b8cca2a))
- parse html - 有些 elem children 需要过滤 ([63cbb80](https://github.com/wangeditor-next/wangeditor-next/commit/63cbb804c8c7a778a4ee1f4ba8717a11b4b6b5a3))
- parse-html - sub sup ([2c15a5f](https://github.com/wangeditor-next/wangeditor-next/commit/2c15a5f9c9c2de8b34770a6bebfe765d203a03f6))
- parse-html pre/code ([d9bd773](https://github.com/wangeditor-next/wangeditor-next/commit/d9bd773f9a40f9531d9163700253d0b5f717afb8))
- rename es module filename ([1821d4e](https://github.com/wangeditor-next/wangeditor-next/commit/1821d4eef49e64efcb41b848849ca7a5e6472044))
- shadow dom 中 modal 输入框异常 ([ef3b199](https://github.com/wangeditor-next/wangeditor-next/commit/ef3b199a3e74c6b8ba61ed781e1aa13a1c5acfde))
- style-to-html - 输入 a 会删除外部的 <a> 标签 ([af1f523](https://github.com/wangeditor-next/wangeditor-next/commit/af1f523983f2bc4b7eaf9726d4b8a35227ab27dc))
- table - elemToHtml ([e36e609](https://github.com/wangeditor-next/wangeditor-next/commit/e36e6092ef721723169afc8bf0560a47ac9f4dfc))
- tableCell 中 br 报错 ([8604db7](https://github.com/wangeditor-next/wangeditor-next/commit/8604db751b622c01fa5391af59328236cf13effc))

### Features

- 两端对齐 ([e5080d3](https://github.com/wangeditor-next/wangeditor-next/commit/e5080d3dd102f7a951d8e1f370db834778ecbdfa))
- 上标 下标 ([40dab08](https://github.com/wangeditor-next/wangeditor-next/commit/40dab085a061ea3e838f0cfa86260c6c6f894c69))
- 增加 enable disable API（删除 setConfig setMenuConfig API） ([984fc50](https://github.com/wangeditor-next/wangeditor-next/commit/984fc50520061fc34ea08f4136bdeb93dee46564))
- 增加 header4 header5 ([cc48734](https://github.com/wangeditor-next/wangeditor-next/commit/cc4873412ce3f4de1ecc1dbf4c313094dceb5a77))
- 支持 nodejs 环境 ([484f18c](https://github.com/wangeditor-next/wangeditor-next/commit/484f18c3abc70d19e51c556f48491c18d390b1e1))
- basic text paste ([f0a5b98](https://github.com/wangeditor-next/wangeditor-next/commit/f0a5b980c95fa1e2fc59a898c6e0d0723c276c28))
- clearStyle menu ([8002f70](https://github.com/wangeditor-next/wangeditor-next/commit/8002f707ed04b914180ec36fdca0edf48c815e01))
- drag resize image ([cd72028](https://github.com/wangeditor-next/wangeditor-next/commit/cd72028f1786e2e53079ad5cbef1b8569731ca79))
- editor 生命周期，自定义事件 ([00e9bc2](https://github.com/wangeditor-next/wangeditor-next/commit/00e9bc2cfcb8b622764db1c76394491d72ffd93e))
- focus支持focus到文档末尾 ([628830e](https://github.com/wangeditor-next/wangeditor-next/commit/628830ef06ff85b3e67001ce30dd9e0557b0aa28))
- fullScreen ([e7ccd88](https://github.com/wangeditor-next/wangeditor-next/commit/e7ccd88a7dd58f64b7bd484de428e3a76cc994f7))
- getHeaders & editor.srcollToElem ([2bfb813](https://github.com/wangeditor-next/wangeditor-next/commit/2bfb813e4957f080c6676ec38f8f051275cdf44a))
- groupButton disabled ([8ffd44c](https://github.com/wangeditor-next/wangeditor-next/commit/8ffd44c9a44758e951ca7bd02dd46746fcac1c03))
- header button menu ([6413135](https://github.com/wangeditor-next/wangeditor-next/commit/64131354d54705e11fd6992fcf5a4389371c3560))
- i18n ([c11b244](https://github.com/wangeditor-next/wangeditor-next/commit/c11b2440f91b99d40bca18b675c66a22b6e160c9))
- image menu - width 50% 100% ([f9b4c68](https://github.com/wangeditor-next/wangeditor-next/commit/f9b4c68dff3232b50491b07949c20eb4c18baa6b))
- image menu config ([bb18774](https://github.com/wangeditor-next/wangeditor-next/commit/bb187740e9703b4a76cde4f5e4d32ac714aa793a))
- insertHtml - text style ([6f303c5](https://github.com/wangeditor-next/wangeditor-next/commit/6f303c5be81dc8763a28bc982928e5bc9f2936d9))
- link menu config ([fe6b6db](https://github.com/wangeditor-next/wangeditor-next/commit/fe6b6db62086a5014c25ea96aa9308c2028a5b60))
- parse html ([2a5eace](https://github.com/wangeditor-next/wangeditor-next/commit/2a5eace00f33cded50b68e8164748ec2480213fd))
- parse src (link image video) ([715a841](https://github.com/wangeditor-next/wangeditor-next/commit/715a841fc6c730ee2b448a1799a07ce778128aad))
- placeholder ([a3e4cdc](https://github.com/wangeditor-next/wangeditor-next/commit/a3e4cdcd474063e4f436327aaf4074bb2126d941))
- react 组件 ([448fc83](https://github.com/wangeditor-next/wangeditor-next/commit/448fc838d64dbef52cbcddde0e98eb021d8a9122))
- todo ([9608fef](https://github.com/wangeditor-next/wangeditor-next/commit/9608fef2ff86368cdcbb950a74af1246a58709de))
- toHtml 机制 ([1c4d872](https://github.com/wangeditor-next/wangeditor-next/commit/1c4d8729f84aaab6a448f23064b34a20596305e9))
- upload video ([ac8e6f8](https://github.com/wangeditor-next/wangeditor-next/commit/ac8e6f8b5258e593714676a6f6be359ba525833c))
- video menu config ([7fa3783](https://github.com/wangeditor-next/wangeditor-next/commit/7fa3783c42aa83f7d53c8be34be3c8b7c8a64754))

### Performance Improvements

- 优化较大的svg图片 ([2c360e7](https://github.com/wangeditor-next/wangeditor-next/commit/2c360e7628eb655e8df67cc7b764f4981b283a2f))
