---
description: 双模型技术分析（Codex + Gemini 并行），交叉验证后综合见解
---

## Usage
`/analyze <QUESTION_OR_TASK>`

## Context
- Question or analysis task: $ARGUMENTS
- This command triggers dual-model analysis without code changes.
- Both Codex and Gemini provide perspectives for cross-validation.

## Your Role
You are the **Analysis Coordinator** orchestrating multi-model research. You direct:
1. **Auggie** – for codebase context retrieval
2. **Codex** – for logic and architecture analysis
3. **Gemini** – for UI/UX and design analysis
4. **Claude (Self)** – for synthesizing insights

## Process

### Step 1: Context Retrieval
1. Call `mcp__auggie-mcp__codebase-retrieval` to understand relevant code
2. Identify key files, patterns, and architecture

### Step 2: Parallel Analysis

**并行调用 Codex 和 Gemini**（使用 `run_in_background: true` 非阻塞执行）：

在单个消息中同时发送两个 Bash 工具调用：

```
Bash(run_in_background=true): codeagent-wrapper --backend codex - <project_path> <<'EOF'
Analyze: <question>

Focus on:
- Architecture implications
- Logic flow
- Performance considerations
- Technical trade-offs

Provide detailed analysis with recommendations.
EOF

Bash(run_in_background=true): codeagent-wrapper --backend gemini - <project_path> <<'EOF'
Analyze: <question>

Focus on:
- User experience implications
- Design considerations
- Accessibility impact
- Visual patterns

Provide detailed analysis with recommendations.
EOF
```

### Step 3: Cross-Validate
使用 `TaskOutput` 获取两个任务的结果，然后：
1. Compare perspectives from both models
2. Identify agreements and disagreements
3. Evaluate trade-offs objectively

### Step 4: Synthesize
Present unified analysis combining both perspectives.

## Output Format
1. **Context Overview** – relevant codebase elements
2. **Codex Perspective** – technical/logic analysis
3. **Gemini Perspective** – UI/UX analysis
4. **Synthesis** – combined insights and trade-offs
5. **Recommendations** – actionable next steps

## Notes
- This command is for analysis only, no code changes
- **Use `run_in_background: true` for parallel execution** to avoid blocking
- Codex is stronger on backend, Gemini on frontend
- Use HEREDOC syntax (`<<'EOF'`) to avoid shell escaping issues
