# Contributing to CCSM

Thanks for your interest in contributing to CCSM. This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)

### Getting Started

```bash
# Clone the repository
git clone <your-ccsm-repository-url>
cd ccsm

# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test
```

### Project Structure

```
ccsm/
├── src/                    # TypeScript source
│   ├── cli.ts              # CLI entry point
│   ├── commands/           # CLI commands (init, update, menu, etc.)
│   └── utils/              # Shared utilities
├── templates/              # Installed to ~/.claude/
│   ├── commands/           # 26 slash command templates (.md)
│   ├── prompts/            # Expert prompts (codex/ + claude/)
│   └── skills/             # Quality gates + orchestration
├── claude-monitor/         # Claude hook monitor server/client
├── tests/                  # Vitest test files
└── bin/                    # Build output + pre-compiled binaries
```

### Key Files

| File | Purpose |
|------|---------|
| `src/utils/installer.ts` | Core installation logic |
| `src/utils/config.ts` | Configuration management |
| `src/utils/mcp.ts` | MCP tool integration |
| `templates/commands/*.md` | Slash command templates |
| `templates/prompts/` | Expert prompts for Codex/Claude |

## How to Contribute

### Find an Issue

- Check the repository's `good first issue` label for beginner-friendly tasks
- Check the repository's `help wanted` label for tasks needing assistance
- Or open a new issue to propose your idea

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Build: `pnpm build`
6. Commit with conventional format: `git commit -m "feat: add something"`
7. Push and create a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Usage |
|--------|-------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `test:` | Adding or updating tests |
| `refactor:` | Code refactoring (no behavior change) |
| `chore:` | Build, CI, dependency updates |

### Code Standards

- **TypeScript**: Follow existing patterns in `src/`
- **Templates**: Markdown files in `templates/commands/` — use `{{VARIABLE}}` for template variables
- **Tests**: Use Vitest, place tests in `tests/` mirroring `src/` structure
- **Metrics**: Function complexity < 10, single function < 50 lines, single file < 500 lines

### What Makes a Good PR

- **Focused**: One concern per PR
- **Tested**: Include tests for new functionality
- **Documented**: Update README if adding user-facing features
- **Small**: Prefer multiple small PRs over one large one

## Good First Issues

Good first issues are designed to be completable in ~2 hours. They typically involve:

- **Documentation**: Fix typos, improve examples, add missing descriptions
- **i18n**: Add missing translations in command templates
- **Tests**: Write tests for untested utility functions
- **Templates**: Improve slash command templates with better examples
- **Small fixes**: Single-file bug fixes in `src/utils/`

Each good first issue includes:
- Clear problem description
- Specific files to modify
- Acceptance criteria
- Verification commands

## Review Process

| Event | Timeline |
|-------|----------|
| Issue claimed | Assigned within 1 day |
| PR submitted | First review within 3 days |
| After review feedback | Contributor has 5 days to respond |
| No response | Issue unassigned (you can reclaim later) |

## Questions?

- Open a repository Discussion
- Check existing Issues

---

Thank you for contributing!
