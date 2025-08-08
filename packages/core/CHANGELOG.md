# Change Log

## 1.7.43

### Patch Changes

- 06ebf22: feat(video-module、upload-image-module): customUpload添加eidtor实例为第三个参数（兼容），便于用户在使用customUpload时调用上传进度条
- ad751aa: chore: 移除多个包中的lodash.isequal依赖
- ad751aa: chore: 移除多个包中的lodash.isequal依赖

## 1.7.42

### Patch Changes

- a37ae4b: fix: 特定场景下死循环问题；style: 魔法字符串；fix: 继承已有子节点；fix：#645

## 1.7.41

### Patch Changes

- a4b6fd8: chore: add rollup package link

## 1.7.40

### Patch Changes

- d000e3f: Update interface.ts

## 1.7.39

### Patch Changes

- 2b8635e: avoid repeated execution of HTML/content (#635)

## 1.7.38

### Patch Changes

- 5e7bfdf: 修复表格批量选择时使用选择范围+标准API替代直接节点操作，解决工具栏状态和格式延续问题

## 1.7.37

### Patch Changes

- 8c91da0: 修复表格批量选择功能中的样式和变换操作
  - 修复了表格批量选择时 addMark 和 removeMark 方法的处理逻辑
  - 修复了 Transforms.setNodes 在表格批量选择场景下的行为
  - 改进了基础模块（颜色、对齐、行高等）与表格批量选择的集成
  - 添加了完整的测试覆盖，确保功能稳定性
  - 扩展了编辑器接口，支持 getTableSelection 方法

## 1.7.36

### Patch Changes

- 54e958e: 抛出一个允许节点跳过缓存的配置项，默认屏蔽list不走缓存

## 1.7.35

### Patch Changes

- e6f4533: 优化编辑器内容过多表格数据容易卡顿

## 1.7.34

### Patch Changes

- 1450d35: update slate version && modify core content plugin

## 1.7.33

### Patch Changes

- 71397d4: feat: enhance upload configuration with additional Uppy and XHRUpload options

## 1.7.32

### Patch Changes

- c60e0e2: fix: Safari paste image base64 and blob (#524)

## 1.7.31

### Patch Changes

- 76fb46e: fix(table): forbidden tabale drag event

## 1.7.30

### Patch Changes

- 53fcee8: Select the toolbar placement below the last row

## 1.7.29

### Patch Changes

- d1d8246: feat: add customCopy event handler for copy

## 1.7.28

### Patch Changes

- 7225111: fix(max length): sync update leftLength

## 1.7.27

### Patch Changes

- 2099e64: fix(upload): add complete upload callback

## 1.7.26

### Patch Changes

- 5fa2a72: fix(upload): delete remove file api

## 1.7.25

### Patch Changes

- 7b80f5d: fix: revert default font config

## 1.7.24

### Patch Changes

- af6b10e: revert diff by selection

## 1.7.23

### Patch Changes

- 9fb698d: perf: reduce re-rendering

## 1.7.22

### Patch Changes

- fa8b969: fix(table): compatible with table style nesting

## 1.7.21

### Patch Changes

- 258e365: fix: show microsoft world img

## 1.7.20

### Patch Changes

- 58022b2: 319 bug 表格单元格内多选内容删除事件没有执行

## 1.7.19

### Patch Changes

- 85c2579: 278 bug选中区域同时选中了有序无序列表与表格单元格时进行删除操作后报错

## 1.7.18

### Patch Changes

- 1e70838: fix(composition): reinput when cursor in link fornt

## 1.7.17

### Patch Changes

- f1848d5: feat: elem id add type

## 1.7.16

### Patch Changes

- a9982a5: fix: safari img src not base64

## 1.7.15

### Patch Changes

- dc5dea1: 253 图片无法回显行内元素包含行内元素无法解析

## 1.7.14

### Patch Changes

- 3ed8ab9: perf: refactor upload type

## 1.7.13

### Patch Changes

- c18aa53: fix: 修复单元格内的换行在编辑模式下的视觉错误

## 1.7.12

### Patch Changes

- c0cfd9c: 254 在windows上搭建webview2或者electron客户端使用wangeditor和搜狗输入法执行特定步骤会出现异常

## 1.7.11

### Patch Changes

- ceeb138: fix path resolve warning

## 1.7.10

### Patch Changes

- 3dbff77: 163 bug只读模式下无法复制文本内容

## 1.7.9

### Patch Changes

- eea16b2: perf: added menu config ts type

## 1.7.8

### Patch Changes

- f111276: Fix test error

## 1.7.7

### Patch Changes

- ac57da1: refactor test and build depts

## 1.7.6

### Patch Changes

- c7ef2d0: refactor by new eslint rule

## 1.7.5

### Patch Changes

- 7d067a0: Improved compatibility with styles of nested tags (e.g., <b>, <strong>, <sup>) to ensure correct rendering within the editor

## 1.7.4

### Patch Changes

- 52340bc: refactor workflow

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.7.3](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/core@1.7.2...@wangeditor-next/core@1.7.3) (2024-09-01)

### Bug Fixes

- **micro app:** fix removeAttr undefind ([c1398ac](https://github.com/wangeditor-next/wangeditor-next/commit/c1398ac0ffa615ab563db6bba261232868f64d84))

## [1.7.2](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/core@1.7.1...@wangeditor-next/core@1.7.2) (2024-08-29)

### Reverts

- Revert "fix(table): filter microsoft word o:p tag" ([17e4349](https://github.com/wangeditor-next/wangeditor-next/commit/17e4349c35f0f96aee3eef917527d859369722d7))
- Revert "chore: modify package publish config" ([7e2785e](https://github.com/wangeditor-next/wangeditor-next/commit/7e2785ede4512e19f8a337e745440e7bf9de2f30))

## [1.7.1](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/core@1.7.0...@wangeditor-next/core@1.7.1) (2024-08-25)

### Bug Fixes

- **base button menu:** record disabled status ([9a7ab29](https://github.com/wangeditor-next/wangeditor-next/commit/9a7ab29fe16666799a20e6173d24b3cb5707f06c))
- **table:** filter microsoft word o:p tag ([173c08d](https://github.com/wangeditor-next/wangeditor-next/commit/173c08d2fd0ff6154bc20dc2931b5856cbc7b228))

# [1.7.0](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/core@1.5.6...@wangeditor-next/core@1.7.0) (2024-08-15)

### Features

- add bar language change listen ([f0c89be](https://github.com/wangeditor-next/wangeditor-next/commit/f0c89bee8020bd8c453d9dd06909cc63dc574803))
- add cancel full screen ([1efee3f](https://github.com/wangeditor-next/wangeditor-next/commit/1efee3fa01664cf730718949db6a3cbce830b8f0))

# [1.6.0](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/core@1.5.6...@wangeditor-next/core@1.6.0) (2024-08-11)

### Features

- add cancel full screen ([1efee3f](https://github.com/wangeditor-next/wangeditor-next/commit/1efee3fa01664cf730718949db6a3cbce830b8f0))

## [1.5.6](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/core@1.5.5...@wangeditor-next/core@1.5.6) (2024-08-03)

### Bug Fixes

- **multi editor:** clear selection ([b7b2fe7](https://github.com/wangeditor-next/wangeditor-next/commit/b7b2fe76de7e4afd1f3370eafdf1a0d4175f22bf))
- **UI:** delete no scroll absolute ([4a522a1](https://github.com/wangeditor-next/wangeditor-next/commit/4a522a18663e7b6da7b172f6eb3b0a98686cd0fe)), closes [/github.com/wangeditor-next/wangeditor-next-next/issues/55#issuecomment-2254190838](https://github.com//github.com/wangeditor-next/wangeditor-next-next/issues/55/issues/issuecomment-2254190838)

### Reverts

- revert core version ([48cdf16](https://github.com/wangeditor-next/wangeditor-next/commit/48cdf16efda69b553b53d10f94234d366b8ff2e9))

## [1.5.6-alpha.0](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/core@1.5.5...@wangeditor-next/core@1.5.6-alpha.0) (2024-07-25)

### Reverts

- **core:** core selection judge ([e87ee63](https://github.com/wangeditor-next/wangeditor-next/commit/e87ee63d5ade4001e6c2509bfda374b8a5ff82ff))

## [1.5.5](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/core@1.5.3...@wangeditor-next/core@1.5.5) (2024-07-21)

### Bug Fixes

- hoverbar misalignment when scroll is set to false ([7761c86](https://github.com/wangeditor-next/wangeditor-next/commit/7761c8689ad0124bbf3cc5d864a97c3903c21e49))
- some Android browsers identified as Safari ([b37cabd](https://github.com/wangeditor-next/wangeditor-next/commit/b37cabdae056fdee0cee5585edace55b6cce02f2))
- support micro-frontend iframe ([659faf3](https://github.com/wangeditor-next/wangeditor-next/commit/659faf39c74998218667a229651505b74a70db78))

## [1.5.4](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/core@1.5.3...@wangeditor-next/core@1.5.4) (2024-07-21)

### Bug Fixes

- hoverbar misalignment when scroll is set to false ([7761c86](https://github.com/wangeditor-next/wangeditor-next/commit/7761c8689ad0124bbf3cc5d864a97c3903c21e49))
- some Android browsers identified as Safari ([b37cabd](https://github.com/wangeditor-next/wangeditor-next/commit/b37cabdae056fdee0cee5585edace55b6cce02f2))

## [1.5.3](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/core@1.5.2...@wangeditor-next/core@1.5.3) (2024-07-17)

**Note:** Version bump only for package @wangeditor-next/core

## [1.5.2](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/core@1.5.0...@wangeditor-next/core@1.5.2) (2024-07-15)

### Bug Fixes

- remove extra lists when pasting Feishu doc lists ([bd2d905](https://github.com/wangeditor-next/wangeditor-next/commit/bd2d90556404e3b5b82ff114931d7a1be1126556))

## [1.5.1](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/core@1.5.0...@wangeditor-next/core@1.5.1) (2024-07-14)

### Bug Fixes

- remove extra lists when pasting Feishu doc lists ([2c242eb](https://github.com/wangeditor-next/wangeditor-next/commit/2c242eb32f388e56a9711af51cd250fe4d61edce))

# [1.5.0](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/core@1.4.2...@wangeditor-next/core@1.5.0) (2024-07-11)

### Bug Fixes

- lint —fix & test tuning ([26c254b](https://github.com/wangeditor-next/wangeditor-next/commit/26c254bbc5b1736bb636766f2fbf1c67e5815a38))

### Features

- Table add merge / split cell ([dac7bbc](https://github.com/wangeditor-next/wangeditor-next/commit/dac7bbc168b89ddb37cf49d8952d5b1ef6648519))

## [1.4.2](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/core@1.4.1...@wangeditor-next/core@1.4.2) (2024-07-08)

### Bug Fixes

- **composition:** fix ime repeat input text ([6e2ac59](https://github.com/wangeditor-next/wangeditor-next/commit/6e2ac59cdc871ee6eab0a6e60c71b8ed9aa50510))
- **composition:** repeat input by selecting across rows ([2aeabc8](https://github.com/wangeditor-next/wangeditor-next/commit/2aeabc8436d7b4f2ef6d9fb569418abdd3d28c81))
- **typo:** correct spelling errors ([541f256](https://github.com/wangeditor-next/wangeditor-next/commit/541f25653ea2d75f063a6f130e53b31df367e8c6))

## [1.4.1](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/core@1.2.2...@wangeditor-next/core@1.4.1) (2024-06-22)

**Note:** Version bump only for package @wangeditor-next/core

## [1.2.2](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/core@1.2.1...@wangeditor-next/core@1.2.2) (2024-06-14)

### Bug Fixes

- **parse-elem-html issue 5881:** span内部分内容加粗，则整个span都会被加粗 ([ded2f91](https://github.com/wangeditor-next/wangeditor-next/commit/ded2f917d4c3b7b2ac87122ecb71ae6d384f96c3))

## [1.2.1](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/core@1.2.0...@wangeditor-next/core@1.2.1) (2024-06-08)

### Performance Improvements

- **issue 13:** add replace icon svg by menu config ([a897f58](https://github.com/wangeditor-next/wangeditor-next/commit/a897f58fd85a7f8f4bd1e6ad1cd114457eebaf13))

# 1.2.0 (2024-05-19)

### Bug Fixes

- ** text-paste issue 4376:** 修复 maxLength 最大字数对外部粘贴进的文本无效 ([21b7d6a](https://github.com/wangeditor-next/wangeditor-next/commit/21b7d6a47818885aad514aa4929f473bf89f8def))
- ** text-paste issue 5837:** 修复设置maxlength后，复制多行文本产生多余换行 ([ec09683](https://github.com/wangeditor-next/wangeditor-next/commit/ec096839362f669cb81a6616193ff261105ff87e))
- **font family menu:** 处理 setHtml 的时候字体样式回显失败的问题 ([b941bab](https://github.com/wangeditor-next/wangeditor-next/commit/b941babbdc6bd5bf7da0cce826803a8fde011e07))
- **fontFamily menu:** fix font-family value quote symbol ([2c25231](https://github.com/wangeditor-next/wangeditor-next/commit/2c25231a088de14edbf7516fc448a6483125e3ed))
- 部分菜单 disabled ([87f1233](https://github.com/wangeditor-next/wangeditor-next/commit/87f12332a087072406c1988dc5cef2eae8335375))
- 错别字 alwaysEnable ([82c5136](https://github.com/wangeditor-next/wangeditor-next/commit/82c5136f8496be420dfa26b0f30522e19924a907))
- 单词之间空格问题 issue 4403 ([2f1d6f5](https://github.com/wangeditor-next/wangeditor-next/commit/2f1d6f5275c8a9e106b66213bb276c58a70aff79))
- 弹出 modal 时 blur ([53454ef](https://github.com/wangeditor-next/wangeditor-next/commit/53454ef74b0775391aecf2d745561c9281715934))
- 点击编辑器区域，未关闭 dropPanel ([b23123b](https://github.com/wangeditor-next/wangeditor-next/commit/b23123bb361ac2acadcacdfeaa78dd7bf878f86e))
- 多余的空行 ([4af6c64](https://github.com/wangeditor-next/wangeditor-next/commit/4af6c648861c2c56db62fae28e9dfa0d27ca5d51))
- 多余的空行 ([9dde85c](https://github.com/wangeditor-next/wangeditor-next/commit/9dde85cec5a27be21e0b89c24288d418e1f6d2de))
- 更新各包之间依赖版本 ([75c552c](https://github.com/wangeditor-next/wangeditor-next/commit/75c552cc8ed54765bebb86a7ec5329a7fc79e85f))
- 获取 activeElement 兼容 Document 和 ShadowRoot ([d904e5d](https://github.com/wangeditor-next/wangeditor-next/commit/d904e5dc263ce670362779b0cfa51ca9f7a8bd86))
- 拼音输入 bug we-2021/issues/47 ([20b7429](https://github.com/wangeditor-next/wangeditor-next/commit/20b74298509d9463d6aa1aaffabc21bd33bd7857))
- 拼音隐藏 placeholder ([aec1a9f](https://github.com/wangeditor-next/wangeditor-next/commit/aec1a9f62af8944b7894beeca953076ec73545d5))
- 全屏边距 ([1acb129](https://github.com/wangeditor-next/wangeditor-next/commit/1acb12974848af28e2d0f574f85a59145675cdbc))
- 全选 ([3cb8f42](https://github.com/wangeditor-next/wangeditor-next/commit/3cb8f428a0b94c280b63d42f46c148a9f0e2d9fd))
- 上传图片 - base64 仍触发上传 + 超出 maxSize 的报错提醒 ([a1d469a](https://github.com/wangeditor-next/wangeditor-next/commit/a1d469accb7f87f8ea0282a1699d002aaaa4e79a))
- 使用了 ts 类型空间导入方式优化 ([5d7b509](https://github.com/wangeditor-next/wangeditor-next/commit/5d7b5094e561af138b2569c669fd4daad2808f73))
- 图片上传，提示 ([3754012](https://github.com/wangeditor-next/wangeditor-next/commit/37540129dff1212c5ebfd4ca3f4d4e8def735e73))
- 图片受 indent 影响 ([3d737f1](https://github.com/wangeditor-next/wangeditor-next/commit/3d737f11e457c46e1aeee40ebd834a2470198dfd))
- 完善了 isDOMEventHandled ([745f1d7](https://github.com/wangeditor-next/wangeditor-next/commit/745f1d7b949eb8839cbdb0fb1690c33c386b697f))
- 完善了 metaWithUrl 类型声明 ([3542834](https://github.com/wangeditor-next/wangeditor-next/commit/3542834b9aa65eba5b1c352d106f6623e5fcdc06))
- 修复 compositionend 时错误修改dom的问题 ([1187154](https://github.com/wangeditor-next/wangeditor-next/commit/1187154aa077594f55211307c00e3493d1ab5676))
- 修复 firefox 上全选编辑器内容使用拼音输入异常 ([87dafcb](https://github.com/wangeditor-next/wangeditor-next/commit/87dafcbe4c51d588ac97d3825a9389571fa16404))
- 修复 modal 中的 input 没有被 focus ([484c51e](https://github.com/wangeditor-next/wangeditor-next/commit/484c51e4629defe9eac3f2acaf83ccb62a669d5d))
- 修复 modal close 时没有恢复选区的问题 ([16f5a57](https://github.com/wangeditor-next/wangeditor-next/commit/16f5a57b2815026741249e8b4ef9e7222071353f))
- 修复 readonly 模式下,特定内容下editor初始化报错的问题 ([f3bc8b8](https://github.com/wangeditor-next/wangeditor-next/commit/f3bc8b8d485765cfa8fa7d19e530aa1a1b4bc4e2))
- 修复回车超过视口后没有自动滚动的问题 ([f088b52](https://github.com/wangeditor-next/wangeditor-next/commit/f088b52ff8c9386ba9efc2d7d3e97f76c702b26d))
- 修复了使用拼音输入法在 safari 上光标位置没有正常更新的问题 ([cb4cf12](https://github.com/wangeditor-next/wangeditor-next/commit/cb4cf12bcb6448e5964c47674281f37db96069fa))
- 修复连续输入空格滚动条不滚动的bug ([3bd358d](https://github.com/wangeditor-next/wangeditor-next/commit/3bd358d83969a53f1ed4f3fd349eb186750f9461))
- 修复内容重复和编辑器内容拖动的一些 bug ([5a9c9d0](https://github.com/wangeditor-next/wangeditor-next/commit/5a9c9d0b0880dc006180a5c4e5828f54cd1905da))
- 修复行间距过小无效 ([5f13a5b](https://github.com/wangeditor-next/wangeditor-next/commit/5f13a5b3dc859a45ad25f88ad363f408d23bcee1))
- 修复选中内容输入时,出现光标位置不对或者输入重复内容的问题 ([9596a4c](https://github.com/wangeditor-next/wangeditor-next/commit/9596a4ccaca2e2c4eed7ffc16fc4b042f73cef5d))
- 修复选中内容中文输入时光标定位问题 ([51596a8](https://github.com/wangeditor-next/wangeditor-next/commit/51596a8b0b920dc1d1a9e39fff7c3624c0aa6f52))
- 修复用户自定义change事件获取html时tabal报错 ([5204f8e](https://github.com/wangeditor-next/wangeditor-next/commit/5204f8ebf63abdf8a7093e202411b63ce86c2964))
- 修复在 Chrome 和 Safari 中删除内容时，内联空节点被选中 ([a47c73f](https://github.com/wangeditor-next/wangeditor-next/commit/a47c73fc5fa008096165d5ac9c55d01f4a6b045b))
- 修复在 Safari 下，即使 contenteditable 元素非聚焦状态，并不会删除所选内容 ([3e8ca3c](https://github.com/wangeditor-next/wangeditor-next/commit/3e8ca3c86074454a75054e5ded03154f6b6544ea))
- 修复在代码块中中文输入会有多余字符的问题 ([a138c3f](https://github.com/wangeditor-next/wangeditor-next/commit/a138c3f0a2f25d9f89afb912cff45596f99e6b05))
- 修复在destory可能出现editor not find的问题 ([ce60416](https://github.com/wangeditor-next/wangeditor-next/commit/ce604165527435952b5ac4b011842714ec8cd5dd))
- 修复Safari上table内空行输入报错的问题 ([dae6dc5](https://github.com/wangeditor-next/wangeditor-next/commit/dae6dc544f714f195989a05970cb6bf272f6eb8b))
- 修复ua正则不支持100+的问题 ([c488ba0](https://github.com/wangeditor-next/wangeditor-next/commit/c488ba09183cbfcabef223709464c42fac53aea0))
- 选择图片会滚动 ([d2a8762](https://github.com/wangeditor-next/wangeditor-next/commit/d2a87629cedc3533e268a31ca822f414082bf48d))
- 选中内容输入中文报错 ([890cc68](https://github.com/wangeditor-next/wangeditor-next/commit/890cc686e566be68227641d5f31b42de66351126))
- 移除了每个包下的 publishConfig directory 配置 ([16559f0](https://github.com/wangeditor-next/wangeditor-next/commit/16559f052545c111318be760e64291a521bdcc65))
- 优化插入新文本的滚动交互 ([71131a4](https://github.com/wangeditor-next/wangeditor-next/commit/71131a4355d24b805052fa9bcf1515432e4351ad))
- 优化当父元素有滚动条，插入新文本的滚动交互 ([9275090](https://github.com/wangeditor-next/wangeditor-next/commit/9275090399f068db14854f2794b9aab996bee22e))
- 优化了 core 类型声明 ([5b5ee1e](https://github.com/wangeditor-next/wangeditor-next/commit/5b5ee1ee34300748460cedab6fcd46463820f8ef))
- 优化了 deleteFragment 函数调用传参 ([8d8145c](https://github.com/wangeditor-next/wangeditor-next/commit/8d8145c5e496a28e2d586722101d217ba1be7079))
- 优化了 normalizeDOMPoint 函数 ([31b9999](https://github.com/wangeditor-next/wangeditor-next/commit/31b99992bdc5bc2cc239320200da7d5ba7d6cfc0))
- 优化了当编辑失焦编辑区域滚动到顶部的问题 ([ebb966b](https://github.com/wangeditor-next/wangeditor-next/commit/ebb966bce81023c79727bae846920323f733008d))
- 优化了浏览器是否支持 beforeinput 事件的兼容性判断 ([ea221bb](https://github.com/wangeditor-next/wangeditor-next/commit/ea221bb3e176ace7a99854673fd727dedc0b3ba7))
- 优化选中代码块不应该展示 hoverbar 的交互 ([33dcbd6](https://github.com/wangeditor-next/wangeditor-next/commit/33dcbd6560dccfbe77e18cfbce8c9f077f19f6cd))
- 在移动 word 之前折叠展开选区 ([6b9b0f3](https://github.com/wangeditor-next/wangeditor-next/commit/6b9b0f3c9755c1950b0645c34166bd043a9d05f0))
- 增加 EXTEND_CONF 配置扩展能力 ([ff75a16](https://github.com/wangeditor-next/wangeditor-next/commit/ff75a16643b26d2d0e7a92cfdd827d5f0f56a849))
- 粘贴 HTML <a> bug ([b935ef6](https://github.com/wangeditor-next/wangeditor-next/commit/b935ef622b9d4f8f3a9954d26a41c89d4e8042bd))
- 粘贴 HTML 后 font-size font-family line-height 不显示 ([2281957](https://github.com/wangeditor-next/wangeditor-next/commit/2281957020a30de9cda1c5e9d5e20c6668b7f592))
- 粘贴网页 HTML 报错 ([939cb22](https://github.com/wangeditor-next/wangeditor-next/commit/939cb2229a11eea827e1bea4420f7502db1e7eb6))
- 粘贴文字报错 ([a11ea56](https://github.com/wangeditor-next/wangeditor-next/commit/a11ea56af4f7976f5664232e80a164cd37d84d8c))
- 重复创建 ([3682c53](https://github.com/wangeditor-next/wangeditor-next/commit/3682c53b181b89d2c16b5d9845b381a4813c9e3c))
- autoFucos ([fea2faf](https://github.com/wangeditor-next/wangeditor-next/commit/fea2faf0af83a3eec67ee7bc7d76328409d2d703))
- beforeinput support ([60e6efc](https://github.com/wangeditor-next/wangeditor-next/commit/60e6efc3b3d6c31c4834e3b40e02fc8bc4ceaea6))
- blockquote & header insertBreak ([06678c9](https://github.com/wangeditor-next/wangeditor-next/commit/06678c963e8c8421ecded448de7510b254117550))
- button 增加 type ([37b3390](https://github.com/wangeditor-next/wangeditor-next/commit/37b33903e0ae5ffe95ab907791ab484facd052d9))
- chrome 链接后输入拼音，js 错误 ([6c04fab](https://github.com/wangeditor-next/wangeditor-next/commit/6c04fabb2c5ec78e13c1e1583685cf726887dcae))
- clear API ([c188b56](https://github.com/wangeditor-next/wangeditor-next/commit/c188b567379ae32abcfa879620c995c8d45818c4))
- code-block 选择语言 - 点击拖拽滚动条 ([b8c75e7](https://github.com/wangeditor-next/wangeditor-next/commit/b8c75e7dc5332c9da622433380802886dedc4344))
- composition-end ([082561d](https://github.com/wangeditor-next/wangeditor-next/commit/082561dc341b45791933757e2cf6102190004674))
- create - 判断 content length ([c0eadc9](https://github.com/wangeditor-next/wangeditor-next/commit/c0eadc9bf03edc7576c1d3e957babede4c0b546f))
- dangerouslyInsertHtml - 兼容异常情况 ([8b549f4](https://github.com/wangeditor-next/wangeditor-next/commit/8b549f480434782107eda3412bf6530d0d7eb9ba))
- droplist 过长 ([1de2a76](https://github.com/wangeditor-next/wangeditor-next/commit/1de2a76ac802b80c1b45537c129e5833b4d73d33))
- dropPanel 定位 ([e76310a](https://github.com/wangeditor-next/wangeditor-next/commit/e76310a1c6d4aafb2385faebb005bdddd38f9838))
- editor.blur() api 无效 ([48cbff3](https://github.com/wangeditor-next/wangeditor-next/commit/48cbff3142d961ff2eaf2f76a3182488de2e5b93))
- editor.focus() 参数语法错误 ([334fa21](https://github.com/wangeditor-next/wangeditor-next/commit/334fa217d43fdaa95454e7c85a53526b7b777fda))
- firefox下全选输入出现多余字符 ([659b107](https://github.com/wangeditor-next/wangeditor-next/commit/659b1078e3395ff00ddc0d1792fbf9c4d448ca41))
- fix https://github.com/wangeditor-next/wangeditor-next-v5/issues/457 ([1d8a46a](https://github.com/wangeditor-next/wangeditor-next/commit/1d8a46a1b5402c2ecb418db24d9d22532d152cea))
- fix https://github.com/wangeditor-next/wangeditor-next/issues/4754 ([e0216b9](https://github.com/wangeditor-next/wangeditor-next/commit/e0216b98b0ea9ebf4f9cc8a8fd820d68fcd230d3))
- focus blur 问题 ([4a1997b](https://github.com/wangeditor-next/wangeditor-next/commit/4a1997b9f19cdce9d6aa6ff4e8e13d439b12af05))
- focus table 时 isFocused 异常 ([5c52bf3](https://github.com/wangeditor-next/wangeditor-next/commit/5c52bf33e91b1a4677e7bbc04c5d80698abfeeab))
- fullScreen 隐藏 hoverbar ([ec463d3](https://github.com/wangeditor-next/wangeditor-next/commit/ec463d302cdc527987741ae6208a625af91ea61c))
- getElems 增加 id ([1dcedd9](https://github.com/wangeditor-next/wangeditor-next/commit/1dcedd9392d2eecef29f9c93e8915a2f2f83b8a5))
- getHtml 死循环 ([4614bfb](https://github.com/wangeditor-next/wangeditor-next/commit/4614bfb5c3a2658348a59749dd800a349e6c33a9))
- getHtml API ([c0b60cf](https://github.com/wangeditor-next/wangeditor-next/commit/c0b60cf47d8eaae4292265906fbe07875e1564c9))
- group-menu 考虑 excludeKeys ([ecc29f3](https://github.com/wangeditor-next/wangeditor-next/commit/ecc29f3b24992c8dc0adf006d81b0d4a252683c5))
- hotkey mod ([d480c20](https://github.com/wangeditor-next/wangeditor-next/commit/d480c206fd83ecc8d12f36147c210208aa6d6ab3))
- hoverbar 被点击多次隐藏 ([bf4fc19](https://github.com/wangeditor-next/wangeditor-next/commit/bf4fc193847e8caba3a67c8dd152eae4f1950c4f))
- hoverbar active ([ceb3f41](https://github.com/wangeditor-next/wangeditor-next/commit/ceb3f41deafd8fc2cb8d3e8a498cb8d90ad1c73f))
- hoverbar modal 重复创建 ([70d2b61](https://github.com/wangeditor-next/wangeditor-next/commit/70d2b618a0662c88cd5e6691f513009726ce1b9b))
- hoverbar show/hide ([c96bc83](https://github.com/wangeditor-next/wangeditor-next/commit/c96bc8378939fecd78807fea4f2b7e1eec2a9ea0))
- hoverbarKeys - text ([59b4840](https://github.com/wangeditor-next/wangeditor-next/commit/59b48406b4c373ef029a5f5bdb0d15d925a91a0f))
- html 特殊字符 ([b3eb81b](https://github.com/wangeditor-next/wangeditor-next/commit/b3eb81bc9c4aa15c2ff7451c173de15d6c4552bc))
- i18n - 获取多语言配置 ([9f81597](https://github.com/wangeditor-next/wangeditor-next/commit/9f815970f8c3c6dddb6bf846ecb672325e80444b))
- i18n 切换语言 ([b3b4642](https://github.com/wangeditor-next/wangeditor-next/commit/b3b4642c6e72ab0b13b05657745abb87e71c633d))
- insertHtml - maxLength ([8c7dc8b](https://github.com/wangeditor-next/wangeditor-next/commit/8c7dc8b8efe1705af9989b040b04e2f98932cb77))
- insertHtml - maxLength ([52d72ec](https://github.com/wangeditor-next/wangeditor-next/commit/52d72ec4778a7a6c6f31a7e95d82fb91c9384ae8))
- insertHtml - maxLength ([b573359](https://github.com/wangeditor-next/wangeditor-next/commit/b5733597966b16d876b0c0e18509f04638e1c4df))
- insertKeys ([0a89420](https://github.com/wangeditor-next/wangeditor-next/commit/0a8942050bd0b39afb5bbc55ca7842461a5b98eb))
- link, text hoverbar 选区问题 ([e0b7438](https://github.com/wangeditor-next/wangeditor-next/commit/e0b7438c89a347f1b0b940d9c11150b72d595529))
- maxLength - 拼音 + 粘贴 ([3ac4db6](https://github.com/wangeditor-next/wangeditor-next/commit/3ac4db6d78cbe7a8d1fe19747deb0a17edd9b552))
- maxLength 对于拼音输入无效 ([117faa6](https://github.com/wangeditor-next/wangeditor-next/commit/117faa635e99667c4762b58757f045c80f949323))
- menu 点击多次才能生效 ([6497e39](https://github.com/wangeditor-next/wangeditor-next/commit/6497e39225a993c4d87f9ffddf20086446a4fbc2))
- min-height ([460fad5](https://github.com/wangeditor-next/wangeditor-next/commit/460fad56001e83842786629b1d1f8ed6411f4fd4))
- modal close ([dbfb3b4](https://github.com/wangeditor-next/wangeditor-next/commit/dbfb3b42504ae97aa0f641ff7fe5eba208b43580))
- mousedown事件添加passive的默认值 ([60229cc](https://github.com/wangeditor-next/wangeditor-next/commit/60229cc2f9647a5f17dc0fd85c4bb1dc396a5e9c))
- **video menu:** fix invoke clear api can not clear video node when insert video ([68c1f8e](https://github.com/wangeditor-next/wangeditor-next/commit/68c1f8ee68ab2cb7b202b6d9b4d4db192a927725))
- 修复设置 maxlength 后粘贴异常的问题 ([14003d0](https://github.com/wangeditor-next/wangeditor-next/commit/14003d0ba01eeb9a264d15fac514dd4b4bd89ff7))
- hoverbar - 处于网页下部 ([6cfb3e2](https://github.com/wangeditor-next/wangeditor-next/commit/6cfb3e2d364f4532cbafe5c8c6e4b3bc13fa2d78))
- issue 4308 - 自定义字号、字体无法回显 ([ad38b8c](https://github.com/wangeditor-next/wangeditor-next/commit/ad38b8ce6dbcff1d65785c8d6701238ad351f562))
- list-item - 遇到 style 是 toHtml 出错 ([9854308](https://github.com/wangeditor-next/wangeditor-next/commit/98543083a1cb09207aceb2a4d8f3c1ce020b106d))
- normalize when create editor ([2b51962](https://github.com/wangeditor-next/wangeditor-next/commit/2b5196244a93ad7beb316bfa42e557221967d063))
- parse html - 有些 elem children 需要过滤 ([63cbb80](https://github.com/wangeditor-next/wangeditor-next/commit/63cbb804c8c7a778a4ee1f4ba8717a11b4b6b5a3))
- parse-html - space 160 ([54e72bc](https://github.com/wangeditor-next/wangeditor-next/commit/54e72bcb5ed38b8dc77e957ebd5d35881466b5b3))
- parse-html - sub sup ([2c15a5f](https://github.com/wangeditor-next/wangeditor-next/commit/2c15a5f9c9c2de8b34770a6bebfe765d203a03f6))
- parseHtml - 多空格文本 ([5d4479c](https://github.com/wangeditor-next/wangeditor-next/commit/5d4479c5d11fc23233ea63f0b69c845fa2ab8630))
- placeholder - 全选输入中文 ([fe4dd2a](https://github.com/wangeditor-next/wangeditor-next/commit/fe4dd2a85d54d64e2411c3dfc6cb90ac18003e28))
- placeHolder elem ([7d577ac](https://github.com/wangeditor-next/wangeditor-next/commit/7d577ac4d6003d1b4c8575be1c014cfa6632d248))
- readOnly 时菜单还可操作 ([0d4a29b](https://github.com/wangeditor-next/wangeditor-next/commit/0d4a29bb5ba8b62ac11a09d3f814abcb1fcf46be))
- readOnly 依然可以 insertText ([096eeaf](https://github.com/wangeditor-next/wangeditor-next/commit/096eeafd0fc62edf196ed3a9549c04ce19b6b159))
- rename es module filename ([1821d4e](https://github.com/wangeditor-next/wangeditor-next/commit/1821d4eef49e64efcb41b848849ca7a5e6472044))
- scroll 滚动问题 ([bc133e1](https://github.com/wangeditor-next/wangeditor-next/commit/bc133e1e4ca89ab5042cbc0971578ad144499805))
- setHtml 问题 - table 后面 p 格式错误 ([b525b4a](https://github.com/wangeditor-next/wangeditor-next/commit/b525b4aaa69b834204232774971367beba7db975))
- setHtml 支持空字符串 ([d438157](https://github.com/wangeditor-next/wangeditor-next/commit/d43815766320d9cb0548bae0415c54ce7b147efb))
- setHtml() 多一个空行 ([994954f](https://github.com/wangeditor-next/wangeditor-next/commit/994954fcbae72808e3488e0936a5f82253b603f4))
- shadowDOM 节点支持问题 ([5eb41f1](https://github.com/wangeditor-next/wangeditor-next/commit/5eb41f1048ad110003b2ef95e0f22e26b7fd757c))
- shadowDOM 在失焦状态下元素获取失败 ([98aeccc](https://github.com/wangeditor-next/wangeditor-next/commit/98aeccc5be85513d577397642a9a2d2f730a0406))
- snabbdom 增加 attributesModule ([2c597b6](https://github.com/wangeditor-next/wangeditor-next/commit/2c597b6a52ffa96c820128d63fd84b903a6faebf))
- table - 粘贴合并单元格的表格 ([56ecb63](https://github.com/wangeditor-next/wangeditor-next/commit/56ecb6392510d433e092653f0f08183361778a3d))
- table - elemToHtml ([e36e609](https://github.com/wangeditor-next/wangeditor-next/commit/e36e6092ef721723169afc8bf0560a47ac9f4dfc))
- table-cell 全选 ([1ef4872](https://github.com/wangeditor-next/wangeditor-next/commit/1ef48729e6d99e7414bc89bc4ef0d66c172fc566))
- tableCell 中 br 报错 ([8604db7](https://github.com/wangeditor-next/wangeditor-next/commit/8604db751b622c01fa5391af59328236cf13effc))
- td th 中换行不起作用 ([89c6032](https://github.com/wangeditor-next/wangeditor-next/commit/89c6032a1c41100b7adaf9927e6bc9c06d0228db))
- textarea height ([873b04a](https://github.com/wangeditor-next/wangeditor-next/commit/873b04a65a7140afdc2427ac07fce57b3e2c423e))
- tooltip ([7e066d1](https://github.com/wangeditor-next/wangeditor-next/commit/7e066d1368f1bfaaca21e3385647be2dee6837f9))
- upload file callback error ([bf20e07](https://github.com/wangeditor-next/wangeditor-next/commit/bf20e07f12ed242b0ab4bb2290d876153a822972))
- upload progress 0 ([9e660be](https://github.com/wangeditor-next/wangeditor-next/commit/9e660be126adb969dd8a80166b60d6f62be17b2a))
- url 后面中文输入异常 ([3bcebc7](https://github.com/wangeditor-next/wangeditor-next/commit/3bcebc78352e05cfec92eed92ee0b05d233feaef))
- void node - 不清理 text ([1bc891c](https://github.com/wangeditor-next/wangeditor-next/commit/1bc891c46318f5c5ab969752b3ddb8d75ee1faf7))
- vue 组件增加 customPaste ([e764248](https://github.com/wangeditor-next/wangeditor-next/commit/e76424870c75e09ab6267b604a951444b2e847c5))
- w-e-menu-tooltip 和 v4 冲突 ([762403b](https://github.com/wangeditor-next/wangeditor-next/commit/762403b2c4e860b3855cbc0caa883b1443d3c862))
- z-index ([02ec2d5](https://github.com/wangeditor-next/wangeditor-next/commit/02ec2d54605e747b7d4e1377a58fc9e14c9bba7c))

### Features

- 增加 API ([63d6fe8](https://github.com/wangeditor-next/wangeditor-next/commit/63d6fe85f17fea31c95fec727126799a979ec2f9))
- 增加 enable disable API（删除 setConfig setMenuConfig API） ([984fc50](https://github.com/wangeditor-next/wangeditor-next/commit/984fc50520061fc34ea08f4136bdeb93dee46564))
- 支持 nodejs 环境 ([484f18c](https://github.com/wangeditor-next/wangeditor-next/commit/484f18c3abc70d19e51c556f48491c18d390b1e1))
- API - getElemsByType + move + moveReverse ([748ad71](https://github.com/wangeditor-next/wangeditor-next/commit/748ad710b55d26ade4df1d8caa0a6ea5d2f6f8c7))
- basic text paste ([f0a5b98](https://github.com/wangeditor-next/wangeditor-next/commit/f0a5b980c95fa1e2fc59a898c6e0d0723c276c28))
- basic text style module ([005b343](https://github.com/wangeditor-next/wangeditor-next/commit/005b343573ba98f2d0b8480d034ff6807a499aa3))
- bold & header ([8130c23](https://github.com/wangeditor-next/wangeditor-next/commit/8130c23ad84485a68cf9ca4b53d52fab1cec4e96))
- clear color ([93b1a18](https://github.com/wangeditor-next/wangeditor-next/commit/93b1a189395ba113dfe9f793c69e136607f9a28f))
- clear editor api ([01b07f2](https://github.com/wangeditor-next/wangeditor-next/commit/01b07f2a2250661ef121919192d40a4852d50a91))
- clearStyle menu ([8002f70](https://github.com/wangeditor-next/wangeditor-next/commit/8002f707ed04b914180ec36fdca0edf48c815e01))
- close modal ([b5106f4](https://github.com/wangeditor-next/wangeditor-next/commit/b5106f4428813cf794c468034c80824b0a4f08db))
- code highlight ([42b2f8d](https://github.com/wangeditor-next/wangeditor-next/commit/42b2f8d192e2433593c11ad0b8424737f6cffb58))
- code-block - part ([a8bcd63](https://github.com/wangeditor-next/wangeditor-next/commit/a8bcd63d882832ac05a32878df0f767d145e0fa7))
- create editor ([12d98e4](https://github.com/wangeditor-next/wangeditor-next/commit/12d98e4bee179e9d277ec3ec2ecb827962ed0e75))
- customPaste ([0f25f5c](https://github.com/wangeditor-next/wangeditor-next/commit/0f25f5cae3a2cd5ae5832f3fc1026b3ab6d047e0))
- dangerouslyInsertHtml ([4dc3d0c](https://github.com/wangeditor-next/wangeditor-next/commit/4dc3d0cb403d751ae067a541868e77083c8ce74c))
- drag resize image ([cd72028](https://github.com/wangeditor-next/wangeditor-next/commit/cd72028f1786e2e53079ad5cbef1b8569731ca79))
- editor 生命周期，自定义事件 ([00e9bc2](https://github.com/wangeditor-next/wangeditor-next/commit/00e9bc2cfcb8b622764db1c76394491d72ffd93e))
- editor with-selection plugin ([9f0a39f](https://github.com/wangeditor-next/wangeditor-next/commit/9f0a39fecf6d92888d2a97929820d3be038efb31))
- editor.alert ([f147c8f](https://github.com/wangeditor-next/wangeditor-next/commit/f147c8f234510959c770860ac2f194e8d720f177))
- editor.isSelectedAll ([960c845](https://github.com/wangeditor-next/wangeditor-next/commit/960c8455f85a6bc7350f9944be80b3997bc1fea1))
- editor.showProgressBar ([51761d4](https://github.com/wangeditor-next/wangeditor-next/commit/51761d466ab3ef7c99e872954d4724ab51d8e28c))
- editVideoSize ([375eecb](https://github.com/wangeditor-next/wangeditor-next/commit/375eecba826eac681268c55c47bcd922f7157d63))
- focus支持focus到文档末尾 ([628830e](https://github.com/wangeditor-next/wangeditor-next/commit/628830ef06ff85b3e67001ce30dd9e0557b0aa28))
- font-size + font-family ([cc649e0](https://github.com/wangeditor-next/wangeditor-next/commit/cc649e0918ce58e78b4d5ee49a400197b9d04b70))
- fullScreen ([e7ccd88](https://github.com/wangeditor-next/wangeditor-next/commit/e7ccd88a7dd58f64b7bd484de428e3a76cc994f7))
- getElemsByTypePrefix （删掉 getHeaders） ([c18834b](https://github.com/wangeditor-next/wangeditor-next/commit/c18834b3ebfd97fb36ccbe0faa84e6fe8c30eb67))
- getHeaders & editor.srcollToElem ([2bfb813](https://github.com/wangeditor-next/wangeditor-next/commit/2bfb813e4957f080c6676ec38f8f051275cdf44a))
- getSelectionText + maxLength ([58f6648](https://github.com/wangeditor-next/wangeditor-next/commit/58f66489b65f857238d96b93120f6de7e2750c81))
- groupButton disabled ([8ffd44c](https://github.com/wangeditor-next/wangeditor-next/commit/8ffd44c9a44758e951ca7bd02dd46746fcac1c03))
- hover bar ([107356e](https://github.com/wangeditor-next/wangeditor-next/commit/107356eff7bfaf53ce25e39244f8133c80518375))
- i18n ([c11b244](https://github.com/wangeditor-next/wangeditor-next/commit/c11b2440f91b99d40bca18b675c66a22b6e160c9))
- image menu - width 50% 100% ([f9b4c68](https://github.com/wangeditor-next/wangeditor-next/commit/f9b4c68dff3232b50491b07949c20eb4c18baa6b))
- image menu config ([bb18774](https://github.com/wangeditor-next/wangeditor-next/commit/bb187740e9703b4a76cde4f5e4d32ac714aa793a))
- image menus & position ([bf5beba](https://github.com/wangeditor-next/wangeditor-next/commit/bf5beba7b3014d63f0b9fe0063530c8b101a5011))
- indent menu + groupMenu ([08db901](https://github.com/wangeditor-next/wangeditor-next/commit/08db901cd3a3f2ddb2173cc4b36d471e4e68237e))
- insert link ([b04242f](https://github.com/wangeditor-next/wangeditor-next/commit/b04242ffa252d4088f5360c3de45c24d6f493552))
- list menu ([fe6c083](https://github.com/wangeditor-next/wangeditor-next/commit/fe6c0830b2c43e335e5972f85096f490694bbe19))
- menu color - part ([3a6cc86](https://github.com/wangeditor-next/wangeditor-next/commit/3a6cc86a7f9133d0862310c408abafb30c531734))
- menu color & dropPanel & menu config ([5d0d41b](https://github.com/wangeditor-next/wangeditor-next/commit/5d0d41b9a765a7deb583393f129925414c36ef35))
- menu hotkey ([fee05f1](https://github.com/wangeditor-next/wangeditor-next/commit/fee05f189434d1e57a32ff0dea1a57db6830318a))
- modal appendTo body ([fc0ab06](https://github.com/wangeditor-next/wangeditor-next/commit/fc0ab06d5c7177eceb04643234a8c301ca4de396))
- onBlur onFocus ([590ab4a](https://github.com/wangeditor-next/wangeditor-next/commit/590ab4a990048bb22cf15787a5fd4615db5b9ef6))
- parse html ([2a5eace](https://github.com/wangeditor-next/wangeditor-next/commit/2a5eace00f33cded50b68e8164748ec2480213fd))
- placeholder ([a3e4cdc](https://github.com/wangeditor-next/wangeditor-next/commit/a3e4cdcd474063e4f436327aaf4074bb2126d941))
- react 组件 ([448fc83](https://github.com/wangeditor-next/wangeditor-next/commit/448fc838d64dbef52cbcddde0e98eb021d8a9122))
- scroll config ([b4942b4](https://github.com/wangeditor-next/wangeditor-next/commit/b4942b4334f255b3d537389be3dacf1642dd5441))
- selectList ([b7366ab](https://github.com/wangeditor-next/wangeditor-next/commit/b7366ab2dafd379145d85881052d6f400bd13c85))
- setHtml ([f4f91b8](https://github.com/wangeditor-next/wangeditor-next/commit/f4f91b883298091e3679ca6b206ae0d796003772))
- text and toolbar ([3ae5d0c](https://github.com/wangeditor-next/wangeditor-next/commit/3ae5d0c4138fec7397ac8629e0012affe6b7dfa4))
- toHtml 机制 ([1c4d872](https://github.com/wangeditor-next/wangeditor-next/commit/1c4d8729f84aaab6a448f23064b34a20596305e9))
- toolbar config - insertKeys ([a2f3c4b](https://github.com/wangeditor-next/wangeditor-next/commit/a2f3c4be3762831723495bbc9d50eb6c9b05d195))
- toolbar excludeKeys ([09bd196](https://github.com/wangeditor-next/wangeditor-next/commit/09bd196ea24c19b04e5e7e38227ca94332847bf8))
- tooltip ([994d875](https://github.com/wangeditor-next/wangeditor-next/commit/994d875fee81cf01271c2e440c1df202aa067d0e))
- updateLink + unLink + viewLink ([254d554](https://github.com/wangeditor-next/wangeditor-next/commit/254d55466b3c8527dd9f0bf34681abd801c8c8ce))
- vue2 组件 ([fd7847a](https://github.com/wangeditor-next/wangeditor-next/commit/fd7847a72db661bbf29cf636d454c075fd331224))

## [1.1.19](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/core@1.1.18...@wangeditor/core@1.1.19) (2022-11-14)

### Bug Fixes

- **font family menu:** 处理 setHtml 的时候字体样式回显失败的问题 ([b941bab](https://github.com/wangeditor-next/wangeditor-next/commit/b941babbdc6bd5bf7da0cce826803a8fde011e07))
- **fontFamily menu:** fix font-family value quote symbol ([2c25231](https://github.com/wangeditor-next/wangeditor-next/commit/2c25231a088de14edbf7516fc448a6483125e3ed))

## [1.1.18](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/core@1.1.17...@wangeditor/core@1.1.18) (2022-10-18)

### Bug Fixes

- mousedown事件添加passive的默认值 ([60229cc](https://github.com/wangeditor-next/wangeditor-next/commit/60229cc2f9647a5f17dc0fd85c4bb1dc396a5e9c))
- **video menu:** fix invoke clear api can not clear video node when insert video ([68c1f8e](https://github.com/wangeditor-next/wangeditor-next/commit/68c1f8ee68ab2cb7b202b6d9b4d4db192a927725))

## [1.1.17](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/core@1.1.16...@wangeditor/core@1.1.17) (2022-10-04)

### Bug Fixes

- 修复 compositionend 时错误修改dom的问题 ([1187154](https://github.com/wangeditor-next/wangeditor-next/commit/1187154aa077594f55211307c00e3493d1ab5676))
- 修复设置 maxlength 后粘贴异常的问题 ([14003d0](https://github.com/wangeditor-next/wangeditor-next/commit/14003d0ba01eeb9a264d15fac514dd4b4bd89ff7))

## [1.1.16](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/core@1.1.15...@wangeditor/core@1.1.16) (2022-09-27)

### Bug Fixes

- list-item - 遇到 style 是 toHtml 出错 ([9854308](https://github.com/wangeditor-next/wangeditor-next/commit/98543083a1cb09207aceb2a4d8f3c1ce020b106d))

## [1.1.15](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/core@1.1.14...@wangeditor/core@1.1.15) (2022-09-27)

**Note:** Version bump only for package @wangeditor/core

## [1.1.14](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/core@1.1.13...@wangeditor/core@1.1.14) (2022-09-16)

**Note:** Version bump only for package @wangeditor/core

## [1.1.13](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/core@1.1.12...@wangeditor/core@1.1.13) (2022-09-15)

### Bug Fixes

- focus table 时 isFocused 异常 ([5c52bf3](https://github.com/wangeditor-next/wangeditor-next/commit/5c52bf33e91b1a4677e7bbc04c5d80698abfeeab))
- snabbdom 增加 attributesModule ([2c597b6](https://github.com/wangeditor-next/wangeditor-next/commit/2c597b6a52ffa96c820128d63fd84b903a6faebf))

## [1.1.12](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/core@1.1.11...@wangeditor/core@1.1.12) (2022-08-30)

### Bug Fixes

- fix https://github.com/wangeditor-next/wangeditor-next/issues/4754 ([e0216b9](https://github.com/wangeditor-next/wangeditor-next/commit/e0216b98b0ea9ebf4f9cc8a8fd820d68fcd230d3))

## [1.1.11](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/core@1.1.10...@wangeditor/core@1.1.11) (2022-07-27)

**Note:** Version bump only for package @wangeditor/core

## [1.1.10](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/core@1.1.9...@wangeditor/core@1.1.10) (2022-07-27)

### Bug Fixes

- setHtml 支持空字符串 ([d438157](https://github.com/wangeditor-next/wangeditor-next/commit/d43815766320d9cb0548bae0415c54ce7b147efb))
- upload file callback error ([bf20e07](https://github.com/wangeditor-next/wangeditor-next/commit/bf20e07f12ed242b0ab4bb2290d876153a822972))

## [1.1.9](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/core@1.1.8...@wangeditor/core@1.1.9) (2022-07-22)

### Bug Fixes

- 粘贴 HTML <a> bug ([b935ef6](https://github.com/wangeditor-next/wangeditor-next/commit/b935ef622b9d4f8f3a9954d26a41c89d4e8042bd))

## [1.1.8](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/core@1.1.7...@wangeditor/core@1.1.8) (2022-07-18)

### Bug Fixes

- 粘贴文字报错 ([a11ea56](https://github.com/wangeditor-next/wangeditor-next/commit/a11ea56af4f7976f5664232e80a164cd37d84d8c))

## [1.1.7](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/core@1.1.6...@wangeditor/core@1.1.7) (2022-07-16)

### Bug Fixes

- setHtml() 多一个空行 ([994954f](https://github.com/wangeditor-next/wangeditor-next/commit/994954fcbae72808e3488e0936a5f82253b603f4))
- 图片受 indent 影响 ([3d737f1](https://github.com/wangeditor-next/wangeditor-next/commit/3d737f11e457c46e1aeee40ebd834a2470198dfd))

## [1.1.6](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/core@1.1.5...@wangeditor/core@1.1.6) (2022-07-14)

### Bug Fixes

- 粘贴网页 HTML 报错 ([939cb22](https://github.com/wangeditor-next/wangeditor-next/commit/939cb2229a11eea827e1bea4420f7502db1e7eb6))

## [1.1.5](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/core@1.1.4...@wangeditor/core@1.1.5) (2022-07-13)

### Bug Fixes

- setHtml 问题 - table 后面 p 格式错误 ([b525b4a](https://github.com/wangeditor-next/wangeditor-next/commit/b525b4aaa69b834204232774971367beba7db975))

## [1.1.4](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/core@1.1.3...@wangeditor/core@1.1.4) (2022-07-12)

**Note:** Version bump only for package @wangeditor/core

## [1.1.3](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/core@1.1.2...@wangeditor/core@1.1.3) (2022-07-11)

### Bug Fixes

- scroll 滚动问题 ([bc133e1](https://github.com/wangeditor-next/wangeditor-next/commit/bc133e1e4ca89ab5042cbc0971578ad144499805))
- 修复选中内容输入时,出现光标位置不对或者输入重复内容的问题 ([9596a4c](https://github.com/wangeditor-next/wangeditor-next/commit/9596a4ccaca2e2c4eed7ffc16fc4b042f73cef5d))

## [1.1.2](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/core@1.1.1...@wangeditor/core@1.1.2) (2022-07-11)

### Bug Fixes

- editor.focus() 参数语法错误 ([334fa21](https://github.com/wangeditor-next/wangeditor-next/commit/334fa217d43fdaa95454e7c85a53526b7b777fda))
- focus blur 问题 ([4a1997b](https://github.com/wangeditor-next/wangeditor-next/commit/4a1997b9f19cdce9d6aa6ff4e8e13d439b12af05))
- 单词之间空格问题 issue 4403 ([2f1d6f5](https://github.com/wangeditor-next/wangeditor-next/commit/2f1d6f5275c8a9e106b66213bb276c58a70aff79))

## [1.1.1](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/core@1.1.0...@wangeditor/core@1.1.1) (2022-06-02)

### Bug Fixes

- issue 4308 - 自定义字号、字体无法回显 ([ad38b8c](https://github.com/wangeditor-next/wangeditor-next/commit/ad38b8ce6dbcff1d65785c8d6701238ad351f562))

# [1.1.0](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/core@1.0.1...@wangeditor/core@1.1.0) (2022-05-25)

### Bug Fixes

- 修复 readonly 模式下,特定内容下editor初始化报错的问题 ([f3bc8b8](https://github.com/wangeditor-next/wangeditor-next/commit/f3bc8b8d485765cfa8fa7d19e530aa1a1b4bc4e2))
- 粘贴 HTML 后 font-size font-family line-height 不显示 ([2281957](https://github.com/wangeditor-next/wangeditor-next/commit/2281957020a30de9cda1c5e9d5e20c6668b7f592))

### Features

- editVideoSize ([375eecb](https://github.com/wangeditor-next/wangeditor-next/commit/375eecba826eac681268c55c47bcd922f7157d63))
- setHtml ([f4f91b8](https://github.com/wangeditor-next/wangeditor-next/commit/f4f91b883298091e3679ca6b206ae0d796003772))

## 1.0.1 (2022-04-18)

### Bug Fixes

- 部分菜单 disabled ([87f1233](https://github.com/wangeditor-next/wangeditor-next/commit/87f12332a087072406c1988dc5cef2eae8335375))
- 错别字 alwaysEnable ([82c5136](https://github.com/wangeditor-next/wangeditor-next/commit/82c5136f8496be420dfa26b0f30522e19924a907))
- 弹出 modal 时 blur ([53454ef](https://github.com/wangeditor-next/wangeditor-next/commit/53454ef74b0775391aecf2d745561c9281715934))
- 点击编辑器区域，未关闭 dropPanel ([b23123b](https://github.com/wangeditor-next/wangeditor-next/commit/b23123bb361ac2acadcacdfeaa78dd7bf878f86e))
- 多余的空行 ([4af6c64](https://github.com/wangeditor-next/wangeditor-next/commit/4af6c648861c2c56db62fae28e9dfa0d27ca5d51))
- 多余的空行 ([9dde85c](https://github.com/wangeditor-next/wangeditor-next/commit/9dde85cec5a27be21e0b89c24288d418e1f6d2de))
- 更新各包之间依赖版本 ([75c552c](https://github.com/wangeditor-next/wangeditor-next/commit/75c552cc8ed54765bebb86a7ec5329a7fc79e85f))
- 获取 activeElement 兼容 Document 和 ShadowRoot ([d904e5d](https://github.com/wangeditor-next/wangeditor-next/commit/d904e5dc263ce670362779b0cfa51ca9f7a8bd86))
- 拼音输入 bug we-2021/issues/47 ([20b7429](https://github.com/wangeditor-next/wangeditor-next/commit/20b74298509d9463d6aa1aaffabc21bd33bd7857))
- 拼音隐藏 placeholder ([aec1a9f](https://github.com/wangeditor-next/wangeditor-next/commit/aec1a9f62af8944b7894beeca953076ec73545d5))
- 全屏边距 ([1acb129](https://github.com/wangeditor-next/wangeditor-next/commit/1acb12974848af28e2d0f574f85a59145675cdbc))
- 全选 ([3cb8f42](https://github.com/wangeditor-next/wangeditor-next/commit/3cb8f428a0b94c280b63d42f46c148a9f0e2d9fd))
- 上传图片 - base64 仍触发上传 + 超出 maxSize 的报错提醒 ([a1d469a](https://github.com/wangeditor-next/wangeditor-next/commit/a1d469accb7f87f8ea0282a1699d002aaaa4e79a))
- 使用了 ts 类型空间导入方式优化 ([5d7b509](https://github.com/wangeditor-next/wangeditor-next/commit/5d7b5094e561af138b2569c669fd4daad2808f73))
- 图片上传，提示 ([3754012](https://github.com/wangeditor-next/wangeditor-next/commit/37540129dff1212c5ebfd4ca3f4d4e8def735e73))
- 完善了 isDOMEventHandled ([745f1d7](https://github.com/wangeditor-next/wangeditor-next/commit/745f1d7b949eb8839cbdb0fb1690c33c386b697f))
- 完善了 metaWithUrl 类型声明 ([3542834](https://github.com/wangeditor-next/wangeditor-next/commit/3542834b9aa65eba5b1c352d106f6623e5fcdc06))
- 修复 firefox 上全选编辑器内容使用拼音输入异常 ([87dafcb](https://github.com/wangeditor-next/wangeditor-next/commit/87dafcbe4c51d588ac97d3825a9389571fa16404))
- 修复 modal 中的 input 没有被 focus ([484c51e](https://github.com/wangeditor-next/wangeditor-next/commit/484c51e4629defe9eac3f2acaf83ccb62a669d5d))
- 修复 modal close 时没有恢复选区的问题 ([16f5a57](https://github.com/wangeditor-next/wangeditor-next/commit/16f5a57b2815026741249e8b4ef9e7222071353f))
- 修复回车超过视口后没有自动滚动的问题 ([f088b52](https://github.com/wangeditor-next/wangeditor-next/commit/f088b52ff8c9386ba9efc2d7d3e97f76c702b26d))
- 修复了使用拼音输入法在 safari 上光标位置没有正常更新的问题 ([cb4cf12](https://github.com/wangeditor-next/wangeditor-next/commit/cb4cf12bcb6448e5964c47674281f37db96069fa))
- 修复连续输入空格滚动条不滚动的bug ([3bd358d](https://github.com/wangeditor-next/wangeditor-next/commit/3bd358d83969a53f1ed4f3fd349eb186750f9461))
- 修复内容重复和编辑器内容拖动的一些 bug ([5a9c9d0](https://github.com/wangeditor-next/wangeditor-next/commit/5a9c9d0b0880dc006180a5c4e5828f54cd1905da))
- 修复行间距过小无效 ([5f13a5b](https://github.com/wangeditor-next/wangeditor-next/commit/5f13a5b3dc859a45ad25f88ad363f408d23bcee1))
- 修复选中内容中文输入时光标定位问题 ([51596a8](https://github.com/wangeditor-next/wangeditor-next/commit/51596a8b0b920dc1d1a9e39fff7c3624c0aa6f52))
- 修复用户自定义change事件获取html时tabal报错 ([5204f8e](https://github.com/wangeditor-next/wangeditor-next/commit/5204f8ebf63abdf8a7093e202411b63ce86c2964))
- 修复在 Chrome 和 Safari 中删除内容时，内联空节点被选中 ([a47c73f](https://github.com/wangeditor-next/wangeditor-next/commit/a47c73fc5fa008096165d5ac9c55d01f4a6b045b))
- 修复在 Safari 下，即使 contenteditable 元素非聚焦状态，并不会删除所选内容 ([3e8ca3c](https://github.com/wangeditor-next/wangeditor-next/commit/3e8ca3c86074454a75054e5ded03154f6b6544ea))
- 修复在代码块中中文输入会有多余字符的问题 ([a138c3f](https://github.com/wangeditor-next/wangeditor-next/commit/a138c3f0a2f25d9f89afb912cff45596f99e6b05))
- 修复在destory可能出现editor not find的问题 ([ce60416](https://github.com/wangeditor-next/wangeditor-next/commit/ce604165527435952b5ac4b011842714ec8cd5dd))
- 修复Safari上table内空行输入报错的问题 ([dae6dc5](https://github.com/wangeditor-next/wangeditor-next/commit/dae6dc544f714f195989a05970cb6bf272f6eb8b))
- 修复ua正则不支持100+的问题 ([c488ba0](https://github.com/wangeditor-next/wangeditor-next/commit/c488ba09183cbfcabef223709464c42fac53aea0))
- 选择图片会滚动 ([d2a8762](https://github.com/wangeditor-next/wangeditor-next/commit/d2a87629cedc3533e268a31ca822f414082bf48d))
- 选中内容输入中文报错 ([890cc68](https://github.com/wangeditor-next/wangeditor-next/commit/890cc686e566be68227641d5f31b42de66351126))
- 移除了每个包下的 publishConfig directory 配置 ([16559f0](https://github.com/wangeditor-next/wangeditor-next/commit/16559f052545c111318be760e64291a521bdcc65))
- 优化插入新文本的滚动交互 ([71131a4](https://github.com/wangeditor-next/wangeditor-next/commit/71131a4355d24b805052fa9bcf1515432e4351ad))
- 优化当父元素有滚动条，插入新文本的滚动交互 ([9275090](https://github.com/wangeditor-next/wangeditor-next/commit/9275090399f068db14854f2794b9aab996bee22e))
- 优化了 core 类型声明 ([5b5ee1e](https://github.com/wangeditor-next/wangeditor-next/commit/5b5ee1ee34300748460cedab6fcd46463820f8ef))
- 优化了 deleteFragment 函数调用传参 ([8d8145c](https://github.com/wangeditor-next/wangeditor-next/commit/8d8145c5e496a28e2d586722101d217ba1be7079))
- 优化了 normalizeDOMPoint 函数 ([31b9999](https://github.com/wangeditor-next/wangeditor-next/commit/31b99992bdc5bc2cc239320200da7d5ba7d6cfc0))
- 优化了当编辑失焦编辑区域滚动到顶部的问题 ([ebb966b](https://github.com/wangeditor-next/wangeditor-next/commit/ebb966bce81023c79727bae846920323f733008d))
- 优化了浏览器是否支持 beforeinput 事件的兼容性判断 ([ea221bb](https://github.com/wangeditor-next/wangeditor-next/commit/ea221bb3e176ace7a99854673fd727dedc0b3ba7))
- 优化选中代码块不应该展示 hoverbar 的交互 ([33dcbd6](https://github.com/wangeditor-next/wangeditor-next/commit/33dcbd6560dccfbe77e18cfbce8c9f077f19f6cd))
- 在移动 word 之前折叠展开选区 ([6b9b0f3](https://github.com/wangeditor-next/wangeditor-next/commit/6b9b0f3c9755c1950b0645c34166bd043a9d05f0))
- 增加 EXTEND_CONF 配置扩展能力 ([ff75a16](https://github.com/wangeditor-next/wangeditor-next/commit/ff75a16643b26d2d0e7a92cfdd827d5f0f56a849))
- 重复创建 ([3682c53](https://github.com/wangeditor-next/wangeditor-next/commit/3682c53b181b89d2c16b5d9845b381a4813c9e3c))
- autoFucos ([fea2faf](https://github.com/wangeditor-next/wangeditor-next/commit/fea2faf0af83a3eec67ee7bc7d76328409d2d703))
- beforeinput support ([60e6efc](https://github.com/wangeditor-next/wangeditor-next/commit/60e6efc3b3d6c31c4834e3b40e02fc8bc4ceaea6))
- blockquote & header insertBreak ([06678c9](https://github.com/wangeditor-next/wangeditor-next/commit/06678c963e8c8421ecded448de7510b254117550))
- button 增加 type ([37b3390](https://github.com/wangeditor-next/wangeditor-next/commit/37b33903e0ae5ffe95ab907791ab484facd052d9))
- chrome 链接后输入拼音，js 错误 ([6c04fab](https://github.com/wangeditor-next/wangeditor-next/commit/6c04fabb2c5ec78e13c1e1583685cf726887dcae))
- clear API ([c188b56](https://github.com/wangeditor-next/wangeditor-next/commit/c188b567379ae32abcfa879620c995c8d45818c4))
- code-block 选择语言 - 点击拖拽滚动条 ([b8c75e7](https://github.com/wangeditor-next/wangeditor-next/commit/b8c75e7dc5332c9da622433380802886dedc4344))
- composition-end ([082561d](https://github.com/wangeditor-next/wangeditor-next/commit/082561dc341b45791933757e2cf6102190004674))
- create - 判断 content length ([c0eadc9](https://github.com/wangeditor-next/wangeditor-next/commit/c0eadc9bf03edc7576c1d3e957babede4c0b546f))
- dangerouslyInsertHtml - 兼容异常情况 ([8b549f4](https://github.com/wangeditor-next/wangeditor-next/commit/8b549f480434782107eda3412bf6530d0d7eb9ba))
- droplist 过长 ([1de2a76](https://github.com/wangeditor-next/wangeditor-next/commit/1de2a76ac802b80c1b45537c129e5833b4d73d33))
- dropPanel 定位 ([e76310a](https://github.com/wangeditor-next/wangeditor-next/commit/e76310a1c6d4aafb2385faebb005bdddd38f9838))
- editor.blur() api 无效 ([48cbff3](https://github.com/wangeditor-next/wangeditor-next/commit/48cbff3142d961ff2eaf2f76a3182488de2e5b93))
- firefox下全选输入出现多余字符 ([659b107](https://github.com/wangeditor-next/wangeditor-next/commit/659b1078e3395ff00ddc0d1792fbf9c4d448ca41))
- fix https://github.com/wangeditor-next/wangeditor-next-v5/issues/457 ([1d8a46a](https://github.com/wangeditor-next/wangeditor-next/commit/1d8a46a1b5402c2ecb418db24d9d22532d152cea))
- fullScreen 隐藏 hoverbar ([ec463d3](https://github.com/wangeditor-next/wangeditor-next/commit/ec463d302cdc527987741ae6208a625af91ea61c))
- getElems 增加 id ([1dcedd9](https://github.com/wangeditor-next/wangeditor-next/commit/1dcedd9392d2eecef29f9c93e8915a2f2f83b8a5))
- getHtml 死循环 ([4614bfb](https://github.com/wangeditor-next/wangeditor-next/commit/4614bfb5c3a2658348a59749dd800a349e6c33a9))
- getHtml API ([c0b60cf](https://github.com/wangeditor-next/wangeditor-next/commit/c0b60cf47d8eaae4292265906fbe07875e1564c9))
- group-menu 考虑 excludeKeys ([ecc29f3](https://github.com/wangeditor-next/wangeditor-next/commit/ecc29f3b24992c8dc0adf006d81b0d4a252683c5))
- hotkey mod ([d480c20](https://github.com/wangeditor-next/wangeditor-next/commit/d480c206fd83ecc8d12f36147c210208aa6d6ab3))
- hoverbar - 处于网页下部 ([6cfb3e2](https://github.com/wangeditor-next/wangeditor-next/commit/6cfb3e2d364f4532cbafe5c8c6e4b3bc13fa2d78))
- hoverbar 被点击多次隐藏 ([bf4fc19](https://github.com/wangeditor-next/wangeditor-next/commit/bf4fc193847e8caba3a67c8dd152eae4f1950c4f))
- hoverbar active ([ceb3f41](https://github.com/wangeditor-next/wangeditor-next/commit/ceb3f41deafd8fc2cb8d3e8a498cb8d90ad1c73f))
- hoverbar modal 重复创建 ([70d2b61](https://github.com/wangeditor-next/wangeditor-next/commit/70d2b618a0662c88cd5e6691f513009726ce1b9b))
- hoverbar show/hide ([c96bc83](https://github.com/wangeditor-next/wangeditor-next/commit/c96bc8378939fecd78807fea4f2b7e1eec2a9ea0))
- hoverbarKeys - text ([59b4840](https://github.com/wangeditor-next/wangeditor-next/commit/59b48406b4c373ef029a5f5bdb0d15d925a91a0f))
- html 特殊字符 ([b3eb81b](https://github.com/wangeditor-next/wangeditor-next/commit/b3eb81bc9c4aa15c2ff7451c173de15d6c4552bc))
- i18n - 获取多语言配置 ([9f81597](https://github.com/wangeditor-next/wangeditor-next/commit/9f815970f8c3c6dddb6bf846ecb672325e80444b))
- i18n 切换语言 ([b3b4642](https://github.com/wangeditor-next/wangeditor-next/commit/b3b4642c6e72ab0b13b05657745abb87e71c633d))
- insertHtml - maxLength ([8c7dc8b](https://github.com/wangeditor-next/wangeditor-next/commit/8c7dc8b8efe1705af9989b040b04e2f98932cb77))
- insertHtml - maxLength ([52d72ec](https://github.com/wangeditor-next/wangeditor-next/commit/52d72ec4778a7a6c6f31a7e95d82fb91c9384ae8))
- insertHtml - maxLength ([b573359](https://github.com/wangeditor-next/wangeditor-next/commit/b5733597966b16d876b0c0e18509f04638e1c4df))
- insertKeys ([0a89420](https://github.com/wangeditor-next/wangeditor-next/commit/0a8942050bd0b39afb5bbc55ca7842461a5b98eb))
- link, text hoverbar 选区问题 ([e0b7438](https://github.com/wangeditor-next/wangeditor-next/commit/e0b7438c89a347f1b0b940d9c11150b72d595529))
- maxLength - 拼音 + 粘贴 ([3ac4db6](https://github.com/wangeditor-next/wangeditor-next/commit/3ac4db6d78cbe7a8d1fe19747deb0a17edd9b552))
- maxLength 对于拼音输入无效 ([117faa6](https://github.com/wangeditor-next/wangeditor-next/commit/117faa635e99667c4762b58757f045c80f949323))
- menu 点击多次才能生效 ([6497e39](https://github.com/wangeditor-next/wangeditor-next/commit/6497e39225a993c4d87f9ffddf20086446a4fbc2))
- min-height ([460fad5](https://github.com/wangeditor-next/wangeditor-next/commit/460fad56001e83842786629b1d1f8ed6411f4fd4))
- modal close ([dbfb3b4](https://github.com/wangeditor-next/wangeditor-next/commit/dbfb3b42504ae97aa0f641ff7fe5eba208b43580))
- normalize when create editor ([2b51962](https://github.com/wangeditor-next/wangeditor-next/commit/2b5196244a93ad7beb316bfa42e557221967d063))
- parse html - 有些 elem children 需要过滤 ([63cbb80](https://github.com/wangeditor-next/wangeditor-next/commit/63cbb804c8c7a778a4ee1f4ba8717a11b4b6b5a3))
- parse-html - space 160 ([54e72bc](https://github.com/wangeditor-next/wangeditor-next/commit/54e72bcb5ed38b8dc77e957ebd5d35881466b5b3))
- parse-html - sub sup ([2c15a5f](https://github.com/wangeditor-next/wangeditor-next/commit/2c15a5f9c9c2de8b34770a6bebfe765d203a03f6))
- parseHtml - 多空格文本 ([5d4479c](https://github.com/wangeditor-next/wangeditor-next/commit/5d4479c5d11fc23233ea63f0b69c845fa2ab8630))
- placeholder - 全选输入中文 ([fe4dd2a](https://github.com/wangeditor-next/wangeditor-next/commit/fe4dd2a85d54d64e2411c3dfc6cb90ac18003e28))
- placeHolder elem ([7d577ac](https://github.com/wangeditor-next/wangeditor-next/commit/7d577ac4d6003d1b4c8575be1c014cfa6632d248))
- readOnly 时菜单还可操作 ([0d4a29b](https://github.com/wangeditor-next/wangeditor-next/commit/0d4a29bb5ba8b62ac11a09d3f814abcb1fcf46be))
- readOnly 依然可以 insertText ([096eeaf](https://github.com/wangeditor-next/wangeditor-next/commit/096eeafd0fc62edf196ed3a9549c04ce19b6b159))
- rename es module filename ([1821d4e](https://github.com/wangeditor-next/wangeditor-next/commit/1821d4eef49e64efcb41b848849ca7a5e6472044))
- shadowDOM 节点支持问题 ([5eb41f1](https://github.com/wangeditor-next/wangeditor-next/commit/5eb41f1048ad110003b2ef95e0f22e26b7fd757c))
- shadowDOM 在失焦状态下元素获取失败 ([98aeccc](https://github.com/wangeditor-next/wangeditor-next/commit/98aeccc5be85513d577397642a9a2d2f730a0406))
- table - 粘贴合并单元格的表格 ([56ecb63](https://github.com/wangeditor-next/wangeditor-next/commit/56ecb6392510d433e092653f0f08183361778a3d))
- table - elemToHtml ([e36e609](https://github.com/wangeditor-next/wangeditor-next/commit/e36e6092ef721723169afc8bf0560a47ac9f4dfc))
- table-cell 全选 ([1ef4872](https://github.com/wangeditor-next/wangeditor-next/commit/1ef48729e6d99e7414bc89bc4ef0d66c172fc566))
- tableCell 中 br 报错 ([8604db7](https://github.com/wangeditor-next/wangeditor-next/commit/8604db751b622c01fa5391af59328236cf13effc))
- td th 中换行不起作用 ([89c6032](https://github.com/wangeditor-next/wangeditor-next/commit/89c6032a1c41100b7adaf9927e6bc9c06d0228db))
- textarea height ([873b04a](https://github.com/wangeditor-next/wangeditor-next/commit/873b04a65a7140afdc2427ac07fce57b3e2c423e))
- tooltip ([7e066d1](https://github.com/wangeditor-next/wangeditor-next/commit/7e066d1368f1bfaaca21e3385647be2dee6837f9))
- upload progress 0 ([9e660be](https://github.com/wangeditor-next/wangeditor-next/commit/9e660be126adb969dd8a80166b60d6f62be17b2a))
- url 后面中文输入异常 ([3bcebc7](https://github.com/wangeditor-next/wangeditor-next/commit/3bcebc78352e05cfec92eed92ee0b05d233feaef))
- void node - 不清理 text ([1bc891c](https://github.com/wangeditor-next/wangeditor-next/commit/1bc891c46318f5c5ab969752b3ddb8d75ee1faf7))
- vue 组件增加 customPaste ([e764248](https://github.com/wangeditor-next/wangeditor-next/commit/e76424870c75e09ab6267b604a951444b2e847c5))
- w-e-menu-tooltip 和 v4 冲突 ([762403b](https://github.com/wangeditor-next/wangeditor-next/commit/762403b2c4e860b3855cbc0caa883b1443d3c862))
- z-index ([02ec2d5](https://github.com/wangeditor-next/wangeditor-next/commit/02ec2d54605e747b7d4e1377a58fc9e14c9bba7c))

### Features

- 增加 API ([63d6fe8](https://github.com/wangeditor-next/wangeditor-next/commit/63d6fe85f17fea31c95fec727126799a979ec2f9))
- 增加 enable disable API（删除 setConfig setMenuConfig API） ([984fc50](https://github.com/wangeditor-next/wangeditor-next/commit/984fc50520061fc34ea08f4136bdeb93dee46564))
- 支持 nodejs 环境 ([484f18c](https://github.com/wangeditor-next/wangeditor-next/commit/484f18c3abc70d19e51c556f48491c18d390b1e1))
- API - getElemsByType + move + moveReverse ([748ad71](https://github.com/wangeditor-next/wangeditor-next/commit/748ad710b55d26ade4df1d8caa0a6ea5d2f6f8c7))
- basic text paste ([f0a5b98](https://github.com/wangeditor-next/wangeditor-next/commit/f0a5b980c95fa1e2fc59a898c6e0d0723c276c28))
- basic text style module ([005b343](https://github.com/wangeditor-next/wangeditor-next/commit/005b343573ba98f2d0b8480d034ff6807a499aa3))
- bold & header ([8130c23](https://github.com/wangeditor-next/wangeditor-next/commit/8130c23ad84485a68cf9ca4b53d52fab1cec4e96))
- clear color ([93b1a18](https://github.com/wangeditor-next/wangeditor-next/commit/93b1a189395ba113dfe9f793c69e136607f9a28f))
- clear editor api ([01b07f2](https://github.com/wangeditor-next/wangeditor-next/commit/01b07f2a2250661ef121919192d40a4852d50a91))
- clearStyle menu ([8002f70](https://github.com/wangeditor-next/wangeditor-next/commit/8002f707ed04b914180ec36fdca0edf48c815e01))
- close modal ([b5106f4](https://github.com/wangeditor-next/wangeditor-next/commit/b5106f4428813cf794c468034c80824b0a4f08db))
- code highlight ([42b2f8d](https://github.com/wangeditor-next/wangeditor-next/commit/42b2f8d192e2433593c11ad0b8424737f6cffb58))
- code-block - part ([a8bcd63](https://github.com/wangeditor-next/wangeditor-next/commit/a8bcd63d882832ac05a32878df0f767d145e0fa7))
- create editor ([12d98e4](https://github.com/wangeditor-next/wangeditor-next/commit/12d98e4bee179e9d277ec3ec2ecb827962ed0e75))
- customPaste ([0f25f5c](https://github.com/wangeditor-next/wangeditor-next/commit/0f25f5cae3a2cd5ae5832f3fc1026b3ab6d047e0))
- dangerouslyInsertHtml ([4dc3d0c](https://github.com/wangeditor-next/wangeditor-next/commit/4dc3d0cb403d751ae067a541868e77083c8ce74c))
- drag resize image ([cd72028](https://github.com/wangeditor-next/wangeditor-next/commit/cd72028f1786e2e53079ad5cbef1b8569731ca79))
- editor 生命周期，自定义事件 ([00e9bc2](https://github.com/wangeditor-next/wangeditor-next/commit/00e9bc2cfcb8b622764db1c76394491d72ffd93e))
- editor with-selection plugin ([9f0a39f](https://github.com/wangeditor-next/wangeditor-next/commit/9f0a39fecf6d92888d2a97929820d3be038efb31))
- editor.alert ([f147c8f](https://github.com/wangeditor-next/wangeditor-next/commit/f147c8f234510959c770860ac2f194e8d720f177))
- editor.isSelectedAll ([960c845](https://github.com/wangeditor-next/wangeditor-next/commit/960c8455f85a6bc7350f9944be80b3997bc1fea1))
- editor.showProgressBar ([51761d4](https://github.com/wangeditor-next/wangeditor-next/commit/51761d466ab3ef7c99e872954d4724ab51d8e28c))
- focus支持focus到文档末尾 ([628830e](https://github.com/wangeditor-next/wangeditor-next/commit/628830ef06ff85b3e67001ce30dd9e0557b0aa28))
- font-size + font-family ([cc649e0](https://github.com/wangeditor-next/wangeditor-next/commit/cc649e0918ce58e78b4d5ee49a400197b9d04b70))
- fullScreen ([e7ccd88](https://github.com/wangeditor-next/wangeditor-next/commit/e7ccd88a7dd58f64b7bd484de428e3a76cc994f7))
- getElemsByTypePrefix （删掉 getHeaders） ([c18834b](https://github.com/wangeditor-next/wangeditor-next/commit/c18834b3ebfd97fb36ccbe0faa84e6fe8c30eb67))
- getHeaders & editor.srcollToElem ([2bfb813](https://github.com/wangeditor-next/wangeditor-next/commit/2bfb813e4957f080c6676ec38f8f051275cdf44a))
- getSelectionText + maxLength ([58f6648](https://github.com/wangeditor-next/wangeditor-next/commit/58f66489b65f857238d96b93120f6de7e2750c81))
- groupButton disabled ([8ffd44c](https://github.com/wangeditor-next/wangeditor-next/commit/8ffd44c9a44758e951ca7bd02dd46746fcac1c03))
- hover bar ([107356e](https://github.com/wangeditor-next/wangeditor-next/commit/107356eff7bfaf53ce25e39244f8133c80518375))
- i18n ([c11b244](https://github.com/wangeditor-next/wangeditor-next/commit/c11b2440f91b99d40bca18b675c66a22b6e160c9))
- image menu - width 50% 100% ([f9b4c68](https://github.com/wangeditor-next/wangeditor-next/commit/f9b4c68dff3232b50491b07949c20eb4c18baa6b))
- image menu config ([bb18774](https://github.com/wangeditor-next/wangeditor-next/commit/bb187740e9703b4a76cde4f5e4d32ac714aa793a))
- image menus & position ([bf5beba](https://github.com/wangeditor-next/wangeditor-next/commit/bf5beba7b3014d63f0b9fe0063530c8b101a5011))
- indent menu + groupMenu ([08db901](https://github.com/wangeditor-next/wangeditor-next/commit/08db901cd3a3f2ddb2173cc4b36d471e4e68237e))
- insert link ([b04242f](https://github.com/wangeditor-next/wangeditor-next/commit/b04242ffa252d4088f5360c3de45c24d6f493552))
- list menu ([fe6c083](https://github.com/wangeditor-next/wangeditor-next/commit/fe6c0830b2c43e335e5972f85096f490694bbe19))
- menu color - part ([3a6cc86](https://github.com/wangeditor-next/wangeditor-next/commit/3a6cc86a7f9133d0862310c408abafb30c531734))
- menu color & dropPanel & menu config ([5d0d41b](https://github.com/wangeditor-next/wangeditor-next/commit/5d0d41b9a765a7deb583393f129925414c36ef35))
- menu hotkey ([fee05f1](https://github.com/wangeditor-next/wangeditor-next/commit/fee05f189434d1e57a32ff0dea1a57db6830318a))
- modal appendTo body ([fc0ab06](https://github.com/wangeditor-next/wangeditor-next/commit/fc0ab06d5c7177eceb04643234a8c301ca4de396))
- onBlur onFocus ([590ab4a](https://github.com/wangeditor-next/wangeditor-next/commit/590ab4a990048bb22cf15787a5fd4615db5b9ef6))
- parse html ([2a5eace](https://github.com/wangeditor-next/wangeditor-next/commit/2a5eace00f33cded50b68e8164748ec2480213fd))
- placeholder ([a3e4cdc](https://github.com/wangeditor-next/wangeditor-next/commit/a3e4cdcd474063e4f436327aaf4074bb2126d941))
- react 组件 ([448fc83](https://github.com/wangeditor-next/wangeditor-next/commit/448fc838d64dbef52cbcddde0e98eb021d8a9122))
- scroll config ([b4942b4](https://github.com/wangeditor-next/wangeditor-next/commit/b4942b4334f255b3d537389be3dacf1642dd5441))
- selectList ([b7366ab](https://github.com/wangeditor-next/wangeditor-next/commit/b7366ab2dafd379145d85881052d6f400bd13c85))
- text and toolbar ([3ae5d0c](https://github.com/wangeditor-next/wangeditor-next/commit/3ae5d0c4138fec7397ac8629e0012affe6b7dfa4))
- toHtml 机制 ([1c4d872](https://github.com/wangeditor-next/wangeditor-next/commit/1c4d8729f84aaab6a448f23064b34a20596305e9))
- toolbar config - insertKeys ([a2f3c4b](https://github.com/wangeditor-next/wangeditor-next/commit/a2f3c4be3762831723495bbc9d50eb6c9b05d195))
- toolbar excludeKeys ([09bd196](https://github.com/wangeditor-next/wangeditor-next/commit/09bd196ea24c19b04e5e7e38227ca94332847bf8))
- tooltip ([994d875](https://github.com/wangeditor-next/wangeditor-next/commit/994d875fee81cf01271c2e440c1df202aa067d0e))
- updateLink + unLink + viewLink ([254d554](https://github.com/wangeditor-next/wangeditor-next/commit/254d55466b3c8527dd9f0bf34681abd801c8c8ce))
- vue2 组件 ([fd7847a](https://github.com/wangeditor-next/wangeditor-next/commit/fd7847a72db661bbf29cf636d454c075fd331224))
