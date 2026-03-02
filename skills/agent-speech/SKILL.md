---
name: agent-speech
description: |
  Text-to-speech plugin for Claude Code using macOS built-in TTS (say command).
  Controls speech synthesis for AI CLI tool responses.

  Use when user asks about TTS settings, voice, speech rate, volume,
  language selection, muting, or enabling/disabling speech output.

  Commands: status, help, enable, disable, toggle, set-voice, set-rate,
  set-volume, list-voices, reset, language, mute, init

Triggers: tts, speech, voice, mute, audio, say command, speak
argument-hint: "[command] [args]"
user-invocable: true
allowed-tools:
  - Bash
  - Read
  - Write
  - AskUserQuestion
---

# Agent Speech Skill

Text-to-speech plugin for Claude Code using macOS `say` command.

## Usage

`/agent-speech-claude-code:agent-speech [command] [args]`

## How to Execute Commands

When this skill is invoked, read the ARGUMENTS provided and execute the corresponding
CLI command using Bash. The CLI is located at:

```
agent-speech
```

Run it with: `agent-speech [command] [args]`

## Available Commands

### `status [tool]`
Show current TTS configuration.

```bash
agent-speech status
agent-speech status claude-code
```

### `help`
Show all available commands and usage.

```bash
agent-speech help
```

### `enable [tool]`
Enable TTS globally or for a specific tool.

```bash
agent-speech enable
agent-speech enable claude-code
```

### `disable [tool]`
Disable TTS globally or for a specific tool.

```bash
agent-speech disable
agent-speech disable opencode
```

### `toggle [tool]`
Toggle TTS on/off.

```bash
agent-speech toggle
agent-speech toggle claude-code
```

### `set-voice <voice-name>`
Set the TTS voice.

```bash
agent-speech set-voice Samantha
agent-speech set-voice Alex
```

### `set-rate <rate>`
Set speech rate in words per minute (50-400).

```bash
agent-speech set-rate 200
```

### `set-volume <volume>`
Set speech volume (0-100).

```bash
agent-speech set-volume 80
```

### `list-voices`
List all available macOS voices.

```bash
agent-speech list-voices
```

### `reset`
Reset all settings to defaults.

```bash
agent-speech reset
```

### `language`
Interactive language selection (8 languages supported).

```bash
agent-speech language
```

### `mute <minutes|off>`
Mute TTS for a specified duration or turn off muting.

```bash
agent-speech mute 15
agent-speech mute off
```

### `init`
Initialize configuration file with defaults.

```bash
agent-speech init
```

## Execution Instructions

1. Parse ARGUMENTS to determine which command and optional arguments were provided
2. Run the corresponding `agent-speech [command] [args]` via Bash
3. Show the output to the user
4. If no command is specified, run `help` and show available commands

## Example Responses

After running `status`, parse and display the JSON output in a readable format.
After running `set-voice`, confirm the voice was changed.
After running `mute 15`, confirm mute was activated for 15 minutes.
