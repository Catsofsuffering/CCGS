export const PRODUCT_NAME = 'CCSM'
export const CANONICAL_PACKAGE_NAME = 'ccsm'
export const CANONICAL_BINARY_NAME = 'ccsm'
export const CANONICAL_NAMESPACE = 'ccsm'
export const CANONICAL_RUNTIME_DIRNAME = '.ccsm'
export const CANONICAL_RULE_PREFIX = 'ccsm'
export const CANONICAL_CODEX_SKILL_NAMES = [
  'spec-init',
  'spec-research',
  'spec-plan',
  'spec-impl',
  'spec-review',
] as const
export const MANAGED_CODEX_SKILL_MARKER = '<!-- CCSM-MANAGED-CODEX-WORKFLOW-SKILL -->'
export const DEPRECATED_PACKAGE_NAMES = [
  'ccsm-workflow',
  'ccgs-workflow',
  'ccg-workflow',
] as const
export const DEPRECATED_BINARY_NAMES = [
  'ccgs',
  'ccg',
] as const
export const DEPRECATED_HOST_NAMESPACES = [
  'ccgs',
  'ccg',
] as const
export const DEPRECATED_RUNTIME_DIRNAMES = [
  '.ccgs',
  '.ccg',
] as const
export const DEPRECATED_CODEX_SKILL_NAME_MAP = {
  'ccsm-spec-init': 'spec-init',
  'ccsm-spec-plan': 'spec-plan',
  'ccsm-spec-impl': 'spec-impl',
  'ccgs-spec-init': 'spec-init',
  'ccgs-spec-plan': 'spec-plan',
  'ccgs-spec-impl': 'spec-impl',
  'ccg-spec-init': 'spec-init',
  'ccg-spec-plan': 'spec-plan',
  'ccg-spec-impl': 'spec-impl',
} as const
export const DEPRECATED_CODEX_SKILL_NAMES = Object.keys(DEPRECATED_CODEX_SKILL_NAME_MAP) as Array<keyof typeof DEPRECATED_CODEX_SKILL_NAME_MAP>
export const CANONICAL_RULE_FILES = [
  'ccsm-skills.md',
  'ccsm-skill-routing.md',
  'ccsm-grok-search.md',
] as const
export const DEPRECATED_RULE_FILES = [
  'ccgs-skills.md',
  'ccgs-skill-routing.md',
  'ccgs-grok-search.md',
  'ccg-skills.md',
  'ccg-skill-routing.md',
  'ccg-grok-search.md',
] as const
export const ALL_CODEX_SKILL_NAMES = [
  ...CANONICAL_CODEX_SKILL_NAMES,
  ...DEPRECATED_CODEX_SKILL_NAMES,
] as const
export const ALL_RULE_FILES = [
  ...CANONICAL_RULE_FILES,
  ...DEPRECATED_RULE_FILES,
] as const

export const MANAGED_PACKAGE_NAMES = [
  CANONICAL_PACKAGE_NAME,
  ...DEPRECATED_PACKAGE_NAMES,
] as const

export function buildNpxPackageCommand(packageSpec: string, args: string[] = []): string {
  return `npx --yes ${packageSpec}${args.length > 0 ? ` ${args.join(' ')}` : ''}`
}

export function getCanonicalNpxCommand(args: string[] = []): string {
  return buildNpxPackageCommand(CANONICAL_PACKAGE_NAME, args)
}

export function getCanonicalNpxLatestCommand(args: string[] = []): string {
  return buildNpxPackageCommand(`${CANONICAL_PACKAGE_NAME}@latest`, args)
}

export function getCanonicalGlobalInstallCommand(): string {
  return `npm install -g ${CANONICAL_PACKAGE_NAME}@latest`
}

export function getCanonicalGlobalUninstallCommand(): string {
  return `npm uninstall -g ${CANONICAL_PACKAGE_NAME}`
}
