---
description: '智能功能开发 - 按配置路由完成规划、讨论与实施'
---

# Feat - 智能功能开发

$ARGUMENTS

---

## 定位

这是一个保留中的次级工作流，用于快速完成“需求澄清 -> 方案规划 -> 实施落地 -> 审查收尾”。

- 默认仍由当前会话负责编排
- 前端相关工作交给 `{{FRONTEND_PRIMARY}}`
- 后端相关工作交给 `{{BACKEND_PRIMARY}}`
- 只有当任务本身同时包含前后端时，才并行调度两个已配置模型

`Gemini` 只会在它被配置为前端模型时参与，本命令不得把它当作默认前提。

---

## 多模型调用规范

**工作目录**

- `{{WORKDIR}}`：必须通过 Bash 执行 `pwd`（Unix）或 `cd`（Windows CMD）获取当前工作目录的绝对路径，禁止从 `$HOME` 或环境变量推断
- 如果用户通过 `/add-dir` 添加了多个工作区，先用 `Glob` / `Grep` 确定任务相关的工作区
- 如果无法确定，用 `AskUserQuestion` 询问用户选择目标工作区

**调用语法**

```bash
# 调用后端执行模型
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{BACKEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'
ROLE_FILE: ~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/architect.md
<TASK>
需求：<增强后的需求（如未增强则用 $ARGUMENTS）>
上下文：<前序阶段收集的项目上下文、计划文件内容等>
</TASK>
OUTPUT: 期望输出格式
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "后端/通用规划或实施"
})

# 调用前端执行模型
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{FRONTEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'
ROLE_FILE: ~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/architect.md
<TASK>
需求：<增强后的需求（如未增强则用 $ARGUMENTS）>
上下文：<前序阶段收集的项目上下文、计划文件内容等>
</TASK>
OUTPUT: 期望输出格式
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "前端规划或实施"
})

# 复用会话
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend <MODEL> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"{{WORKDIR}}\" <<'EOF'
ROLE_FILE: <ROLE_FILE>
<TASK>
需求：<增强后的需求（如未增强则用 $ARGUMENTS）>
上下文：<前序阶段收集的项目上下文、计划文件内容等>
</TASK>
OUTPUT: 期望输出格式
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "复用指定模型会话"
})
```

**角色提示词**

| 阶段 | `{{BACKEND_PRIMARY}}` | `{{FRONTEND_PRIMARY}}` |
|------|-----------------------|------------------------|
| 分析 | `~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/analyzer.md` | `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/analyzer.md` |
| 规划 | `~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/architect.md` | `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/architect.md` |
| 实施 | `~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/architect.md` | `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/architect.md` |
| 审查 | `~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/reviewer.md` | `~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/reviewer.md` |

**并行等待规则**

- 后台任务统一使用 `TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })`
- 若 10 分钟后仍未完成，继续轮询，禁止直接杀进程
- 若等待时间过长需要放弃等待，必须先用 `AskUserQuestion` 询问用户是继续等待还是终止任务
- 任一已启动模型都必须先拿到结果，或得到用户明确授权后才能放弃

---

## 沟通守则

1. 每次进入命令后，先声明你判断的操作类型：`需求规划`、`讨论迭代`、`执行实施`
2. 需要用户确认、选择或批准时，优先使用 `AskUserQuestion`
3. 明确告知用户当前调用了哪个模型、为什么调用、下一步准备做什么

---

## 核心工作流程

### 1. 输入分类

| 类型 | 常见关键词 | 动作 |
|------|------------|------|
| 需求规划 | 实现、开发、新增、添加、构建、设计 | 进入步骤 2 |
| 讨论迭代 | 调整、修改、优化、改进、包含计划文件路径 | 读取现有计划后进入步骤 2 |
| 执行实施 | 开始实施、执行计划、按照计划、根据计划 | 进入步骤 3 |

### 2. 需求规划流程

#### 2.0 Prompt 增强

按 `/ccg:enhance` 的逻辑增强 `$ARGUMENTS`，补全目标、约束、范围边界和验收标准。
后续所有模型调用都使用增强后的需求。

#### 2.1 上下文检索

调用 `{{MCP_SEARCH_TOOL}}` 检索相关代码、组件、技术栈和约束。

#### 2.2 任务归类

| 任务类型 | 判断依据 | 推荐模型路由 |
|----------|----------|--------------|
| 前端 | 页面、组件、UI、样式、布局、交互 | `{{FRONTEND_PRIMARY}}` |
| 后端 | API、接口、数据库、逻辑、算法 | `{{BACKEND_PRIMARY}}` |
| 全栈 | 同时包含前后端改动 | `{{BACKEND_PRIMARY}}` + `{{FRONTEND_PRIMARY}}` 并行 |

#### 2.3 规划与保存

- 前端或全栈任务，可先调用 `ui-ux-designer` agent 产出 UI/UX 方案
- 所有任务都调用 `planner` agent 形成可执行计划
- 计划保存到 `.claude/plan/<功能名>.md`
- 若是迭代版本，使用 `.claude/plan/<功能名>-N.md`

#### 2.4 交互确认

规划完成后询问用户：

- 开始实施
- 继续讨论并修改计划
- 重新规划
- 仅保存计划并退出

### 3. 执行实施流程

#### 3.1 读取计划

优先使用用户指定路径，否则读取最新的计划文件。

#### 3.2 按任务类型路由

- 前端任务：调用 `{{FRONTEND_PRIMARY}}`
- 后端任务：调用 `{{BACKEND_PRIMARY}}`
- 全栈任务：并行调用 `{{BACKEND_PRIMARY}}` 与 `{{FRONTEND_PRIMARY}}`

#### 3.3 等待结果并整合

- 必须等待所有已启动模型返回完整结果后，才能进入下一阶段
- 当前端与后端意见冲突时，以任务边界为准：
  前端体验、组件结构、视觉交互优先参考 `{{FRONTEND_PRIMARY}}`
  后端架构、接口契约、数据流与稳定性优先参考 `{{BACKEND_PRIMARY}}`
- 如果冲突跨越边界，由当前会话整合并向用户说明取舍

#### 3.4 实施后验证

```bash
git status --short
git diff --name-status
```

询问用户是否继续执行 `/ccg:review` 做代码审查。

---

## 执行原则

1. 规划文档与实际执行要保持同步
2. 不得把任一可选模型写成默认必需依赖
3. 对前后端边界不清的任务，必须先澄清再实施
4. 所有并行调用都要透明告知用户当前等待状态
5. 如果配置中未使用 Gemini，本命令仍必须完整可用

---

## 使用方法

```bash
/feat <功能描述>
```
