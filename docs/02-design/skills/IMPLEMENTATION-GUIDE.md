# Skills Implementation Guide for Agent Speech Plugin

This guide provides step-by-step instructions for implementing the Claude Code skills structure for the agent-speech-claude-code.

## Directory Structure

First, create the skills directory structure:

```bash
# Create skills directory in the plugin location
mkdir -p ~/.claude-plugin/agent-speech-claude-code/skills

# Copy the design files to the actual skills directory
cp docs/02-design/skills/SKILL.md ~/.claude-plugin/agent-speech-claude-code/skills/
cp docs/02-design/skills/skill-init.sh ~/.claude-plugin/agent-speech-claude-code/skills/
cp docs/02-design/skills/skill-enable.sh ~/.claude-plugin/agent-speech-claude-code/skills/
cp docs/02-design/skills/skill-disable.sh ~/.claude-plugin/agent-speech-claude-code/skills/
cp docs/02-design/skills/skill-toggle.sh ~/.claude-plugin/agent-speech-claude-code/skills/
cp docs/02-design/skills/skill-status.sh ~/.claude-plugin/agent-speech-claude-code/skills/
cp docs/02-design/skills/skill-set-voice.sh ~/.claude-plugin/agent-speech-claude-code/skills/
cp docs/02-design/skills/skill-set-rate.sh ~/.claude-plugin/agent-speech-claude-code/skills/
cp docs/02-design/skills/skill-set-volume.sh ~/.claude-plugin/agent-speech-claude-code/skills/
cp docs/02-design/skills/skill-list-voices.sh ~/.claude-plugin/agent-speech-claude-code/skills/
cp docs/02-design/skills/skill-reset.sh ~/.claude-plugin/agent-speech-claude-code/skills/
cp docs/02-design/skills/skill-language.sh ~/.claude-plugin/agent-speech-claude-code/skills/
cp docs/02-design/skills/skill-mute.sh ~/.claude-plugin/agent-speech-claude-code/skills/
cp docs/02-design/skills/skill-help.sh ~/.claude-plugin/agent-speech-claude-code/skills/
```

## Make Scripts Executable

Set executable permissions for all skill scripts:

```bash
chmod +x ~/.claude-plugin/agent-speech-claude-code/skills/skill-*.sh
```

## Verify CLI Entry Point

Ensure the CLI entry point exists and is accessible:

```bash
# Check if cli.js exists
ls -la src/cli.js

# Test Node.js availability
node --version

# Test CLI functionality
node src/cli.js --help
```

## Update Plugin Hooks

Update the plugin hooks to include skill installation. Modify the plugin hooks to create and install the skills:

### 1. Update Installation Hook

Add to `.claude-plugin/agent-speech-claude-code/hooks/load-config.sh`:

```bash
# Install skills
echo "Installing agent-speech skills..."

# Create skills directory
mkdir -p ~/.claude-plugin/agent-speech-claude-code/skills

# Copy SKILL.md
cp ~/.claude-plugin/agent-speech-claude-code/config/SKILL.md ~/.claude-plugin/agent-speech-claude-code/skills/

# Copy and make executable all skill scripts
for script in ~/.claude-plugin/agent-speech-claude-code/skills/skill-*.sh; do
    cp "$(dirname "$0")/../skills/$(basename "$script")" "$script"
    chmod +x "$script"
done

echo "Skills installed successfully"
```

### 2. Create Skills Package

Create a skills package in the plugin:

```bash
# Create skills directory in plugin
mkdir -p .claude-plugin/agent-speech-claude-code/skills

# Copy all design files to plugin skills directory
cp docs/02-design/skills/SKILL.md .claude-plugin/agent-speech-claude-code/skills/
cp docs/02-design/skills/skill-*.sh .claude-plugin/agent-speech-claude-code/skills/
```

## Testing the Skills

### 1. Test Individual Skills

Test each skill command:

```bash
# Test help
~/.claude-plugin/agent-speech-claude-code/skills/skill-help.sh

# Test status
~/.claude-plugin/agent-speech-claude-code/skills/skill-status.sh

# Test voice list
~/.claude-plugin/agent-speech-claude-code/skills/skill-list-voices.sh

# Test enable command
~/.claude-plugin/agent-speech-claude-code/skills/skill-enable.sh claude-code
```

### 2. Test Error Handling

```bash
# Test missing parameters
~/.claude-plugin/agent-speech-claude-code/skills/skill-enable.sh
~/.claude-plugin/agent-speech-claude-code/skills/skill-set-rate.sh

# Test invalid parameters
~/.claude-plugin/agent-speech-claude-code/skills/skill-set-rate.sh abc
```

### 3. Test Integration

Verify skills integrate properly with the existing CLI:

```bash
# Compare output between CLI and skills
node src/cli.js status
~/.claude-plugin/agent-speech-claude-code/skills/skill-status.sh

node src/cli.js enable claude-code
~/.claude-plugin/agent-speech-claude-code/skills/skill-enable.sh claude-code
```

## Deployment Script

Create a deployment script to automate the setup:

```bash
#!/bin/bash
# deploy-skills.sh - Deploy skills to Claude Code plugin location

set -e

echo "Deploying agent-speech skills..."

# Plugin directory
PLUGIN_DIR="$HOME/.claude-plugin/agent-speech-claude-code"

# Create skills directory
mkdir -p "$PLUGIN_DIR/skills"

# Copy SKILL.md
cp docs/02-design/skills/SKILL.md "$PLUGIN_DIR/skills/"

# Copy and make executable scripts
for script in docs/02-design/skills/skill-*.sh; do
    script_name=$(basename "$script")
    cp "$script" "$PLUGIN_DIR/skills/"
    chmod +x "$PLUGIN_DIR/skills/$script_name"
done

echo "Skills deployed successfully to $PLUGIN_DIR/skills/"
echo "Available commands:"
ls -1 "$PLUGIN_DIR/skills/skill-"*.sh | sed 's/.*\///' | sed 's/\.sh$//'
```

## Troubleshooting

### 1. Permission Issues

If scripts are not executable:

```bash
chmod +x ~/.claude-plugin/agent-speech-claude-code/skills/skill-*.sh
```

### 2. Path Issues

If CLI path is incorrect, update the scripts:

```bash
# In each skill script, update CLI_PATH if needed
CLI_PATH="$SCRIPT_DIR/../../../src/cli.js"  # Adjust relative path as needed
```

### 3. Node.js Issues

Ensure Node.js is installed and accessible:

```bash
which node
node --version
```

### 4. Plugin Location

Verify plugin location:

```bash
ls -la ~/.claude-plugin/agent-speech-claude-code/
```

## Verification Checklist

After deployment, verify:

- [ ] Skills directory exists at `~/.claude-plugin/agent-speech-claude-code/skills/`
- [ ] SKILL.md file is present
- [ ] All skill scripts are present and executable
- [ ] Each skill command works correctly
- [ ] Error handling works as expected
- [ ] Integration with existing CLI verified
- [ ] Help system accessible via skills

## Maintenance

### Updating Skills

1. Update CLI commands in `src/`
2. Update corresponding skill scripts in `docs/02-design/skills/`
3. Re-deploy using the deployment script

### Adding New Commands

1. Add command to CLI in `src/cli.ts`
2. Create corresponding skill script
3. Update SKILL.md metadata
4. Update deployment script

### Documentation Updates

1. Update this implementation guide if structure changes
2. Update plugin hooks if installation process changes
3. Update user documentation with new skill commands