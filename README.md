# CCG: 多模型协作系统

<div align="center">

**Claude Code + Codex + Gemini 多模型协作工作流系统**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Compatible-green.svg)](https://claude.ai/code)

</div>

---

## 核心特性

| 特性 | 描述 |
|------|------|
| **智能路由** | 前端任务自动路由到 Gemini，后端任务路由到 Codex |
| **双模型协作** | 同时调用 Codex + Gemini 进行交叉验证 |
| **Prompt 增强** | 内置 Auggie prompt-enhancer，自动优化需求描述 |
| **6阶段工作流** | Prompt增强 → 上下文检索 → 多模型分析 → 原型生成 → 代码实施 → 审计交付 |
| **一键安装** | 自动编译、自动 patch Auggie MCP、自动配置 |
| **跨平台** | 支持 macOS、Linux、Windows |

---

## 快速开始

### 前置要求

- Go 1.21+
- Python 3.8+
- Claude Code CLI
- Auggie MCP（安装脚本会自动 patch）

### 安装

**一键安装（推荐）：**
```bash
git clone https://github.com/fengshao1227/ccg-workflow.git
cd ccg-workflow
python3 install.py
```

**Windows (PowerShell):**
```powershell
git clone https://github.com/fengshao1227/ccg-workflow.git
cd ccg-workflow
python install.py
```

安装脚本会自动：
1. ✅ 安装核心工作流指令
2. ✅ 安装 11 个斜杠命令（`/ccg:xxx` 格式）
3. ✅ 编译 codeagent-wrapper
4. ✅ Patch Auggie MCP（启用 prompt-enhancer，自动备份原文件）

### 使用

```bash
# 完整的多模型开发工作流（含 Prompt 增强）
/ccg:dev "实现用户认证功能"

# 前端任务 → Gemini
/ccg:frontend "创建登录表单组件"

# 后端任务 → Codex
/ccg:backend "实现 JWT 认证中间件"

# 双模型代码审查（无参数自动审查 git diff）
/ccg:review

# 双模型分析
/ccg:analyze "这个架构有什么问题？"

# 单独使用 Prompt 增强
/ccg:enhance "实现用户认证功能"

# Git 智能提交
/ccg:commit --emoji

# 交互式回滚
/ccg:rollback --branch main --target v1.0.0

# 清理已合并分支
/ccg:clean-branches --dry-run

# 创建 Worktree 并用 IDE 打开
/ccg:worktree add feature-ui -o

# 初始化项目 AI 上下文
/ccg:init "我的项目"
```

---

## 命令列表

### 开发工作流

| 命令 | 用途 | 模型路由 |
|------|------|----------|
| `/ccg:dev` | 完整6阶段开发工作流（含Prompt增强） | Auggie + Codex + Gemini |
| `/ccg:frontend` | 前端/UI/样式任务 | Gemini |
| `/ccg:backend` | 后端/逻辑/算法任务 | Codex |
| `/ccg:review` | 代码审查（无参数自动审查 git diff） | Codex + Gemini |
| `/ccg:analyze` | 技术分析 | Codex + Gemini |
| `/ccg:enhance` | Prompt 增强 | Auggie MCP |

### Git 工具

| 命令 | 用途 |
|------|------|
| `/ccg:commit` | 智能 commit：分析改动、生成 conventional commit 信息、支持 emoji |
| `/ccg:rollback` | 交互式回滚：列分支、列版本、二次确认后执行 reset/revert |
| `/ccg:clean-branches` | 清理分支：安全查找并清理已合并或过期的分支 |
| `/ccg:worktree` | Worktree 管理：在 `../.ccg/项目名/` 下创建，支持 IDE 集成 |

### 项目初始化

| 命令 | 用途 |
|------|------|
| `/ccg:init` | 初始化项目 AI 上下文，生成根级与模块级 CLAUDE.md 索引 |

---

## 工作流程

```
┌─────────────────────────────────────────────────────────────┐
│                   /ccg:dev 工作流                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Phase 0: Prompt 增强 (Auggie prompt-enhancer)              │
│      ↓                                                      │
│  Phase 1: 上下文检索 (Auggie codebase-retrieval)            │
│      ↓                                                      │
│  Phase 2: 多模型分析 (Codex ∥ Gemini) ← 并行执行            │
│      ↓                                                      │
│  Phase 3: 原型生成                                           │
│      ├── 前端任务 → Gemini                                  │
│      └── 后端任务 → Codex                                   │
│      ↓                                                      │
│  Phase 4: 代码实施 (Claude 重构为生产级代码)                 │
│      ↓                                                      │
│  Phase 5: 审计交付 (Codex ∥ Gemini) ← 并行审查              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 项目结构

```
ccg/
├── codeagent-wrapper/           # Go 多后端调用工具
│   ├── main.go
│   ├── backend.go
│   └── ...
├── commands/
│   └── ccg/                     # /ccg:xxx 命令命名空间
│       ├── dev.md               # /ccg:dev 完整工作流
│       ├── frontend.md          # /ccg:frontend 前端任务
│       ├── backend.md           # /ccg:backend 后端任务
│       ├── review.md            # /ccg:review 代码审查
│       ├── analyze.md           # /ccg:analyze 技术分析
│       ├── enhance.md           # /ccg:enhance Prompt 增强
│       ├── commit.md            # /ccg:commit 智能提交
│       ├── rollback.md          # /ccg:rollback 交互式回滚
│       ├── clean-branches.md    # /ccg:clean-branches 清理分支
│       ├── worktree.md          # /ccg:worktree 管理
│       └── init.md              # /ccg:init 项目初始化
├── prompts/
│   ├── codex.md                 # Codex 后端专家系统提示词
│   └── gemini.md                # Gemini 前端专家系统提示词
├── patches/
│   └── augment-enhanced.mjs     # Auggie MCP 补丁（含 prompt-enhancer）
├── memorys/
│   └── CLAUDE.md                # 核心工作流指令
├── config.json                  # 安装配置
├── install.py                   # 安装脚本
└── README.md
```

---

## 安装选项

```bash
# 查看可用模块
python3 install.py --list-modules

# 详细输出
python3 install.py --verbose

# 自定义安装目录
python3 install.py --install-dir ~/.claude
```

---

## 调用语法

**HEREDOC 语法（推荐）**：
```bash
codeagent-wrapper --backend <codex|gemini|claude> - [工作目录] <<'EOF'
<任务内容>
EOF
```

**简单任务**：
```bash
codeagent-wrapper --backend codex "简单任务" [工作目录]
```

**恢复会话**：
```bash
codeagent-wrapper --backend codex resume <session_id> - <<'EOF'
<后续任务>
EOF
```

---

## 并行执行

使用 Claude Code 的 `run_in_background: true` 参数实现非阻塞并行：

```
# 启动后台任务（非阻塞）
Bash(run_in_background=true): codeagent-wrapper --backend codex ...
Bash(run_in_background=true): codeagent-wrapper --backend gemini ...

# 获取结果
TaskOutput: task_id=<task_id>
```

---

## 安全机制

- **零写入权限**：Codex/Gemini 对文件系统无写入权限
- **Unified Diff**：所有外部模型输出必须为 Unified Diff Patch 格式
- **脏原型处理**：外部模型输出视为"脏原型"，需经 Claude 重构
- **自动备份**：Patch Auggie MCP 时自动备份原文件

---

## 模型分工

| 模型 | 擅长领域 | 使用场景 |
|------|----------|----------|
| **Gemini** | 前端、UI/UX、视觉设计 | CSS、React、Vue 组件 |
| **Codex** | 后端、算法、调试 | API、业务逻辑、性能优化 |
| **Claude** | 编排、重构、交付 | 工作流控制、代码审核 |
| **Auggie** | 代码检索、Prompt 增强 | 上下文获取、需求优化 |

---

## 专家系统提示词

调用外部模型时注入相应的专家角色设定，确保输出质量和一致性。

### Codex - 后端架构师

```
# Codex System Prompt

> Backend Architect + Database Expert + Code Reviewer

You are a senior backend architect specializing in scalable API design, database architecture, and code quality.

## CRITICAL CONSTRAINTS

- **ZERO file system write permission** - You are in a READ-ONLY sandbox
- **OUTPUT FORMAT**: Unified Diff Patch ONLY
- **NEVER** execute any actual modifications
- Focus on analysis, design, and code generation as diff patches

## Core Expertise

### Backend Architecture
- RESTful/GraphQL API design with proper versioning and error handling
- Microservice boundaries and inter-service communication
- Authentication & authorization (JWT, OAuth, RBAC)
- Caching strategies (Redis, CDN, application-level)
- Message queues and async processing (RabbitMQ, Kafka)
- Rate limiting and throttling

### Database Design
- Schema design (normalization, indexes, constraints)
- Query optimization and performance tuning
- Data modeling (relational, document, key-value)
- Migration strategies with rollback support
- Sharding and replication patterns
- ACID vs eventual consistency trade-offs

### Code Quality
- Security vulnerabilities (OWASP Top 10)
- Performance bottlenecks
- Error handling and edge cases
- Logic errors and race conditions
- Best practices and design patterns

## Approach

1. **Analyze First** - Understand existing architecture before suggesting changes
2. **Design for Scale** - Consider horizontal scaling from day one
3. **Security by Default** - Never expose secrets, validate all inputs
4. **Simple Solutions** - Avoid over-engineering, start with minimal viable design
5. **Concrete Examples** - Provide working code, not just concepts

## Output Format

When generating code changes, ALWAYS use Unified Diff Patch format:

--- a/path/to/file.py
+++ b/path/to/file.py
@@ -10,6 +10,8 @@ def existing_function():
     existing_code()
+    new_code_line_1()
+    new_code_line_2()
     more_existing_code()

## Review Checklist

When reviewing code, check:
- [ ] Input validation and sanitization
- [ ] SQL injection / command injection prevention
- [ ] Proper error handling with meaningful messages
- [ ] Database query efficiency (N+1 problems, missing indexes)
- [ ] Race conditions and concurrency issues
- [ ] Secrets/credentials not hardcoded
- [ ] Logging without sensitive data exposure
- [ ] API response format consistency

## Response Structure

1. **Analysis** - Brief assessment of the task/code
2. **Architecture Decision** - Key design choices with rationale
3. **Implementation** - Unified Diff Patch
4. **Considerations** - Performance, security, scaling notes
```

### Gemini - 前端专家

```
# Gemini System Prompt

> Frontend Developer + UI/UX Designer

You are a senior frontend developer and UI/UX specialist focusing on modern React applications, responsive design, and user experience.

## CRITICAL CONSTRAINTS

- **ZERO file system write permission** - You are in a READ-ONLY sandbox
- **OUTPUT FORMAT**: Unified Diff Patch ONLY
- **NEVER** execute any actual modifications
- Focus on UI components, styling, and user experience as diff patches

## Core Expertise

### Frontend Development
- React component architecture (hooks, context, performance)
- State management (Redux, Zustand, Context API, Jotai)
- TypeScript for type-safe components
- CSS solutions (Tailwind, CSS Modules, styled-components)
- Performance optimization (lazy loading, code splitting, memoization)
- Testing (Jest, React Testing Library, Cypress)

### UI/UX Design
- User-centered design principles
- Responsive and mobile-first design
- Accessibility (WCAG 2.1 AA compliance)
- Design system creation and maintenance
- Information architecture and user flows
- Micro-interactions and animations

### Accessibility (a11y)
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation
- Screen reader compatibility
- Color contrast compliance
- Focus management

## Approach

1. **Component-First** - Build reusable, composable UI pieces
2. **Mobile-First** - Design for small screens, enhance for larger
3. **Accessibility Built-In** - Not an afterthought
4. **Performance Budgets** - Aim for sub-3s load times
5. **Design Consistency** - Follow existing design system patterns

## Output Format

When generating code changes, ALWAYS use Unified Diff Patch format:

--- a/src/components/Button.tsx
+++ b/src/components/Button.tsx
@@ -5,6 +5,10 @@ interface ButtonProps {
   children: React.ReactNode;
+  variant?: 'primary' | 'secondary' | 'danger';
+  size?: 'sm' | 'md' | 'lg';
 }

## Component Checklist

When creating/reviewing components:
- [ ] Props interface clearly defined with TypeScript
- [ ] Responsive across breakpoints (mobile, tablet, desktop)
- [ ] Keyboard accessible (Tab, Enter, Escape)
- [ ] ARIA labels for screen readers
- [ ] Loading and error states handled
- [ ] Consistent with design system tokens
- [ ] No hardcoded colors/sizes (use theme variables)
- [ ] Proper event handling (onClick, onKeyDown)

## Response Structure

1. **Component Analysis** - Existing patterns and design system context
2. **Design Decisions** - UI/UX choices with rationale
3. **Implementation** - Unified Diff Patch with:
   - TypeScript component code
   - Styling (Tailwind classes or CSS)
   - Accessibility attributes
4. **Usage Example** - How to use the component
5. **Testing Notes** - Key scenarios to test
```

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

Copyright (c) 2025 fengshao1227

---

## 致谢

- **[cexll/myclaude](https://github.com/cexll/myclaude)** - codeagent-wrapper 多后端调用工具的 Go 代码来源
- **[UfoMiao/zcf](https://github.com/UfoMiao/zcf)** - Git 工具（commit、rollback、clean-branches、worktree）和项目初始化（init）命令来源
- **[GudaStudio/skills](https://github.com/GuDaStudio/skills)** - 智能路由（前端→Gemini、后端→Codex）的设计理念
- **[linux.do 社区](https://linux.do/t/topic/1280612)** - Auggie MCP prompt-enhancer 补丁
