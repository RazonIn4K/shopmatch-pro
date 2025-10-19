#!/bin/bash

# Webhook Diagnostic Script for ShopMatch Pro
# This script helps identify why webhooks aren't processing despite being configured
#
# Usage:
#   ./scripts/diagnose-webhook.sh           # Basic health checks
#   ./scripts/diagnose-webhook.sh --test    # Trigger test webhook event
#   ./scripts/diagnose-webhook.sh --monitor # Real-time event monitoring
#   ./scripts/diagnose-webhook.sh --verify  # Verify custom claims after webhook

set -e

echo "=================================================="
echo "ShopMatch Pro Webhook Diagnostic"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command line arguments
MODE="basic"
if [[ "$1" == "--test" ]]; then
    MODE="test"
elif [[ "$1" == "--monitor" ]]; then
    MODE="monitor"
elif [[ "$1" == "--verify" ]]; then
    MODE="verify"
elif [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    echo "Usage:"
    echo "  $0           # Basic health checks"
    echo "  $0 --test    # Trigger test webhook event"
    echo "  $0 --monitor # Real-time event monitoring"
    echo "  $0 --verify  # Verify custom claims after webhook"
    echo ""
    exit 0
fi

# Step 1: Test webhook endpoint responds
echo -e "${BLUE}Step 1: Testing webhook endpoint accessibility...${NC}"
WEBHOOK_URL="https://shopmatch-pro.vercel.app/api/stripe/webhook"
RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"test": "data"}' $WEBHOOK_URL)

if echo "$RESPONSE" | grep -q "Missing signature"; then
    echo -e "${GREEN}✅ Webhook endpoint is responding correctly${NC}"
    echo "   Response: $RESPONSE"
else
    echo -e "${RED}❌ Unexpected webhook response${NC}"
    echo "   Response: $RESPONSE"
    exit 1
fi
echo ""

# Step 2: Check production health
echo -e "${BLUE}Step 2: Checking production health...${NC}"
HEALTH=$(curl -s https://shopmatch-pro.vercel.app/api/health)
FIREBASE_OK=$(echo "$HEALTH" | jq -r '.checks.firebase')
STRIPE_OK=$(echo "$HEALTH" | jq -r '.checks.stripe')
ENV_OK=$(echo "$HEALTH" | jq -r '.checks.environment')

if [[ "$FIREBASE_OK" == "true" ]] && [[ "$STRIPE_OK" == "true" ]] && [[ "$ENV_OK" == "true" ]]; then
    echo -e "${GREEN}✅ All production checks passing${NC}"
    echo "   Firebase: $FIREBASE_OK"
    echo "   Stripe: $STRIPE_OK"
    echo "   Environment: $ENV_OK"
else
    echo -e "${RED}❌ Some production checks failing${NC}"
    echo "$HEALTH" | jq '.'
    exit 1
fi
echo ""

# Step 3: Check Stripe CLI availability
check_stripe_cli() {
    echo -e "${BLUE}Step 3: Checking Stripe CLI availability...${NC}"

    if ! command -v stripe &> /dev/null; then
        echo -e "${YELLOW}⚠️  Stripe CLI not found${NC}"
        echo "   Install with: brew install stripe/stripe-cli/stripe"
        echo "   Documentation: https://stripe.com/docs/stripe-cli"
        return 1
    else
        echo -e "${GREEN}✅ Stripe CLI installed${NC}"
        STRIPE_VERSION=$(stripe --version)
        echo "   Version: $STRIPE_VERSION"

        # Check if logged in
        if stripe config --list &> /dev/null; then
            echo -e "${GREEN}✅ Stripe CLI authenticated${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  Stripe CLI not authenticated${NC}"
            echo "   Login with: stripe login"
            return 1
        fi
    fi
}

# Step 4: Trigger test webhook event
trigger_test_event() {
    echo ""
    echo -e "${BLUE}Step 4: Triggering test webhook event...${NC}"

    if ! command -v stripe &> /dev/null; then
        echo -e "${RED}❌ Cannot trigger event - Stripe CLI not installed${NC}"
        echo "   Install first: brew install stripe/stripe-cli/stripe"
        return 1
    fi

    echo "   Sending checkout.session.completed event..."
    echo "   Target: $WEBHOOK_URL"
    echo ""

    # Trigger the event and capture output
    OUTPUT=$(stripe trigger checkout.session.completed 2>&1)

    if echo "$OUTPUT" | grep -Eq "Trigger (succeeded|successful)"; then
        echo -e "${GREEN}✅ Test event triggered successfully${NC}"
        echo "$OUTPUT" | grep -E "event id:|Trigger (succeeded|successful)" || true
        echo ""
        echo "   Check Stripe Dashboard → Events for delivery status"
        echo "   URL: https://dashboard.stripe.com/test/events"
        return 0
    else
        echo -e "${RED}❌ Failed to trigger test event${NC}"
        echo "$OUTPUT"
        return 1
    fi
}

# Step 5: Verify Firebase custom claims
verify_custom_claims() {
    echo ""
    echo -e "${BLUE}Step 5: Verifying Firebase custom claims...${NC}"

    # Check if Firebase CLI is installed
    if ! command -v firebase &> /dev/null; then
        echo -e "${YELLOW}⚠️  Firebase CLI not found${NC}"
        echo "   Install with: npm install -g firebase-tools"
        echo "   Documentation: https://firebase.google.com/docs/cli"
        return 1
    fi

    echo "   This step requires Firebase CLI authentication"
    echo "   Run manually: firebase login"
    echo ""
    echo "   To verify custom claims for a user:"
    echo "   1. Get user UID from Firebase Console"
    echo "   2. Run: firebase auth:export users.json --project shopmatch-c7df0"
    echo "   3. Check customClaims field in users.json"
    echo ""
    echo "   Expected: {\"role\": \"owner\", \"subActive\": true}"
    echo ""
}

# Step 6: Monitor live webhook events
monitor_live_events() {
    echo ""
    echo -e "${BLUE}Step 6: Starting real-time webhook event monitoring...${NC}"

    if ! command -v stripe &> /dev/null; then
        echo -e "${RED}❌ Cannot monitor - Stripe CLI not installed${NC}"
        echo "   Install first: brew install stripe/stripe-cli/stripe"
        return 1
    fi

    echo "   Forwarding Stripe events to: $WEBHOOK_URL"
    echo "   Press Ctrl+C to stop"
    echo ""
    echo -e "${YELLOW}=================================================="
    echo "Live Event Stream"
    echo "==================================================${NC}"
    echo ""

    # Start listening for events
    stripe listen --forward-to "$WEBHOOK_URL" --print-json
}

# Execute based on mode
if [[ "$MODE" == "test" ]]; then
    check_stripe_cli && trigger_test_event && verify_custom_claims
    echo ""
    echo -e "${GREEN}✅ Test complete - check Stripe Dashboard for event delivery${NC}"
    exit 0
elif [[ "$MODE" == "monitor" ]]; then
    check_stripe_cli && monitor_live_events
    exit 0
elif [[ "$MODE" == "verify" ]]; then
    verify_custom_claims
    exit 0
fi

# Step 3: Provide next steps (basic mode)
echo ""
echo -e "${YELLOW}=================================================="
echo "Manual Steps Required (Cannot Automate)"
echo "==================================================${NC}"
echo ""

echo -e "${BLUE}Step 3: Check Stripe Dashboard Webhook Configuration${NC}"
echo "   1. Go to: https://dashboard.stripe.com/test/webhooks"
echo "   2. Look for webhook with URL: $WEBHOOK_URL"
echo "   3. Verify:"
echo "      - Status: Enabled (not Disabled)"
echo "      - Events selected: 4 events"
echo "        ☑ checkout.session.completed"
echo "        ☑ customer.subscription.created"
echo "        ☑ customer.subscription.updated"
echo "        ☑ customer.subscription.deleted"
echo ""

echo -e "${BLUE}Step 4: Test Webhook in Stripe Dashboard${NC}"
echo "   1. On your webhook page, click 'Send test webhook'"
echo "   2. Select event: checkout.session.completed"
echo "   3. Click 'Send test webhook'"
echo "   4. Check the response:"
echo ""
echo "   Expected: ${GREEN}200 OK${NC}"
echo ""
echo "   If you see:"
echo "   - ${RED}400 Bad Request${NC} → Signing secret mismatch (Fix: Re-copy secret from Stripe → Vercel)"
echo "   - ${RED}500 Internal Server Error${NC} → Server error (Check Vercel logs)"
echo "   - ${RED}Timeout${NC} → Function timeout (Check Vercel logs)"
echo ""

echo -e "${BLUE}Step 5: Check Recent Webhook Attempts${NC}"
echo "   1. Go to: https://dashboard.stripe.com/test/events"
echo "   2. Find recent 'checkout.session.completed' event (if you've attempted payment)"
echo "   3. Click on the event"
echo "   4. Scroll to 'Sent to webhook' section"
echo "   5. Check response status"
echo ""

echo -e "${BLUE}Step 6: Check Vercel Deployment Logs${NC}"
echo "   1. Go to: https://vercel.com/razs-projects-29d4f2e6/shopmatch-pro"
echo "   2. Click 'Deployments' → 'Production' (latest)"
echo "   3. Click 'Functions' tab"
echo "   4. Type 'webhook' in filter box"
echo "   5. Look for /api/stripe/webhook logs"
echo "   6. Check for any errors"
echo ""

echo -e "${YELLOW}=================================================="
echo "Most Common Issues When 'Already Configured'"
echo "==================================================${NC}"
echo ""

echo -e "${BLUE}Issue 1: Signing Secret Mismatch${NC}"
echo "   Problem: STRIPE_WEBHOOK_SECRET in Vercel doesn't match Stripe"
echo "   Fix:"
echo "   1. Stripe Dashboard → Webhooks → Your webhook → 'Reveal' signing secret"
echo "   2. Copy the EXACT secret (whsec_...)"
echo "   3. Vercel → Settings → Environment Variables → STRIPE_WEBHOOK_SECRET → Edit"
echo "   4. Paste exact secret (no extra spaces)"
echo "   5. Wait 2 minutes for redeploy"
echo ""

echo -e "${BLUE}Issue 2: Token Not Refreshed${NC}"
echo "   Problem: Browser has cached old token without custom claims"
echo "   Fix (in browser console while logged in):"
echo "   const user = firebase.auth().currentUser"
echo "   await user.getIdToken(true)  // Force refresh"
echo "   const token = await user.getIdTokenResult()"
echo "   console.log('subActive:', token.claims.subActive)"
echo ""

echo -e "${BLUE}Issue 3: Multiple Webhooks Configured${NC}"
echo "   Problem: Old ngrok webhook still exists and receiving events"
echo "   Fix:"
echo "   1. Stripe Dashboard → Webhooks"
echo "   2. Delete any webhooks with ngrok or localhost URLs"
echo "   3. Keep only: $WEBHOOK_URL"
echo ""

echo -e "${BLUE}Issue 4: Wrong Vercel Environment${NC}"
echo "   Problem: Updated STRIPE_WEBHOOK_SECRET in Preview/Development, not Production"
echo "   Fix:"
echo "   1. Vercel → Settings → Environment Variables"
echo "   2. Find STRIPE_WEBHOOK_SECRET"
echo "   3. Ensure 'Production' checkbox is checked (not just Preview)"
echo "   4. If not, edit and check Production"
echo ""

echo -e "${GREEN}=================================================="
echo "Automated Checks: PASSED ✅"
echo "==================================================${NC}"
echo ""
echo "Next Steps:"
echo ""
echo -e "${BLUE}Quick Test (Recommended):${NC}"
echo "  ./scripts/diagnose-webhook.sh --test    # Trigger test webhook"
echo ""
echo -e "${BLUE}Monitor Live Events:${NC}"
echo "  ./scripts/diagnose-webhook.sh --monitor # Watch events in real-time"
echo ""
echo -e "${BLUE}Verify Custom Claims:${NC}"
echo "  ./scripts/diagnose-webhook.sh --verify  # Check Firebase auth claims"
echo ""
echo "Or complete manual steps above and report findings"
echo ""
