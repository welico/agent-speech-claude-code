# Plan: Fix Agent-Speech Skill Invocation

## Problem Statement

When typing `/agent-speech` in the Claude Code input box, no commands appear or work.

## Root Cause Analysis

### Issue 1: Skills in Wrong Location
- Created: `~/.claude-plugin/agent-speech-claude-code/skills/agent-speech/SKILL.md`
- Expected: `{installPath}/skills/agent-speech/SKILL.md`
- Actual installPath: `~/.claude/plugins/cache/welico/agent-speech-claude-code/0.1.0/`
- The `~/.claude-plugin/` directory is NOT where Claude Code reads plugin skills

### Issue 2: Wrong SKILL.md Format
- Current format: Custom YAML with `commands:` object structure
- Required format: Claude Code format with `name`, `description`, `user-invocable`, `allowed-tools`, then markdown body
- Reference: `~/.claude/plugins/cache/bkit-marketplace/bkit/1.4.7/skills/pdca/SKILL.md`

### Issue 3: Plugin Name Mismatch
- Plugin name: `agent-speech-claude-code`
- Skill invocation prefix: `/agent-speech-claude-code:agent-speech`
- User expectation: `/agent-speech`

## Fix Strategy

### Short-term Fix (No Reinstall Required)
1. Create `skills/agent-speech/SKILL.md` at **repo root** with proper Claude Code format
2. Copy to plugin cache: `~/.claude/plugins/cache/welico/agent-speech-claude-code/0.1.0/skills/`
3. Restart Claude Code → skill appears as `/agent-speech-claude-code:agent-speech [command]`

### Long-term Fix (Better UX, Requires Reinstall)
1. Rename plugin in `plugin.json` from `agent-speech-claude-code` to `agent-speech`
2. Reinstall plugin → skill appears as `/agent-speech:agent-speech [command]`

## Implementation Plan

### Phase 1: Create Proper SKILL.md
- File: `skills/agent-speech/SKILL.md` (repo root)
- Format: Claude Code SKILL.md format (frontmatter + markdown body)
- Content: All 13 commands documented with arguments and execution via Bash

### Phase 2: Copy to Plugin Cache
- Destination: `~/.claude/plugins/cache/welico/agent-speech-claude-code/0.1.0/skills/agent-speech/SKILL.md`
- Immediate effect without reinstall

### Phase 3: Update Plugin Repository Structure
- Add `skills/` directory to `.gitignore` if needed (or commit as plugin structure)
- Update plugin.json to document skills capability

## Acceptance Criteria
- [ ] `/agent-speech-claude-code:agent-speech` appears in Claude Code autocomplete
- [ ] `/agent-speech-claude-code:agent-speech status` shows current TTS config
- [ ] `/agent-speech-claude-code:agent-speech help` lists all commands
- [ ] Skill executes CLI commands correctly via Bash

## Commands After Fix

| User Types | Result |
|-----------|--------|
| `/agent-speech-claude-code:agent-speech status` | Show TTS configuration |
| `/agent-speech-claude-code:agent-speech help` | Show all commands |
| `/agent-speech-claude-code:agent-speech mute 15` | Mute for 15 minutes |
| `/agent-speech-claude-code:agent-speech set-voice Samantha` | Set voice |
