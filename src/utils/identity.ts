export const PRODUCT_NAME = 'CCGS'
export const CANONICAL_PACKAGE_NAME = 'ccgs-workflow'
export const LEGACY_PACKAGE_NAME = 'ccg-workflow'
export const CANONICAL_BINARY_NAME = 'ccgs'
export const LEGACY_BINARY_NAME = 'ccg'
export const CANONICAL_NAMESPACE = 'ccgs'
export const LEGACY_NAMESPACE = 'ccg'
export const CANONICAL_RUNTIME_DIRNAME = '.ccgs'
export const LEGACY_RUNTIME_DIRNAME = '.ccg'
export const CANONICAL_RULE_PREFIX = 'ccgs'
export const LEGACY_RULE_PREFIX = 'ccg'
export const CANONICAL_CODEX_SKILL_NAMES = [
  'ccgs-spec-init',
  'ccgs-spec-plan',
  'ccgs-spec-impl',
] as const
export const LEGACY_CODEX_SKILL_NAMES = [
  'ccg-spec-init',
  'ccg-spec-plan',
  'ccg-spec-impl',
] as const
export const CANONICAL_RULE_FILES = [
  'ccgs-skills.md',
  'ccgs-skill-routing.md',
  'ccgs-grok-search.md',
] as const
export const LEGACY_RULE_FILES = [
  'ccg-skills.md',
  'ccg-skill-routing.md',
  'ccg-grok-search.md',
] as const
export const ALL_CODEX_SKILL_NAMES = [
  ...CANONICAL_CODEX_SKILL_NAMES,
  ...LEGACY_CODEX_SKILL_NAMES,
] as const
export const ALL_RULE_FILES = [
  ...CANONICAL_RULE_FILES,
  ...LEGACY_RULE_FILES,
] as const

export const MANAGED_PACKAGE_NAMES = [CANONICAL_PACKAGE_NAME, LEGACY_PACKAGE_NAME] as const

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
