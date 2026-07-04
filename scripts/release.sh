#!/bin/bash
set -e

# Release script for agent-speech-claude-code
# This script automates the release process for the marketplace

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: ./scripts/release.sh <version>"
  echo "Example: ./scripts/release.sh 0.2.0"
  exit 1
fi

# Validate version format (semver)
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: Version must be in semantic versioning format (e.g., 0.2.0)"
  exit 1
fi

echo "🚀 Releasing agent-speech-claude-code v$VERSION"

# Step 1: Update version in package.json
echo "📦 Updating package.json version to $VERSION"
npm version "$VERSION" --no-git-tag-version

# Step 2: Update marketplace.json version
echo "📦 Updating .claude-plugin/marketplace.json version to $VERSION"
sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" .claude-plugin/marketplace.json

# Step 3: Update plugin.json version
echo "📦 Updating .claude-plugin/plugin.json version to $VERSION"
sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" .claude-plugin/plugin.json

# Step 4: Build the project and re-bundle the MCP server
echo "🔨 Building the project"
pnpm build
node scripts/bundle-mcp.js

# Step 5: Run tests
echo "🧪 Running tests"
pnpm test

# Step 6: Commit changes
echo "💾 Committing version changes"
git add package.json package-lock.json .claude-plugin/marketplace.json .claude-plugin/plugin.json dist
git commit -m "chore: release v$VERSION"

# Step 7: Create git tag
echo "🏷️  Creating git tag v$VERSION"
git tag -a "v$VERSION" -m "Release v$VERSION"

# Step 8: Push to GitHub
echo "📤 Pushing to GitHub"
git push
git push --tags

echo ""
echo "✅ Release v$VERSION complete!"
echo ""
echo "Next steps:"
echo "1. Create a GitHub release: https://github.com/welico/agent-speech-claude-code/releases/new"
echo "2. Tag: v$VERSION"
echo "3. Include the changelog"
echo ""
echo "To install from marketplace:"
echo "  claude plugin marketplace add welico/agent-speech-claude-code"
echo "  claude plugin install agent-speech@welico"
