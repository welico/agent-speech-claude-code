# Plan: Rename Plugin to agent-speech

**Feature ID**: rename-to-agent-speech
**Status**: 📋 Planned
**Created**: 2026-02-20
**Priority**: Medium

## Overview

Rename the plugin from "agent-speech" to "agent-speech" across all files, configurations, and documentation to provide a shorter, more memorable name.

## Background

The current plugin name "agent-speech" is descriptive but lengthy. The shorter "agent-speech" name:
- Is easier to type and remember
- Follows common naming conventions (e.g., "eslint", "prettier")
- Reduces redundancy (plugin is implied by context)
- Maintains brand identity while being more concise

## Scope

### Files to Rename

1. **Package Configuration**
   - `package.json` - name field

2. **Directory Structure**
   - `.claude-plugin/agent-speech/` → `.claude-plugin/agent-speech/`

3. **Plugin Configuration**
   - `.claude-plugin/agent-speech/plugin.json`
   - `.claude-plugin/marketplace.json`

4. **Release Artifacts** (scripts)
   - `scripts/package-release.sh`
   - `scripts/create-github-release.sh`
   - `scripts/test-installation.sh`

5. **Documentation**
   - `README.md`
   - `INSTALL.md`
   - `CLAUDE.md`
   - `docs/marketplace-setup.md`
   - `docs/marketplace-implementation-summary.md`
   - `docs/CLAUDE_CODE_INTEGRATION.md`
   - `docs/04-report/features/agent-speech-v1.report.md`
   - `docs/04-report/agent-speech-v1-completion-summary.md`

6. **Source Code References**
   - `.mcp.json`
   - `src/infrastructure/mcp-server.ts`

7. **Example Files**
   - `docs/examples/claude-code-config.json`

8. **BKit Memory**
   - `.bkit-memory.json`
   - `docs/.pdca-status.json`

### Text Replacements

All occurrences of the following patterns will be replaced:
- `"agent-speech"` → `"agent-speech"` (package name)
- `agent-speech` → `agent-speech` (directory/file references)
- `@agent-speech` → `@agent-speech` (if used in imports)

### Exclusions

The following will NOT be changed:
- Git history (commit messages, tags)
- Archived PDCA documents (historical accuracy)
- Existing release artifacts (already published)
- npm package lock file (will be regenerated)

## Implementation Order

### Phase 1: Core Configuration
1. Update `package.json` name field
2. Rename plugin directory
3. Update plugin manifests

### Phase 2: Source Code
4. Update source code references
5. Update MCP configuration
6. Update example files

### Phase 3: Documentation
7. Update main documentation (README, INSTALL, CLAUDE.md)
8. Update guides and integration docs
9. Update archived references (if needed)

### Phase 4: Scripts
10. Update packaging scripts
11. Update release scripts
12. Update test scripts

### Phase 5: BKit Integration
13. Update .bkit-memory.json
14. Update .pdca-status.json
15. Clean up and verify

## Success Criteria

- [ ] All files use "agent-speech" instead of "agent-speech"
- [ ] Plugin directory renamed to `.claude-plugin/agent-speech/`
- [ ] `package.json` name is "agent-speech"
- [ ] All documentation updated consistently
- [ ] Scripts generate correct package names
- [ ] No broken references or imports
- [ ] Build completes successfully
- [ ] All tests pass

## Dependencies

None - This is a standalone refactoring task.

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Broken imports after rename | High | Use global replace with verification |
| Release scripts generate wrong name | Medium | Test packaging after changes |
| Documentation inconsistencies | Medium | Comprehensive search and replace |
| Git history confusion | Low | Keep clear commit message |

## Notes

- This change affects the npm package name
- Users will need to install using the new name
- Consider creating a deprecation notice for old name
- Update any marketplace listings or documentation that references the old name
- The bin command `agent-speech` already uses the short name, so no CLI changes needed

## Next Steps

1. Review this plan
2. Proceed to Design phase for detailed implementation strategy
3. Execute changes in Do phase
4. Verify all references updated correctly
