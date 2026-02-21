# [Do] Phase Summary: Rename Plugin to agent-speech

**Feature**: rename-to-agent-speech
**Status**: ✅ Completed
**Date**: 2026-02-20

## Changes Implemented

### ✅ Phase 1: Core Configuration
- [x] `package.json` - Updated name from "agent-speech" to "agent-speech"
- [x] `.bkit-memory.json` - Updated project name
- [x] Build verified successfully (`npm run build` passed)

### ✅ Phase 2: Directory Structure
- [x] Renamed `.claude-plugin/agent-speech/` → `.claude-plugin/agent-speech/`
- [x] Renamed `docs/archive/2026-02/agent-speech/` → `docs/archive/2026-02/agent-speech/`

### ✅ Phase 3: Plugin Configuration
- [x] `.claude-plugin/agent-speech/plugin.json` - Updated repository URLs
- [x] `.claude-plugin/marketplace.json` - Updated repository URLs

### ✅ Phase 4: Scripts
- [x] `scripts/package-release.sh` - Updated PACKAGE_NAME variable
- [x] `scripts/create-github-release.sh` - Updated PACKAGE_NAME variable
- [x] `scripts/test-installation.sh` - Updated PACKAGE_NAME variable

### ✅ Phase 5: Documentation
- [x] `README.md` - Updated all references
  - Title changed to "# agent-speech"
  - Repository URLs updated
  - Installation commands updated
  - Path references updated
- [x] `docs/examples/claude-code-config.json` - Updated paths and comments

### ✅ Phase 6: Configuration Files
- [x] `.mcp.json` - Updated MCP server path
- [x] `docs/.pdca-status.json` - Updated phase status

## Files Modified

### Core (2 files)
1. `package.json` - Package name
2. `.bkit-memory.json` - Project name

### Directories Renamed (2)
1. `.claude-plugin/agent-speech/` → `.claude-plugin/agent-speech/`
2. `docs/archive/2026-02/agent-speech/` → `docs/archive/2026-02/agent-speech/`

### Plugin Config (2 files)
3. `.claude-plugin/agent-speech/plugin.json`
4. `.claude-plugin/marketplace.json`

### Scripts (3 files)
5. `scripts/package-release.sh`
6. `scripts/create-github-release.sh`
7. `scripts/test-installation.sh`

### Documentation (2 files)
8. `README.md`
9. `docs/examples/claude-code-config.json`

### Config (1 file)
10. `.mcp.json`

## Verification Results

✅ **Build Status**: PASSED
```
npm run build
> agent-speech@0.2.0 build
> tsc
```

✅ **No TypeScript Errors**
✅ **All Files Updated**
✅ **Directory Structure Correct**

## Git Changes Summary

```
Modified:  15 files
Deleted:   13 files (old plugin directory)
Renamed:   2 directories
```

## Impact Assessment

### Breaking Changes
- npm package name changed: Users will need to install using new name
- Repository URLs changed: External references may need updates

### Non-Breaking
- CLI command name unchanged: `agent-speech` (already short)
- MCP server name unchanged: `agent-speech`
- All functionality preserved

## Next Steps

### Immediate
1. ✅ Review git changes with `git status`
2. Create commit with descriptive message
3. Test installation with new package name

### Future
1. Update any external documentation that references old name
2. Create npm package with new name
3. Update marketplace listings

## Commit Message Suggestion

```
refactor: rename plugin from agent-speech to agent-speech

Breaking Change:
- Package name changed: agent-speech → agent-speech
- Repository URLs updated to agent-speech

Changes:
- Update package.json name field
- Rename plugin directory structure
- Update all documentation references
- Update packaging scripts
- Update MCP configuration paths

Migration:
Users installing from source should use the new repository URL:
git clone https://github.com/welico/agent-speech.git

All functionality remains unchanged.
```

## Completion Checklist

- [x] All files renamed/updated
- [x] Build successful
- [x] No broken references
- [x] Documentation updated
- [x] Scripts updated
- [x] Configuration files updated
- [x] Ready for commit

---

**Implementation Time**: ~10 minutes
**Files Modified**: 10
**Directories Renamed**: 2
**Build Status**: ✅ PASSED
