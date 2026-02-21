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
**Description**: Comprehensive debugging and testing environment for the agent-speech-claude-code MCP server
**Level**: N/A (Infrastructure)
**Match Rate**: 96%

**Key Achievements:**
- Logger utilities with stderr output and file logging with rotation
- VS Code debugging configurations (6 debug configs)
- 64 passing unit tests (100% pass rate)
- MCP Inspector integration for browser-based debugging
- Claude Code integration documentation

---

### agent-speech-claude-code

| Phase | Document | Status | Date |
|-------|----------|--------|------|
| Plan | [01-plan.md](./agent-speech-claude-code/01-plan.md) | ✅ Complete | 2026-02-12 |
| Design | [02-design.md](./agent-speech-claude-code/02-design.md) | ✅ Complete | 2026-02-12 |
| Check | [03-analysis.md](./agent-speech-claude-code/03-analysis.md) | ✅ Complete | 2026-02-12 |
| Report | [04-report.md](./agent-speech-claude-code/04-report.md) | ✅ Complete | 2026-02-12 |

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
**Description**: Complete implementation enabling users to discover and install the agent-speech-claude-code through Claude Code's built-in plugin marketplace system.

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
- TTS hook migrated to `.claude-plugin/agent-speech-claude-code/hooks/` structure
- hooks.json uses `${CLAUDE_PLUGIN_ROOT}` for portable path resolution
- python3 dependency removed — pure bash + jq implementation
- Fixed Stop hook bug: was reading non-existent `response` field; now reads `transcript_path`
- Non-blocking TTS with `say &` — Claude Code unaffected on TTS failure

---

## tts-config

| Item | Value |
|------|-------|
| Archived | 2026-02-16 |
| Match Rate | 96% |
| Status | Completed |
| Path | `docs/archive/2026-02/tts-config/` |

**Feature**: TTS Configuration System
**Description**: Centralized `~/.agent-speech/config.json` config file with shared `load-config.sh` loader. All 5 hook scripts use user-configurable voice, rate, and volume. Stop hook upgraded to first-sentence summary extraction mode. Korean users can set `"voice": "Yuna"`.

**Documents**:
- `tts-config.plan.md`
- `tts-config.design.md`
- `tts-config.analysis.md`
- `tts-config.report.md`

**Key Achievements:**
- `load-config.sh` shared loader — validates voice via `say -v ?`, falls back to Samantha
- All 5 hooks use `$VOICE`/`$RATE`/`$VOLUME` from config (no more hardcoded values)
- `first-sentence` summary mode: extracts first complete sentence, fallback to truncate
- `~/.agent-speech/config.json` created with Yuna Korean voice defaults
- Invalid voice fallback verified: `say -v ? | grep` approach confirmed working

---

## tts-i18n

| Item | Value |
|------|-------|
| Archived | 2026-02-17 |
| Match Rate | 93% |
| Status | Completed |
| Path | `docs/archive/2026-02/tts-i18n/` |

**Feature**: TTS Internationalization
**Description**: Automatically translate TTS hook messages into a user-defined language using the free, unofficial Google Translate API. When `"language": "ko"` is set, all hook messages (permission, subagent, task, notification, stop summary) are translated into Korean and voice guidance is provided. Fallback to original text in case of no internet/API failure.

**Documents**:
- `tts-i18n.plan.md`
- `tts-i18n.design.md`
- `tts-i18n.analysis.md`
- `tts-i18n.report.md`

**Key Achievements:**
- `translate.sh` helper — `translate()` function with Google Translate API (no API key)
- `curl --max-time 3` timeout + 6-level fallback chain ensures TTS always works
- All 5 hooks updated: source `translate.sh` + `MSG=$(translate "$MESSAGE")`
- `load-config.sh` updated — exports `LANGUAGE` from config (default: `"en"`)
- `~/.agent-speech/config.json` updated with `"language": "ko"` for Korean TTS
- 9/9 acceptance criteria passed (100%)
- Verified: `"The task has been completed."` → `"The task has been completed."`

---

## cli-interactive-commands

| Item | Value |
|------|-------|
| Archived | 2026-02-17 |
| Match Rate | 98% |
| Status | Completed |
| Path | `docs/archive/2026-02/cli-interactive-commands/` |

**Feature**: CLI Interactive Commands
**Description**: Language selection and mute functionality for the agent-speech-claude-code CLI with interactive menus and persistent state management.

**Documents**:
- `cli-interactive-commands.plan.md`
- `cli-interactive-commands.design.md`
- `cli-interactive-commands.report.md`

**Key Achievements:**
- `language` command — interactive selection of 8 languages (EN, KO, JA, ZH, ES, FR, DE, IT)
- `mute [off]` command — 7 duration options (5s, 30s, 1min, 5min, 15min, 1hr, permanent) + cancel
- `IS_MUTED` guard added to all 5 TTS hooks (permission, subagent, task, notification, stop)
- Mute state persisted in `~/.agent-speech/mute.json` with automatic expiration/cleanup
- `status` command shows current language and mute status
- BSD date parsing for macOS compatibility in duration calculation
- Error handling for corrupt mute files and expired mutes
- CLI help documentation updated with new command descriptions
- TypeScript type safety for all configuration structures
