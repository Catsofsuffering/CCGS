## ADDED Requirements

### Requirement: Installer manages CCG-owned Codex workflow skills

The installer SHALL create and update the CCG-owned Codex workflow skills as part of the primary workflow installation.

#### Scenario: Installer targets the Codex skills home

- **WHEN** the workflow installer runs
- **THEN** it copies the CCG-owned Codex workflow skills into the Codex skills home
- **AND** the copied skill content reflects the configured routing and path variables

#### Scenario: Install summary exposes Codex workflow assets

- **WHEN** installation completes
- **THEN** the result surface includes the installed Codex workflow skills so the user can see that the Codex-native entrypoint is available

### Requirement: Uninstall preserves user-owned Codex skills

The uninstall path SHALL remove only the known CCG-owned Codex workflow skills and MUST NOT remove unrelated user-owned Codex skills.

#### Scenario: User has custom Codex skills

- **WHEN** the workflow uninstall path runs on a machine that also contains user-created Codex skills
- **THEN** the CCG-owned Codex workflow skills are removed
- **AND** unrelated user-owned Codex skills remain in place
