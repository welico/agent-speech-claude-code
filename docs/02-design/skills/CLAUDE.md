# Claude Code Skills Structure Design for Agent Speech Plugin

## Overview

This document outlines the design for implementing Claude Code skills structure for the agent-speech-claude-code. The design reuses all existing CLI functionality while wrapping it in the Claude Code skills format with executable scripts and proper metadata.

## Design Requirements

### 1. Skills Structure

The skills must follow the Claude Code skills structure with:
- SKILL.md file containing metadata
- Executable command scripts
- Proper permissions and shell shebangs

### 2. Commands to Implement

All commands from the existing CLI must be available as skills:

| Command | Description | Skill Script |
|---------|-------------|--------------|
| `init` | Initialize configuration | `skill-init` |
| `enable [tool]` | Enable TTS for tool | `skill-enable` |
| `disable [tool]` | Disable TTS for tool | `skill-disable` |
| `toggle [tool]` | Toggle TTS on/off | `skill-toggle` |
| `status` | Show configuration status | `skill-status` |
| `set-voice <name>` | Set voice | `skill-set-voice` |
| `set-rate <wpm>` | Set speech rate | `skill-set-rate` |
| `set-volume <0-100>` | Set volume | `skill-set-volume` |
| `list-voices` | List available voices | `skill-list-voices` |
| `reset` | Reset to defaults | `skill-reset` |
| `language` | Select language interactively | `skill-language` |
| `mute [off]` | Set mute duration or cancel mute | `skill-mute` |
| `help` | Show help | `skill-help` |

### 3. Integration Architecture

## Design Overview

### 1. Skills Directory Structure

```
skills/
├── SKILL.md                    # Main skill metadata
├── skill-init                  # Initialize configuration
├── skill-enable                # Enable TTS for tool
├── skill-disable               # Disable TTS for tool
├── skill-toggle                # Toggle TTS on/off
├── skill-status                # Show configuration status
├── skill-set-voice             # Set voice
├── skill-set-rate              # Set speech rate
├── skill-set-volume            # Set volume
├── skill-list-voices           # List available voices
├── skill-reset                 # Reset to defaults
├── skill-language              # Select language
├── skill-mute                  # Set mute duration
└── skill-help                  # Show help
```

### 2. SKILL.md Design

```yaml
name: "agent-speech"
title: "Agent Speech Plugin - Text-to-Speech for AI CLI Tools"
version: "0.1.0"
description: |
  Convert AI responses from Claude Code, OpenCode, Codex-CLI, and Gemini-CLI into speech using macOS TTS.

  Features:
  - Text-to-speech conversion for AI CLI responses
  - Support for multiple CLI tools (Claude Code, OpenCode, Codex-CLI, Gemini-CLI)
  - Customizable voices, speech rate, and volume
  - Global and per-tool configuration
  - Mute functionality with time limits
  - Voice filtering for sensitive content

  Prerequisites:
  - macOS 10.15+
  - Node.js 18+
  - macOS Text-to-Speech voices

  Notes:
  - Requires node in PATH for execution
  - Configuration stored in ~/.agent-speech/config.json
  - Mute state stored in ~/.agent-speech/mute.json
  - First run will initialize configuration
commands:
  - name: "init"
    description: "Initialize configuration with defaults"
    usage: "skill-init"
    examples:
      - "skill-init"
      - "Initialize the agent-speech configuration"

  - name: "enable"
    description: "Enable TTS for a specific tool"
    usage: "skill-enable <tool>"
    parameters:
      - name: "tool"
        type: "string"
        description: "Tool name (claude-code, opencode, codex-cli, gemini-cli)"
        required: true
    examples:
      - "skill-enable claude-code"
      - "skill-enable opencode"

  - name: "disable"
    description: "Disable TTS for a specific tool"
    usage: "skill-disable <tool>"
    parameters:
      - name: "tool"
        type: "string"
        description: "Tool name (claude-code, opencode, codex-cli, gemini-cli)"
        required: true
    examples:
      - "skill-disable claude-code"
      - "skill-disable gemini-cli"

  - name: "toggle"
    description: "Toggle TTS on/off for a tool"
    usage: "skill-toggle <tool>"
    parameters:
      - name: "tool"
        type: "string"
        description: "Tool name (claude-code, opencode, codex-cli, gemini-cli)"
        required: true
    examples:
      - "skill-toggle claude-code"
      - "skill-toggle codex-cli"

  - name: "status"
    description: "Show current configuration status"
    usage: "skill-status"
    examples:
      - "skill-status"
      - "Display current settings and tool status"

  - name: "set-voice"
    description: "Set the voice name"
    usage: "skill-set-voice <voice>"
    parameters:
      - name: "voice"
        type: "string"
        description: "Voice name (e.g., Samantha, Alex, Victoria)"
        required: true
    examples:
      - "skill-set-voice Samantha"
      - "skill-set-voice Alex"

  - name: "set-rate"
    description: "Set speech rate in words per minute"
    usage: "skill-set-rate <wpm>"
    parameters:
      - name: "wpm"
        type: "number"
        description: "Speech rate (50-400)"
        required: true
    examples:
      - "skill-set-rate 200"
      - "skill-set-rate 150"

  - name: "set-volume"
    description: "Set volume (0-100)"
    usage: "skill-set-volume <volume>"
    parameters:
      - name: "volume"
        type: "number"
        description: "Volume level (0-100)"
        required: true
    examples:
      - "skill-set-volume 50"
      - "skill-set-volume 75"

  - name: "list-voices"
    description: "List available macOS voices"
    usage: "skill-list-voices"
    examples:
      - "skill-list-voices"
      - "Show all available TTS voices"

  - name: "reset"
    description: "Reset configuration to defaults"
    usage: "skill-reset"
    examples:
      - "skill-reset"
      - "Reset all settings to factory defaults"

  - name: "language"
    description: "Interactively select translation language"
    usage: "skill-language"
    examples:
      - "skill-language"
      - "Choose translation language for TTS"

  - name: "mute"
    description: "Mute TTS for duration or cancel mute"
    usage: "skill-mute [duration|off]"
    parameters:
      - name: "duration"
        type: "string"
        description: "Duration in minutes (e.g., 5, 30, 120) or 'off' to cancel"
        required: false
    examples:
      - "skill-mute 30"
      - "skill-mute 5"
      - "skill-mute off"
      - "skill-mute"

  - name: "help"
    description: "Show help information"
    usage: "skill-help"
    examples:
      - "skill-help"
      - "Display usage information and available commands"
```

### 3. Script Design Template

Each skill script will follow this pattern:

```bash
#!/bin/bash
# Skill: <Command Name>
# Description: <Brief description>

# Get directory containing this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Path to node and CLI entry point
NODE_CMD="$(command -v node)"
CLI_PATH="$SCRIPT_DIR/../../src/cli.js"

# Check if node is available
if [ -z "$NODE_CMD" ]; then
    echo "Error: node not found in PATH" >&2
    echo "Please install Node.js 18+ and ensure it's in your PATH" >&2
    exit 1
fi

# Check if CLI exists
if [ ! -f "$CLI_PATH" ]; then
    echo "Error: CLI not found at $CLI_PATH" >&2
    exit 1
fi

# Map skill command to CLI command
CLI_CMD="agent-speech"
SKILL_CMD="${0##*/skill-}"

# Build CLI arguments
CLI_ARGS=()

case "$SKILL_CMD" in
    init)
        CLI_ARGS=("init")
        ;;
    enable)
        if [ $# -eq 0 ]; then
            echo "Error: Tool name required" >&2
            exit 1
        fi
        CLI_ARGS=("enable" "$1")
        ;;
    disable)
        if [ $# -eq 0 ]; then
            echo "Error: Tool name required" >&2
            exit 1
        fi
        CLI_ARGS=("disable" "$1")
        ;;
    toggle)
        if [ $# -eq 0 ]; then
            echo "Error: Tool name required" >&2
            exit 1
        fi
        CLI_ARGS=("toggle" "$1")
        ;;
    status)
        CLI_ARGS=("status")
        ;;
    set-voice)
        if [ $# -eq 0 ]; then
            echo "Error: Voice name required" >&2
            exit 1
        fi
        CLI_ARGS=("set-voice" "$1")
        ;;
    set-rate)
        if [ $# -eq 0 ]; then
            echo "Error: Rate required" >&2
            exit 1
        fi
        CLI_ARGS=("set-rate" "$1")
        ;;
    set-volume)
        if [ $# -eq 0 ]; then
            echo "Error: Volume required" >&2
            exit 1
        fi
        CLI_ARGS=("set-volume" "$1")
        ;;
    list-voices)
        CLI_ARGS=("list-voices")
        ;;
    reset)
        CLI_ARGS=("reset")
        ;;
    language)
        CLI_ARGS=("language")
        ;;
    mute)
        if [ $# -eq 0 ]; then
            CLI_ARGS=("mute")
        else
            CLI_ARGS=("mute" "$1")
        fi
        ;;
    help)
        CLI_ARGS=("help")
        ;;
    *)
        echo "Error: Unknown skill command: $SKILL_CMD" >&2
        exit 1
        ;;
esac

# Execute CLI with mapped arguments
exec "$NODE_CMD" "$CLI_PATH" "${CLI_ARGS[@]}"
```

### 4. Error Handling Design

#### Script-Level Error Handling

1. **Node.js Check**: Verify Node.js is available in PATH
2. **CLI Path Check**: Verify CLI entry point exists
3. **Parameter Validation**: Validate required parameters
4. **Exit Codes**: Propagate CLI exit codes (0=success, 1=error)

#### CLI-Level Error Handling (Existing)

All error handling is already implemented in the CLI commands:
- Parameter validation
- Configuration validation
- File system error handling
- Voice availability checking
- Volume/range validation

### 5. Output Formatting

The scripts will preserve all existing CLI output formats:
- Success messages with `[agent-speech] SUCCESS` prefix
- Error messages with `[agent-speech] ERROR` prefix
- Status display with structured formatting
- Table/list formatting for voices and status

### 6. Configuration Integration

The skills will use the existing configuration system:
- Configuration path: `~/.agent-speech/config.json`
- Mute state path: `~/.agent-speech/mute.json`
- Automatic initialization on first run
- Per-tool and global configuration support

### 7. Language Support

The `skill-language` command will leverage the existing translation system:
- Interactive language selection interface
- Google Translate API integration
- Language-specific voice mapping
- First-sentence summary extraction for context

### 8. File Permissions

All skill scripts will have executable permissions:
```bash
chmod +x skill-*
```

### 9. Installation Flow

The installation will:
1. Create skills directory in plugin location
2. Copy all skill scripts
3. Set executable permissions
4. Initialize configuration if needed
5. Validate Node.js installation

### 10. Integration with Claude Code

Skills will be integrated with Claude Code through:
- Plugin system hooks
- Proper shebang for Node.js execution
- Standard command line interface
- Consistent error handling
- Help system integration

## Implementation Plan

### Phase 1: Create Skills Directory Structure

1. Create skills directory at plugin location
2. Create SKILL.md with metadata
3. Create all skill script files

### Phase 2: Implement Skill Scripts

1. Create master script template
2. Implement each command script
3. Add error handling and validation
4. Set file permissions

### Phase 3: Test Integration

1. Test each skill command
2. Verify CLI integration
3. Test error scenarios
4. Validate output formatting

### Phase 4: Documentation

1. Update installation docs
2. Add usage examples
3. Document troubleshooting
4. Create skill-specific help

## Benefits of This Design

1. **Reuse Existing Code**: All CLI functionality is preserved and reused
2. **Consistent Interface**: Skills follow Claude Code conventions
3. **Maintainable**: Changes to CLI logic automatically apply to skills
4. **Backward Compatible**: Original CLI continues to work unchanged
5. **Future-Proof**: New CLI features automatically become skills
6. **Minimal Duplication**: Only wrapper scripts are added, no core logic duplication

## Risk Mitigation

1. **Node.js Dependency**: Check availability and provide clear error messages
2. **Path Resolution**: Use relative paths from script location
3. **Parameter Mapping**: Ensure proper argument passing between skills and CLI
4. **Error Propagation**: Maintain consistent exit codes and error messages
5. **Configuration Safety**: Skills use existing, tested configuration system

## Success Criteria

- [ ] All 13 commands implemented as skills
- [ ] Skills directory structure created
- [ ] SKILL.md metadata complete
- [ ] All scripts executable and working
- [ ] Integration with existing CLI verified
- [ ] Error handling working correctly
- [ ] Help system accessible via skills
- [ ] Documentation updated
- [ ] Installation flow tested

<claude-mem-context>
# Recent Activity

<!-- This section is auto-generated by claude-mem. Edit content outside the tags. -->

### Feb 17, 2026

| ID | Time | T | Title | Read |
|----|------|---|-------|------|
| #1607 | 2:14 PM | 🔵 | Completed gap analysis for agent-speech skill implementation | ~328 |
| #1555 | 2:04 PM | 🟣 | Created skill-help.sh for command documentation | ~142 |
| #1553 | " | 🟣 | Created skill-language.sh for interactive language selection | ~152 |
| #1551 | " | 🟣 | Created skill-list-voices.sh for voice enumeration | ~157 |
| #1549 | " | 🟣 | Created skill-set-rate.sh with numeric validation | ~189 |
| #1547 | " | 🟣 | Created skill-status.sh script for configuration display | ~161 |
| #1545 | " | 🟣 | Created skill-disable.sh script with parameter validation | ~211 |
| #1543 | " | 🟣 | Created skill-init.sh script for skill initialization | ~214 |
| #1541 | 2:03 PM | ✅ | Created skill design documentation for agent-speech | ~276 |
</claude-mem-context>