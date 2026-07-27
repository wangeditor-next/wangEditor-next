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

1. 从 `master` 分支启动该工作流。
2. `release_sha`：自动发布产生的 `chore(release)` 提交的小写 40 位 SHA。
3. `release_run_id`：该提交原始 `Release` workflow 的数字 run ID（Actions URL 中的数字）。

稳定版只能来自受保护的 `master`，alpha 版只能来自受保护的 `develop`。恢复会校验
run ID、workflow 路径、源码 SHA、分支和 npm 已发布版本，不能用普通版本提交伪造。

该工作流会从该提交相对第一父提交的包版本变化自动推导发布列表，再验证 npm 中
的已发布版本、只创建缺失的源码 tag，并幂等更新产品 Release 与 sourcemap。
它不会发布或重新发布 npm 包；已有 tag 若指向其他提交会直接失败。文档只会在该
editor 版本仍为 npm `latest` 时触发，避免修复历史 Release 时回退站点。

## 发布一个测试版本

1. 从 `master` 创建并保护 `develop` 分支，使用与 `master` 相同的审批和必需检查。
2. 将包含 changeset 的预发布改动合入 `develop`。
3. `Release` workflow 自动进入 alpha 模式并完成发布、source tag 和 Release 归档。

不要直接执行 `pnpm changeset publish`，否则会绕过 npm 校验、不可变 source tag 和失败补偿。
