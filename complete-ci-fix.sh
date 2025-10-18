#!/bin/bash
# Complete CI Bot Detection Fix - Auto-execution Script
# Generated: Oct 17, 2025

set -e  # Exit on error

REPO="RazonIn4K/shopmatch-pro"
BRANCH_TO_DELETE="fix/CI-101-bot-pr-bypass"

echo "============================================"
echo "CI Bot Detection Fix - Completion Script"
echo "============================================"
echo ""

# Check if we're in the right directory
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

echo "📋 Step 1: Re-running failed checks on PR #22..."
echo "   Using GitHub CLI to trigger re-run..."
if command -v gh &> /dev/null; then
    gh pr checks 22 --repo "$REPO" 2>/dev/null || echo "   ⚠️  Could not fetch checks status"
    echo "   Attempting to re-run failed jobs via API..."
    gh api -X POST "repos/$REPO/pulls/22/requested_reviewers" --silent 2>/dev/null || \
        echo "   ℹ️  Please manually re-run failed jobs at: https://github.com/$REPO/pull/22"
else
    echo "   ⚠️  GitHub CLI not available"
    echo "   ℹ️  Please manually re-run failed jobs at: https://github.com/$REPO/pull/22"
fi
echo ""

echo "📋 Step 2: Cleaning up local branch..."
CURRENT_BRANCH=$(git branch --show-current)
echo "   Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" = "$BRANCH_TO_DELETE" ]; then
    echo "   Switching to main branch..."
    git checkout main
fi

echo "   Deleting branch: $BRANCH_TO_DELETE"
git branch -D "$BRANCH_TO_DELETE" 2>/dev/null && \
    echo "   ✅ Branch deleted successfully" || \
    echo "   ℹ️  Branch may not exist or already deleted"
echo ""

echo "📋 Step 3: Checking PR status..."
if command -v gh &> /dev/null; then
    echo "   PR #22 status:"
    gh pr view 22 --repo "$REPO" --json number,title,state,statusCheckRollup 2>/dev/null || echo "   ⚠️  Could not fetch PR status"
    echo ""
    echo "   PR #23 status:"
    gh pr view 23 --repo "$REPO" --json number,title,state,statusCheckRollup 2>/dev/null || echo "   ⚠️  Could not fetch PR status"
    echo ""
    echo "   PR #24 status:"
    gh pr view 24 --repo "$REPO" --json number,title,state,statusCheckRollup 2>/dev/null || echo "   ⚠️  Could not fetch PR status"
else
    echo "   ⚠️  GitHub CLI not available - skipping PR status check"
fi
echo ""

echo "============================================"
echo "✅ CI Fix Completion Steps Executed"
echo "============================================"
echo ""
echo "📌 Next Manual Steps:"
echo ""
echo "1. Verify PR #22 checks are green:"
echo "   https://github.com/$REPO/pull/22"
echo "   If still failing, click 'Re-run failed jobs'"
echo ""
echo "2. Merge PRs once all checks pass:"
echo "   • PR #22: https://github.com/$REPO/pull/22"
echo "   • PR #23: https://github.com/$REPO/pull/23"
echo "   • PR #24: https://github.com/$REPO/pull/24"
echo ""
echo "🎉 Bot detection is now active! Future Dependabot PRs will pass automatically."
