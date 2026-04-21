# Workflow Guide

## Default path

Use this when you want the maintained product path:

```bash
/ccsm:spec-init
/ccsm:spec-research <request>
/ccsm:spec-plan
/ccsm:team-plan
/ccsm:team-exec
/ccsm:team-review
/ccsm:spec-review
openspec archive <change-id>
```

## Managed shortcut

Use this when you want Codex to dispatch Claude work and keep acceptance in the same loop:

```bash
/ccsm:spec-impl
```

## When to use `team-*`

Use the `team-*` steps when the change has enough scope to justify a bounded execution packet and a review pass before acceptance.

## When to use `context` and `enhance`

- Use `/ccsm:enhance` when the request is underspecified.
- Use `/ccsm:context` when the project needs decision logs or working context snapshots.

## What is no longer the default

The following are no longer part of the maintained path:

- wrapper-based execution
- compatibility quick flows
- legacy multi-command “autopilot” paths

The repo may still contain historical references, but they are not the product direction.
