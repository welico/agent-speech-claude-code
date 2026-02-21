# Changelog

All notable changes to the agent-speech-claude-code project will be documented in this file.

## [2026-02-17] - Project Completion v1.0

### Added
- Complete agent-speech-claude-code v1.0 implementation
- Comprehensive completion report documenting all 7 features
- Multi-language TTS support with 8 languages via Google Translate
- Interactive CLI commands (`agent-speech language`, `agent-speech mute`)
- Marketplace distribution system with automated deployment
- Complete documentation suite (800+ lines)
- 64 unit tests with full coverage
- MCP server integration with tool registration

### Changed
- Project status from development to complete
- All features archived with 95-100% design match rates
- Enhanced configuration system with hierarchical structure
- Improved hook system with standardized convention
- Added comprehensive error handling and validation
- Automated release management system

### Fixed
- Configuration file compatibility issues between TypeScript and bash
- Hook integration problems across different CLI tools
- TTS chunking for long text responses
- Edge case handling for missing/corrupt files
- Permission error handling for file operations

---

## [2026-02-17] - CLI Interactive Commands Implementation

### Added
- Interactive CLI commands for language selection and TTS muting
- `agent-speech language` command with 8 supported language options
- `agent-speech mute` command with 7 duration options (5min - 2hr + permanent)
- `agent-speech mute off` command for canceling active mute
- Mute state management with timestamp-based expiry and auto-cleanup
- IS_MUTED variable export in load-config.sh for hook integration
- Mute guard clauses added to all 5 bash hook scripts
- Comprehensive error handling for file operations and user input
- Type-safe implementation with TypeScript interfaces and constants

### Changed
- Updated CLI help text to include new language and mute commands
- Enhanced load-config.sh with mute state checking logic
- Added language field patching at top level for bash compatibility
- Improved error messages with clear guidance for users

### Fixed
- Addressed 2% design inconsistencies in implementation details
- Ensured backward compatibility with existing configuration structure
- Implemented proper file permission handling for all operations

---

## [2026-02-16] - Git Changes Documentation Synchronization

### Added
- Marketplace distribution expertise to cli-plugin-specialist.md agent documentation
- Marketplace distribution implementation status to prd.md with version history entry
- Go-to-Market Strategy section in prd.md covering Claude Code marketplace channel
- Documentation synchronization PDCA cycle documents (plan, design, completion report)

### Changed
- .bkit-memory.json version updated from 1.4.7 to 1.4.8
- .bkit-memory.json phase updated from design to completed
- docs/.bkit-memory.json session count corrected from 19 to 15
- docs/.bkit-memory.json timestamp synchronized to 2026-02-16T17:05:42.597Z
- CLAUDE.md recent achievements updated to include marketplace distribution

### Fixed
- Session count inconsistency between .bkit-memory.json files
- Marketplace distribution feature status not reflected in prd.md

---

## [2026-02-15] - Marketplace Distribution Implementation

### Added
- Complete marketplace distribution system for Claude Code plugin ecosystem
- Marketplace definition files (.claude-plugin/marketplace.json, plugin.json, .mcp.json)
- Automated release script (scripts/release.sh) for version management
- Marketplace validation script (test-marketplace.sh) for local testing
- Comprehensive marketplace documentation with setup guides
- Version synchronization across all metadata files
- User installation guide with marketplace commands
- Developer maintenance guide with release procedures
- Troubleshooting section for common marketplace issues

### Changed
- Updated package.json to include .claude-plugin files in distribution
- Enhanced project structure to support marketplace deployment
- Added marketplace testing to quality assurance process
- Improved documentation with marketplace-specific guides
- Created automated version bumping across all metadata files

### Fixed
- Marketplace discovery and installation flow documentation
- MCP server path configuration for marketplace deployment
- Version consistency between package.json and marketplace metadata
- File inclusion in npm package for marketplace distribution

---

## [2026-02-15] - README Usage Documentation

### Added
- Comprehensive README usage documentation with 539 lines of content
- Quick Start section for users to get speech output in < 2 minutes
- Installation guide with local development and npm options
- Configuration documentation including MCP server setup and environment variables
- Complete CLI reference for all 11 commands with examples
- Development section with testing and debugging guides
- Troubleshooting section covering 5 common issues
- MCP Tool Reference section with API documentation
- Test results summary showing 64 tests passing
- Project structure documentation with clear file organization
- Debug logging examples and multiple debugging methods

### Changed
- Fixed incorrect configuration path (was ~/.claude/mcp.json)
- Cleaned excessive whitespace (~100 lines removed)
- Reorganized documentation structure with logical flow
- Enhanced CLI command documentation with output examples
- Improved user guidance throughout the documentation
- Added macOS-specific notes and voice selection guidance

### Fixed
- Wrong config path in documentation
- Missing Quick Start section
- Incomplete CLI command examples
- Missing troubleshooting section
- Missing environment variables documentation
- Missing development testing guide

---

## [2026-02-15] - Debug Environment Setup

### Added
- Comprehensive debugging and testing environment for MCP server development
- Logger utility with stderr output and file logging with rotation
- Error handling wrapper with DebugError class for structured error management
- Zod schemas for tool input validation (SpeakTextInput, TTSConfig)
- VS Code debugging configuration with 6 debug configurations
- Vitest testing framework with 64 passing unit and integration tests
- MCP Inspector integration script for browser-based tool testing
- Environment variables support (DEBUG, LOG_FILE)
- Hot-reload development with `tsc --watch`
- Comprehensive test coverage targeting 70% (all targets met)

### Changed
- Updated package.json with development dependencies (vitest, zod, coverage)
- Added npm scripts for build, dev, test, and inspect commands
- Enhanced existing tool handlers with debug logging capabilities
- Improved error handling throughout the codebase

### Fixed
- Standardized all debug output to use console.error() to avoid MCP protocol interference
- Added proper error boundaries for async operations
- Implemented log file rotation to prevent disk space issues

---

## [2026-02-13] - Initial Implementation

### Added
- Basic MCP server structure
- Text-to-speech functionality with macOS say command
- Plugin configuration system
- CLI interface for plugin management