import type { WorkflowConfig } from '../types'

// ═══════════════════════════════════════════════════════
// Command builder — adding a new command = 1 function call
// ═══════════════════════════════════════════════════════

type CommandCategory = 'development' | 'init' | 'git' | 'spec'

/**
 * Create a WorkflowConfig with sensible defaults.
 * @param cmdOverride — Use when the slash command name differs from the id (e.g. 'init-project' → 'init')
 */
function cmd(
  id: string,
  order: number,
  category: CommandCategory,
  name: string,
  nameEn: string,
  description: string,
  descriptionEn: string,
  cmdOverride?: string,
): WorkflowConfig {
  return {
    id,
    name,
    nameEn,
    category,
    commands: [cmdOverride ?? id],
    defaultSelected: true,
    order,
    description,
    descriptionEn,
  }
}

// ═══════════════════════════════════════════════════════
// Command registry (source of truth)
// To add a command: append one cmd() call below.
// ═══════════════════════════════════════════════════════

const WORKFLOW_CONFIGS: WorkflowConfig[] = [
  // ── Development ──────────────────────────────────────
  cmd('workflow', 1, 'development', '完整开发工作流', 'Full Development Workflow', 'Codex 主控的 6 阶段开发主路径，兼容现有多模型资产', 'Codex-led 6-phase development workflow with compatibility assets'),
  cmd('plan', 1.5, 'development', '多模型协作规划', 'Multi-Model Planning', 'Codex 主导规划与上下文收敛，输出可执行计划', 'Codex-led planning that turns context into an executable plan'),
  cmd('execute', 1.6, 'development', '多模型协作执行', 'Multi-Model Execution', '兼容流：基于既有计划执行并保留旧工作流资产', 'Compatibility execution flow for existing multi-model plans'),
  cmd('team', 1.75, 'development', 'Agent Teams 统一工作流', 'Agent Teams Unified Workflow', 'Claude Agent Teams 执行层，由 Codex 编排与验收', 'Claude Agent Teams execution flow dispatched by Codex'),
  cmd('team-research', 1.8, 'development', 'Agent Teams 需求研究', 'Agent Teams Research', '并行探索代码库并整理 Claude 执行所需约束', 'Parallel codebase research for Claude execution constraints'),
  cmd('team-plan', 1.85, 'development', 'Agent Teams 规划', 'Agent Teams Planning', 'Codex 组织 Claude 执行计划与 worker handoff', 'Codex prepares Claude execution plans and worker handoff'),
  cmd('team-exec', 1.9, 'development', 'Agent Teams 并行实施', 'Agent Teams Parallel Execution', 'Claude Agent Teams 执行 Codex 下发的并行任务', 'Claude Agent Teams execute Codex-dispatched parallel tasks'),
  cmd('team-review', 1.95, 'development', 'Agent Teams 审查', 'Agent Teams Review', '执行结果回流给 Codex 进行质量审查与返工判断', 'Execution results flow back to Codex for review and rework decisions'),
  cmd('frontend', 2, 'development', '前端专项', 'Frontend Tasks', '前端专项快速流，按配置的前端模型执行', 'Frontend-focused quick flow using the configured frontend model'),
  cmd('codex-exec', 2.5, 'development', 'Codex 执行计划', 'Codex Plan Executor', 'Codex 直接执行计划并保留轻量审查路径', 'Codex executes the plan directly with a lightweight review path'),
  cmd('context', 2.6, 'development', '项目上下文管理', 'Project Context Manager', '初始化 .context 目录、记录决策日志、压缩归档、查看历史', 'Init .context dir, log decisions, compress, view history'),
  cmd('backend', 3, 'development', '后端专项', 'Backend Tasks', '后端专项快速流，Codex 默认负责', 'Backend-focused quick flow led by Codex'),
  cmd('feat', 4, 'development', '智能功能开发', 'Smart Feature Development', '智能功能开发：规划、设计、实施一体化', 'Smart feature development across planning, design, and implementation'),
  cmd('analyze', 5, 'development', '技术分析', 'Technical Analysis', '技术分析模式，只分析不改代码', 'Technical analysis only, with no code changes'),
  cmd('debug', 6, 'development', '问题诊断', 'Debug', '诊断问题并产出修复路径', 'Diagnose problems and produce a fix path'),
  cmd('optimize', 7, 'development', '性能优化', 'Performance Optimization', '定位瓶颈并输出优化方案', 'Identify bottlenecks and produce optimization guidance'),
  cmd('test', 8, 'development', '测试生成', 'Test Generation', '根据上下文生成测试资产', 'Generate test assets from project context'),
  cmd('review', 9, 'development', '代码审查', 'Code Review', '代码审查，默认可读取 git diff', 'Code review with optional git diff auto-detection'),
  cmd('enhance', 9.5, 'development', 'Prompt 增强', 'Prompt Enhancement', '增强任务描述与边界条件', 'Improve task prompts and boundary conditions'),

  // ── Init ─────────────────────────────────────────────
  cmd('init-project', 10, 'init', '项目初始化', 'Project Init', '初始化项目 AI 上下文，生成 CLAUDE.md', 'Initialize project AI context, generate CLAUDE.md', 'init'),

  // ── Git ──────────────────────────────────────────────
  cmd('commit', 20, 'git', 'Git 提交', 'Git Commit', '智能生成 conventional commit 信息', 'Smart conventional commit message generation'),
  cmd('rollback', 21, 'git', 'Git 回滚', 'Git Rollback', '交互式回滚分支到历史版本', 'Interactive rollback to historical version'),
  cmd('clean-branches', 22, 'git', 'Git 清理分支', 'Git Clean Branches', '安全清理已合并或过期分支', 'Safely clean merged or stale branches'),
  cmd('worktree', 23, 'git', 'Git Worktree', 'Git Worktree', '管理 Git worktree', 'Manage Git worktree'),

  // ── Spec (OpenSpec / OPSX) ───────────────────────────
  cmd('spec-init', 30, 'spec', 'OpenSpec 初始化', 'OpenSpec Init', '初始化 Codex 主控的 OpenSpec 环境，可选启用集成功能', 'Initialize the Codex-led OpenSpec environment with optional integrations'),
  cmd('spec-research', 31, 'spec', '需求研究', 'Spec Research', '把需求整理为约束与 change 输入', 'Turn requirements into constraints and change inputs'),
  cmd('spec-plan', 32, 'spec', '零决策规划', 'Spec Plan', 'Codex 收敛 proposal 并生成执行交接契约', 'Codex refines proposals into an execution-ready plan and handoff contract'),
  cmd('spec-impl', 33, 'spec', '规范驱动实现', 'Spec Implementation', 'Codex 调度 Claude 执行，并在完成后决定验收与归档', 'Codex dispatches Claude execution, then verifies and decides archive'),
  cmd('spec-review', 34, 'spec', '归档前审查', 'Spec Review', 'Codex 最终验收门禁，必要时结合多模型审查', 'Codex final acceptance and archive gate with optional multi-model review'),
]

// ═══════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════

export function getWorkflowConfigs(): WorkflowConfig[] {
  return WORKFLOW_CONFIGS.sort((a, b) => a.order - b.order)
}

export function getWorkflowById(id: string): WorkflowConfig | undefined {
  return WORKFLOW_CONFIGS.find(w => w.id === id)
}

/**
 * Get all command IDs for installation.
 * No more presets — always install all commands.
 */
export function getAllCommandIds(): string[] {
  return WORKFLOW_CONFIGS.map(w => w.id)
}

/**
 * @deprecated Use getAllCommandIds() instead.
 * Kept for backward compatibility.
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
