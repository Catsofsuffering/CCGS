#!/bin/bash

# 批量替换命令模板中的 MCP 硬编码为占位符变量

set -e

echo "开始批量替换 MCP 硬编码..."

# 需要处理的文件列表
FILES=(
  "templates/commands/analyze.md"
  "templates/commands/backend.md"
  "templates/commands/bugfix.md"
  "templates/commands/code.md"
  "templates/commands/debug.md"
  "templates/commands/enhance.md"
  "templates/commands/frontend.md"
  "templates/commands/optimize.md"
  "templates/commands/review.md"
  "templates/commands/scan.md"
  "templates/commands/test.md"
  "templates/commands/think.md"
  "templates/commands/agents/planner.md"
  "templates/commands/agents/ui-ux-designer.md"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "处理: $file"

    # 1. 替换调用说明（英文）
    sed -i.bak 's/Call `mcp__ace-tool__search_context`/Call `{{MCP_SEARCH_TOOL}}`/g' "$file"
    sed -i.bak 's/Call `mcp__ace-tool__enhance_prompt`/Call `{{MCP_ENHANCE_TOOL}}`/g' "$file"

    # 2. 替换调用说明（中文）
    sed -i.bak 's/调用 `mcp__ace-tool__search_context`/调用 `{{MCP_SEARCH_TOOL}}`/g' "$file"
    sed -i.bak 's/调用 `mcp__ace-tool__enhance_prompt`/调用 `{{MCP_ENHANCE_TOOL}}`/g' "$file"

    # 3. 替换工具调用本身
    sed -i.bak 's/mcp__ace-tool__search_context/{{MCP_SEARCH_TOOL}}/g' "$file"
    sed -i.bak 's/mcp__ace-tool__enhance_prompt/{{MCP_ENHANCE_TOOL}}/g' "$file"

    # 4. 替换参数名（需要更精确的匹配）
    # 这部分可能需要手动调整，因为参数结构不同

    # 删除备份文件
    rm -f "${file}.bak"

    echo "  ✓ 完成"
  else
    echo "  ⚠ 文件不存在: $file"
  fi
done

echo ""
echo "✅ 批量替换完成！"
echo "⚠ 注意：请手动检查以下文件中的参数名替换："
echo "   - 某些文件可能需要将 'query' 改为 '{{MCP_SEARCH_PARAM}}'"
echo "   - 某些文件可能需要将 'prompt' 改为 '{{MCP_ENHANCE_PARAM}}'"
