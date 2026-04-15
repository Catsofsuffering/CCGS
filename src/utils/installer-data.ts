import type { WorkflowConfig } from '../types'

type CommandCategory = 'development' | 'init' | 'git' | 'spec'

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

const WORKFLOW_CONFIGS: WorkflowConfig[] = [
  cmd('team-plan', 1, 'development', 'Agent Teams 规划', 'Agent Teams Planning', 'Codex 组织 Claude 的执行计划与 worker handoff', 'Codex prepares Claude execution plans and worker handoff'),
  cmd('team-exec', 2, 'development', 'Agent Teams 并行实施', 'Agent Teams Parallel Execution', 'Claude Agent Teams 执行 Codex 下发的并行任务', 'Claude Agent Teams execute Codex-dispatched parallel tasks'),
  cmd('team-review', 3, 'development', 'Agent Teams 审查', 'Agent Teams Review', '执行结果回流给 Codex 做质量审查与返工判断', 'Execution results flow back to Codex for review and rework decisions'),
  cmd('context', 4, 'development', '项目上下文管理', 'Project Context Manager', '初始化 .context 目录、记录决策日志、压缩归档与查看历史', 'Initialize the .context directory, record decisions, compress archives, and inspect history'),
  cmd('enhance', 5, 'development', 'Prompt 增强', 'Prompt Enhancement', '增强任务描述与边界条件', 'Improve task prompts and boundary conditions'),
  cmd('init-project', 10, 'init', '项目初始化', 'Project Init', '初始化项目 AI 上下文并生成 CLAUDE.md', 'Initialize project AI context and generate CLAUDE.md', 'init'),
  cmd('commit', 20, 'git', 'Git 提交', 'Git Commit', '智能生成 conventional commit 信息', 'Generate conventional commit messages'),
  cmd('rollback', 21, 'git', 'Git 回滚', 'Git Rollback', '交互式回滚到历史版本', 'Interactively roll back to a historical version'),
  cmd('clean-branches', 22, 'git', 'Git 清理分支', 'Git Clean Branches', '安全清理已合并或过期分支', 'Safely clean merged or stale branches'),
  cmd('worktree', 23, 'git', 'Git Worktree', 'Git Worktree', '管理 Git worktree', 'Manage Git worktrees'),
  cmd('spec-init', 30, 'spec', 'OpenSpec 初始化', 'OpenSpec Init', '初始化 Codex 主导的 OpenSpec 环境', 'Initialize the Codex-led OpenSpec environment'),
  cmd('spec-research', 31, 'spec', '需求研究', 'Spec Research', '把需求整理为约束与 change 输入', 'Turn requirements into constraints and change inputs'),
  cmd('spec-plan', 32, 'spec', '零决策规划', 'Spec Plan', 'Codex 收敛 proposal 并生成执行交接契约', 'Codex refines proposals into an execution-ready plan and handoff contract'),
  cmd('spec-impl', 33, 'spec', '规范驱动实现', 'Spec Implementation', 'Codex 调度 Claude 执行并决定验收与归档', 'Codex dispatches Claude execution, then verifies and decides acceptance and archive'),
  cmd('spec-review', 34, 'spec', '归档前审查', 'Spec Review', 'Codex 最终验收门禁，可结合多模型审查', 'Codex final acceptance gate with optional multi-model review'),
]

const DEFAULT_COMMAND_IDS = WORKFLOW_CONFIGS.map(workflow => workflow.id)

export function getWorkflowConfigs(): WorkflowConfig[] {
  return [...WORKFLOW_CONFIGS].sort((a, b) => a.order - b.order)
}

export function getWorkflowById(id: string): WorkflowConfig | undefined {
  return WORKFLOW_CONFIGS.find(workflow => workflow.id === id)
}

export function getAllCommandIds(): string[] {
  return WORKFLOW_CONFIGS.map(workflow => workflow.id)
}

export function getDefaultCommandIds(): string[] {
  return [...DEFAULT_COMMAND_IDS]
}

export const WORKFLOW_PRESETS = {
  full: {
    name: '完整',
    nameEn: 'Full',
    description: `全部命令（${WORKFLOW_CONFIGS.length} 个）`,
    descriptionEn: `All commands (${WORKFLOW_CONFIGS.length})`,
    workflows: WORKFLOW_CONFIGS.map(workflow => workflow.id),
  },
}

export type WorkflowPreset = keyof typeof WORKFLOW_PRESETS

export function getWorkflowPreset(preset: WorkflowPreset): string[] {
  return [...WORKFLOW_PRESETS[preset].workflows]
}
