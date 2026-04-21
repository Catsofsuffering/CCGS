---
name: ccsm-skills
description: CCSM skills - quality gates, documentation generator, and multi-agent orchestration. Auto-installed by the CCSM workflow system.
license: MIT
user-invocable: false
disable-model-invocation: false
---

# CCSM Skills

## Directory Structure

```
skills/
├── tools/            # Quality gate tools
│   ├── verify-security/   # Security vulnerability scanning
│   ├── verify-quality/    # Code quality checking
│   ├── verify-change/     # Change analysis & doc sync
│   ├── verify-module/     # Module completeness validation
│   ├── gen-docs/          # README.md & DESIGN.md generator
│   └── lib/               # Shared utilities
├── orchestration/    # Multi-agent coordination
│   └── multi-agent/       # Ant colony-inspired coordination
├── run_skill.js      # Unified skill runner
└── SKILL.md          # This file
```

## Quick Navigation

| Category | Description | Entry |
|----------|-------------|-------|
| **Quality Gates** | Module completeness, security, quality, change validation | [Quality Gates](#quality-gates) |
| **Multi-Agent** | Multi-agent coordination and task decomposition | [Multi-Agent](#multi-agent-orchestration) |

---

## Quality Gates

**Mandatory quality checkpoints to ensure deliverable standards.**

| Skill | Trigger | Description |
|-------|---------|-------------|
| `/verify-module` | New module completed | Module structure & documentation completeness |
| `/verify-security` | New module / security changes / refactoring | Security vulnerability scanning |
| `/verify-change` | Design-level changes / refactoring | Document sync & change impact analysis |
| `/verify-quality` | Complex modules / refactoring | Code quality metrics checking |
| `/gen-docs` | New module created | README.md & DESIGN.md skeleton generator |

### Auto-trigger Rules

```
New module:     /gen-docs → develop → /verify-module → /verify-security
Code changes:   develop → /verify-change → /verify-quality
Security tasks: execute → /verify-security
Refactoring:    refactor → /verify-change → /verify-quality → /verify-security
```

### Running Skills

```bash
# Unified runner
node ~/.ccsm/skills/ccsm/run_skill.js <skill-name> [args...]

# Examples
node ~/.ccsm/skills/ccsm/run_skill.js verify-security ./src
node ~/.ccsm/skills/ccsm/run_skill.js verify-quality ./src -v
node ~/.ccsm/skills/ccsm/run_skill.js verify-change --mode staged
node ~/.ccsm/skills/ccsm/run_skill.js verify-module ./my-module
node ~/.ccsm/skills/ccsm/run_skill.js gen-docs ./new-module --force
```

---

## Multi-Agent Orchestration

| Skill | Trigger | Description |
|-------|---------|-------------|
| `multi-agent` | TeamCreate, parallel tasks, multi-agent | Ant colony-inspired multi-agent coordination |

Provides:
- Agent role system (Lead/Scout/Worker/Soldier/Drone)
- Pheromone-based indirect communication
- File ownership locking & conflict avoidance
- Adaptive concurrency control
- TeamCreate vs single-agent decision tree

---

## Installed by CCSM

These skills are automatically installed during `npx ccsm-workflow` initialization.
To update: run `npx ccsm-workflow update` or `npx ccsm-workflow` again.
