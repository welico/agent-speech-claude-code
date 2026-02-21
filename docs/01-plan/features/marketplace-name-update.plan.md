# PDCA Plan: Marketplace Name Update

## Feature: Marketplace Name Update
**ID**: marketplace-name-update
**Priority**: High
**Type**: Refactoring / Branding Update
**Duration**: 2-3 hours
**Dependencies**: None

---

## 1. Problem Statement

Current marketplace name "welico" needs to be updated to "agent-speech-marketplace" to better reflect the project's purpose and improve brand consistency across all marketplace-related references in the codebase.

---

## 2. Current State Analysis

After comprehensive search, I identified **47 files** containing "welico" references, with **14 files** specifically containing marketplace-related GitHub URLs and configurations.

### Key Files Requiring Updates:

#### Primary Marketplace Configuration Files:
1. **`.claude-plugin/marketplace.json`** - Marketplace definition
2. **`.claude-plugin/agent-speech-claude-code/plugin.json`** - Plugin metadata
3. **`.claude-plugin/agent-speech-claude-code/.mcp.json`** - MCP server config
4. **`.claude-plugin/agent-speech-claude-code/README.md`** - Plugin documentation

#### Documentation and Setup Files:
5. **`README.md`** - Main project README
6. **`docs/marketplace-setup.md`** - Marketplace setup guide
7. **`docs/marketplace-implementation-summary.md`** - Implementation summary
8. **`test-marketplace.sh`** - Test script
9. **`scripts/release.sh`** - Release script

#### Package and Configuration Files:
10. **`package.json`** - Package metadata

#### Low Priority (Archive and documentation files - 24+ files in docs/archive/)

---

## 3. Detailed Inventory of Required Changes

### High Priority Files (Critical Marketplace References):

#### 3.1 `.claude-plugin/marketplace.json`
```json
{
  "name": "welico" → "agent-speech-marketplace",
  "description": "Plugin marketplace by welico" → "Plugin marketplace by agent-speech-marketplace",
  "owner": {
    "name": "welico" → "agent-speech-marketplace",
    "url": "https://github.com/welico" → "https://github.com/welico/agent-speech-marketplace"
  },
  "plugins": [{
    "author": {
      "name": "welico" → "agent-speech-marketplace",
      "url": "https://github.com/welico" → "https://github.com/welico/agent-speech-marketplace"
    },
    "repository": "https://github.com/welico/agent-speech-claude-code" → "https://github.com/welico/agent-speech-marketplace/agent-speech-claude-code"
  }]
}
```

#### 3.2 `.claude-plugin/agent-speech-claude-code/plugin.json`
```json
{
  "author": {
    "name": "welico" → "agent-speech-marketplace",
    "email": "welico@users.noreply.github.com" → "marketplace@agent-speech-marketplace.com",
    "url": "https://github.com/welico" → "https://github.com/welico/agent-speech-marketplace"
  },
  "repository": "https://github.com/welico/agent-speech-claude-code" → "https://github.com/welico/agent-speech-marketplace/agent-speech-claude-code",
  "homepage": "https://github.com/welico/agent-speech-claude-code#readme" → "https://github.com/welico/agent-speech-marketplace/agent-speech-claude-code#readme"
}
```

#### 3.3 `README.md`
- Update Repository URL from `https://github.com/welico/agent-speech-claude-code` to `https://github.com/welico/agent-speech-marketplace/agent-speech-claude-code`
- Update marketplace installation commands:
  ```bash
  claude plugin marketplace add welico → claude plugin marketplace add agent-speech-marketplace
  ```

#### 3.4 `docs/marketplace-setup.md`
- Update all marketplace references in installation examples
- Update marketplace URL references
- Update setup commands

#### 3.5 Supporting Files
- `.claude-plugin/agent-speech-claude-code/README.md` - Installation commands
- `scripts/release.sh` - Command examples
- `test-marketplace.sh` - Test script and output messages

---

## 4. Implementation Strategy

### Phase 1: Core Marketplace Configuration (30 minutes)
1. **Bulk Find-and-Replace Operations**
   ```bash
   # Update marketplace.json
   sed -i '' 's/"name": "welico"/"name": "agent-speech-marketplace"/g' .claude-plugin/marketplace.json
   sed -i '' 's/Plugin marketplace by welico/Plugin marketplace by agent-speech-marketplace/g' .claude-plugin/marketplace.json
   sed -i '' 's/"name": "welico"/"name": "agent-speech-marketplace"/g' .claude-plugin/marketplace.json

   # Update plugin.json
   sed -i '' 's/"name": "welico"/"name": "agent-speech-marketplace"/g' .claude-plugin/agent-speech-claude-code/plugin.json
   sed -i '' 's/welico@users.noreply.github.com/marketplace@agent-speech-marketplace.com/g' .claude-plugin/agent-speech-claude-code/plugin.json
   ```

2. **Manual URL Updates**
   - Update GitHub repository URLs in owner and repository fields
   - Ensure consistent repository path structure

### Phase 2: Documentation Updates (60 minutes)
1. **Markdown Files**
   - Update all installation commands
   - Update marketplace references
   - Update repository URLs

2. **Script Files**
   - Update release script examples
   - Update test script commands and output

### Phase 3: Testing and Validation (30 minutes)
1. **Configuration Validation**
   - JSON syntax checking
   - Field consistency verification

2. **Functionality Testing**
   - Marketplace installation test
   - MCP server load test
   - Script execution tests

---

## 5. Testing Approach

### Pre-Update Validation
```bash
# Create backup
git add .
git commit -m "backup: Pre-marketplace name update"

# List all references
grep -r "welico" .claude-plugin/
grep -r "github.com/welico" docs/
grep -r "claude plugin marketplace add welico" .
```

### Post-Update Verification
```bash
# Verify key files
cat .claude-plugin/marketplace.json | grep -E "name|description|owner"
cat .claude-plugin/agent-speech-claude-code/plugin.json | grep -E "author|repository"
grep -r "agent-speech-marketplace" docs/

# Test functionality
./test-marketplace.sh
```

### Automated Tests
1. Marketplace Configuration Validation
2. Script Functionality Tests
3. Installation Command Verification

---

## 6. Risk Assessment and Mitigation

### Risks:
1. **Marketplace URL Changes** - Users need to remove and re-add marketplace
2. **Author Identity** - Package.json author field conflicts possible
3. **Documentation Consistency** - Archive files may need updates

### Mitigation:
1. **Migration Guide** - Create transition documentation
2. **Version Management** - Consider semantic versioning
3. **Communication Plan** - Update release notes and GitHub description

---

## 7. Success Criteria

### Completion Metrics:
1. **14 marketplace-related files** updated
2. **All JSON files** pass validation
3. **Marketplace installation** works with new name
4. **Documentation consistency** across all references

### Quality Checks:
1. No regressions in existing functionality
2. Marketplace compatibility maintained
3. User experience preserved
4. All automated tests pass

---

## 8. Rollback Plan

### Immediate Options:
1. **Git-based rollback**
   ```bash
   git reset --hard HEAD~1
   # Or restore specific files
   git checkout .claude-plugin/marketplace.json
   git checkout .claude-plugin/agent-speech-claude-code/plugin.json
   ```

2. **Partial rollback** - Restore individual files using git checkout

### Recovery Procedures:
1. Configuration backup with timestamps
2. Migration documentation
3. Change log recording

---

## 9. Dependencies and Prerequisites

### Technical Requirements:
- Build environment available
- Git repository access
- Claude Code CLI for testing
- Network connectivity

### Environmental Dependencies:
- Current branch: main
- Clean working tree status
- All dependencies installed

---

## 10. Acceptance Criteria

### Functional Requirements:
- [ ] Marketplace name updated in all configuration files
- [ ] All installation commands use new marketplace name
- [ ] Repository URLs updated correctly
- [ ] MCP server configuration remains functional
- [ ] Test script passes with new name

### Non-Functional Requirements:
- [ ] JSON syntax validation passes
- [ ] Documentation consistency maintained
- [ ] No breaking changes to functionality
- [ ] User migration path documented

---

## 11. Implementation Notes

### Key Considerations:
1. **Brand Consistency** - Ensure new name reflects project purpose
2. **User Impact** - Minimal disruption for existing users
3. **Documentation Accuracy** - Update all references systematically
4. **Future Maintainability** - Clear naming convention established

### Quality Assurance:
1. **Cross-reference verification** between files
2. **Automated testing** of marketplace functionality
3. **Manual review** of documentation updates
4. **Backup strategy** for rollback capability

---

*Plan Created: 2026-02-17*
*Estimated Duration: 2-3 hours*
*PDCA Phase: Plan → Next: Design*