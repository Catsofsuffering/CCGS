import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import { dirname, join } from 'pathe'
import {
  CANONICAL_RUNTIME_DIRNAME,
  DEPRECATED_RUNTIME_DIRNAMES,
} from './identity'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function findPackageRoot(startDir: string): string {
  let dir = startDir
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(join(dir, 'package.json')) && fs.existsSync(join(dir, 'templates')))
      return dir

    const parent = dirname(dir)
    if (parent === dir)
      break
    dir = parent
  }

  console.error(
    `[CCSM] PACKAGE_ROOT resolution failed.\n`
    + `  Start dir: ${startDir}\n`
    + `  Last checked: ${dir}\n`
    + `  The package must contain both package.json and templates/.`,
  )
  return startDir
}

export const PACKAGE_ROOT = findPackageRoot(__dirname)

const MCP_PROVIDERS: Record<string, { tool: string, param: string }> = {
  'ace-tool': { tool: 'mcp__ace-tool__search_context', param: 'query' },
  'ace-tool-rs': { tool: 'mcp__ace-tool__search_context', param: 'query' },
  contextweaver: { tool: 'mcp__contextweaver__codebase-retrieval', param: 'information_request' },
  'fast-context': { tool: 'mcp__fast-context__fast_context_search', param: 'query' },
}

export function injectConfigVariables(content: string, config: {
  routing?: {
    mode?: string
    frontend?: { models?: string[], primary?: string }
    backend?: { models?: string[], primary?: string }
    review?: { models?: string[] }
  }
  mcpProvider?: string
}): string {
  let processed = content
  const routing = config.routing || {}

  const frontendModels = routing.frontend?.models || ['codex']
  const frontendPrimary = routing.frontend?.primary || 'codex'
  processed = processed.replace(/\{\{FRONTEND_MODELS\}\}/g, JSON.stringify(frontendModels))
  processed = processed.replace(/\{\{FRONTEND_PRIMARY\}\}/g, frontendPrimary)

  const backendModels = routing.backend?.models || ['codex']
  const backendPrimary = routing.backend?.primary || 'codex'
  processed = processed.replace(/\{\{BACKEND_MODELS\}\}/g, JSON.stringify(backendModels))
  processed = processed.replace(/\{\{BACKEND_PRIMARY\}\}/g, backendPrimary)

  const reviewModels = routing.review?.models || ['codex']
  processed = processed.replace(/\{\{REVIEW_MODELS\}\}/g, JSON.stringify(reviewModels))

  const routingMode = routing.mode || 'smart'
  processed = processed.replace(/\{\{ROUTING_MODE\}\}/g, routingMode)

  const mcpProvider = config.mcpProvider || 'ace-tool'
  if (mcpProvider === 'skip') {
    processed = processed.replace(/,\s*\{\{MCP_SEARCH_TOOL\}\}/g, '')
    processed = processed.replace(
      /```\n\{\{MCP_SEARCH_TOOL\}\}[\s\S]*?\n```/g,
      '> MCP is not configured. Use `Glob` to locate files, `Grep` to search symbols, and `Read` to inspect file content.',
    )
    processed = processed.replace(/`\{\{MCP_SEARCH_TOOL\}\}`/g, '`Glob + Grep` (MCP not configured)')
    processed = processed.replace(/\{\{MCP_SEARCH_TOOL\}\}/g, 'Glob + Grep')
    processed = processed.replace(/\{\{MCP_SEARCH_PARAM\}\}/g, '')
    return processed
  }

  const provider = MCP_PROVIDERS[mcpProvider] ?? MCP_PROVIDERS['ace-tool']
  processed = processed.replace(/\{\{MCP_SEARCH_TOOL\}\}/g, provider.tool)
  processed = processed.replace(/\{\{MCP_SEARCH_PARAM\}\}/g, provider.param)
  return processed
}

export function replaceHomePathsInTemplate(content: string, options: {
  hostHomeDir: string
  canonicalHomeDir?: string
}): string {
  const userHome = homedir()
  const canonicalRuntimeDir = options.canonicalHomeDir || join(options.hostHomeDir, CANONICAL_RUNTIME_DIRNAME)
  const deprecatedRuntimeDirs = DEPRECATED_RUNTIME_DIRNAMES.map(dirname => join(options.hostHomeDir, dirname))
  const hostDir = options.hostHomeDir
  const toForwardSlash = (path: string) => path.replace(/\\/g, '/')

  let processed = content
  processed = processed.replace(/~\/\.claude\/\.ccgs/g, toForwardSlash(canonicalRuntimeDir))
  processed = processed.replace(/~\/\.claude\/\.ccg/g, toForwardSlash(canonicalRuntimeDir))
  processed = processed.replace(/~\/\.codex\/\.ccgs/g, toForwardSlash(canonicalRuntimeDir))
  processed = processed.replace(/~\/\.codex\/\.ccg/g, toForwardSlash(canonicalRuntimeDir))
  processed = processed.replace(/\.\.\/\.ccgs/g, '../.ccsm')
  processed = processed.replace(/\.\.\/\.ccg/g, '../.ccsm')
  processed = processed.replace(/~\/\.claude/g, toForwardSlash(hostDir))
  processed = processed.replace(/~\/\.codex/g, toForwardSlash(hostDir))
  processed = processed.replace(/~\//g, `${toForwardSlash(userHome)}/`)
  for (const deprecatedRuntimeDir of deprecatedRuntimeDirs) {
    processed = processed.replace(new RegExp(toForwardSlash(deprecatedRuntimeDir), 'g'), toForwardSlash(canonicalRuntimeDir))
  }
  return processed
}
