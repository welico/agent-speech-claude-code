# tts-config Planning Document

> **Summary**: Introduce a config file that allows users to set TTS language/voice/speed, and improve the response summary method.
>
> **Project**: agent-speech-claude-code
> **Version**: 0.2.0
> **Author**: welico
> **Date**: 2026-02-16
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

Currently all hook scripts are hardcoded with the `Samantha` voice and 200 wpm speed. Korean users want to be guided by a Korean voice (e.g. Yuna), and the summary method needs to be more natural than a simple truncation of 180 characters.

### 1.2 Motivation

| Current Issues | After improvement |
|----------|--------|
| Samantha (English) Fixed Voice | custom voice |
| Fixed speed of 200wpm | User set speed |
| Simple cut of 180 characters | Extract the first complete sentence |
| Hardcoding all scripts | Full reflection by modifying one config file |

### 1.3 macOS Korean language support (confirmed)

```
Yuna ko_KR Hello. My name is Yuna.
Eddy (Korean)       ko_KR
Flo (Korean)        ko_KR
Sandy (Korean)      ko_KR
Shelley (Korean)    ko_KR
Reed (Korean)       ko_KR
```

---

## 2. Scope

### 2.1 In Scope

| Features | Description |
|------|------|
| Config file | Create/Read `~/.agent-speech/config.json` |
| Voice Settings | `voice` field (e.g. "Yuna", "Samantha") |
| Speed ​​settings | `rate` field (wpm, default 200) |
| Improved summary method | Extract first complete sentence (maximum 200 characters) |
| Common Settings Loader | `load-config.sh` — `source` |
| Verify settings | Invalid voice name → fallback to default |

### 2.2 Out of Scope

- Summary of AI API calls (external dependencies, separate features)
- UI settings screen
- Different settings for each hook (single global setting)
- Windows/Linux support

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirements | Priority |
|----|---------|---------|
| FR-01 | Read `~/.agent-speech/config.json` and apply voice/rate | High |
| FR-02 | If no config, use default value (Samantha, 200) | High |
| FR-03 | Incorrect voice name → fall back to default, continue | High |
| FR-04 | Common config loader `load-config.sh` — used by all hooks | High |
| FR-05 | Response Summary: Extract the first complete sentence (maximum 200 characters) | Medium |
| FR-06 | Natural text extraction after removing markdown | Medium |
| FR-07 | Provide example config file `config.example.json` | Low |

### 3.2 Non-Functional Requirements

| Item | standards |
|------|------|
| Guaranteed fallback | TTS always works even without a config file |
| Performance | config load < 50ms |
| Compatibility | No change to existing hook operation |

---

## 4. Config File Spec

### 4.1 Location

```
~/.agent-speech/config.json
```

### 4.2 Schema

```json
{
  "voice": "Yuna",
  "rate": 200,
  "volume": 50,
  "summary": {
    "maxChars": 200,
    "mode": "first-sentence"
  }
}
```

| field | Type | default | Description |
|------|------|--------|------|
| `voice` | string | `"Samantha"` | macOS voice name |
| `rate` | number | `200` | Firing rate (wpm) |
| `volume` | number | `50` | Volume (0-100) |
| `summary.maxChars` | number | `200` | Maximum number of utterance characters |
| `summary.mode` | string | `"first-sentence"` | `"first-sentence"` or `"truncate"` |

---

## 5. Architecture

### 5.1 File structure changes

```
hooks/
├── hooks.json
├── load-config.sh ← New: Common config loader
├── stop-hook.sh ← Edit: Use load-config.sh
├── notification-hook.sh ← Edit: Use load-config.sh
├── permission-hook.sh ← Edit: Use load-config.sh
├── subagent-stop-hook.sh ← Edit: Use load-config.sh
└── task-completed-hook.sh ← Edit: Use load-config.sh
```

### 5.2 load-config.sh role

```bash
# How to call
source "$(dirname "$0")/load-config.sh"
# Afterwards, $VOICE, $RATE, and $VOLUME variables can be used.
```

### 5.3 Summary improvement logic (first-sentence mode)

```
1. Remove markdown code block (``` ... ```)
2. Remove inline code (`...`)
3. Remove markdown symbols (#, *, _, |, >)
4. Line break → space
5. Extract the first complete sentence (first sentence ending with . / ? / !)
6. If there is no sentence, simply cut it up to maxChars.
```

---

## 6. Summary Mode Comparison

| mode | method | Example |
|------|------|------|
| `truncate` | Just like the letter N in front | "Current settings confirmed 5 hooks registered..." |
| `first-sentence` | first complete sentence | “Your current settings have been confirmed.” |

---

## 7. Risks and Mitigation

| Risk | Response |
|------|------|
| Typo in voice name → `say` failed | Samantha fallback after voice verification |
| No config file | Use default, ensure exit 0 |
| Korean text + English voice | Solved when the user sets up Yuna |
| Failed to extract first sentence (no punctuation) | Fallback to truncate mode |

---

## 8. Success Criteria

- [ ] Read voice/rate from `~/.agent-speech/config.json` and apply TTS
- [ ] Operates as default even without config
- [ ] `load-config.sh` Common loader Applies to all hooks
- [ ] first-sentence summary mode operation
- [ ] `config.example.json` Contains examples of Korean settings
- [ ] Cache synchronization completed

---

## 9. Implementation Order

1. Write `load-config.sh`
2. Update `stop-hook.sh` (config + first-sentence summary)
3. Update the remaining 4 hooks (reflected in config)
4. Write `config.example.json`
5. Create default settings for users in `~/.agent-speech/config.json`
6. Cache synchronization
7. Verification of operation

---

## 10. Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-02-16 | Initial draft |
