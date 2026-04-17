const LEGACY_LONG_OPTIONS = new Set([
  'backend',
  'detach',
  'force',
  'frontend',
  'install-dir',
  'lang',
  'mode',
  'skip-mcp',
  'skip-prompt',
  'workflows',
])

export function normalizeLegacyLongOptions(argv: string[]): string[] {
  return argv.map((arg) => {
    if (!arg.startsWith('-') || arg.startsWith('--') || arg.length <= 2) {
      return arg
    }

    const optionName = arg.slice(1)
    if (!LEGACY_LONG_OPTIONS.has(optionName)) {
      return arg
    }

    return `--${optionName}`
  })
}
