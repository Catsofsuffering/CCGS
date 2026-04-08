## 1. Define the Codex-native entrypoint

- [x] 1.1 Add proposal, design, and spec artifacts for the Codex-native entrypoint change
- [x] 1.2 Define the minimal Codex skill set and the installer ownership boundaries

## 2. Lock behavior with tests

- [x] 2.1 Add failing tests that require installation of top-level Codex workflow skills
- [x] 2.2 Add failing tests that reject Codex skill content which redirects the user back to Claude slash commands
- [x] 2.3 Add failing tests that require uninstall isolation for user-owned Codex skills

## 3. Implement the Codex-native installer path

- [x] 3.1 Add Codex workflow skill templates for `ccg-spec-init`, `ccg-spec-plan`, and `ccg-spec-impl`
- [x] 3.2 Extend installer logic to copy CCG-owned Codex workflow skills into the Codex skills home
- [x] 3.3 Extend uninstall logic to remove only the CCG-owned Codex workflow skills
- [x] 3.4 Update install result reporting and init summary output so Codex workflow skills are visible after install

## 4. Validate and document

- [x] 4.1 Run targeted installer tests for the Codex-native path
- [x] 4.2 Run typecheck and build after the installer changes land
- [x] 4.3 Update README and AGENTS guidance so the primary usage path names the new Codex-native entrypoint
