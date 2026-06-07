# jkit

> 语言：中文 | [English](README.en.md)

jkit 是一个 agent-map 驱动的开发工具包，基于仓库级 agent map 和可组合命令，为 coding agent 构建可复用、可验证、可恢复的 harness。

构建思路受到 OpenAI 的 [Harness Engineering](https://openai.com/zh-Hans-CN/index/harness-engineering/) 启发：把仓库作为 coding agent 可读取、可执行、可验证的记录系统，而不是依赖一次性聊天上下文。

## Get Started

### 安装

#### Claude Code

##### Install with Claude Code

复制到 Claude Code：

```text
帮我安装 jkit Claude Code plugin。

请执行或引导我执行：

/plugin marketplace add superjack2050/jkit
/plugin install jkit@jkit
/reload-plugins

安装完成后，请验证 jkit commands 是否可用。
```

如果 Claude Code 要求确认插件来源，选择 `superjack2050/jkit` 和 `jkit@jkit`。

##### Manual install

在终端执行：

```bash
npm install -g @nobodyjack/jkit
jkit claude-code install
jkit claude-code status
```

#### Codex

##### Install with Codex

复制到 Codex：

```text
帮我安装 jkit Codex plugin。

请在终端执行：

npm install -g @nobodyjack/jkit
jkit codex install
jkit codex status

安装完成后，请验证 jkit plugin 是否可用。
```

##### Manual install

在终端执行：

```bash
npm install -g @nobodyjack/jkit
jkit codex install
jkit codex status
```

### 初始化 agent map

在仓库中运行 `/map-init`，初始化或更新仓库级 agent map。

agent map 会为 coding agent 提供项目入口、工作流规则、记录、计划、
generated indexes 和验证命令，让 agent 能基于仓库状态工作，而不是只依赖聊天历史。

## Workflow

当前已发布的工作流是：

```text
/map-init -> /explore -> /grill-me -> /to-spec -> /clarify -> /to-plan -> /run
                                               \-> /to-done ->/
```

### 需求探索与方案成形

当需求还比较粗时使用 `/explore`。它用于探讨需求、比较方案方向、识别风险，
并生成推荐方向和可交给 `/to-spec` 的输入。

当方向已经选定但关键决策还没问透时使用 `/grill-me`。它逐问追问范围、
边界、验收和验证信号，并生成可交给 `/to-spec` 的输入。

### Spec 编写与澄清

使用 `/to-spec` 把明确输入、当前会话上下文或 repo/project base 转成
`docs/specs/` 下的一份可 review spec。

当已有 spec 存在会阻塞 `/to-plan` 的需求或验收问题时使用 `/clarify`。
它优先用项目证据解决问题，并把澄清结果写回 spec。

### 计划拆解

使用 `/to-plan` 把一份可规划的 spec 转成 active ExecPlan，包含 checklist、
verification loop、decisions、progress log 和 rollback notes。

### 执行与验证

使用 `/run` 执行 active plan 中已准备好的工作，review diff，修复范围内问题，
运行验证，更新记录，并持续推进直到目标完成或记录明确 blocker。

### 清晰小任务的快速路径

只有当需求已经清晰且范围有限时使用 `/to-done`。它会创建必要的最小 durable artifacts，
再进入同一套可验证执行闭环。

## Commands

| Command | 说明 |
|---|---|
| `/map-init` | 初始化仓库级 agent map，补齐 agent 可读的项目入口、工作流、记录和验证规则 |
| `/explore` | 探讨粗需求、比较方案方向，并生成可交给 `/to-spec` 的输入；启发自 [`obra/superpowers`](https://github.com/obra/superpowers) 的 `brainstorming` |
| `/grill-me` | 逐问追问已选需求和方案方向，澄清关键决策，并生成可交给 `/to-spec` 的输入；启发自 [`mattpocock/skills`](https://github.com/mattpocock/skills) 的 `/grill-me` |
| `/clarify` | 澄清一个已有 spec 中阻塞 `/to-plan` 的需求或验收问题，并把结果写回 spec；启发自 [`github/spec-kit`](https://github.com/github/spec-kit) 的 `/speckit.clarify` |
| `/to-spec` | 从明确输入、当前会话上下文或 repo/project base 创建或更新可 review 的 spec |
| `/to-plan` | 把可 review 的 spec 转成带 Checklist 和 Verification Loop 的 active ExecPlan |
| `/to-done` | 对清晰、有限的需求走快速闭环：最小 spec、最小 plan、`/run`、真实验证完成 |
| `/run` | 执行 active ExecPlan 的 Goal-Driven Execution loop，review、修复、验证并更新 maps |

## Agent Maps

agent map 是 coding agent 的仓库级操作上下文。它把一个仓库变成 agent
可以导航、验证和恢复工作的 workspace。

一份好的 agent map 应该回答六个问题：

- agent 应该从哪里开始？
- agent 应该遵循什么工作流？
- 需求、spec、plan 和记录放在哪里？
- 有哪些可用命令和检查？
- 哪些事实已知、哪些只是 assumed、哪些仍然 unresolved？
- 后续 agent 应该如何继续或修复工作？

在 jkit 中，agent map 由多层协同组成：

- 入口层：`AGENTS.md`、`agent-map.yaml`
  给 agent 一个短入口、项目形状、路由规则和机器可读配置。
- Workflow 层：`docs/WORKFLOW.md`、`docs/PLANS.md`
  定义从需求到 spec、plan、run、records 的默认工作流，以及 ExecPlan 的形状和使用规则。
- 工作原则层：`docs/AGENT_WORKING_PRINCIPLES.md`
  记录 agent 在仓库中协作时应遵循的行为原则、边界和偏好。
- 技术架构层：`ARCHITECTURE.md`、`docs/ENGINEERING.md`、`docs/RELIABILITY.md`、`docs/SECURITY.md`
  让 agent 理解系统架构、工程规则、可靠性要求和安全边界。
- 需求与计划层：`docs/specs/`、`docs/exec-plans/`
  存放可 review 的行为 spec、active plans、completed plans 和技术债记录。
- 持久记录层：`docs/records/`
  记录 open questions、workflow exceptions、verification failures 和其他不能丢失的上下文。
- 导航索引层：`docs/generated/`
  通过生成索引帮助 agent 快速理解仓库结构，避免把大段上下文塞进单个文件。
- 验证层：`scripts/agent-map-check`、`scripts/agent-map-generate` 和项目检查命令
  提供可运行的检查和生成命令，让 agent map 可以被验证和刷新。
- 命令层：`skills/`、`commands/`
  把 `/explore`、`/grill-me`、`/clarify`、`/to-spec`、`/to-plan`、`/to-done`、`/run` 等流程变成可组合命令。

目标是让仓库本身成为 coding agent 工作的记录系统：需求、决策、计划、进度、
验证和恢复都保存在版本化的项目文件中。

## License

MIT，见 `LICENSE`。
