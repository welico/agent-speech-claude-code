# plugin-hooks-convention Planning Document

> **Summary**: Move the TTS Hook script into the plugin directory and reorganize the structure in accordance with the Claude Code official plugin convention.
>
> **Project**: agent-speech-claude-code
> **Version**: 0.1.0
> **Author**: welico
> **Date**: 2026-02-16
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

The TTS Hook script currently located in `~/.claude/claude-tts.sh` does not follow the Claude Code official plugin convention.
Using the `ralph-loop` official plugin as a reference, move the Hook script inside the plugin directory (`hooks/` folder) and
Remove absolute path hardcoding using the `${CLAUDE_PLUGIN_ROOT}` variable.

### 1.2 Background

- As a result of analyzing the structure of the `ralph-loop` official plugin, the Hook script must be located in the `hooks/` folder within the plugin directory.
- `hooks/hooks.json` defines Hook settings, and references the absolute path with the `${CLAUDE_PLUGIN_ROOT}` variable.
- Currently, the absolute path (`/Users/warezio/.claude/claude-tts.sh`) is hardcoded in `~/.claude/settings.json` and does not work in other user environments.
- Hooks must be automatically registered when the plugin is installed, and for this, a `hooks.json`-based structure is required.

### 1.3 Reference

- `~/.claude/plugins/marketplaces/claude-plugins-official/plugins/ralph-loop/hooks/hooks.json`
- `~/.claude/plugins/marketplaces/claude-plugins-official/plugins/ralph-loop/hooks/stop-hook.sh`

---

## 2. Scope

### 2.1 In Scope

- [ ] Create directory `.claude-plugin/agent-speech-claude-code/hooks/`
- [ ] Create `hooks/hooks.json` (Stop hook setting, see `${CLAUDE_PLUGIN_ROOT}`)
- [ ] Created `hooks/stop-hook.sh` (based on current `claude-tts.sh` contents, improved using jq)
- [ ] Convert the stop hook of `~/.claude/settings.json` to `hooks.json` based.
- [ ] Remove `~/.claude/claude-tts.sh` file (after removing settings.json hook)

### 2.2 Out of Scope

- Change Hook logic (does not modify the voice conversion function itself)
- Add new Hook events (PreToolUse, PostToolUse, etc.)
- Support for platforms other than macOS

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | `hooks/hooks.json` defines Stop hook based on `${CLAUDE_PLUGIN_ROOT}` | High | Pending |
| FR-02 | `hooks/stop-hook.sh` extracts the last assistant text from the transcript and executes TTS | High | Pending |
| FR-03 | Parsing JSON using `jq` (matching ralph-loop approach) | Medium | Pending |
| FR-04 | Remove hardcoded hook path from `~/.claude/settings.json` | High | Pending |
| FR-05 | Hook should be automatically registered after reinstalling the plugin | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Portability | Works on other users' Macs (no absolute path) | Testing your installation in different environments |
| Convention | Same pattern as ralph-loop formula structure | Directory Structure Comparison |
| Reliability | No effect on Claude Code operation when TTS fails | Check hook exit code 0 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] Create `.claude-plugin/agent-speech-claude-code/hooks/hooks.json`
- [ ] Grant permission to create and execute `.claude-plugin/agent-speech-claude-code/hooks/stop-hook.sh`
- [ ] Check stop hook operation using `hooks.json` method
- [ ] Remove existing hook items in `~/.claude/claude-tts.sh` and `settings.json`
- [ ] Verify normal operation of response voice output

### 4.2 Quality Criteria

- [ ] `stop-hook.sh` parses JSON based on `jq` (python3 dependency removed)
- [ ] If there are no errors when executing the script, exit 0 is returned.
- [ ] Normal TTS operation with 500 character limit

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| `hooks.json` based auto-registration may not actually work | High | Medium | settings.json maintain manual registration fallback |
| `jq` not installed environment | Medium | Low | After checking `which jq`, add python3 fallback |
| Stop TTS after deleting existing `~/.claude/claude-tts.sh` | High | Low | Confirm new script behavior and delete |

---

## 6. Architecture Considerations

### 6.1 Target Structure

```
.claude-plugin/
└── agent-speech-claude-code/
├── hooks/ ← New addition
│ ├── hooks.json ← Hook settings (Stop event)
│ └── stop-hook.sh ← TTS execution script
    ├── plugin.json
    ├── .mcp.json
    └── README.md
```

### 6.2 hooks.json structure

```json
{
  "description": "Agent Speech Plugin stop hook for TTS",
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/stop-hook.sh"
          }
        ]
      }
    ]
  }
}
```

### 6.3 Change settings.json

**Before** (now - hardcoded):
```json
"hooks": {
  "Stop": [{
    "matcher": "",
    "hooks": [{"type": "command", "command": "/Users/warezio/.claude/claude-tts.sh"}]
  }]
}
```

**After** (goal - autoregister hooks.json or see ${CLAUDE_PLUGIN_ROOT}):
```json
"hooks": {}
```
→ hooks.json must be automatically applied when installing the plugin. If it is not applied automatically, keep it as a reference to the `${CLAUDE_PLUGIN_ROOT}` variable in settings.json.

---

## 7. Convention Prerequisites

### 7.1 Reference Implementation

- Completely replicates the `ralph-loop` plugin structure.
- bash-native JSON parsing using `jq` (removing dependency on python3)
- Utilize `${CLAUDE_PLUGIN_ROOT}` environment variable

### 7.2 File Naming Convention

| file | See also ralph-loop | apply agent-speech |
|------|-----------------|------------------|
| Hook settings | `hooks/hooks.json` | `hooks/hooks.json` |
| Stop hook | `hooks/stop-hook.sh` | `hooks/stop-hook.sh` |

---

## 8. Next Steps

1. [ ] Create a Design document (`plugin-hooks-convention.design.md`)
2. [ ] `hooks/` directory and file implementation
3. [ ] Migrate existing `~/.claude/claude-tts.sh`

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-16 | Initial draft | welico |
