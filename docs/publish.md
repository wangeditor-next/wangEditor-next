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

这里的统一版本号是已验证的 wangEditor 产品组合和兼容性标识，不是每个 npm 包的独立功能
清单。用户可以将任意官方包升级到同一产品版本，无需再维护包之间的版本矩阵。单个包仅有
同步版本变更时，其 CHANGELOG 中的 `Updated dependencies` 条目表示产品同步，不表示该包
新增了同等级别的功能。

`@wangeditor-next/editor` 会在每次产品 release 中发布，因此会创建对应的 GitHub Release
`v<version>`；Release 中列出本次所有包的源码与 tarball 链接。

## 版本关联策略

所有 `packages/*` 下、名称为 `@wangeditor-next/*` 的公开运行时包属于同一个 Changesets
`fixed` 组。这包含 `core`、`editor`、Vue 2/Vue 3/React 适配器、内置模块、可选插件和
Yjs 包。一个用户可见的变更只需要在直接受影响的包写 changeset；Changesets 会把整个组
提升到同一个产品版本，并在一次 release PR 中发布。

产品版本由本次 release 中直接变更的最高 SemVer 级别决定：直接变更中的 `minor` 会使整套
官方包进入下一个产品 minor，直接变更均为 `patch` 时才进入下一个产品 patch。这是固定组
的预期行为，不要通过手改 package.json、移除单个包或拆分 fixed 组来压低一次 release 的
版本号。需要延后某项功能时，应在合并 release PR 前保留其 changeset，等待下一次产品发布。

发布说明以直接变更为准：产品级 GitHub Release 和 PR 描述只列出用户可见的 changeset
内容；包级 CHANGELOG 保留 Changesets 自动生成的同步记录，方便追溯来源但不作为功能目录。

当前 `6.1.0` 已经发布，不能变更其 npm 包或 immutable source tag。它仅包含包同步，迁入后的
首次共同发布使用 `6.1.1`：`editor`、`core` 和全部官方包都会是 `6.1.1`。之后每次发布都遵守相同规则。

`pnpm check:release-group` 会校验新增公开包不会漏出该组。新增公开运行时包时必须同时：

1. 放入 `.changeset/config.json` 的固定组。
2. 添加 workspace 依赖、构建和框架集成测试。
3. 确认其 package source tag 能由本仓库 release workflow 创建。

修改版本关联策略属于仓库级发布架构变更，必须单独提出并验证发布矩阵、peer dependency
兼容范围、源码 tag、GitHub Release 与 Repair Release Provenance；不能作为单个功能或插件
PR 的附带修改。

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
