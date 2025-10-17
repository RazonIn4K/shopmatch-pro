#!/bin/bash
# E2E Test Environment Setup Script
#
# This script prepares the environment for running Playwright E2E tests
# by copying the test environment configuration and clearing the Next.js cache
# to ensure NEXT_PUBLIC_AUTH_TEST_MODE=mock is properly loaded.
#
# Usage:
#   ./e2e/utils/setup-test-env.sh
#   npm run dev (in separate terminal)
#   npm run test:e2e

set -e

echo "🧪 Setting up E2E test environment..."

# Backup existing .env.local if it exists
if [ -f .env.local ]; then
  echo "📦 Backing up existing .env.local to .env.local.backup"
  cp .env.local .env.local.backup
fi

# Copy test environment
echo "📋 Copying .env.test.local to .env.local"
cp .env.test.local .env.local

# Clear Next.js cache to force rebuild with new env vars
echo "🧹 Clearing Next.js cache (.next directory)"
rm -rf .next

echo "✅ Test environment ready!"
echo ""
echo "Next steps:"
echo "1. Start dev server: npm run dev"
echo "2. Run E2E tests:   npm run test:e2e"
echo ""
echo "To restore production environment:"
echo "  cp .env.local.backup .env.local && rm -rf .next"
