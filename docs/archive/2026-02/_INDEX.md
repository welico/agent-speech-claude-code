# Archive Index - February 2026

## Features

### readme-usage-docs

| Phase | Document | Status | Date |
|-------|----------|--------|------|
| Plan | [readme-usage-docs.plan.md](./readme-usage-docs/readme-usage-docs.plan.md) | ✅ Complete | 2026-02-13 |
| Design | [readme-usage-docs.design.md](./readme-usage-docs/readme-usage-docs.design.md) | ✅ Complete | 2026-02-13 |
| Check | [readme-usage-docs-gap.md](./readme-usage-docs/readme-usage-docs-gap.md) | ✅ Complete | 2026-02-13 |
| Report | [readme-usage-docs.report.md](./readme-usage-docs/readme-usage-docs.report.md) | ✅ Complete | 2026-02-13 |

**Feature**: README Usage Documentation Update
**Description**: Comprehensive usage documentation in README.md including Quick Start, Installation, Configuration, CLI Reference, Development, and Troubleshooting sections
**Level**: N/A (Documentation)
**Match Rate**: 99%

**Key Achievements:**
- README.md completely rewritten (539 lines)
- Quick Start section gets users operational in < 2 minutes
- All 11 CLI commands documented with examples
- Environment variables documentation added
- Troubleshooting section covering 5 common issues
- MCP Tool Reference for API documentation

---

### debug-env-setup

| Phase | Document | Status | Date |
|-------|----------|--------|------|
| Plan | [debug-env-setup.plan.md](./debug-env-setup/debug-env-setup.plan.md) | ✅ Complete | 2026-02-13 |
| Design | [debug-env-setup.design.md](./debug-env-setup/debug-env-setup.design.md) | ✅ Complete | 2026-02-13 |
| Implementation | [debug-env-setup.do.md](./debug-env-setup/debug-env-setup.do.md) | ✅ Complete | 2026-02-13 |
| Check | [debug-env-setup-gap.md](./debug-env-setup/debug-env-setup-gap.md) | ✅ Complete | 2026-02-13 |
| Report | [debug-env-setup.report.md](./debug-env-setup/debug-env-setup.report.md) | ✅ Complete | 2026-02-13 |

**Feature**: Debug Environment Setup
**Description**: Comprehensive debugging and testing environment for the agent-speech-plugin MCP server
**Level**: N/A (Infrastructure)
**Match Rate**: 96%

**Key Achievements:**
- Logger utilities with stderr output and file logging with rotation
- VS Code debugging configurations (6 debug configs)
- 64 passing unit tests (100% pass rate)
- MCP Inspector integration for browser-based debugging
- Claude Code integration documentation

---

### agent-speech-plugin

| Phase | Document | Status | Date |
|-------|----------|--------|------|
| Plan | [01-plan.md](./agent-speech-plugin/01-plan.md) | ✅ Complete | 2026-02-12 |
| Design | [02-design.md](./agent-speech-plugin/02-design.md) | ✅ Complete | 2026-02-12 |
| Check | [03-analysis.md](./agent-speech-plugin/03-analysis.md) | ✅ Complete | 2026-02-12 |
| Report | [04-report.md](./agent-speech-plugin/04-report.md) | ✅ Complete | 2026-02-12 |

### Summary

**Feature**: Agent Speech Plugin
**Description**: macOS TTS plugin for terminal CLI AI agents (Claude Code, OpenCode, Codex-CLI, Gemini-CLI)
**Level**: Starter
**Match Rate**: 96%
**Iterations**: 1

### Key Achievements

- MCP Server integration with Claude Code
- Core + Adapter architecture
- macOS native TTS using `say` command
- 11 CLI configuration commands
- 4 CLI tool adapters (1 full, 3 stubs)

## git-changes-documentation-sync

| Item | Value |
|------|-------|
| Archived | 2026-02-16 |
| Match Rate | 96% |
| Status | Completed |
| Path | `docs/archive/2026-02/git-changes-documentation-sync/` |

**Documents**:
- `git-changes-documentation-sync.plan.md`
- `git-changes-documentation-sync.design.md`
- `git-changes-documentation-sync-completion-report.md`

---

## marketplace-distribution

| Item | Value |
|------|-------|
| Archived | 2026-02-16 |
| Match Rate | 100% |
| Status | Completed |
| Path | `docs/archive/2026-02/marketplace-distribution/` |

**Feature**: Claude Code Plugin Marketplace Distribution
**Description**: Complete implementation enabling users to discover and install the agent-speech-plugin through Claude Code's built-in plugin marketplace system.

**Documents**:
- `marketplace-distribution.plan.md`
- `marketplace-distribution.design.md`
- `marketplace-distribution-v1.0.md`

**Key Achievements:**
- Marketplace infrastructure implemented (.claude-plugin/ directory)
- marketplace.json, plugin.json, .mcp.json all configured
- Automated release script created
- End-to-end installation verified (English + Korean TTS)
- Claude Code Stop hook configured for automatic TTS

---

## plugin-hooks-convention

| Item | Value |
|------|-------|
| Archived | 2026-02-16 |
| Match Rate | 92% |
| Status | Completed |
| Path | `docs/archive/2026-02/plugin-hooks-convention/` |

**Feature**: Plugin Hooks Convention Migration
**Description**: Migrated TTS hook from standalone `~/.claude/claude-tts.sh` to official Claude Code plugin convention structure following `ralph-loop` reference pattern.

**Documents**:
- `plugin-hooks-convention.plan.md`
- `plugin-hooks-convention.design.md`
- `plugin-hooks-convention.analysis.md`
- `plugin-hooks-convention.report.md`

**Key Achievements:**
- TTS hook migrated to `.claude-plugin/agent-speech-plugin/hooks/` structure
- hooks.json uses `${CLAUDE_PLUGIN_ROOT}` for portable path resolution
- python3 dependency removed — pure bash + jq implementation
- Fixed Stop hook bug: was reading non-existent `response` field; now reads `transcript_path`
- Non-blocking TTS with `say &` — Claude Code unaffected on TTS failure
