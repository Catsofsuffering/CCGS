# CCSM Domain Knowledge - Auto-routing Rules

When the user's request matches trigger keywords below, automatically READ the corresponding skill file to gain domain expertise before responding. These knowledge files are installed at `~/.ccsm/skills/ccsm/domains/`.

**IMPORTANT**: Read the skill file FIRST, then respond. Do NOT fabricate domain knowledge from training data when a skill file exists.

## Security Domain (`domains/security/`)

| Trigger Keywords | Skill File | Description |
|------------------|-----------|-------------|
| pentest, red team, exploit, C2, lateral movement, privilege escalation, evasion, persistence | `~/.ccsm/skills/ccsm/domains/security/red-team.md` | Red team attack techniques |
| blue team, alert, IOC, incident response, forensics, SIEM, EDR, containment | `~/.ccsm/skills/ccsm/domains/security/blue-team.md` | Blue team defense and incident response |
| web pentest, API security, OWASP, SQLi, XSS, SSRF, RCE, injection | `~/.ccsm/skills/ccsm/domains/security/pentest.md` | Web and API penetration testing |
| code audit, dangerous function, taint analysis, sink, source | `~/.ccsm/skills/ccsm/domains/security/code-audit.md` | Source code security audit |
| binary, reversing, PWN, fuzzing, stack overflow, heap overflow, ROP | `~/.ccsm/skills/ccsm/domains/security/vuln-research.md` | Vulnerability research and exploitation |
| OSINT, threat intelligence, threat modeling, ATT&CK, threat hunting | `~/.ccsm/skills/ccsm/domains/security/threat-intel.md` | Threat intelligence and OSINT |

## Architecture Domain (`domains/architecture/`)

| Trigger Keywords | Skill File |
|------------------|-----------|
| API design, REST, GraphQL, gRPC, endpoint, versioning | `~/.ccsm/skills/ccsm/domains/architecture/api-design.md` |
| caching, Redis, Memcached, cache invalidation, CDN | `~/.ccsm/skills/ccsm/domains/architecture/caching.md` |
| cloud native, Kubernetes, Docker, microservice, service mesh | `~/.ccsm/skills/ccsm/domains/architecture/cloud-native.md` |
| message queue, Kafka, RabbitMQ, event driven, pub/sub | `~/.ccsm/skills/ccsm/domains/architecture/message-queue.md` |
| security architecture, zero trust, defense in depth, IAM | `~/.ccsm/skills/ccsm/domains/architecture/security-arch.md` |

## AI / MLOps Domain (`domains/ai/`)

| Trigger Keywords | Skill File |
|------------------|-----------|
| RAG, retrieval augmented, vector database, embedding, chunking | `~/.ccsm/skills/ccsm/domains/ai/rag-system.md` |
| AI agent, tool use, function calling, agent framework, orchestration | `~/.ccsm/skills/ccsm/domains/ai/agent-dev.md` |
| LLM security, prompt injection, jailbreak, guardrail | `~/.ccsm/skills/ccsm/domains/ai/llm-security.md` |
| prompt engineering, model evaluation, benchmark, fine-tuning | `~/.ccsm/skills/ccsm/domains/ai/prompt-and-eval.md` |

## DevOps Domain (`domains/devops/`)

| Trigger Keywords | Skill File |
|------------------|-----------|
| Git workflow, branching strategy, trunk-based, GitFlow | `~/.ccsm/skills/ccsm/domains/devops/git-workflow.md` |
| testing strategy, unit test, integration test, e2e, test pyramid | `~/.ccsm/skills/ccsm/domains/devops/testing.md` |
| database, migration, schema design, indexing, query optimization | `~/.ccsm/skills/ccsm/domains/devops/database.md` |
| performance, profiling, load test, latency, throughput | `~/.ccsm/skills/ccsm/domains/devops/performance.md` |
| observability, logging, tracing, metrics, Prometheus, Grafana | `~/.ccsm/skills/ccsm/domains/devops/observability.md` |
| DevSecOps, CI security, SAST, DAST, supply chain | `~/.ccsm/skills/ccsm/domains/devops/devsecops.md` |
| cost optimization, cloud cost, FinOps, resource right-sizing | `~/.ccsm/skills/ccsm/domains/devops/cost-optimization.md` |

## Development Domain (`domains/development/`)

When the user is working with a specific programming language, read the corresponding skill file for language-specific best practices:

| Language | Skill File |
|----------|-----------|
| Python | `~/.ccsm/skills/ccsm/domains/development/python.md` |
| Go | `~/.ccsm/skills/ccsm/domains/development/go.md` |
| Rust | `~/.ccsm/skills/ccsm/domains/development/rust.md` |
| TypeScript / JavaScript | `~/.ccsm/skills/ccsm/domains/development/typescript.md` |
| Java / Kotlin | `~/.ccsm/skills/ccsm/domains/development/java.md` |
| C / C++ | `~/.ccsm/skills/ccsm/domains/development/cpp.md` |
| Shell / Bash | `~/.ccsm/skills/ccsm/domains/development/shell.md` |

## Frontend Design Domain (`domains/frontend-design/`)

| Trigger Keywords | Skill File |
|------------------|-----------|
| UI aesthetics, visual design, color theory, layout | `~/.ccsm/skills/ccsm/domains/frontend-design/ui-aesthetics.md` |
| UX principles, usability, user flow, information architecture | `~/.ccsm/skills/ccsm/domains/frontend-design/ux-principles.md` |
| component patterns, design system, atomic design | `~/.ccsm/skills/ccsm/domains/frontend-design/component-patterns.md` |
| state management, Redux, Zustand, Pinia, context | `~/.ccsm/skills/ccsm/domains/frontend-design/state-management.md` |
| frontend engineering, build tool, bundler, SSR, SSG | `~/.ccsm/skills/ccsm/domains/frontend-design/engineering.md` |
| claymorphism | `~/.ccsm/skills/ccsm/domains/frontend-design/claymorphism/SKILL.md` |
| glassmorphism | `~/.ccsm/skills/ccsm/domains/frontend-design/glassmorphism/SKILL.md` |
| liquid glass | `~/.ccsm/skills/ccsm/domains/frontend-design/liquid-glass/SKILL.md` |
| neubrutalism | `~/.ccsm/skills/ccsm/domains/frontend-design/neubrutalism/SKILL.md` |

## Routing Rules

1. **Keyword match is fuzzy**: Match on intent, not exact string. "How to do SQL injection testing" triggers `pentest.md`.
2. **Multiple matches**: If a request spans two domains, read both skill files.
3. **Language detection**: Automatically detect the programming language from file extensions or context, then read the corresponding development skill.
4. **Read once per conversation**: No need to re-read the same skill file within the same conversation.
5. **Skill files are authoritative**: When a skill file contradicts training data, the skill file wins.
