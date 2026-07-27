# 发布到 NPM

## 发布一个正式版本

1. 添加 `changeset`：`npx changeset`
2. 提交代码合并 master，线上会自动发版到 `npm`。

发布完成后，每个包都有一个不可变的源码 tag：
`@wangeditor-next/<package>@<version>`。仅当
`@wangeditor-next/editor` 发布时，才会创建对应的产品级 GitHub Release
`v<version>`；Release 中会列出所有本次发布包的源码与 tarball 链接。

## 发布失败后的补偿

如果 npm 已发布，但 source tag、GitHub Release、sourcemap 或文档触发步骤失败，
不要重新执行 npm publish。到 Actions 运行 `Repair Release Provenance`，填写：

1. `release_sha`：声明该版本的小写 40 位提交 SHA。稳定版必须可达 `master`；
   alpha 版必须可达 `dev`、`develop`、`dev-*` 或 `dev/**` 发布分支。

该工作流会从该提交相对第一父提交的包版本变化自动推导发布列表，再验证 npm 中
的已发布版本、只创建缺失的源码 tag，并幂等更新产品 Release 与 sourcemap。
它不会发布或重新发布 npm 包；已有 tag 若指向其他提交会直接失败。文档只会在该
editor 版本仍为 npm `latest` 时触发，避免修复历史 Release 时回退站点。

## 发布一个测试版本

1. 进入预发布模式：`npx changeset pre enter beta`
2. 添加 `changeset`：`npx changeset`
3. 更新版本号：`npx changeset version`
4. 发布测试包：`npx changeset publish`
5. 退出预发布模式（可选）：`npx changeset pre exit`
