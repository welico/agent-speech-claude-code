# Debugging Environment Setup Planning Document

> **Summary**: Establish comprehensive debugging and testing environment for Claude Code plugin (MCP server) development
>
> **Project**: agent-speech-claude-code
> **Version**: 0.1.0
> **Author**: welico
> **Date**: 2026-02-13
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

This feature aims to create a robust debugging and testing environment for the agent-speech-claude-code MCP server. The goal is to enable efficient development, testing, and debugging of the text-to-speech plugin that integrates with Claude Code and other AI CLI tools.

### 1.2 Background

Claude Code plugins are implemented as MCP (Model Context Protocol) servers. Developing these servers requires specialized debugging approaches since:
- stdout is reserved for MCP protocol messages
- Debugging must happen via stderr or external tools
- Integration testing requires loading the plugin into Claude Code
- Real-time tool invocation testing needs browser-based inspection

### 1.3 Related Documents

- MCP Specification: https://modelcontextprotocol.io/
- agent-speech-claude-code CLAUDE.md: `/Users/welico/Git/GitHub/welico/agent-speech-claude-code/CLAUDE.md`
- Archived PDCA documents: `docs/archive/2026-02/agent-speech-claude-code/`

---

## 2. Scope

### 2.1 In Scope

- [ ] Local MCP server development setup with hot-reload
- [ ] Console logging to stderr for debugging
- [ ] VS Code debugger configuration for TypeScript
- [ ] DEBUG environment variable integration
- [ ] Unit testing framework (Vitest) setup
- [ ] MCP Inspector integration for browser-based debugging
- [ ] Claude Code local integration testing
- [ ] Log file management for persistent debugging
- [ ] Error handling patterns and schema validation
- [ ] `.vscode/` configuration files

### 2.2 Out of Scope

- CI/CD pipeline integration (future enhancement)
- Performance benchmarking tools
- Automated end-to-end testing with Claude Code
- Cross-platform testing (macOS only project)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Hot-reload development server (`npm run dev`) | High | Pending |
| FR-02 | Console.error() logging in all tool handlers | High | Pending |
| FR-03 | VS Code launch.json for debugging TypeScript | High | Pending |
| FR-04 | DEBUG environment variable support (mcp:*) | Medium | Pending |
| FR-05 | Vitest unit test setup with sample tests | High | Pending |
| FR-06 | MCP Inspector integration script | Medium | Pending |
| FR-07 | Local Claude Code config for plugin testing | High | Pending |
| FR-08 | Persistent log file to /tmp/agent-speech-debug.log | Medium | Pending |
| FR-09 | Error handling wrapper for all tool handlers | High | Pending |
| FR-10 | JSON Schema validation for tool inputs | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | Hot-reload rebuild < 2 seconds | Build time measurement |
| Debugging | Breakpoints work in VS Code | Manual verification |
| Testing | Unit tests run < 5 seconds | Vitest timing |
| Logging | Logs don't interfere with MCP protocol | stderr inspection |
| Usability | Single command to start debugging | Command count |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] All functional requirements implemented
- [ ] Unit tests written and passing for debug utilities
- [ ] VS Code debugging verified with breakpoints
- [ ] MCP Inspector successfully invokes tools
- [ ] Local Claude Code loads and tests the plugin
- [ ] Documentation completed (README.md debug section)

### 4.2 Quality Criteria

- [ ] Test coverage above 70% for core modules
- [ ] Zero TypeScript errors in debug mode
- [ ] All console.error messages include `[DEBUG]` prefix
- [ ] Error handling covers all async operations

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| MCP protocol breakage from console.log | High | Medium | Enforce stderr-only logging; add linter rule |
| Hot-reload not restarting process | Medium | Low | Use nodemon or tsc --watch properly |
| VS Code debugger not attaching breakpoints | Medium | Medium | Verify sourcemap generation in tsconfig.json |
| MCP Inspector version incompatibility | Low | Low | Pin @modelcontextprotocol/inspector version |
| Log file growing too large | Low | Medium | Implement log rotation (max 10MB) |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure, single testing framework | MCP servers, CLI tools | ✅ **Yes** |
| **Dynamic** | Feature-based modules, services layer | Web apps with backend | ☐ |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems | ☐ |

**Rationale**: This is an MCP server/CLI plugin project. Starter level is appropriate - simple folder structure with clear separation of concerns.

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| **Logging** | winston / pino / console.error | console.error | Built-in, no dependencies, MCP-friendly |
| **Testing** | Jest / Vitest / Mocha | Vitest | Native TypeScript, ESM support, faster |
| **Hot Reload** | tsc --watch / nodemon / tsx-dev | tsc --watch | TypeScript native, already configured |
| **Debug Tool** | Chrome DevTools / MCP Inspector / custom | MCP Inspector | Official MCP tool, purpose-built |
| **Schema Validation** | Zod / Ajv / manual | Zod | TypeScript-native, excellent DX |

### 6.3 Clean Architecture Approach

```
Selected Level: Starter

Folder Structure for Debug Environment:
┌───────────────────────────────────────────────────────────┐
│ src/                                                      │
│   ├── utils/                                             │
│   │   └── logger.ts         # Debug logging utilities    │
│   ├── core/                                             │
│   │   ├── filter.ts          # Text filtering logic      │
│   │   ├── config.ts          # Config management        │
│   │   └── tts.ts             # TTS synthesis           │
│   ├── infrastructure/                                 │
│   │   ├── mcp-server.ts      # MCP server setup        │
│   │   └── say.ts             # macOS say wrapper      │
│   ├── tests/                                            │
│   │   ├── unit/              # Unit test files         │
│   │   └── integration/       # Integration tests       │
│   └── mcp-server.ts           # Entry point            │
├───────────────────────────────────────────────────────────┤
│ .vscode/                                                  │
│   ├── launch.json           # Debug configuration     │
│   └── tasks.json            # Build tasks             │
├───────────────────────────────────────────────────────────┤
│ scripts/                                                  │
│   └── inspect.sh            # MCP Inspector launcher  │
└───────────────────────────────────────────────────────────┘
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

Check which conventions already exist in this project:

- [x] `CLAUDE.md` has coding conventions section (naming rules, import order, error handling)
- [ ] `docs/01-plan/conventions.md` exists (Phase 2 output)
- [ ] `CONVENTIONS.md` exists at project root
- [x] ESLint configuration (`.eslintrc.*`) - Need to add debug rules
- [x] TypeScript configuration (`tsconfig.json`) - Need to verify sourcemaps
- [ ] Prettier configuration (`.prettierrc`)

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Debug Logging** | console.error sporadic | [DEBUG] prefix, logger utility | High |
| **Error Handling** | Try-catch in async | Unified error wrapper | High |
| **File Logging** | None | /tmp/agent-speech-debug.log | Medium |
| **Import Order** | Defined in CLAUDE.md | Apply to new files | Medium |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `DEBUG` | Enable verbose logging | Development | ✅ Yes |
| `LOG_FILE` | Path to debug log file | Development | ✅ Yes |
| `MCP_INSPECTOR_PORT` | Port for MCP Inspector | Development | ✅ Yes |

### 7.4 Pipeline Integration

This is a focused debugging environment task, not following the full 9-phase pipeline.

---

## 8. Implementation Tasks

### Phase 1: Core Debug Infrastructure

1. [ ] Create `src/utils/logger.ts` with debug logging utilities
2. [ ] Add stderr-only logging to all existing tool handlers
3. [ ] Implement error wrapper for async operations

### Phase 2: VS Code Configuration

4. [ ] Create `.vscode/launch.json` with TypeScript debug config
5. [ ] Create `.vscode/tasks.json` with build tasks
6. [ ] Verify tsconfig.json has sourcemap generation enabled
7. [ ] Test breakpoints in VS Code

### Phase 3: Unit Testing Setup

8. [ ] Create `tests/unit/logger.test.ts`
9. [ ] Create `tests/unit/tts.test.ts`
10. [ ] Create `tests/unit/filter.test.ts`
11. [ ] Verify Vitest runs successfully

### Phase 4: MCP Inspector Integration

12. [ ] Create `scripts/inspect.sh` script
13. [ ] Test MCP Inspector with sample tool invocation
14. [ ] Document Inspector workflow

### Phase 5: Local Claude Code Integration

15. [ ] Create example `~/.config/claude-code/config.json` snippet
16. [ ] Test plugin loading in local Claude Code
17. [ ] Verify tool invocation from Claude Code

### Phase 6: Log File Management

18. [ ] Implement file logging in `src/utils/logger.ts`
19. [ ] Add log rotation (max 10MB, 3 files)
20. [ ] Create `/tmp/agent-speech-debug.log` on first use

### Phase 7: Schema Validation

21. [ ] Install Zod dependency
22. [ ] Define Zod schemas for all tool inputs
23. [ ] Add validation to tool handlers

---

## 9. Next Steps

1. [ ] Write design document (`debug-env-setup.design.md`)
2. [ ] Review and approve plan
3. [ ] Start implementation following Phase 1-7 order

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-13 | Initial draft | welico |
