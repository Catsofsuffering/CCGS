import type { WorkflowConfig } from '../types'

// All available commands (27 total)
// Note: This array is for documentation/reference. WORKFLOW_CONFIGS is the source of truth.
const ALL_COMMANDS = [
  'workflow', // 完整6阶段开发工作流
  'plan', // 多模型协作规划（Phase 1-2）
  'execute', // 多模型协作执行（Phase 3-5）
  'frontend', // 前端专项（Gemini主导）
  'backend', // 后端专项（Codex主导）
  'feat', // 智能功能开发
  'analyze', // 技术分析
  'debug', // 问题诊断+修复
  'optimize', // 性能优化
  'test', // 测试生成
  'review', // 代码审查
  'init', // 初始化 CLAUDE.md
  'commit', // Git 智能提交
  'rollback', // Git 回滚
  'clean-branches', // Git 清理分支
  'worktree', // Git Worktree
  'spec-init', // OpenSpec 初始化
  'spec-research', // 需求研究 → 约束集
  'spec-plan', // 多模型分析 → 零决策计划
  'spec-impl', // 多模型协作实现
  'spec-review', // 归档前多模型审查
  'team-research', // Agent Teams 需求研究（并行探索 → 约束集）
  'team-plan', // Agent Teams 规划（Lead 调 Codex/Gemini 产出并行计划）
  'team-exec', // Agent Teams 并行实施（spawn Builders 并行写代码）
  'team-review', // Agent Teams 审查（双模型交叉审查并行产出）
  'codex-exec', // 读取计划文件，Codex 全权执行 + 多模型审核
  'context', // 项目上下文管理（.context 目录初始化/日志/压缩/历史）
] as const

// Workflow configurations (source of truth for command registry)
const WORKFLOW_CONFIGS: WorkflowConfig[] = [
  {
    id: 'workflow',
    name: '完整开发工作流',
    nameEn: 'Full Development Workflow',
    category: 'development',
    commands: ['workflow'],
    defaultSelected: true,
    order: 1,
    description: '完整6阶段开发工作流（研究→构思→计划→执行→优化→评审）',
    descriptionEn: 'Full 6-phase development workflow',
  },
  {
    id: 'plan',
    name: '多模型协作规划',
    nameEn: 'Multi-Model Planning',
    category: 'development',
    commands: ['plan'],
    defaultSelected: true,
    order: 1.5,
    description: '上下文检索 + 双模型分析 → 生成 Step-by-step 实施计划',
    descriptionEn: 'Context retrieval + dual-model analysis → Step-by-step plan',
  },
  {
    id: 'execute',
    name: '多模型协作执行',
    nameEn: 'Multi-Model Execution',
    category: 'development',
    commands: ['execute'],
    defaultSelected: true,
    order: 1.6,
    description: '根据计划获取原型 → Claude 重构实施 → 多模型审计交付',
    descriptionEn: 'Get prototype from plan → Claude refactor → Multi-model audit',
  },
  {
    id: 'frontend',
    name: '前端专项',
    nameEn: 'Frontend Tasks',
    category: 'development',
    commands: ['frontend'],
    defaultSelected: true,
    order: 2,
    description: '前端专项任务（Gemini主导，更快更精准）',
    descriptionEn: 'Frontend tasks (Gemini-led, faster)',
  },
  {
    id: 'backend',
    name: '后端专项',
    nameEn: 'Backend Tasks',
    category: 'development',
    commands: ['backend'],
    defaultSelected: true,
    order: 3,
    description: '后端专项任务（Codex主导，更快更精准）',
    descriptionEn: 'Backend tasks (Codex-led, faster)',
  },
  {
    id: 'feat',
    name: '智能功能开发',
    nameEn: 'Smart Feature Development',
    category: 'development',
    commands: ['feat'],
    defaultSelected: true,
    order: 4,
    description: '智能功能开发 - 自动规划、设计、实施',
    descriptionEn: 'Smart feature development - auto plan, design, implement',
  },
  {
    id: 'analyze',
    name: '技术分析',
    nameEn: 'Technical Analysis',
    category: 'development',
    commands: ['analyze'],
    defaultSelected: true,
    order: 5,
    description: '双模型技术分析，仅分析不修改代码',
    descriptionEn: 'Dual-model technical analysis, analysis only',
  },
  {
    id: 'debug',
    name: '问题诊断',
    nameEn: 'Debug',
    category: 'development',
    commands: ['debug'],
    defaultSelected: true,
    order: 6,
    description: '多模型诊断 + 修复',
    descriptionEn: 'Multi-model diagnosis + fix',
  },
  {
    id: 'optimize',
    name: '性能优化',
    nameEn: 'Performance Optimization',
    category: 'development',
    commands: ['optimize'],
    defaultSelected: true,
    order: 7,
    description: '多模型性能优化',
    descriptionEn: 'Multi-model performance optimization',
  },
  {
    id: 'test',
    name: '测试生成',
    nameEn: 'Test Generation',
    category: 'development',
    commands: ['test'],
    defaultSelected: true,
    order: 8,
    description: '智能路由测试生成',
    descriptionEn: 'Smart routing test generation',
  },
  {
    id: 'review',
    name: '代码审查',
    nameEn: 'Code Review',
    category: 'development',
    commands: ['review'],
    defaultSelected: true,
    order: 9,
    description: '双模型代码审查，无参数时自动审查 git diff',
    descriptionEn: 'Dual-model code review, auto-review git diff when no args',
  },
  {
    id: 'enhance',
    name: 'Prompt 增强',
    nameEn: 'Prompt Enhancement',
    category: 'development',
    commands: ['enhance'],
    defaultSelected: true,
    order: 9.5,
    description: 'ace-tool Prompt 增强工具',
    descriptionEn: 'ace-tool prompt enhancement',
  },
  {
    id: 'init-project',
    name: '项目初始化',
    nameEn: 'Project Init',
    category: 'init',
    commands: ['init'],
    defaultSelected: true,
    order: 10,
    description: '初始化项目 AI 上下文，生成 CLAUDE.md',
    descriptionEn: 'Initialize project AI context, generate CLAUDE.md',
  },
  {
    id: 'commit',
    name: 'Git 提交',
    nameEn: 'Git Commit',
    category: 'git',
    commands: ['commit'],
    defaultSelected: true,
    order: 20,
    description: '智能生成 conventional commit 信息',
    descriptionEn: 'Smart conventional commit message generation',
  },
  {
    id: 'rollback',
    name: 'Git 回滚',
    nameEn: 'Git Rollback',
    category: 'git',
    commands: ['rollback'],
    defaultSelected: true,
    order: 21,
    description: '交互式回滚分支到历史版本',
    descriptionEn: 'Interactive rollback to historical version',
  },
  {
    id: 'clean-branches',
    name: 'Git 清理分支',
    nameEn: 'Git Clean Branches',
    category: 'git',
    commands: ['clean-branches'],
    defaultSelected: true,
    order: 22,
    description: '安全清理已合并或过期分支',
    descriptionEn: 'Safely clean merged or stale branches',
  },
  {
    id: 'worktree',
    name: 'Git Worktree',
    nameEn: 'Git Worktree',
    category: 'git',
    commands: ['worktree'],
    defaultSelected: true,
    order: 23,
    description: '管理 Git worktree',
    descriptionEn: 'Manage Git worktree',
  },
  {
    id: 'spec-init',
    name: 'OpenSpec 初始化',
    nameEn: 'OpenSpec Init',
    category: 'spec',
    commands: ['spec-init'],
    defaultSelected: true,
    order: 30,
    description: '初始化 OpenSpec 环境 + 验证多模型 MCP 工具',
    descriptionEn: 'Initialize OpenSpec environment with multi-model MCP validation',
  },
  {
    id: 'spec-research',
    name: '需求研究',
    nameEn: 'Spec Research',
    category: 'spec',
    commands: ['spec-research'],
    defaultSelected: true,
    order: 31,
    description: '需求 → 约束集（并行探索 + OpenSpec 提案）',
    descriptionEn: 'Transform requirements into constraint sets via parallel exploration',
  },
  {
    id: 'spec-plan',
    name: '零决策规划',
    nameEn: 'Spec Plan',
    category: 'spec',
    commands: ['spec-plan'],
    defaultSelected: true,
    order: 32,
    description: '多模型分析 → 消除歧义 → 零决策可执行计划',
    descriptionEn: 'Refine proposals into zero-decision executable plans',
  },
  {
    id: 'spec-impl',
    name: '规范驱动实现',
    nameEn: 'Spec Implementation',
    category: 'spec',
    commands: ['spec-impl'],
    defaultSelected: true,
    order: 33,
    description: '按规范执行 + 多模型协作 + 归档',
    descriptionEn: 'Execute changes via multi-model collaboration with spec compliance',
  },
  {
    id: 'spec-review',
    name: '归档前审查',
    nameEn: 'Spec Review',
    category: 'spec',
    commands: ['spec-review'],
    defaultSelected: true,
    order: 34,
    description: '双模型交叉审查 → Critical 必须修复 → 允许归档',
    descriptionEn: 'Multi-model compliance review before archiving',
  },
  {
    id: 'team-research',
    name: 'Agent Teams 需求研究',
    nameEn: 'Agent Teams Research',
    category: 'development',
    commands: ['team-research'],
    defaultSelected: true,
    order: 1.8,
    description: '并行探索代码库，产出约束集 + 可验证成功判据',
    descriptionEn: 'Parallel codebase exploration, produces constraint sets + success criteria',
  },
  {
    id: 'team-plan',
    name: 'Agent Teams 规划',
    nameEn: 'Agent Teams Planning',
    category: 'development',
    commands: ['team-plan'],
    defaultSelected: true,
    order: 1.85,
    description: 'Lead 调用 Codex/Gemini 并行分析，产出零决策并行实施计划',
    descriptionEn: 'Lead orchestrates Codex/Gemini analysis, produces zero-decision parallel plan',
  },
  {
    id: 'team-exec',
    name: 'Agent Teams 并行实施',
    nameEn: 'Agent Teams Parallel Execution',
    category: 'development',
    commands: ['team-exec'],
    defaultSelected: true,
    order: 1.9,
    description: '读取计划文件，spawn Builder teammates 并行写代码，需启用 Agent Teams',
    descriptionEn: 'Read plan file, spawn Builder teammates for parallel implementation',
  },
  {
    id: 'team-review',
    name: 'Agent Teams 审查',
    nameEn: 'Agent Teams Review',
    category: 'development',
    commands: ['team-review'],
    defaultSelected: true,
    order: 1.95,
    description: '双模型交叉审查并行实施产出，分级处理 Critical/Warning/Info',
    descriptionEn: 'Dual-model cross-review with severity classification',
  },
  {
    id: 'codex-exec',
    name: 'Codex 执行计划',
    nameEn: 'Codex Plan Executor',
    category: 'development',
    commands: ['codex-exec'],
    defaultSelected: true,
    order: 2.5,
    description: '读取 /ccg:plan 计划文件，Codex 全权执行 + 多模型审核',
    descriptionEn: 'Read plan file from /ccg:plan, Codex executes + multi-model review',
  },
  {
    id: 'context',
    name: '项目上下文管理',
    nameEn: 'Project Context Manager',
    category: 'development',
    commands: ['context'],
    defaultSelected: true,
    order: 2.6,
    description: '初始化 .context 目录、记录决策日志、压缩归档、查看历史',
    descriptionEn: 'Init .context dir, log decisions, compress, view history',
  },
]

export function getWorkflowConfigs(): WorkflowConfig[] {
  return WORKFLOW_CONFIGS.sort((a, b) => a.order - b.order)
}

export function getWorkflowById(id: string): WorkflowConfig | undefined {
  return WORKFLOW_CONFIGS.find(w => w.id === id)
}

/**
 * Get all command IDs for installation
 * No more presets - always install all commands
 */
export function getAllCommandIds(): string[] {
  return WORKFLOW_CONFIGS.map(w => w.id)
}

/**
 * @deprecated Use getAllCommandIds() instead
 * Kept for backward compatibility
 */
export const WORKFLOW_PRESETS = {
  full: {
    name: '完整',
    nameEn: 'Full',
    description: `全部命令（${WORKFLOW_CONFIGS.length}个）`,
    descriptionEn: `All commands (${WORKFLOW_CONFIGS.length})`,
    workflows: WORKFLOW_CONFIGS.map(w => w.id),
  },
}

export type WorkflowPreset = keyof typeof WORKFLOW_PRESETS

export function getWorkflowPreset(preset: WorkflowPreset): string[] {
  return [...WORKFLOW_PRESETS[preset].workflows]
}
