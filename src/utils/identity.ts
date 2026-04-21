export const PRODUCT_NAME = 'CCSM'
export const CANONICAL_PACKAGE_NAME = 'ccsm'
export const CANONICAL_BINARY_NAME = 'ccsm'
export const CANONICAL_NAMESPACE = 'ccsm'
export const CANONICAL_RUNTIME_DIRNAME = '.ccsm'
export const CANONICAL_RULE_PREFIX = 'ccsm'
export const CANONICAL_CODEX_SKILL_NAMES = [
  'ccsm-spec-init',
  'ccsm-spec-plan',
  'ccsm-spec-impl',
] as const
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
export const DEPRECATED_CODEX_SKILL_NAMES = [
  'ccgs-spec-init',
  'ccgs-spec-plan',
  'ccgs-spec-impl',
  'ccg-spec-init',
  'ccg-spec-plan',
  'ccg-spec-impl',
] as const
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
