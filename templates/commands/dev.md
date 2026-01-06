---
description: 完整6阶段多模型协作工作流（Prompt增强 → 上下文检索 → 多模型分析 → 原型生成 → 代码实施 → 审计交付）
---

> 调用语法见 `_config.md`

## 用法
`/dev <功能描述>`

## 上下文
- 要实现的功能: $ARGUMENTS
- 此命令触发完整的 6 阶段多模型协作工作流

## 你的角色
你是**编排者**，协调三模型协作系统。你指挥:
1. **MCP 工具** – 代码库检索和 Prompt 增强（已配置为 `{{MCP_SEARCH_TOOL}}` 和 `{{MCP_ENHANCE_TOOL}}`）
2. **Codex** – 后端逻辑、算法、调试专家
3. **Gemini** – 前端 UI/UX、视觉设计专家
4. **Claude (子进程)** – 全栈整合、契约设计、跨层问题
5. **Claude (自己)** – 编排、重构、最终交付

## 流程

### 阶段 0: Prompt 增强
1. **Prompt 增强**（调用 `{{MCP_ENHANCE_TOOL}}`）:
   - 参数：`{{MCP_ENHANCE_PARAM}}`（用户的原始需求），`conversation_history`（最近 5-10 轮对话，可选），`project_root_path`（当前项目根目录，可选）
   - 如果工具不可用，直接使用原始 prompt

2. 向用户展示原始和增强后的 prompt:

```
📝 原始需求:
<原始需求>

✨ 增强后需求:
<增强后需求>

🔧 模型配置:
- 前端模型: {{FRONTEND_MODELS}}
- 后端模型: {{BACKEND_MODELS}}
- 协作模式: {{ROUTING_MODE}}

---
**使用增强后的需求继续？(Y/N)**
```

3. **强制停止**: 等待用户确认
   - 如果 Y: 后续阶段使用增强后的 prompt
   - 如果 N: 使用原始 prompt 或要求修改

### 阶段 1: 上下文检索
1. **代码库检索**（调用 `{{MCP_SEARCH_TOOL}}`）:
   - 参数：`{{MCP_SEARCH_PARAM}}`（增强后的需求描述）
   - 对于 ace-tool：还需要 `project_root_path`（项目根目录绝对路径）
2. 识别所有相关文件、类、函数和依赖
3. 如需求仍不清晰，提出澄清问题

### 阶段 2: 多模型分析

**并行调用以下模型进行分析**（使用 `run_in_background: true` 非阻塞执行）：
- 前端分析: {{FRONTEND_PRIMARY}}
- 后端分析: {{BACKEND_PRIMARY}}

**调用方式**: 使用 `Bash` 工具调用 `codeagent-wrapper`

**并行调用所有配置的模型进行分析**（使用 `run_in_background: true`）：

1. **后端模型**：遍历 {{BACKEND_MODELS}} 中的每个模型
   - 每个模型使用对应的 `~/.claude/.ccg/prompts/<模型名>/analyzer.md`
   - 输出：`Structured analysis/diagnostic report`

2. **前端模型**：遍历 {{FRONTEND_MODELS}} 中的每个模型
   - 每个模型使用对应的 `~/.claude/.ccg/prompts/<模型名>/analyzer.md`
   - 输出：`Structured analysis/diagnostic report`

调用示例：
```bash
# 遍历后端模型列表（假设配置了 codex 和 gemini）
for model in codex gemini; do
  codeagent-wrapper --backend $model - $PROJECT_DIR <<'EOF' &
ROLE_FILE: ~/.claude/.ccg/prompts/$model/analyzer.md
<TASK>
分析需求: {{增强后的需求}}
Context: {{从 MCP 获取的代码上下文}}
</TASK>
OUTPUT: Structured analysis/diagnostic report.
EOF
done
```

使用 `TaskOutput` 获取所有模型的分析结果，交叉验证后综合方案。

**强制停止**: 询问用户 **"是否继续执行此方案？(Y/N)"** 并等待确认

### 阶段 3: 原型生成

**并行调用所有配置的模型生成原型**（使用 `run_in_background: true`）：

1. **后端模型**：遍历 {{BACKEND_MODELS}} 中的每个模型
   - 每个模型使用对应的 `~/.claude/.ccg/prompts/<模型名>/architect.md`
   - 输出：`Unified Diff Patch ONLY`

2. **前端模型**：遍历 {{FRONTEND_MODELS}} 中的每个模型
   - 每个模型使用对应的 `~/.claude/.ccg/prompts/<模型名>/frontend.md`（如无 frontend 角色，使用 architect）
   - 输出：`Unified Diff Patch ONLY`

调用示例：
```bash
# 遍历后端模型生成原型
for model in $(echo '{{BACKEND_MODELS}}' | jq -r '.[]'); do
  codeagent-wrapper --backend $model - $PROJECT_DIR <<'EOF' &
ROLE_FILE: ~/.claude/.ccg/prompts/$model/architect.md
<TASK>
生成后端原型: {{功能需求}}
Context: {{相关代码}}
</TASK>
OUTPUT: Unified Diff Patch ONLY.
EOF
done
```

使用 `TaskOutput` 收集所有模型的原型结果。

### 阶段 4: 代码实施
1. 将所有模型的原型视为"脏原型" – 仅作参考
2. **交叉验证所有模型结果，集各家所长**：
   - 分析每个模型的优势和不足
   - 选择最佳实现方案
   - 综合多个模型的创新点
3. 重构为干净的生产级代码
4. 验证变更不会引入副作用

### 阶段 5: 审计与交付

**并行调用所有配置的审查模型**（使用 `run_in_background: true`）：

遍历 {{REVIEW_MODELS}} 中的每个模型进行代码审查：
- 每个模型使用对应的 `~/.claude/.ccg/prompts/<模型名>/reviewer.md`
- 输出：`Review comments only`

调用示例：
```bash
# 遍历审查模型列表（默认: codex, gemini）
for model in $(echo '{{REVIEW_MODELS}}' | jq -r '.[]'); do
  codeagent-wrapper --backend $model - $PROJECT_DIR <<'EOF' &
ROLE_FILE: ~/.claude/.ccg/prompts/$model/reviewer.md
<TASK>
审查代码: {{实施的代码变更}}
关注点: 安全性、性能、错误处理、可访问性、设计一致性
</TASK>
OUTPUT: Review comments only. No code modifications.
EOF
done
```

使用 `TaskOutput` 获取所有审查结果，整合各方反馈后修正并交付。

## 输出格式
1. **增强后需求** – 优化后的 prompt (阶段 0)
2. **上下文摘要** – 识别的相关代码元素
3. **实施方案** – 逐步执行方案
4. **代码变更** – 生产级实现
5. **审计报告** – 审查反馈和修正
6. **后续步骤** – 部署或跟进操作

## 关键规则
- 未经用户批准不得跳过任何阶段
- **阶段 0 的 prompt 增强是强制性的** – 必须先展示增强后的 prompt
- 始终要求外部模型输出 Unified Diff Patch
- 外部模型对文件系统**零写入权限**
- 实时向用户报告当前阶段和下一阶段
- 使用 HEREDOC 语法 (`<<'EOF'`) 避免 shell 转义问题
- **三模型并行调用使用 `run_in_background: true`** 避免阻塞
- **三模型结果需交叉验证，集各家所长**
