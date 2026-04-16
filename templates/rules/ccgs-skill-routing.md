# CCGS Domain Knowledge - Auto-routing Rules

When the user's request matches trigger keywords below, automatically READ the corresponding skill file to gain domain expertise before responding. These knowledge files are installed at `~/.claude/skills/ccgs/domains/`.

**IMPORTANT**: Read the skill file FIRST, then respond. Do NOT fabricate domain knowledge from training data when a skill file exists.

## Security Domain (`domains/security/`)

| Trigger Keywords | Skill File | Description |
|------------------|-----------|-------------|
| pentest, red team, exploit, C2, lateral movement, privilege escalation, evasion, persistence | `~/.claude/skills/ccgs/domains/security/red-team.md` | Red team attack techniques |
| blue team, alert, IOC, incident response, forensics, SIEM, EDR, containment | `~/.claude/skills/ccgs/domains/security/blue-team.md` | Blue team defense and incident response |
| web pentest, API security, OWASP, SQLi, XSS, SSRF, RCE, injection | `~/.claude/skills/ccgs/domains/security/pentest.md` | Web and API penetration testing |
| code audit, dangerous function, taint analysis, sink, source | `~/.claude/skills/ccgs/domains/security/code-audit.md` | Source code security audit |
| binary, reversing, PWN, fuzzing, stack overflow, heap overflow, ROP | `~/.claude/skills/ccgs/domains/security/vuln-research.md` | Vulnerability research and exploitation |
| OSINT, threat intelligence, threat modeling, ATT&CK, threat hunting | `~/.claude/skills/ccgs/domains/security/threat-intel.md` | Threat intelligence and OSINT |

## Architecture Domain (`domains/architecture/`)

| Trigger Keywords | Skill File |
|------------------|-----------|
| API design, REST, GraphQL, gRPC, endpoint, versioning | `~/.claude/skills/ccgs/domains/architecture/api-design.md` |
| caching, Redis, Memcached, cache invalidation, CDN | `~/.claude/skills/ccgs/domains/architecture/caching.md` |
| cloud native, Kubernetes, Docker, microservice, service mesh | `~/.claude/skills/ccgs/domains/architecture/cloud-native.md` |
| message queue, Kafka, RabbitMQ, event driven, pub/sub | `~/.claude/skills/ccgs/domains/architecture/message-queue.md` |
| security architecture, zero trust, defense in depth, IAM | `~/.claude/skills/ccgs/domains/architecture/security-arch.md` |

## AI / MLOps Domain (`domains/ai/`)

| Trigger Keywords | Skill File |
|------------------|-----------|
| RAG, retrieval augmented, vector database, embedding, chunking | `~/.claude/skills/ccgs/domains/ai/rag-system.md` |
| AI agent, tool use, function calling, agent framework, orchestration | `~/.claude/skills/ccgs/domains/ai/agent-dev.md` |
| LLM security, prompt injection, jailbreak, guardrail | `~/.claude/skills/ccgs/domains/ai/llm-security.md` |
| prompt engineering, model evaluation, benchmark, fine-tuning | `~/.claude/skills/ccgs/domains/ai/prompt-and-eval.md` |

## DevOps Domain (`domains/devops/`)

| Trigger Keywords | Skill File |
|------------------|-----------|
| Git workflow, branching strategy, trunk-based, GitFlow | `~/.claude/skills/ccgs/domains/devops/git-workflow.md` |
| testing strategy, unit test, integration test, e2e, test pyramid | `~/.claude/skills/ccgs/domains/devops/testing.md` |
| database, migration, schema design, indexing, query optimization | `~/.claude/skills/ccgs/domains/devops/database.md` |
| performance, profiling, load test, latency, throughput | `~/.claude/skills/ccgs/domains/devops/performance.md` |
| observability, logging, tracing, metrics, Prometheus, Grafana | `~/.claude/skills/ccgs/domains/devops/observability.md` |
| DevSecOps, CI security, SAST, DAST, supply chain | `~/.claude/skills/ccgs/domains/devops/devsecops.md` |
| cost optimization, cloud cost, FinOps, resource right-sizing | `~/.claude/skills/ccgs/domains/devops/cost-optimization.md` |

## Development Domain (`domains/development/`)

When the user is working with a specific programming language, read the corresponding skill file for language-specific best practices:

| Language | Skill File |
|----------|-----------|
| Python | `~/.claude/skills/ccgs/domains/development/python.md` |
| Go | `~/.claude/skills/ccgs/domains/development/go.md` |
| Rust | `~/.claude/skills/ccgs/domains/development/rust.md` |
| TypeScript / JavaScript | `~/.claude/skills/ccgs/domains/development/typescript.md` |
| Java / Kotlin | `~/.claude/skills/ccgs/domains/development/java.md` |
| C / C++ | `~/.claude/skills/ccgs/domains/development/cpp.md` |
| Shell / Bash | `~/.claude/skills/ccgs/domains/development/shell.md` |

## Frontend Design Domain (`domains/frontend-design/`)

| Trigger Keywords | Skill File |
|------------------|-----------|
| UI aesthetics, visual design, color theory, layout | `~/.claude/skills/ccgs/domains/frontend-design/ui-aesthetics.md` |
| UX principles, usability, user flow, information architecture | `~/.claude/skills/ccgs/domains/frontend-design/ux-principles.md` |
| component patterns, design system, atomic design | `~/.claude/skills/ccgs/domains/frontend-design/component-patterns.md` |
| state management, Redux, Zustand, Pinia, context | `~/.claude/skills/ccgs/domains/frontend-design/state-management.md` |
| frontend engineering, build tool, bundler, SSR, SSG | `~/.claude/skills/ccgs/domains/frontend-design/engineering.md` |
| claymorphism | `~/.claude/skills/ccgs/domains/frontend-design/claymorphism/SKILL.md` |
| glassmorphism | `~/.claude/skills/ccgs/domains/frontend-design/glassmorphism/SKILL.md` |
| liquid glass | `~/.claude/skills/ccgs/domains/frontend-design/liquid-glass/SKILL.md` |
| neubrutalism | `~/.claude/skills/ccgs/domains/frontend-design/neubrutalism/SKILL.md` |

## Routing Rules

1. **Keyword match is fuzzy**: Match on intent, not exact string. "How to do SQL injection testing" triggers `pentest.md`.
2. **Multiple matches**: If a request spans two domains, read both skill files.
3. **Language detection**: Automatically detect the programming language from file extensions or context, then read the corresponding development skill.
4. **Read once per conversation**: No need to re-read the same skill file within the same conversation.
5. **Skill files are authoritative**: When a skill file contradicts training data, the skill file wins.
