import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import { dirname, join } from 'pathe'
import { isWindows } from './platform'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Find package root by looking for package.json
function findPackageRoot(startDir: string): string {
  let dir = startDir
  for (let i = 0; i < 5; i++) {
    if (fs.existsSync(join(dir, 'package.json'))) {
      return dir
    }
    dir = dirname(dir)
  }
  return startDir
}

export const PACKAGE_ROOT = findPackageRoot(__dirname)

/**
 * Replace template variables in content based on user configuration.
 * Injects model routing configs and MCP provider tool names at install time.
 *
 * Supported MCP providers: 'ace-tool' (default), 'ace-tool-rs', 'contextweaver',
 * 'fast-context', 'skip' (fallback to Glob+Grep).
 */
export function injectConfigVariables(content: string, config: {
  routing?: {
    mode?: string
    frontend?: { models?: string[], primary?: string }
    backend?: { models?: string[], primary?: string }
    review?: { models?: string[] }
  }
  liteMode?: boolean
  mcpProvider?: string
}): string {
  let processed = content

  // Model routing injection
  const routing = config.routing || {}

  // Frontend models
  const frontendModels = routing.frontend?.models || ['gemini']
  const frontendPrimary = routing.frontend?.primary || 'gemini'
  processed = processed.replace(/\{\{FRONTEND_MODELS\}\}/g, JSON.stringify(frontendModels))
  processed = processed.replace(/\{\{FRONTEND_PRIMARY\}\}/g, frontendPrimary)

  // Backend models
  const backendModels = routing.backend?.models || ['codex']
  const backendPrimary = routing.backend?.primary || 'codex'
  processed = processed.replace(/\{\{BACKEND_MODELS\}\}/g, JSON.stringify(backendModels))
  processed = processed.replace(/\{\{BACKEND_PRIMARY\}\}/g, backendPrimary)

  // Review models
  const reviewModels = routing.review?.models || ['codex', 'gemini']
  processed = processed.replace(/\{\{REVIEW_MODELS\}\}/g, JSON.stringify(reviewModels))

  // Routing mode
  const routingMode = routing.mode || 'smart'
  processed = processed.replace(/\{\{ROUTING_MODE\}\}/g, routingMode)

  // Lite mode flag for codeagent-wrapper
  // If liteMode is true, inject "--lite" flag
  const liteModeFlag = config.liteMode ? '--lite ' : ''
  processed = processed.replace(/\{\{LITE_MODE_FLAG\}\}/g, liteModeFlag)

  // MCP tool injection based on provider
  const mcpProvider = config.mcpProvider || 'ace-tool'
  if (mcpProvider === 'skip') {
    // MCP skipped: remove all MCP tool references, replace with Glob+Grep fallback

    // 1) Agent frontmatter — remove MCP tool from tools declaration
    processed = processed.replace(/,\s*\{\{MCP_SEARCH_TOOL\}\}/g, '')

    // 2) Code blocks containing MCP tool invocation — replace with fallback guidance
    processed = processed.replace(
      /```\n\{\{MCP_SEARCH_TOOL\}\}[\s\S]*?\n```/g,
      '> MCP 未配置。使用 `Glob` 定位文件 + `Grep` 搜索关键符号 + `Read` 读取文件内容。',
    )

    // 3) Inline backtick references — replace with fallback tool names
    processed = processed.replace(
      /`\{\{MCP_SEARCH_TOOL\}\}`/g,
      '`Glob + Grep`（MCP 未配置）',
    )

    // 4) Any remaining bare references (safety net)
    processed = processed.replace(/\{\{MCP_SEARCH_TOOL\}\}/g, 'Glob + Grep')

    // 5) MCP_SEARCH_PARAM — not applicable when skipped
    processed = processed.replace(/\{\{MCP_SEARCH_PARAM\}\}/g, '')
  }
  else if (mcpProvider === 'contextweaver') {
    // ContextWeaver MCP tools
    processed = processed.replace(/\{\{MCP_SEARCH_TOOL\}\}/g, 'mcp__contextweaver__codebase-retrieval')
    processed = processed.replace(/\{\{MCP_SEARCH_PARAM\}\}/g, 'information_request')
  }
  else if (mcpProvider === 'fast-context') {
    // Fast Context (Windsurf) MCP tools
    processed = processed.replace(/\{\{MCP_SEARCH_TOOL\}\}/g, 'mcp__fast-context__fast_context_search')
    processed = processed.replace(/\{\{MCP_SEARCH_PARAM\}\}/g, 'query')
  }
  else {
    // ace-tool / ace-tool-rs MCP tools (default)
    processed = processed.replace(/\{\{MCP_SEARCH_TOOL\}\}/g, 'mcp__ace-tool__search_context')
    processed = processed.replace(/\{\{MCP_SEARCH_PARAM\}\}/g, 'query')
  }

  return processed
}

/**
 * Replace ~ paths in template content with absolute paths.
 * Fixes Windows multi-user path resolution issues.
 *
 * IMPORTANT: Always use forward slashes (/) for cross-platform compatibility.
 * Windows Git Bash requires forward slashes in heredoc (backslashes get escaped).
 * PowerShell and CMD also support forward slashes for most commands.
 */
export function replaceHomePathsInTemplate(content: string, installDir: string): string {
  // Get absolute paths for replacement
  const userHome = homedir()
  const ccgDir = join(installDir, '.ccg')
  const binDir = join(installDir, 'bin')
  const claudeDir = installDir // ~/.claude

  // IMPORTANT: Always use forward slashes for cross-platform compatibility
  // Git Bash on Windows requires forward slashes in heredoc (backslashes get escaped)
  // PowerShell and CMD also support forward slashes for most commands
  const toForwardSlash = (path: string) => path.replace(/\\/g, '/')

  let processed = content

  // Order matters: replace longer patterns first to avoid partial matches
  // 1. Replace ~/.claude/.ccg with absolute path (longest match first)
  processed = processed.replace(/~\/\.claude\/\.ccg/g, toForwardSlash(ccgDir))

  // 2. Replace ~/.claude/bin/codeagent-wrapper with absolute path + .exe on Windows
  //    CRITICAL: Windows Git Bash requires explicit .exe extension
  const wrapperName = isWindows() ? 'codeagent-wrapper.exe' : 'codeagent-wrapper'
  const wrapperPath = `${toForwardSlash(binDir)}/${wrapperName}`
  processed = processed.replace(/~\/\.claude\/bin\/codeagent-wrapper/g, wrapperPath)

  // 3. Replace ~/.claude/bin with absolute path (for other binaries)
  processed = processed.replace(/~\/\.claude\/bin/g, toForwardSlash(binDir))

  // 4. Replace ~/.claude with absolute path
  processed = processed.replace(/~\/\.claude/g, toForwardSlash(claudeDir))

  // 5. Replace remaining ~/ patterns with user home
  processed = processed.replace(/~\//g, `${toForwardSlash(userHome)}/`)

  return processed
}
