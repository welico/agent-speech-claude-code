# Changelog

All notable changes to the agent-speech-plugin project will be documented in this file.

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