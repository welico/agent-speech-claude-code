# Claude Code-Specific Refactoring Planning Document

> **Summary**: Refactor agent-speech-claude-code to be Claude Code-specific, simplifying architecture by removing multi-CLI support
>
> **Project**: agent-speech-claude-code
> **Version**: 0.1.0
> **Author**: welico
> **Date**: 2026-02-20
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

Simplify the agent-speech-claude-code architecture by making it Claude Code-specific only. This refactoring removes the complexity of supporting multiple CLI tools (OpenCode, Codex-CLI, Gemini-CLI) that were never implemented, allowing the codebase to focus on Claude Code integration exclusively.

### 1.2 Background

The original design envisioned agent-speech-claude-code as a universal TTS solution for multiple AI CLI tools. However, in practice:
- Only Claude Code integration has been implemented
- Multi-CLI abstraction layer adds unnecessary complexity
- Users are specifically Claude Code developers
- Marketplace distribution is via Claude Code's plugin system

**Current State Analysis:**
- `src/plugins/` directory structure anticipates multiple CLI tools
- Plugin interface abstraction exists but only Claude Code implementation
- Documentation mentions "AI CLI tools" generically
- Configuration structure supports per-tool settings (unused)

**New Naming Convention:**
- **Marketplace**: `welico` (unchanged - marketplace identity)
- **Plugin**: `agent-speech` (simplified from `agent-speech-claude-code`)

### 1.3 Related Documents

- Current Architecture: `CLAUDE.md`
- Marketplace Config: `.claude-plugin/marketplace.json`
- Plugin Config: `.claude-plugin/agent-speech-claude-code/plugin.json`

---

## 2. Scope

### 2.1 In Scope

- [ ] Remove multi-CLI abstraction layer (`src/plugins/` directory structure)
- [ ] Simplify plugin interface (remove generic `PluginInterface`)
- [ ] Update all documentation to reflect Claude Code-specific focus
- [ ] Clean up configuration schema (remove per-tool settings)
- [ ] Update marketplace metadata (plugin name: `agent-speech`)
- [ ] Remove references to OpenCode, Codex-CLI, Gemini-CLI from docs
- [ ] Simplify README to focus on Claude Code usage
- [ ] Update package.json description and keywords

### 2.2 Out of Scope

- Changes to TTS core functionality (macOS `say` command integration)
- MCP server architecture (remains unchanged)
- Configuration storage mechanism (`~/.agent-speech/config.json`)
- Skill command implementation (`/agent-speech` commands)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Remove `src/plugins/` directory and abstraction layer | High | Pending |
| FR-02 | Move Claude Code implementation to `src/` root level | High | Pending |
| FR-03 | Update `plugin.json` name field to `agent-speech` | High | Pending |
| FR-04 | Update `marketplace.json` plugins array entry | High | Pending |
| FR-05 | Remove per-tool configuration settings from config schema | Medium | Pending |
| FR-06 | Update README.md to Claude Code-specific content | Medium | Pending |
| FR-07 | Update CLAUDE.md architecture section | Medium | Pending |
| FR-08 | Remove multi-CLI references from all documentation | Low | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Code Quality | Zero ESLint errors after refactoring | `pnpm lint` |
| Build | TypeScript compilation succeeds | `pnpm build` |
| Functionality | All `/agent-speech` commands still work | Manual testing |
| Documentation | No references to removed tools exist | `grep -r "opencode\|codex-cli\|gemini-cli"` |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] All functional requirements implemented
- [ ] Zero references to removed CLI tools in codebase
- [ ] Plugin name changed to `agent-speech` across all configs
- [ ] README reflects Claude Code-specific positioning
- [ ] Build succeeds with no errors
- [ ] ESLint passes with no warnings
- [ ] All skill commands functional

### 4.2 Quality Criteria

- [ ] Codebase simplified by estimated 30% reduction
- [ ] No breaking changes to existing functionality
- [ ] Configuration backward compatible (old configs still work)
- [ ] Documentation consistent with new scope

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Breaking existing user configurations | High | Medium | Maintain backward compatibility in config loader |
| Marketplace installation issues | Medium | Low | Test installation flow after name change |
| Documentation inconsistency | Medium | Medium | Comprehensive grep search for outdated references |
| Git history confusion | Low | Low | Clear commit message explaining refactoring |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | ✅ Current - Simple structure, macOS CLI tool | macOS-only CLI plugins, focused utilities | ☑️ |
| **Dynamic** | Feature-based modules, BaaS integration | Web apps with backend | ☐ |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems | ☐ |

**Rationale**: This refactoring reinforces Starter level by simplifying to a single-purpose tool.

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Plugin Architecture | Multi-CLI abstraction / Single-tool direct | Single-tool direct | Only Claude Code implemented |
| File Structure | `src/plugins/` / `src/` | `src/` | Simplification |
| Config Schema | Per-tool settings / Global settings | Global settings | Multi-tool not needed |
| Documentation | Generic AI CLI / Claude Code specific | Claude Code specific | Alignment with actual use |

### 6.3 Clean Architecture Approach

```
Current Architecture:
┌─────────────────────────────────────────────────────┐
│ src/                                                │
│   core/ (tts.ts, config.ts, filter.ts)              │
│   plugins/                                          │
│     claude-code.ts  ← Only implemented              │
│     opencode.ts      ← Never implemented            │
│     codex-cli.ts     ← Never implemented            │
│     gemini-cli.ts    ← Never implemented            │
│   types/index.ts                                    │
│   index.ts                                           │
└─────────────────────────────────────────────────────┘

Target Architecture (After Refactoring):
┌─────────────────────────────────────────────────────┐
│ src/                                                │
│   core/ (tts.ts, config.ts, filter.ts)              │
│   claude-code.ts  ← Moved from plugins/             │
│   types/index.ts                                    │
│   index.ts                                           │
└─────────────────────────────────────────────────────┘
```

**Simplified Structure:**
- Remove `src/plugins/` directory entirely
- Move `claude-code.ts` to `src/` root
- Remove `PluginInterface` abstraction (unused)
- Update all imports referencing plugins

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

Check which conventions already exist in the project:

- [x] `CLAUDE.md` has coding conventions section
- [ ] `docs/01-plan/conventions.md` exists (Phase 2 output)
- [ ] `CONVENTIONS.md` exists at project root
- [x] ESLint configuration (`.eslintrc.*`)
- [ ] Prettier configuration (`.prettierrc`)
- [x] TypeScript configuration (`tsconfig.json`)

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | ✅ Exists | No changes needed | High |
| **Folder structure** | ⚠️ Multi-CLI | Simplify to single-tool | High |
| **Import order** | ✅ Exists | No changes needed | Medium |
| **Error handling** | ✅ Exists | No changes needed | Medium |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| None | CLI tool uses config file | N/A | N/A |

### 7.4 Pipeline Integration

Not applicable - This is a refactoring of existing Starter-level project, not a new project following the 9-phase pipeline.

---

## 8. Next Steps

1. [ ] Write design document (`claude-code-refactoring.design.md`)
2. [ ] Create file-by-file refactoring checklist
3. [ ] Execute refactoring in sequence (core → plugins → docs)
4. [ ] Test all `/agent-speech` commands
5. [ ] Verify marketplace installation flow

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-20 | Initial draft | welico |
