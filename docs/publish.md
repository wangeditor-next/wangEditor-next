# 发布到 NPM

## 发布凭证（合并前配置）

Release 与 `Repair Release Provenance` 都只能使用 GitHub Environment
`release-automation` 中的凭证。该 Environment 必须限制为受保护的分支，并要求另一名
维护者批准部署。不要把以下凭证保留为仓库级 secret：

1. `NPM_RELEASE_TOKEN`：将现有 npm 发布 token 的值迁入该 Environment。
2. `RELEASE_AUTOMATION_TOKEN`：机器人账号的 fine-grained PAT（或 GitHub App token），至少
   授予本仓库 Contents 和 Pull requests 的读写权限。
3. `DOCS_RELEASE_DISPATCH_TOKEN`：可选；用于触发 `wangeditor-next/docs` 的发布。

在合并本流程后、批准首个 `release-automation` job 前，删除仓库级的 `NPM_TOKEN` 和
`DOCS_REPO_DISPATCH_TOKEN`。缺少前两个 secret 时工作流会停止，绝不会回退使用仓库级
`NPM_TOKEN`。

## 发布一个正式版本

1. 添加 `changeset`：`npx changeset`
2. 提交代码合并 master，线上会自动发版到 `npm`。

发布完成后，每个包都有一个不可变的源码 tag：
`@wangeditor-next/<package>@<version>`。所有官方 framework adapter、core、editor、
模块、插件和协同包都从同一个 monorepo、同一个 Changesets release PR 与同一个 workflow
发布，并使用相同的产品版本号；`apps/*`、文档和内部构建工具不发布到 npm。

`@wangeditor-next/editor` 会在每次产品 release 中发布，因此会创建对应的 GitHub Release
`v<version>`；Release 中列出本次所有包的源码与 tarball 链接。

## 版本关联策略

所有 `packages/*` 下、名称为 `@wangeditor-next/*` 的公开运行时包都属于 Changesets 的
`fixed` 组。`core`、`editor`、Vue 2/Vue 3/React 适配器、内置模块和 Yjs 包属于主同步组；
`plugin-link-card` 单独成组，使它的功能变更不会抬高其他包的版本。一个用户可见的变更只
需要在直接受影响的包写 changeset；Changesets 会在一次 release PR 中按组提升版本并发布。

当前 `6.1.0` 已经发布，不能变更其 npm 包或 immutable source tag。它仅包含包同步，迁入后的
首次共同发布使用 `6.1.1`：`editor`、`core` 和主同步组中的官方包都会是 `6.1.1`。之后每次发布都遵守按组同步的规则。

`pnpm check:release-group` 会校验新增公开包不会漏出该组。新增公开运行时包时必须同时：

1. 放入 `.changeset/config.json` 的合适固定组；若不应与主产品同步升级，则单独成组。
2. 添加 workspace 依赖、构建和框架集成测试。
3. 确认其 package source tag 能由本仓库 release workflow 创建。

历史版本不重写：`@wangeditor-next/editor-for-vue@5.1.14` 和
`@wangeditor-next/editor-for-vue2@1.0.2` 继续由原独立仓库的历史 tag 说明来源。迁入后的
新版本，其 npm metadata、source tag 和 GitHub Release 链接均指向本仓库。

## 发布失败后的补偿

如果 npm 已发布，但 source tag、GitHub Release、sourcemap 或文档触发步骤失败，
不要重新执行 npm publish。到 Actions 运行 `Repair Release Provenance`，填写：

1. 从 `master` 分支启动该工作流。
2. `release_sha`：自动发布产生的 `chore(release)` 提交的小写 40 位 SHA。
3. `release_run_id`：该提交原始 `Release` workflow 的数字 run ID（Actions URL 中的数字）。

恢复只接受受保护 `master` 的新流程发布。它会校验 run ID、workflow 路径、源码 SHA、
分支和 npm 已发布版本，不能用普通版本提交伪造。

该工作流会从该提交相对第一父提交的包版本变化自动推导发布列表，再验证 npm 中
的已发布版本、只创建缺失的源码 tag，并幂等更新产品 Release 与 sourcemap。
它不会发布或重新发布 npm 包；已有 tag 若指向其他提交会直接失败。文档只会在该
editor 版本仍为 npm `latest` 时触发，避免修复历史 Release 时回退站点。

这个工作流只处理本流程启用后产生的发布。历史版本若没有可查询的 Actions run，不要
放宽输入校验；应在单独 PR 中提交包含 npm、源码提交和 Release 链接证据的补档清单，
由两名维护者核对后手工创建不可变 source tag 与 Release。见
[`release-provenance-backfill.md`](./release-provenance-backfill.md)。

## 发布一个测试版本

当前自动流程只发布 `master` 稳定版。启用 alpha 前，必须先从已合并的 `master` 创建
精确的 `develop` 分支，并应用与 `master` 相同的审批和必需检查；随后通过一个单独审查
的 PR 将 `develop` 加入 Release 与 Repair 的允许分支。不要将未受保护的临时分支作为
发布源。

不要直接执行 `pnpm changeset publish`，否则会绕过 npm 校验、不可变 source tag 和失败补偿。
