---
template: plan
version: 1.2
description: PDCA Plan phase document for Agent Speech Plugin
variables:
  - feature: Agent Speech Plugin
  - date: 2026-02-12
  - author: welico
  - project: agent-speech-claude-code
  - version: 0.1.0
---

# Agent Speech Plugin Planning Document

> **Summary**: A plugin that provides voice guidance for the response results of Terminal CLI AI agents (Claude Code, OpenCode, Codex-CLI, Gemini-CLI)
>
> **Project**: agent-speech-claude-code
> **Version**: 0.1.0
> **Author**: welico
> **Date**: 2026-02-12
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

When using AI CLI tools (Claude Code, OpenCode, Codex-CLI, Gemini-CLI) in a terminal environment, it improves the user experience by allowing users to hear response results via voice, providing the convenience of not having to constantly watch the screen.

### 1.2 Background

- Developers use AI CLI tools in the terminal to perform tasks such as coding, debugging, and document searching
- Scrolling is inconvenient when reading long responses, and it is cumbersome to have to re-read if you look away from the screen
- Improved accessibility for developers with visual impairments
- Convenience of being able to hear content via voice in multitasking situations

### 1.3 Related Documents

- Requirements: N/A (Initial Planning)
- References:
  - [Claude Code Documentation](https://docs.anthropic.com/claude-code)
  - [macOS TTS Documentation](https://developer.apple.com/documentation/avfoundation/speech-synthesis)

---

## 2. Scope

### 2.1 In Scope

- [ ] **Claude Code Plugin** - Converts Claude Code responses to speech
- [ ] **OpenCode Plugin** - Compatible with OpenCode
- [ ] **Codex-CLI Plugin** - Compatible with Codex-CLI
- [ ] **Gemini-CLI Plugin** - Compatible with Gemini-CLI
- [ ] **macOS Native TTS** - Utilizes macOS's built-in `say` command
- [ ] **Configuration Management** - Selectable speech rate, volume, and voice
- [ ] **ON/OFF Toggle** - Feature to turn voice guidance on/off
- [ ] **Response Length Filter** - Option to skip speech for short responses

### 2.2 Out of Scope

- Cloud-based TTS (Google Cloud TTS, AWS Polly, OpenAI TTS, etc.)
- Speech-to-Text (STT) functionality
- Real-time speech synthesis (streaming)
- Multi-language TTS (English only supported)
- Web interface
- Mobile app

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Can be integrated as a plugin with each CLI tool (Claude Code, OpenCode, Codex-CLI, Gemini-CLI) | High | Pending |
| FR-02 | Converts response text to speech using macOS `say` command | High | Pending |
| FR-03 | Adjustable speech rate (words per minute) | Medium | Pending |
| FR-04 | Adjustable speech volume | Medium | Pending |
| FR-05 | Selectable voice (e.g., Samantha, Alex, Victoria, etc.) | Medium | Pending |
| FR-06 | Speech output ON/OFF toggle feature | High | Pending |
| FR-07 | Option to skip speech for responses below a certain length | Low | Pending |
| FR-08 | Persistent storage via configuration file (`~/.agent-speech/config.json`) | High | Pending |
| FR-09 | Different settings can be applied for each CLI tool | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | Speech conversion starts within 1 second | Measure `say` process start time after receiving response |
| Reliability | Does not interfere with CLI responses | Asynchronous processing, verify CLI operation on speech output failure |
| Usability | Simple configuration and usage | User testing and feedback |
| Compatibility | macOS 10.15+ (Catalina or higher) | Verify AVFoundation Speech Synthesis support |
| Security | Prevent exposure of sensitive information via voice | Filtering options for PIN/password related responses |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] Implementation of all functional requirements (FR-01 ~ FR-09) completed
- [ ] Verify plugin loading in each CLI tool
- [ ] Configuration file creation/load/save functionality working
- [ ] README.md completed (installation, configuration, usage)
- [ ] Local tests passed

### 4.2 Quality Criteria

- [ ] Implemented in TypeScript (type safety)
- [ ] ESLint passed (0 errors)
- [ ] Concise codebase (within maximum 1000 lines)
- [ ] Minimize dependencies

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Compatibility issues due to plugin API differences of each CLI tool | Medium | High | Analyze documentation for each tool and provide a unified interface with an abstraction layer |
| macOS `say` command limitations (long text processing) | Low | Medium | Split text into appropriate lengths before sending |
| Speech interruption when CLI exits during asynchronous speech output | Low | Medium | Run as a background process, manage PID |
| Differences in installed TTS voices on user systems | Low | Low | Default voice (fallback) setting and feature to display list of installed voices |
| Exposure of sensitive information such as PIN/password via voice | Medium | Medium | Provide keyword filtering options, disabled by default |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure (`src/`, `config/`) | CLI plugins, local tools | ☑️ |
| **Dynamic** | Feature-based modules, services layer | Web apps with backend, SaaS MVPs | ☐ |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Language | TypeScript / JavaScript | TypeScript | Type safety, IDE support |
| Runtime | Node.js / Bun / Deno | Node.js | Native runtime compatibility with each CLI tool |
| TTS Engine | macOS `say` / child_process | child_process + `say` | macOS native, no separate dependencies required |
| Config Format | JSON / YAML | JSON | Simplicity, Node.js built-in support |
| Package Manager | npm / pnpm / bun | pnpm | Fast installation, disk efficiency |
| Testing | Vitest / Jest | Vitest | Fast, native TypeScript support |

### 6.3 Clean Architecture Approach

```
Selected Level: Starter

Folder Structure Preview:
┌─────────────────────────────────────────────────────┐
│ Starter:                                            │
│   src/                                              │
│     core/           # Core TTS logic                 │
│       tts.ts        # Speech synthesis class         │
│       config.ts     # Configuration management        │
│     plugins/        # CLI tool plugins               │
│       claude-code.ts                                 │
│       opencode.ts                                    │
│       codex-cli.ts                                   │
│       gemini-cli.ts                                  │
│     types/          # TypeScript types               │
│       index.ts                                      │
│     index.ts        # Entry point                    │
│   config/           # Config file examples           │
│     config.example.json                              │
└─────────────────────────────────────────────────────┘
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

Check which conventions already exist in the project:

- [ ] `CLAUDE.md` has coding conventions section
- [ ] `docs/01-plan/conventions.md` exists (Phase 2 output)
- [ ] `CONVENTIONS.md` exists at project root
- [ ] ESLint configuration (`.eslintrc.*`)
- [ ] Prettier configuration (`.prettierrc`)
- [ ] TypeScript configuration (`tsconfig.json`)

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | Missing | camelCase for variables, PascalCase for classes | High |
| **Folder structure** | Missing | `src/`, `config/`, `tests/` | High |
| **Import order** | Missing | 1) Node.js built-ins 2) External 3) Internal | Medium |
| **Environment variables** | Missing | N/A (config file based) | Medium |
| **Error handling** | Missing | Async/Await with try-catch, logging errors | Medium |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| N/A | Configuration file based (`~/.agent-speech/config.json`) | - | - |

### 7.4 Pipeline Integration

| Phase | Status | Document Location | Command |
|-------|:------:|-------------------|---------|
| Phase 1 (Schema) | ☐ | `docs/01-plan/schema.md` | `/phase-1-schema` |
| Phase 2 (Convention) | ☐ | `docs/01-plan/conventions.md` | `/phase-2-convention` |

---

## 8. Next Steps

1. [ ] Write design document (`agent-speech-claude-code.design.md`)
2. [ ] Create TypeScript project setup
3. [ ] Start implementation

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-12 | Initial draft | welico |
