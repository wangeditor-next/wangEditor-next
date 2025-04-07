# wangEditor-next 贡献指南

## 欢迎贡献

首先，感谢您对`wangEditor-next`项目的兴趣，以及您愿意投入时间来贡献代码、文档、功能请求或任何其他形式的帮助。这份贡献指南将帮助您了解如何参与项目。

### 1. 行为准则

我们致力于维护一个开放、友好的环境。请确保您的互动符合我们的[行为准则](https://www.contributor-covenant.org/version/2/0/code_of_conduct/)。

### 2. 报告问题

如果您发现bug或有新功能的想法，请在[问题跟踪器](https://github.com/wangeditor-next/wangEditor-next/issues)中创建一个新的问题。在提交之前，请检查是否已经存在类似的问题。

### 3. 提交 Pull Request

我们非常欢迎Pull Request！

- **克隆仓库**：Fork并克隆项目到本地。
- **创建分支**：基于主分支`master`创建一个新的分支。
- **编写代码**：确保您的代码遵循项目中的编码规范(清晰的注释、空行、lint 校验)。
- **提交之前**：
  - 确保在提交更改之前运行测试和 linter。
  - 如果您要对其中一个包进行更改，请确保**始终**在您的 PR 中包含一个 [changeset](https://github.com/changesets/changesets)，描述**更改的内容**以及更改的**说明**。这些负责创建变更日志
- **提交更改**：提交您的更改，并确保提交信息清晰明了。

   commit 格式

   type [feat, fix, refactor, docs, test, perf, chore, ci, style, build, revert]

   commit 模版如下

   ```
   type(xx module): 简要标题
   (此处为空行)
   详细描述
   (此处为空行)
   相关 issue 链接
   ```
   样例
   ```
   fix(img link): image incorrectly converted to link

   dragging img elements from the page into the editor converts them to links

   https://github.com/wangeditor-team/wangeditor/issues/52
   ```
- **Pull Request**：将您的分支推送到远程仓库，并在GitHub上发起Pull Request。

### 4. 代码审查

您的Pull Request可能会经过代码审查过程。请不要担心，这是为了确保代码质量和项目的整体一致性。

### 5. 文档

如果您添加了新的功能或对现有功能进行了更改，请相应地更新文档。

### 6. 测试

请确保您的代码添加了相应的单元测试，并且所有测试都是通过的。

### 7. 许可

通过提交代码，您同意在`MIT`许可证下发布您的贡献。

## 贡献类型

### Bug修复

修复已知的问题或提交新的bug修复。

### 新功能

提出新功能的想法或实现它们。

### 文档

改进项目文档，包括README、Wiki或任何其他文档。

### 代码优化

优化现有代码，提高性能或可读性。

### 社区建设

帮助回答问题，参与讨论，或在社交媒体上推广项目。

## 感谢

我们非常感激您的贡献，无论是大是小。您的努力帮助我们构建了一个更好的`wangEditor-next`。
