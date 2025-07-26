# Change Log

## 5.6.40

### Patch Changes

- e204312: fix: 宽度自适应获取当前选中的表格容器宽度，防止文档多表格时获取到其它表格容器元素和兼容高版本node.js
- a4b6fd8: chore: add rollup package link
- Updated dependencies [e204312]
- Updated dependencies [a4b6fd8]
  - @wangeditor-next/table-module@1.6.53
  - @wangeditor-next/basic-modules@1.5.41
  - @wangeditor-next/code-highlight@1.3.38
  - @wangeditor-next/core@1.7.41
  - @wangeditor-next/list-module@1.1.47
  - @wangeditor-next/upload-image-module@1.1.44
  - @wangeditor-next/video-module@1.3.47

## 5.6.39

### Patch Changes

- b557818: 表格自适应功能优化、表格样式统一、codelang 类型纠正
- Updated dependencies [b557818]
- Updated dependencies [d000e3f]
  - @wangeditor-next/table-module@1.6.52
  - @wangeditor-next/core@1.7.40
  - @wangeditor-next/basic-modules@1.5.40
  - @wangeditor-next/code-highlight@1.3.37
  - @wangeditor-next/list-module@1.1.46
  - @wangeditor-next/upload-image-module@1.1.43
  - @wangeditor-next/video-module@1.3.46

## 5.6.38

### Patch Changes

- a28a86f: revert: 回退 table module fullwidth 更改
- Updated dependencies [a28a86f]
  - @wangeditor-next/table-module@1.6.51

## 5.6.37

### Patch Changes

- 2b8635e: 修复若干 bug、优化表格使用
- Updated dependencies [22548a3]
- Updated dependencies [9e5955e]
- Updated dependencies [2b8635e]
  - @wangeditor-next/table-module@1.6.50
  - @wangeditor-next/basic-modules@1.5.39
  - @wangeditor-next/core@1.7.39
  - @wangeditor-next/upload-image-module@1.1.42
  - @wangeditor-next/code-highlight@1.3.36
  - @wangeditor-next/list-module@1.1.45
  - @wangeditor-next/video-module@1.3.45

## 5.6.36

### Patch Changes

- 6c7e34d: fix table、indent、video error

## 5.6.35

### Patch Changes

- 09fa830: 切换 yarn 为 pnpm
- Updated dependencies [5e7bfdf]
  - @wangeditor-next/basic-modules@1.5.38
  - @wangeditor-next/core@1.7.38
  - @wangeditor-next/table-module@1.6.48
  - @wangeditor-next/upload-image-module@1.1.41
  - @wangeditor-next/code-highlight@1.3.35
  - @wangeditor-next/list-module@1.1.44
  - @wangeditor-next/video-module@1.3.44

## 5.6.34

### Patch Changes

- 1450d35: update slate version && modify core content plugin
- Updated dependencies [1450d35]
  - @wangeditor-next/core@1.7.34
  - @wangeditor-next/basic-modules@1.5.34
  - @wangeditor-next/code-highlight@1.3.31
  - @wangeditor-next/list-module@1.1.40
  - @wangeditor-next/table-module@1.6.44
  - @wangeditor-next/upload-image-module@1.1.37
  - @wangeditor-next/video-module@1.3.40

## 5.6.33

### Patch Changes

- 71397d4: feat: enhance upload configuration with additional Uppy and XHRUpload options
- Updated dependencies [71397d4]
  - @wangeditor-next/core@1.7.33
  - @wangeditor-next/basic-modules@1.5.33
  - @wangeditor-next/code-highlight@1.3.30
  - @wangeditor-next/list-module@1.1.39
  - @wangeditor-next/table-module@1.6.43
  - @wangeditor-next/upload-image-module@1.1.36
  - @wangeditor-next/video-module@1.3.39

## 5.6.32

### Patch Changes

- aa01136: update snabbdom version

## 5.6.31

### Patch Changes

- 3f6d567: fix(table): allow parsing for TH elements in table module
- Updated dependencies [3f6d567]
  - @wangeditor-next/table-module@1.6.42

## 5.6.30

### Patch Changes

- c60e0e2: fix: Safari paste image base64 and blob (#524)
- Updated dependencies [c60e0e2]
  - @wangeditor-next/core@1.7.32
  - @wangeditor-next/basic-modules@1.5.32
  - @wangeditor-next/code-highlight@1.3.29
  - @wangeditor-next/list-module@1.1.38
  - @wangeditor-next/table-module@1.6.41
  - @wangeditor-next/upload-image-module@1.1.35
  - @wangeditor-next/video-module@1.3.38

## 5.6.29

### Patch Changes

- 76fb46e: fix(table): forbidden tabale drag event
- Updated dependencies [76fb46e]
  - @wangeditor-next/core@1.7.31
  - @wangeditor-next/basic-modules@1.5.31
  - @wangeditor-next/code-highlight@1.3.28
  - @wangeditor-next/list-module@1.1.37
  - @wangeditor-next/table-module@1.6.40
  - @wangeditor-next/upload-image-module@1.1.34
  - @wangeditor-next/video-module@1.3.37

## 5.6.28

### Patch Changes

- 53fcee8: Select the toolbar placement below the last row
- Updated dependencies [53fcee8]
  - @wangeditor-next/core@1.7.30
  - @wangeditor-next/basic-modules@1.5.30
  - @wangeditor-next/code-highlight@1.3.27
  - @wangeditor-next/list-module@1.1.36
  - @wangeditor-next/table-module@1.6.39
  - @wangeditor-next/upload-image-module@1.1.33
  - @wangeditor-next/video-module@1.3.36

## 5.6.27

### Patch Changes

- 31f0207: fix(table): improve type handling for table-cell elements in parseRowHtml function
- Updated dependencies [31f0207]
  - @wangeditor-next/table-module@1.6.38

## 5.6.26

### Patch Changes

- d1d8246: feat: add customCopy event handler for copy
- Updated dependencies [d1d8246]
  - @wangeditor-next/core@1.7.29
  - @wangeditor-next/basic-modules@1.5.29
  - @wangeditor-next/code-highlight@1.3.26
  - @wangeditor-next/list-module@1.1.35
  - @wangeditor-next/table-module@1.6.37
  - @wangeditor-next/upload-image-module@1.1.32
  - @wangeditor-next/video-module@1.3.35

## 5.6.25

### Patch Changes

- 592c7b6: fix(table): add colLength judge
- Updated dependencies [592c7b6]
  - @wangeditor-next/table-module@1.6.36

## 5.6.24

### Patch Changes

- 76819e1: fix(table): table tdList first column default width
- Updated dependencies [76819e1]
  - @wangeditor-next/table-module@1.6.35

## 5.6.23

### Patch Changes

- f4e759e: 375 复制excel数据到编辑器中格式错乱
- Updated dependencies [f4e759e]
  - @wangeditor-next/table-module@1.6.34

## 5.6.22

### Patch Changes

- 7225111: fix(max length): sync update leftLength
- Updated dependencies [7225111]
  - @wangeditor-next/core@1.7.28
  - @wangeditor-next/basic-modules@1.5.28
  - @wangeditor-next/code-highlight@1.3.25
  - @wangeditor-next/list-module@1.1.34
  - @wangeditor-next/table-module@1.6.33
  - @wangeditor-next/upload-image-module@1.1.31
  - @wangeditor-next/video-module@1.3.34

## 5.6.21

### Patch Changes

- 2099e64: fix(upload): add complete upload callback
- Updated dependencies [2099e64]
  - @wangeditor-next/core@1.7.27
  - @wangeditor-next/basic-modules@1.5.27
  - @wangeditor-next/code-highlight@1.3.24
  - @wangeditor-next/list-module@1.1.33
  - @wangeditor-next/table-module@1.6.32
  - @wangeditor-next/upload-image-module@1.1.30
  - @wangeditor-next/video-module@1.3.33

## 5.6.20

### Patch Changes

- 8c762a9: feat(code block): add code block handletab
- Updated dependencies [8c762a9]
  - @wangeditor-next/basic-modules@1.5.26
  - @wangeditor-next/upload-image-module@1.1.29

## 5.6.19

### Patch Changes

- 5fa2a72: fix(upload): delete remove file api
- Updated dependencies [5fa2a72]
  - @wangeditor-next/core@1.7.26
  - @wangeditor-next/basic-modules@1.5.25
  - @wangeditor-next/code-highlight@1.3.23
  - @wangeditor-next/list-module@1.1.32
  - @wangeditor-next/table-module@1.6.31
  - @wangeditor-next/upload-image-module@1.1.28
  - @wangeditor-next/video-module@1.3.32

## 5.6.18

### Patch Changes

- ad3d49b: fix(table): If followed by a table deleteforward is disabled
- Updated dependencies [ad3d49b]
  - @wangeditor-next/table-module@1.6.30

## 5.6.17

### Patch Changes

- 230e46d: fix table merge row show error
- Updated dependencies [230e46d]
  - @wangeditor-next/table-module@1.6.28

## 5.6.16

### Patch Changes

- 33d87c9: video module add align prop
- Updated dependencies [33d87c9]
  - @wangeditor-next/video-module@1.3.31

## 5.6.15

### Patch Changes

- 5bbff78: fix: add more font style
- 7b80f5d: fix: revert default font config
- Updated dependencies [5bbff78]
- Updated dependencies [7b80f5d]
  - @wangeditor-next/basic-modules@1.5.24
  - @wangeditor-next/core@1.7.25
  - @wangeditor-next/upload-image-module@1.1.27
  - @wangeditor-next/code-highlight@1.3.22
  - @wangeditor-next/list-module@1.1.31
  - @wangeditor-next/table-module@1.6.27
  - @wangeditor-next/video-module@1.3.30

## 5.6.14

### Patch Changes

- af6b10e: revert diff by selection
- Updated dependencies [af6b10e]
  - @wangeditor-next/core@1.7.24
  - @wangeditor-next/basic-modules@1.5.23
  - @wangeditor-next/code-highlight@1.3.21
  - @wangeditor-next/list-module@1.1.30
  - @wangeditor-next/table-module@1.6.26
  - @wangeditor-next/upload-image-module@1.1.26
  - @wangeditor-next/video-module@1.3.29

## 5.6.13

### Patch Changes

- 9fb698d: perf: reduce re-rendering
- Updated dependencies [9fb698d]
  - @wangeditor-next/core@1.7.23
  - @wangeditor-next/basic-modules@1.5.22
  - @wangeditor-next/code-highlight@1.3.20
  - @wangeditor-next/list-module@1.1.29
  - @wangeditor-next/table-module@1.6.25
  - @wangeditor-next/upload-image-module@1.1.25
  - @wangeditor-next/video-module@1.3.28

## 5.6.12

### Patch Changes

- 11135d9: - Fix incorrect nesting of tables within paragraph tags
  - Improve table cell interaction handling
  - Prevent node splitting on new lines
  - Handle deletion without affecting table structure
  - Enhance tab navigation between cells
  - Maintain document structure with proper paragraph placement
- Updated dependencies [11135d9]
  - @wangeditor-next/table-module@1.6.24

## 5.6.11

### Patch Changes

- 51f9221: fix(table): fill in the hidden table cell
- Updated dependencies [51f9221]
  - @wangeditor-next/table-module@1.6.23

## 5.6.10

### Patch Changes

- 258e365: fix: show microsoft world img
- Updated dependencies [258e365]
  - @wangeditor-next/core@1.7.21
  - @wangeditor-next/basic-modules@1.5.20
  - @wangeditor-next/code-highlight@1.3.18
  - @wangeditor-next/list-module@1.1.27
  - @wangeditor-next/table-module@1.6.21
  - @wangeditor-next/upload-image-module@1.1.23
  - @wangeditor-next/video-module@1.3.26

## 5.6.9

### Patch Changes

- 58022b2: 319 bug 表格单元格内多选内容删除事件没有执行
- Updated dependencies [58022b2]
  - @wangeditor-next/core@1.7.20
  - @wangeditor-next/basic-modules@1.5.19
  - @wangeditor-next/code-highlight@1.3.17
  - @wangeditor-next/list-module@1.1.26
  - @wangeditor-next/table-module@1.6.20
  - @wangeditor-next/upload-image-module@1.1.22
  - @wangeditor-next/video-module@1.3.25

## 5.6.8

### Patch Changes

- 85c2579: 278 bug选中区域同时选中了有序无序列表与表格单元格时进行删除操作后报错
- Updated dependencies [85c2579]
  - @wangeditor-next/table-module@1.6.19
  - @wangeditor-next/core@1.7.19
  - @wangeditor-next/basic-modules@1.5.18
  - @wangeditor-next/code-highlight@1.3.16
  - @wangeditor-next/list-module@1.1.25
  - @wangeditor-next/upload-image-module@1.1.21
  - @wangeditor-next/video-module@1.3.24

## 5.6.7

### Patch Changes

- 1e70838: fix(composition): reinput when cursor in link fornt
- Updated dependencies [1e70838]
  - @wangeditor-next/core@1.7.18
  - @wangeditor-next/basic-modules@1.5.17
  - @wangeditor-next/code-highlight@1.3.15
  - @wangeditor-next/list-module@1.1.24
  - @wangeditor-next/table-module@1.6.18
  - @wangeditor-next/upload-image-module@1.1.20
  - @wangeditor-next/video-module@1.3.23

## 5.6.6

### Patch Changes

- f1848d5: feat: elem id add type
- Updated dependencies [f1848d5]
  - @wangeditor-next/core@1.7.17
  - @wangeditor-next/basic-modules@1.5.16
  - @wangeditor-next/code-highlight@1.3.14
  - @wangeditor-next/list-module@1.1.23
  - @wangeditor-next/table-module@1.6.17
  - @wangeditor-next/upload-image-module@1.1.19
  - @wangeditor-next/video-module@1.3.22

## 5.6.5

### Patch Changes

- 5e1d59a: update editor module version

## 5.6.4

### Patch Changes

- c18aa53: fix: 修复单元格内的换行在编辑模式下的视觉错误
- Updated dependencies [c18aa53]
  - @wangeditor-next/core@1.7.13
  - @wangeditor-next/table-module@1.6.11
  - @wangeditor-next/basic-modules@1.5.12
  - @wangeditor-next/code-highlight@1.3.10
  - @wangeditor-next/list-module@1.1.18
  - @wangeditor-next/upload-image-module@1.1.15
  - @wangeditor-next/video-module@1.3.18

## 5.6.3

### Patch Changes

- c0cfd9c: 254 在windows上搭建webview2或者electron客户端使用wangeditor和搜狗输入法执行特定步骤会出现异常
- Updated dependencies [c0cfd9c]
  - @wangeditor-next/upload-image-module@1.1.14
  - @wangeditor-next/code-highlight@1.3.9
  - @wangeditor-next/basic-modules@1.5.11
  - @wangeditor-next/table-module@1.6.10
  - @wangeditor-next/video-module@1.3.17
  - @wangeditor-next/list-module@1.1.17
  - @wangeditor-next/core@1.7.12

## 5.6.2

### Patch Changes

- ceeb138: fix path resolve warning
- Updated dependencies [ceeb138]
  - @wangeditor-next/upload-image-module@1.1.13
  - @wangeditor-next/code-highlight@1.3.8
  - @wangeditor-next/basic-modules@1.5.10
  - @wangeditor-next/table-module@1.6.9
  - @wangeditor-next/video-module@1.3.16
  - @wangeditor-next/list-module@1.1.16
  - @wangeditor-next/core@1.7.11

## 5.6.1

### Patch Changes

- eea16b2: perf: added menu config ts type
- Updated dependencies [eea16b2]
  - @wangeditor-next/basic-modules@1.5.8
  - @wangeditor-next/core@1.7.9
  - @wangeditor-next/upload-image-module@1.1.10
  - @wangeditor-next/code-highlight@1.3.6
  - @wangeditor-next/list-module@1.1.14
  - @wangeditor-next/table-module@1.6.7
  - @wangeditor-next/video-module@1.3.13

## 5.6.0

### Minor Changes

- 739f925: refactor test\style\build

## 5.5.8

### Patch Changes

- ac57da1: refactor test and build depts
- Updated dependencies [ac57da1]
  - @wangeditor-next/basic-modules@1.5.6
  - @wangeditor-next/code-highlight@1.3.4
  - @wangeditor-next/core@1.7.7
  - @wangeditor-next/list-module@1.1.12
  - @wangeditor-next/table-module@1.6.5
  - @wangeditor-next/upload-image-module@1.1.8
  - @wangeditor-next/video-module@1.3.11

## 5.5.7

### Patch Changes

- c7ef2d0: refactor by new eslint rule
- Updated dependencies [c7ef2d0]
  - @wangeditor-next/upload-image-module@1.1.7
  - @wangeditor-next/code-highlight@1.3.3
  - @wangeditor-next/basic-modules@1.5.5
  - @wangeditor-next/table-module@1.6.4
  - @wangeditor-next/video-module@1.3.10
  - @wangeditor-next/list-module@1.1.11
  - @wangeditor-next/core@1.7.6

## 5.5.6

### Patch Changes

- 94f8470: revert modify table with hook
- Updated dependencies [94f8470]
  - @wangeditor-next/table-module@1.6.2

## 5.5.5

### Patch Changes

- 52340bc: refactor workflow
- Updated dependencies [52340bc]
  - @wangeditor-next/basic-modules@1.5.3
  - @wangeditor-next/code-highlight@1.3.1
  - @wangeditor-next/core@1.7.4
  - @wangeditor-next/list-module@1.1.9
  - @wangeditor-next/table-module@1.6.1
  - @wangeditor-next/upload-image-module@1.1.5
  - @wangeditor-next/video-module@1.3.8

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.5.4](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.5.3...@wangeditor-next/editor@5.5.4) (2024-09-06)

**Note:** Version bump only for package @wangeditor-next/editor

## [5.5.3](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.5.2...@wangeditor-next/editor@5.5.3) (2024-09-01)

**Note:** Version bump only for package @wangeditor-next/editor

## [5.5.2](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.5.1...@wangeditor-next/editor@5.5.2) (2024-08-29)

### Reverts

- Revert "chore: modify package publish config" ([7e2785e](https://github.com/wangeditor-next/wangeditor-next/commit/7e2785ede4512e19f8a337e745440e7bf9de2f30))

## [5.5.1](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.5.0...@wangeditor-next/editor@5.5.1) (2024-08-25)

**Note:** Version bump only for package @wangeditor-next/editor

# [5.5.0](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.4.2...@wangeditor-next/editor@5.5.0) (2024-08-18)

### Features

- **format painter menu:** add format painter menu ([93a2d4b](https://github.com/wangeditor-next/wangeditor-next/commit/93a2d4b4da3632eb15ed7d4aa65499ab3249cdbd))

## [5.4.2](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.4.1...@wangeditor-next/editor@5.4.2) (2024-08-15)

**Note:** Version bump only for package @wangeditor-next/editor

# [5.4.0](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.3.14...@wangeditor-next/editor@5.4.0) (2024-08-11)

### Features

- **table module:** add table property setting ([48d0f3b](https://github.com/wangeditor-next/wangeditor-next/commit/48d0f3b3a84b304c7f0aad613fc8cbaffb1f1914))

## [5.3.15](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.3.14...@wangeditor-next/editor@5.3.15) (2024-08-08)

**Note:** Version bump only for package @wangeditor-next/editor

## [5.3.14](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.3.13...@wangeditor-next/editor@5.3.14) (2024-08-03)

**Note:** Version bump only for package @wangeditor-next/editor

## [5.3.13](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.3.12...@wangeditor-next/editor@5.3.13) (2024-07-27)

**Note:** Version bump only for package @wangeditor-next/editor

## [5.3.12](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.3.12-alpha.0...@wangeditor-next/editor@5.3.12) (2024-07-27)

### Reverts

- Revert "chore(release): publish" ([64b047f](https://github.com/wangeditor-next/wangeditor-next/commit/64b047f9ec1ff499d5ca6c6063f410f49fd779ba))

## [5.3.12-alpha.1](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.3.12-alpha.0...@wangeditor-next/editor@5.3.12-alpha.1) (2024-07-25)

**Note:** Version bump only for package @wangeditor-next/editor

## [5.3.12-alpha.0](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.3.11...@wangeditor-next/editor@5.3.12-alpha.0) (2024-07-25)

**Note:** Version bump only for package @wangeditor-next/editor

## [5.3.11](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.3.10...@wangeditor-next/editor@5.3.11) (2024-07-23)

**Note:** Version bump only for package @wangeditor-next/editor

## [5.3.10](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.3.8...@wangeditor-next/editor@5.3.10) (2024-07-21)

**Note:** Version bump only for package @wangeditor-next/editor

## [5.3.9](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.3.8...@wangeditor-next/editor@5.3.9) (2024-07-21)

**Note:** Version bump only for package @wangeditor-next/editor

## [5.3.8](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.3.7...@wangeditor-next/editor@5.3.8) (2024-07-19)

**Note:** Version bump only for package @wangeditor-next/editor

## [5.3.7](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.3.5...@wangeditor-next/editor@5.3.7) (2024-07-17)

**Note:** Version bump only for package @wangeditor-next/editor

## [5.3.6](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.3.5...@wangeditor-next/editor@5.3.6) (2024-07-16)

**Note:** Version bump only for package @wangeditor-next/editor

## [5.3.5](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.4.0...@wangeditor-next/editor@5.3.5) (2024-07-15)

**Note:** Version bump only for package @wangeditor-next/editor

## [5.3.4](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.4.0...@wangeditor-next/editor@5.3.4) (2024-07-14)

**Note:** Version bump only for package @wangeditor-next/editor

# [5.4.0](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.3.2...@wangeditor-next/editor@5.4.0) (2024-07-11)

### Features

- Table add merge / split cell ([26250fa](https://github.com/wangeditor-next/wangeditor-next/commit/26250faaa6fbbbdd39a4d5c28364df9d944596bd))

## [5.3.2](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.3.1...@wangeditor-next/editor@5.3.2) (2024-07-08)

**Note:** Version bump only for package @wangeditor-next/editor

## [5.3.1](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.3.0...@wangeditor-next/editor@5.3.1) (2024-06-29)

**Note:** Version bump only for package @wangeditor-next/editor

# [5.3.0](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.2.8...@wangeditor-next/editor@5.3.0) (2024-06-24)

### Features

- **video:** add edit video src menu ([77b6d13](https://github.com/wangeditor-next/wangeditor-next/commit/77b6d13a5bbbebbf56aee7b6113029b90f7d6686))

## [5.2.8](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.2.7...@wangeditor-next/editor@5.2.8) (2024-06-22)

**Note:** Version bump only for package @wangeditor-next/editor

## [5.2.7](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.2.6...@wangeditor-next/editor@5.2.7) (2024-06-22)

### Performance Improvements

- **video:** modify video position by toolbar ([b0c5f0a](https://github.com/wangeditor-next/wangeditor-next/commit/b0c5f0a0fe8e0b0db4456f8777430a1610f700b7))
- show more config ([055cffc](https://github.com/wangeditor-next/wangeditor-next/commit/055cffc6bdeb74636e54e35f31725feb798b8449))

### Reverts

- **example:** revert content config ([ecfc3e9](https://github.com/wangeditor-next/wangeditor-next/commit/ecfc3e93539a52ec3d9c00559ffba527605e29f0))

## [5.2.6](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.2.5...@wangeditor-next/editor@5.2.6) (2024-06-17)

**Note:** Version bump only for package @wangeditor-next/editor

## [5.2.5](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.2.4...@wangeditor-next/editor@5.2.5) (2024-06-14)

**Note:** Version bump only for package @wangeditor-next/editor

## [5.2.4](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.2.3...@wangeditor-next/editor@5.2.4) (2024-06-13)

### Performance Improvements

- add edit image and video width height menu ([f0a9ce6](https://github.com/wangeditor-next/wangeditor-next/commit/f0a9ce6a24107e6e4865f38dd8cd1c7f048551f2))

## [5.2.3](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.2.2...@wangeditor-next/editor@5.2.3) (2024-06-08)

### Performance Improvements

- **issue 13:** add replace icon svg by menu config ([a897f58](https://github.com/wangeditor-next/wangeditor-next/commit/a897f58fd85a7f8f4bd1e6ad1cd114457eebaf13))

## [5.2.2](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.2.1...@wangeditor-next/editor@5.2.2) (2024-06-04)

### Performance Improvements

- **issue 5259:** video element default center ([9c01d40](https://github.com/wangeditor-next/wangeditor-next/commit/9c01d4029dd5a63869e737e579f4a0af50650e1e))

## [5.2.1](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor-next/editor@5.2.0...@wangeditor-next/editor@5.2.1) (2024-05-30)

**Note:** Version bump only for package @wangeditor-next/editor

# 5.2.0 (2024-05-19)

### Bug Fixes

- 不支持 IE 浏览器的提醒 ([70c5cae](https://github.com/wangeditor-next/wangeditor-next/commit/70c5caefd8f6f663225b7a0b796a035d274ef4e1))
- 尝试修复 nuxt 报错 issue[#4409](https://github.com/wangeditor-next/wangeditor-next/issues/4409) ([912f888](https://github.com/wangeditor-next/wangeditor-next/commit/912f8889a11d962b3ac2c65cb5835f4e8c58c372))
- 打包问题 ([c4e87cc](https://github.com/wangeditor-next/wangeditor-next/commit/c4e87ccac82bcf90d20b7304aff83745e52fb1b1))
- 更新各包之间依赖版本 ([75c552c](https://github.com/wangeditor-next/wangeditor-next/commit/75c552cc8ed54765bebb86a7ec5329a7fc79e85f))
- 兼容 AggregateError ([0cbd82d](https://github.com/wangeditor-next/wangeditor-next/commit/0cbd82d30d350b2313f6373e2b5f6d168e47e1bc))
- 兼容next.js及nuxt.js ([233728e](https://github.com/wangeditor-next/wangeditor-next/commit/233728eb984f541437c62a1390fa0542b2cc6227))
- 开放几个第三方用的 API ([bdf3e70](https://github.com/wangeditor-next/wangeditor-next/commit/bdf3e70c52bac71e2056e21237fe4ac9e2b0818f))
- 拼音隐藏 placeholder ([aec1a9f](https://github.com/wangeditor-next/wangeditor-next/commit/aec1a9f62af8944b7894beeca953076ec73545d5))
- 上传视频 - customBrowseAndUpload 缺少 poster ([c24627a](https://github.com/wangeditor-next/wangeditor-next/commit/c24627aaa4c173c5d435e3077dfe8f6b4a9a87b1))
- 上传图片 - base64 仍触发上传 + 超出 maxSize 的报错提醒 ([a1d469a](https://github.com/wangeditor-next/wangeditor-next/commit/a1d469accb7f87f8ea0282a1699d002aaaa4e79a))
- 添加QQ浏览器polyfill ([a1b476a](https://github.com/wangeditor-next/wangeditor-next/commit/a1b476a0bed52315f3e398c586d73f85996f9431))
- 图片上传，提示 ([3754012](https://github.com/wangeditor-next/wangeditor-next/commit/37540129dff1212c5ebfd4ca3f4d4e8def735e73))
- 修复 node 环境下报错问题 ([5a635a5](https://github.com/wangeditor-next/wangeditor-next/commit/5a635a5e8fac942ee214dd22b097e09057abc69c))
- 修复取消链接后撤销再重做报错的问题 ([9b233a9](https://github.com/wangeditor-next/wangeditor-next/commit/9b233a92c95571235248623a6ca5212eb4237f2a))
- 移除了每个包下的 publishConfig directory 配置 ([16559f0](https://github.com/wangeditor-next/wangeditor-next/commit/16559f052545c111318be760e64291a521bdcc65))
- 优化选中代码块不应该展示 hoverbar 的交互 ([33dcbd6](https://github.com/wangeditor-next/wangeditor-next/commit/33dcbd6560dccfbe77e18cfbce8c9f077f19f6cd))
- checkVideo 增加 poster 参数 ([c0402e1](https://github.com/wangeditor-next/wangeditor-next/commit/c0402e155470233d256e037d863dab74c026b7f6))
- customInsert 不触发 onSuccess ([d6f4a1b](https://github.com/wangeditor-next/wangeditor-next/commit/d6f4a1b1494864b116a1310cce2d9e8632c92c6f))
- delete divider ([f04cbd6](https://github.com/wangeditor-next/wangeditor-next/commit/f04cbd6009099629e3cd41be19d20b6788fe7f28))
- divider - 键盘删除 ([31db059](https://github.com/wangeditor-next/wangeditor-next/commit/31db0593dbc77fba9b4a719bc0f48f1223afd680))
- example/code-hightlight ([7885988](https://github.com/wangeditor-next/wangeditor-next/commit/78859884cefc18d15ce2f87507380a78c2ad65e5))
- focus table 时 isFocused 异常 ([5c52bf3](https://github.com/wangeditor-next/wangeditor-next/commit/5c52bf33e91b1a4677e7bbc04c5d80698abfeeab))
- globalThis 兼容性 ([7a47f4b](https://github.com/wangeditor-next/wangeditor-next/commit/7a47f4b904815516d3b5749ab652ff80478411bc))
- group-menu 考虑 excludeKeys ([ecc29f3](https://github.com/wangeditor-next/wangeditor-next/commit/ecc29f3b24992c8dc0adf006d81b0d4a252683c5))
- hoverbar config - 同时选中文字和 table ([8f6b4d1](https://github.com/wangeditor-next/wangeditor-next/commit/8f6b4d1a20e3b1b75da69b20bd5893ce08a27185))
- hoverbarKeys - text ([59b4840](https://github.com/wangeditor-next/wangeditor-next/commit/59b48406b4c373ef029a5f5bdb0d15d925a91a0f))
- html 特殊字符 ([b3eb81b](https://github.com/wangeditor-next/wangeditor-next/commit/b3eb81bc9c4aa15c2ff7451c173de15d6c4552bc))
- i18n - 获取多语言配置 ([9f81597](https://github.com/wangeditor-next/wangeditor-next/commit/9f815970f8c3c6dddb6bf846ecb672325e80444b))
- i18n 切换语言 ([b3b4642](https://github.com/wangeditor-next/wangeditor-next/commit/b3b4642c6e72ab0b13b05657745abb87e71c633d))
- insertKeys ([0a89420](https://github.com/wangeditor-next/wangeditor-next/commit/0a8942050bd0b39afb5bbc55ca7842461a5b98eb))
- link, text hoverbar 选区问题 ([e0b7438](https://github.com/wangeditor-next/wangeditor-next/commit/e0b7438c89a347f1b0b940d9c11150b72d595529))
- menu 点击多次才能生效 ([6497e39](https://github.com/wangeditor-next/wangeditor-next/commit/6497e39225a993c4d87f9ffddf20086446a4fbc2))
- normalize when create editor ([2b51962](https://github.com/wangeditor-next/wangeditor-next/commit/2b5196244a93ad7beb316bfa42e557221967d063))
- parse html - v4 video ([8dca822](https://github.com/wangeditor-next/wangeditor-next/commit/8dca822f9f1b52fd71dd6e17f0954d6aa016324b))
- qq 浏览器报错 ([8a09ed5](https://github.com/wangeditor-next/wangeditor-next/commit/8a09ed5d810fc1e2c4d0c529aa1269ed0c06425e))
- readOnly 时菜单还可操作 ([0d4a29b](https://github.com/wangeditor-next/wangeditor-next/commit/0d4a29bb5ba8b62ac11a09d3f814abcb1fcf46be))
- registerModule ([189981c](https://github.com/wangeditor-next/wangeditor-next/commit/189981c73db07d5b15ee4c46b1639f76f6f63ba1))
- rename es module filename ([1821d4e](https://github.com/wangeditor-next/wangeditor-next/commit/1821d4eef49e64efcb41b848849ca7a5e6472044))
- scroll 滚动问题 ([bc133e1](https://github.com/wangeditor-next/wangeditor-next/commit/bc133e1e4ca89ab5042cbc0971578ad144499805))
- setHtml 支持空字符串 ([d438157](https://github.com/wangeditor-next/wangeditor-next/commit/d43815766320d9cb0548bae0415c54ce7b147efb))
- shadow dom 样式缺失 ([2fcb69c](https://github.com/wangeditor-next/wangeditor-next/commit/2fcb69c866266cc5b0265cff031ae9279d368b84))
- style-to-html - 输入 a 会删除外部的 <a> 标签 ([af1f523](https://github.com/wangeditor-next/wangeditor-next/commit/af1f523983f2bc4b7eaf9726d4b8a35227ab27dc))
- table - elemToHtml ([e36e609](https://github.com/wangeditor-next/wangeditor-next/commit/e36e6092ef721723169afc8bf0560a47ac9f4dfc))
- tableCell 中 br 报错 ([8604db7](https://github.com/wangeditor-next/wangeditor-next/commit/8604db751b622c01fa5391af59328236cf13effc))
- text hoverbar ([c7de4f8](https://github.com/wangeditor-next/wangeditor-next/commit/c7de4f815d6f5b9e009a3149ed042052576c424e))
- text hoverbar ([efe9a34](https://github.com/wangeditor-next/wangeditor-next/commit/efe9a34d85f8baaeced27543a7bcd508b50f6bca))
- upload file callback error ([bf20e07](https://github.com/wangeditor-next/wangeditor-next/commit/bf20e07f12ed242b0ab4bb2290d876153a822972))
- video - 键盘删除 ([5a6bedd](https://github.com/wangeditor-next/wangeditor-next/commit/5a6bedd80fa0d758270731f62115637ad7f313d0))

### Features

- 两端对齐 ([e5080d3](https://github.com/wangeditor-next/wangeditor-next/commit/e5080d3dd102f7a951d8e1f370db834778ecbdfa))
- 上标 下标 ([40dab08](https://github.com/wangeditor-next/wangeditor-next/commit/40dab085a061ea3e838f0cfa86260c6c6f894c69))
- 上传图片 metaWithUrl ([2485157](https://github.com/wangeditor-next/wangeditor-next/commit/24851576a1dcc07b1a8931d17a147c3640222e85))
- 增加 enable disable API（删除 setConfig setMenuConfig API） ([984fc50](https://github.com/wangeditor-next/wangeditor-next/commit/984fc50520061fc34ea08f4136bdeb93dee46564))
- 支持 nodejs 环境 ([484f18c](https://github.com/wangeditor-next/wangeditor-next/commit/484f18c3abc70d19e51c556f48491c18d390b1e1))
- basic text style module ([005b343](https://github.com/wangeditor-next/wangeditor-next/commit/005b343573ba98f2d0b8480d034ff6807a499aa3))
- block quote ([c3c87a5](https://github.com/wangeditor-next/wangeditor-next/commit/c3c87a5c09b311eb14c799df94fc4826aa3f4262))
- bold & header ([8130c23](https://github.com/wangeditor-next/wangeditor-next/commit/8130c23ad84485a68cf9ca4b53d52fab1cec4e96))
- clearStyle menu ([8002f70](https://github.com/wangeditor-next/wangeditor-next/commit/8002f707ed04b914180ec36fdca0edf48c815e01))
- code highlight ([42b2f8d](https://github.com/wangeditor-next/wangeditor-next/commit/42b2f8d192e2433593c11ad0b8424737f6cffb58))
- code-block - part ([a8bcd63](https://github.com/wangeditor-next/wangeditor-next/commit/a8bcd63d882832ac05a32878df0f767d145e0fa7))
- create editor ([12d98e4](https://github.com/wangeditor-next/wangeditor-next/commit/12d98e4bee179e9d277ec3ec2ecb827962ed0e75))
- create mode ([63c2eef](https://github.com/wangeditor-next/wangeditor-next/commit/63c2eef9a9a0a2838dfadd23483de35a76f88b0b))
- customPaste ([0f25f5c](https://github.com/wangeditor-next/wangeditor-next/commit/0f25f5cae3a2cd5ae5832f3fc1026b3ab6d047e0))
- divider menu ([5262634](https://github.com/wangeditor-next/wangeditor-next/commit/526263445616725541bf374b80260e73b1d4c6ec))
- drag resize image ([cd72028](https://github.com/wangeditor-next/wangeditor-next/commit/cd72028f1786e2e53079ad5cbef1b8569731ca79))
- editor 生命周期，自定义事件 ([00e9bc2](https://github.com/wangeditor-next/wangeditor-next/commit/00e9bc2cfcb8b622764db1c76394491d72ffd93e))
- editor with-selection plugin ([9f0a39f](https://github.com/wangeditor-next/wangeditor-next/commit/9f0a39fecf6d92888d2a97929820d3be038efb31))
- editor.isSelectedAll ([960c845](https://github.com/wangeditor-next/wangeditor-next/commit/960c8455f85a6bc7350f9944be80b3997bc1fea1))
- editor.showProgressBar ([51761d4](https://github.com/wangeditor-next/wangeditor-next/commit/51761d466ab3ef7c99e872954d4724ab51d8e28c))
- editVideoSize ([375eecb](https://github.com/wangeditor-next/wangeditor-next/commit/375eecba826eac681268c55c47bcd922f7157d63))
- emotion ([736f955](https://github.com/wangeditor-next/wangeditor-next/commit/736f955211287bafca2375de3c8193cd0aa0856f))
- enter menu ([988fc31](https://github.com/wangeditor-next/wangeditor-next/commit/988fc31f31de3d37dffbf54abb784cceb8e6118d))
- font-size + font-family ([cc649e0](https://github.com/wangeditor-next/wangeditor-next/commit/cc649e0918ce58e78b4d5ee49a400197b9d04b70))
- fullScreen ([e7ccd88](https://github.com/wangeditor-next/wangeditor-next/commit/e7ccd88a7dd58f64b7bd484de428e3a76cc994f7))
- getElemsByTypePrefix （删掉 getHeaders） ([c18834b](https://github.com/wangeditor-next/wangeditor-next/commit/c18834b3ebfd97fb36ccbe0faa84e6fe8c30eb67))
- header button menu ([6413135](https://github.com/wangeditor-next/wangeditor-next/commit/64131354d54705e11fd6992fcf5a4389371c3560))
- hover bar ([107356e](https://github.com/wangeditor-next/wangeditor-next/commit/107356eff7bfaf53ce25e39244f8133c80518375))
- i18n ([c11b244](https://github.com/wangeditor-next/wangeditor-next/commit/c11b2440f91b99d40bca18b675c66a22b6e160c9))
- image menu - width 50% 100% ([f9b4c68](https://github.com/wangeditor-next/wangeditor-next/commit/f9b4c68dff3232b50491b07949c20eb4c18baa6b))
- image menus & position ([bf5beba](https://github.com/wangeditor-next/wangeditor-next/commit/bf5beba7b3014d63f0b9fe0063530c8b101a5011))
- indent menu + groupMenu ([08db901](https://github.com/wangeditor-next/wangeditor-next/commit/08db901cd3a3f2ddb2173cc4b36d471e4e68237e))
- insert link ([b04242f](https://github.com/wangeditor-next/wangeditor-next/commit/b04242ffa252d4088f5360c3de45c24d6f493552))
- justify ([2ed7b88](https://github.com/wangeditor-next/wangeditor-next/commit/2ed7b883ca759dc4a9e0eefbd23cfe603a0f46fd))
- line-height menu ([755a752](https://github.com/wangeditor-next/wangeditor-next/commit/755a752d76803423f2794b85004d75055c9b54ec))
- list menu ([fe6c083](https://github.com/wangeditor-next/wangeditor-next/commit/fe6c0830b2c43e335e5972f85096f490694bbe19))
- menu color - part ([3a6cc86](https://github.com/wangeditor-next/wangeditor-next/commit/3a6cc86a7f9133d0862310c408abafb30c531734))
- menu color & dropPanel & menu config ([5d0d41b](https://github.com/wangeditor-next/wangeditor-next/commit/5d0d41b9a765a7deb583393f129925414c36ef35))
- modal appendTo body ([fc0ab06](https://github.com/wangeditor-next/wangeditor-next/commit/fc0ab06d5c7177eceb04643234a8c301ca4de396))
- parse html ([2a5eace](https://github.com/wangeditor-next/wangeditor-next/commit/2a5eace00f33cded50b68e8164748ec2480213fd))
- parse src (link image video) ([715a841](https://github.com/wangeditor-next/wangeditor-next/commit/715a841fc6c730ee2b448a1799a07ce778128aad))
- selectList ([b7366ab](https://github.com/wangeditor-next/wangeditor-next/commit/b7366ab2dafd379145d85881052d6f400bd13c85))
- setHtml ([f4f91b8](https://github.com/wangeditor-next/wangeditor-next/commit/f4f91b883298091e3679ca6b206ae0d796003772))
- shadow dom example ([c55f38d](https://github.com/wangeditor-next/wangeditor-next/commit/c55f38dab7886b9115c4353118d1f182885878ae))
- table module ([a397116](https://github.com/wangeditor-next/wangeditor-next/commit/a397116de73e088232d9c41828f30f8d56a22dd4))
- table module - header + fullWidth ([9a8a0e0](https://github.com/wangeditor-next/wangeditor-next/commit/9a8a0e093af944ee7deab674f47c2ec7baae0e63))
- text and toolbar ([3ae5d0c](https://github.com/wangeditor-next/wangeditor-next/commit/3ae5d0c4138fec7397ac8629e0012affe6b7dfa4))
- todo ([9608fef](https://github.com/wangeditor-next/wangeditor-next/commit/9608fef2ff86368cdcbb950a74af1246a58709de))
- toHtml 机制 ([1c4d872](https://github.com/wangeditor-next/wangeditor-next/commit/1c4d8729f84aaab6a448f23064b34a20596305e9))
- toolbar config - insertKeys ([a2f3c4b](https://github.com/wangeditor-next/wangeditor-next/commit/a2f3c4be3762831723495bbc9d50eb6c9b05d195))
- toolbar excludeKeys ([09bd196](https://github.com/wangeditor-next/wangeditor-next/commit/09bd196ea24c19b04e5e7e38227ca94332847bf8))
- tooltip ([994d875](https://github.com/wangeditor-next/wangeditor-next/commit/994d875fee81cf01271c2e440c1df202aa067d0e))
- undo redo - menu ([bfb3014](https://github.com/wangeditor-next/wangeditor-next/commit/bfb3014791cfcb2d7897f916bf280a57b1906e4d))
- updateLink + unLink + viewLink ([254d554](https://github.com/wangeditor-next/wangeditor-next/commit/254d55466b3c8527dd9f0bf34681abd801c8c8ce))
- upload image ([0a0564b](https://github.com/wangeditor-next/wangeditor-next/commit/0a0564bf14edd4dea6eb958e653272a9a216cec1))
- upload video ([ac8e6f8](https://github.com/wangeditor-next/wangeditor-next/commit/ac8e6f8b5258e593714676a6f6be359ba525833c))
- video menu ([c1faa1c](https://github.com/wangeditor-next/wangeditor-next/commit/c1faa1cfa896e1d240f5a2a100e1fd9b89dbef0b))

## [5.1.23](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/editor@5.1.22...@wangeditor/editor@5.1.23) (2022-11-14)

**Note:** Version bump only for package @wangeditor/editor

## [5.1.22](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/editor@5.1.21...@wangeditor/editor@5.1.22) (2022-10-18)

**Note:** Version bump only for package @wangeditor/editor

## [5.1.21](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/editor@5.1.20...@wangeditor/editor@5.1.21) (2022-10-04)

**Note:** Version bump only for package @wangeditor/editor

## [5.1.20](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/editor@5.1.19...@wangeditor/editor@5.1.20) (2022-09-27)

**Note:** Version bump only for package @wangeditor/editor

## [5.1.19](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/editor@5.1.18...@wangeditor/editor@5.1.19) (2022-09-27)

**Note:** Version bump only for package @wangeditor/editor

## [5.1.18](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/editor@5.1.17...@wangeditor/editor@5.1.18) (2022-09-16)

**Note:** Version bump only for package @wangeditor/editor

## [5.1.17](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/editor@5.1.16...@wangeditor/editor@5.1.17) (2022-09-15)

### Bug Fixes

- customInsert 不触发 onSuccess ([d6f4a1b](https://github.com/wangeditor-next/wangeditor-next/commit/d6f4a1b1494864b116a1310cce2d9e8632c92c6f))
- focus table 时 isFocused 异常 ([5c52bf3](https://github.com/wangeditor-next/wangeditor-next/commit/5c52bf33e91b1a4677e7bbc04c5d80698abfeeab))
- 上传视频 - customBrowseAndUpload 缺少 poster ([c24627a](https://github.com/wangeditor-next/wangeditor-next/commit/c24627aaa4c173c5d435e3077dfe8f6b4a9a87b1))

## [5.1.16](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/editor@5.1.15...@wangeditor/editor@5.1.16) (2022-09-14)

**Note:** Version bump only for package @wangeditor/editor

## [5.1.15](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/editor@5.1.14...@wangeditor/editor@5.1.15) (2022-08-30)

### Bug Fixes

- checkVideo 增加 poster 参数 ([c0402e1](https://github.com/wangeditor-next/wangeditor-next/commit/c0402e155470233d256e037d863dab74c026b7f6))

## [5.1.14](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/editor@5.1.13...@wangeditor/editor@5.1.14) (2022-07-27)

**Note:** Version bump only for package @wangeditor/editor

## [5.1.13](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/editor@5.1.12...@wangeditor/editor@5.1.13) (2022-07-27)

### Bug Fixes

- setHtml 支持空字符串 ([d438157](https://github.com/wangeditor-next/wangeditor-next/commit/d43815766320d9cb0548bae0415c54ce7b147efb))
- upload file callback error ([bf20e07](https://github.com/wangeditor-next/wangeditor-next/commit/bf20e07f12ed242b0ab4bb2290d876153a822972))

## [5.1.12](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/editor@5.1.11...@wangeditor/editor@5.1.12) (2022-07-22)

**Note:** Version bump only for package @wangeditor/editor

## [5.1.11](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/editor@5.1.10...@wangeditor/editor@5.1.11) (2022-07-18)

**Note:** Version bump only for package @wangeditor/editor

## [5.1.10](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/editor@5.1.9...@wangeditor/editor@5.1.10) (2022-07-16)

**Note:** Version bump only for package @wangeditor/editor

## [5.1.9](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/editor@5.1.8...@wangeditor/editor@5.1.9) (2022-07-14)

**Note:** Version bump only for package @wangeditor/editor

## [5.1.8](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/editor@5.1.7...@wangeditor/editor@5.1.8) (2022-07-14)

**Note:** Version bump only for package @wangeditor/editor

## [5.1.7](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/editor@5.1.6...@wangeditor/editor@5.1.7) (2022-07-13)

**Note:** Version bump only for package @wangeditor/editor

## [5.1.6](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/editor@5.1.5...@wangeditor/editor@5.1.6) (2022-07-12)

**Note:** Version bump only for package @wangeditor/editor

## [5.1.5](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/editor@5.1.3...@wangeditor/editor@5.1.5) (2022-07-11)

### Bug Fixes

- 尝试修复 nuxt 报错 issue[#4409](https://github.com/wangeditor-next/wangeditor-next/issues/4409) ([912f888](https://github.com/wangeditor-next/wangeditor-next/commit/912f8889a11d962b3ac2c65cb5835f4e8c58c372))

## [5.1.4](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/editor@5.1.3...@wangeditor/editor@5.1.4) (2022-07-11)

### Bug Fixes

- 尝试修复 nuxt 报错 issue[#4409](https://github.com/wangeditor-next/wangeditor-next/issues/4409) ([912f888](https://github.com/wangeditor-next/wangeditor-next/commit/912f8889a11d962b3ac2c65cb5835f4e8c58c372))

## [5.1.3](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/editor@5.1.2...@wangeditor/editor@5.1.3) (2022-07-11)

### Bug Fixes

- scroll 滚动问题 ([bc133e1](https://github.com/wangeditor-next/wangeditor-next/commit/bc133e1e4ca89ab5042cbc0971578ad144499805))

## [5.1.2](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/editor@5.1.1...@wangeditor/editor@5.1.2) (2022-07-11)

**Note:** Version bump only for package @wangeditor/editor

## [5.1.1](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/editor@5.1.0...@wangeditor/editor@5.1.1) (2022-06-02)

**Note:** Version bump only for package @wangeditor/editor

# [5.1.0](https://github.com/wangeditor-next/wangeditor-next/compare/@wangeditor/editor@5.0.1...@wangeditor/editor@5.1.0) (2022-05-25)

### Features

- editVideoSize ([375eecb](https://github.com/wangeditor-next/wangeditor-next/commit/375eecba826eac681268c55c47bcd922f7157d63))
- enter menu ([988fc31](https://github.com/wangeditor-next/wangeditor-next/commit/988fc31f31de3d37dffbf54abb784cceb8e6118d))
- setHtml ([f4f91b8](https://github.com/wangeditor-next/wangeditor-next/commit/f4f91b883298091e3679ca6b206ae0d796003772))

## 5.0.1 (2022-04-18)

### Bug Fixes

- 不支持 IE 浏览器的提醒 ([70c5cae](https://github.com/wangeditor-next/wangeditor-next/commit/70c5caefd8f6f663225b7a0b796a035d274ef4e1))
- 打包问题 ([c4e87cc](https://github.com/wangeditor-next/wangeditor-next/commit/c4e87ccac82bcf90d20b7304aff83745e52fb1b1))
- 更新各包之间依赖版本 ([75c552c](https://github.com/wangeditor-next/wangeditor-next/commit/75c552cc8ed54765bebb86a7ec5329a7fc79e85f))
- 兼容 AggregateError ([0cbd82d](https://github.com/wangeditor-next/wangeditor-next/commit/0cbd82d30d350b2313f6373e2b5f6d168e47e1bc))
- 兼容next.js及nuxt.js ([233728e](https://github.com/wangeditor-next/wangeditor-next/commit/233728eb984f541437c62a1390fa0542b2cc6227))
- 开放几个第三方用的 API ([bdf3e70](https://github.com/wangeditor-next/wangeditor-next/commit/bdf3e70c52bac71e2056e21237fe4ac9e2b0818f))
- 拼音隐藏 placeholder ([aec1a9f](https://github.com/wangeditor-next/wangeditor-next/commit/aec1a9f62af8944b7894beeca953076ec73545d5))
- 上传图片 - base64 仍触发上传 + 超出 maxSize 的报错提醒 ([a1d469a](https://github.com/wangeditor-next/wangeditor-next/commit/a1d469accb7f87f8ea0282a1699d002aaaa4e79a))
- 添加QQ浏览器polyfill ([a1b476a](https://github.com/wangeditor-next/wangeditor-next/commit/a1b476a0bed52315f3e398c586d73f85996f9431))
- 图片上传，提示 ([3754012](https://github.com/wangeditor-next/wangeditor-next/commit/37540129dff1212c5ebfd4ca3f4d4e8def735e73))
- 修复 node 环境下报错问题 ([5a635a5](https://github.com/wangeditor-next/wangeditor-next/commit/5a635a5e8fac942ee214dd22b097e09057abc69c))
- 修复取消链接后撤销再重做报错的问题 ([9b233a9](https://github.com/wangeditor-next/wangeditor-next/commit/9b233a92c95571235248623a6ca5212eb4237f2a))
- 移除了每个包下的 publishConfig directory 配置 ([16559f0](https://github.com/wangeditor-next/wangeditor-next/commit/16559f052545c111318be760e64291a521bdcc65))
- 优化选中代码块不应该展示 hoverbar 的交互 ([33dcbd6](https://github.com/wangeditor-next/wangeditor-next/commit/33dcbd6560dccfbe77e18cfbce8c9f077f19f6cd))
- delete divider ([f04cbd6](https://github.com/wangeditor-next/wangeditor-next/commit/f04cbd6009099629e3cd41be19d20b6788fe7f28))
- divider - 键盘删除 ([31db059](https://github.com/wangeditor-next/wangeditor-next/commit/31db0593dbc77fba9b4a719bc0f48f1223afd680))
- example/code-hightlight ([7885988](https://github.com/wangeditor-next/wangeditor-next/commit/78859884cefc18d15ce2f87507380a78c2ad65e5))
- globalThis 兼容性 ([7a47f4b](https://github.com/wangeditor-next/wangeditor-next/commit/7a47f4b904815516d3b5749ab652ff80478411bc))
- group-menu 考虑 excludeKeys ([ecc29f3](https://github.com/wangeditor-next/wangeditor-next/commit/ecc29f3b24992c8dc0adf006d81b0d4a252683c5))
- hoverbar config - 同时选中文字和 table ([8f6b4d1](https://github.com/wangeditor-next/wangeditor-next/commit/8f6b4d1a20e3b1b75da69b20bd5893ce08a27185))
- hoverbarKeys - text ([59b4840](https://github.com/wangeditor-next/wangeditor-next/commit/59b48406b4c373ef029a5f5bdb0d15d925a91a0f))
- html 特殊字符 ([b3eb81b](https://github.com/wangeditor-next/wangeditor-next/commit/b3eb81bc9c4aa15c2ff7451c173de15d6c4552bc))
- i18n - 获取多语言配置 ([9f81597](https://github.com/wangeditor-next/wangeditor-next/commit/9f815970f8c3c6dddb6bf846ecb672325e80444b))
- i18n 切换语言 ([b3b4642](https://github.com/wangeditor-next/wangeditor-next/commit/b3b4642c6e72ab0b13b05657745abb87e71c633d))
- insertKeys ([0a89420](https://github.com/wangeditor-next/wangeditor-next/commit/0a8942050bd0b39afb5bbc55ca7842461a5b98eb))
- link, text hoverbar 选区问题 ([e0b7438](https://github.com/wangeditor-next/wangeditor-next/commit/e0b7438c89a347f1b0b940d9c11150b72d595529))
- menu 点击多次才能生效 ([6497e39](https://github.com/wangeditor-next/wangeditor-next/commit/6497e39225a993c4d87f9ffddf20086446a4fbc2))
- normalize when create editor ([2b51962](https://github.com/wangeditor-next/wangeditor-next/commit/2b5196244a93ad7beb316bfa42e557221967d063))
- parse html - v4 video ([8dca822](https://github.com/wangeditor-next/wangeditor-next/commit/8dca822f9f1b52fd71dd6e17f0954d6aa016324b))
- qq 浏览器报错 ([8a09ed5](https://github.com/wangeditor-next/wangeditor-next/commit/8a09ed5d810fc1e2c4d0c529aa1269ed0c06425e))
- readOnly 时菜单还可操作 ([0d4a29b](https://github.com/wangeditor-next/wangeditor-next/commit/0d4a29bb5ba8b62ac11a09d3f814abcb1fcf46be))
- registerModule ([189981c](https://github.com/wangeditor-next/wangeditor-next/commit/189981c73db07d5b15ee4c46b1639f76f6f63ba1))
- rename es module filename ([1821d4e](https://github.com/wangeditor-next/wangeditor-next/commit/1821d4eef49e64efcb41b848849ca7a5e6472044))
- shadow dom 样式缺失 ([2fcb69c](https://github.com/wangeditor-next/wangeditor-next/commit/2fcb69c866266cc5b0265cff031ae9279d368b84))
- style-to-html - 输入 a 会删除外部的 <a> 标签 ([af1f523](https://github.com/wangeditor-next/wangeditor-next/commit/af1f523983f2bc4b7eaf9726d4b8a35227ab27dc))
- table - elemToHtml ([e36e609](https://github.com/wangeditor-next/wangeditor-next/commit/e36e6092ef721723169afc8bf0560a47ac9f4dfc))
- tableCell 中 br 报错 ([8604db7](https://github.com/wangeditor-next/wangeditor-next/commit/8604db751b622c01fa5391af59328236cf13effc))
- text hoverbar ([c7de4f8](https://github.com/wangeditor-next/wangeditor-next/commit/c7de4f815d6f5b9e009a3149ed042052576c424e))
- text hoverbar ([efe9a34](https://github.com/wangeditor-next/wangeditor-next/commit/efe9a34d85f8baaeced27543a7bcd508b50f6bca))
- video - 键盘删除 ([5a6bedd](https://github.com/wangeditor-next/wangeditor-next/commit/5a6bedd80fa0d758270731f62115637ad7f313d0))

### Features

- 两端对齐 ([e5080d3](https://github.com/wangeditor-next/wangeditor-next/commit/e5080d3dd102f7a951d8e1f370db834778ecbdfa))
- 上标 下标 ([40dab08](https://github.com/wangeditor-next/wangeditor-next/commit/40dab085a061ea3e838f0cfa86260c6c6f894c69))
- 上传图片 metaWithUrl ([2485157](https://github.com/wangeditor-next/wangeditor-next/commit/24851576a1dcc07b1a8931d17a147c3640222e85))
- 增加 enable disable API（删除 setConfig setMenuConfig API） ([984fc50](https://github.com/wangeditor-next/wangeditor-next/commit/984fc50520061fc34ea08f4136bdeb93dee46564))
- 支持 nodejs 环境 ([484f18c](https://github.com/wangeditor-next/wangeditor-next/commit/484f18c3abc70d19e51c556f48491c18d390b1e1))
- basic text style module ([005b343](https://github.com/wangeditor-next/wangeditor-next/commit/005b343573ba98f2d0b8480d034ff6807a499aa3))
- block quote ([c3c87a5](https://github.com/wangeditor-next/wangeditor-next/commit/c3c87a5c09b311eb14c799df94fc4826aa3f4262))
- bold & header ([8130c23](https://github.com/wangeditor-next/wangeditor-next/commit/8130c23ad84485a68cf9ca4b53d52fab1cec4e96))
- clearStyle menu ([8002f70](https://github.com/wangeditor-next/wangeditor-next/commit/8002f707ed04b914180ec36fdca0edf48c815e01))
- code highlight ([42b2f8d](https://github.com/wangeditor-next/wangeditor-next/commit/42b2f8d192e2433593c11ad0b8424737f6cffb58))
- code-block - part ([a8bcd63](https://github.com/wangeditor-next/wangeditor-next/commit/a8bcd63d882832ac05a32878df0f767d145e0fa7))
- create editor ([12d98e4](https://github.com/wangeditor-next/wangeditor-next/commit/12d98e4bee179e9d277ec3ec2ecb827962ed0e75))
- create mode ([63c2eef](https://github.com/wangeditor-next/wangeditor-next/commit/63c2eef9a9a0a2838dfadd23483de35a76f88b0b))
- customPaste ([0f25f5c](https://github.com/wangeditor-next/wangeditor-next/commit/0f25f5cae3a2cd5ae5832f3fc1026b3ab6d047e0))
- divider menu ([5262634](https://github.com/wangeditor-next/wangeditor-next/commit/526263445616725541bf374b80260e73b1d4c6ec))
- drag resize image ([cd72028](https://github.com/wangeditor-next/wangeditor-next/commit/cd72028f1786e2e53079ad5cbef1b8569731ca79))
- editor 生命周期，自定义事件 ([00e9bc2](https://github.com/wangeditor-next/wangeditor-next/commit/00e9bc2cfcb8b622764db1c76394491d72ffd93e))
- editor with-selection plugin ([9f0a39f](https://github.com/wangeditor-next/wangeditor-next/commit/9f0a39fecf6d92888d2a97929820d3be038efb31))
- editor.isSelectedAll ([960c845](https://github.com/wangeditor-next/wangeditor-next/commit/960c8455f85a6bc7350f9944be80b3997bc1fea1))
- editor.showProgressBar ([51761d4](https://github.com/wangeditor-next/wangeditor-next/commit/51761d466ab3ef7c99e872954d4724ab51d8e28c))
- emotion ([736f955](https://github.com/wangeditor-next/wangeditor-next/commit/736f955211287bafca2375de3c8193cd0aa0856f))
- font-size + font-family ([cc649e0](https://github.com/wangeditor-next/wangeditor-next/commit/cc649e0918ce58e78b4d5ee49a400197b9d04b70))
- fullScreen ([e7ccd88](https://github.com/wangeditor-next/wangeditor-next/commit/e7ccd88a7dd58f64b7bd484de428e3a76cc994f7))
- getElemsByTypePrefix （删掉 getHeaders） ([c18834b](https://github.com/wangeditor-next/wangeditor-next/commit/c18834b3ebfd97fb36ccbe0faa84e6fe8c30eb67))
- header button menu ([6413135](https://github.com/wangeditor-next/wangeditor-next/commit/64131354d54705e11fd6992fcf5a4389371c3560))
- hover bar ([107356e](https://github.com/wangeditor-next/wangeditor-next/commit/107356eff7bfaf53ce25e39244f8133c80518375))
- i18n ([c11b244](https://github.com/wangeditor-next/wangeditor-next/commit/c11b2440f91b99d40bca18b675c66a22b6e160c9))
- image menu - width 50% 100% ([f9b4c68](https://github.com/wangeditor-next/wangeditor-next/commit/f9b4c68dff3232b50491b07949c20eb4c18baa6b))
- image menus & position ([bf5beba](https://github.com/wangeditor-next/wangeditor-next/commit/bf5beba7b3014d63f0b9fe0063530c8b101a5011))
- indent menu + groupMenu ([08db901](https://github.com/wangeditor-next/wangeditor-next/commit/08db901cd3a3f2ddb2173cc4b36d471e4e68237e))
- insert link ([b04242f](https://github.com/wangeditor-next/wangeditor-next/commit/b04242ffa252d4088f5360c3de45c24d6f493552))
- justify ([2ed7b88](https://github.com/wangeditor-next/wangeditor-next/commit/2ed7b883ca759dc4a9e0eefbd23cfe603a0f46fd))
- line-height menu ([755a752](https://github.com/wangeditor-next/wangeditor-next/commit/755a752d76803423f2794b85004d75055c9b54ec))
- list menu ([fe6c083](https://github.com/wangeditor-next/wangeditor-next/commit/fe6c0830b2c43e335e5972f85096f490694bbe19))
- menu color - part ([3a6cc86](https://github.com/wangeditor-next/wangeditor-next/commit/3a6cc86a7f9133d0862310c408abafb30c531734))
- menu color & dropPanel & menu config ([5d0d41b](https://github.com/wangeditor-next/wangeditor-next/commit/5d0d41b9a765a7deb583393f129925414c36ef35))
- modal appendTo body ([fc0ab06](https://github.com/wangeditor-next/wangeditor-next/commit/fc0ab06d5c7177eceb04643234a8c301ca4de396))
- parse html ([2a5eace](https://github.com/wangeditor-next/wangeditor-next/commit/2a5eace00f33cded50b68e8164748ec2480213fd))
- parse src (link image video) ([715a841](https://github.com/wangeditor-next/wangeditor-next/commit/715a841fc6c730ee2b448a1799a07ce778128aad))
- selectList ([b7366ab](https://github.com/wangeditor-next/wangeditor-next/commit/b7366ab2dafd379145d85881052d6f400bd13c85))
- shadow dom example ([c55f38d](https://github.com/wangeditor-next/wangeditor-next/commit/c55f38dab7886b9115c4353118d1f182885878ae))
- table module ([a397116](https://github.com/wangeditor-next/wangeditor-next/commit/a397116de73e088232d9c41828f30f8d56a22dd4))
- table module - header + fullWidth ([9a8a0e0](https://github.com/wangeditor-next/wangeditor-next/commit/9a8a0e093af944ee7deab674f47c2ec7baae0e63))
- text and toolbar ([3ae5d0c](https://github.com/wangeditor-next/wangeditor-next/commit/3ae5d0c4138fec7397ac8629e0012affe6b7dfa4))
- todo ([9608fef](https://github.com/wangeditor-next/wangeditor-next/commit/9608fef2ff86368cdcbb950a74af1246a58709de))
- toHtml 机制 ([1c4d872](https://github.com/wangeditor-next/wangeditor-next/commit/1c4d8729f84aaab6a448f23064b34a20596305e9))
- toolbar config - insertKeys ([a2f3c4b](https://github.com/wangeditor-next/wangeditor-next/commit/a2f3c4be3762831723495bbc9d50eb6c9b05d195))
- toolbar excludeKeys ([09bd196](https://github.com/wangeditor-next/wangeditor-next/commit/09bd196ea24c19b04e5e7e38227ca94332847bf8))
- tooltip ([994d875](https://github.com/wangeditor-next/wangeditor-next/commit/994d875fee81cf01271c2e440c1df202aa067d0e))
- undo redo - menu ([bfb3014](https://github.com/wangeditor-next/wangeditor-next/commit/bfb3014791cfcb2d7897f916bf280a57b1906e4d))
- updateLink + unLink + viewLink ([254d554](https://github.com/wangeditor-next/wangeditor-next/commit/254d55466b3c8527dd9f0bf34681abd801c8c8ce))
- upload image ([0a0564b](https://github.com/wangeditor-next/wangeditor-next/commit/0a0564bf14edd4dea6eb958e653272a9a216cec1))
- upload video ([ac8e6f8](https://github.com/wangeditor-next/wangeditor-next/commit/ac8e6f8b5258e593714676a6f6be359ba525833c))
- video menu ([c1faa1c](https://github.com/wangeditor-next/wangeditor-next/commit/c1faa1cfa896e1d240f5a2a100e1fd9b89dbef0b))
