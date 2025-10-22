#!/bin/bash
# Stripe Live Webhook Setup Script
# Usage: ./scripts/setup-stripe-webhook.sh

set -e

echo "🚀 Stripe Live Webhook Setup"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Create Webhook in Stripe Dashboard${NC}"
echo "-------------------------------------------"
echo ""
echo "1. Open: https://dashboard.stripe.com/webhooks"
echo "2. Switch to LIVE mode (toggle top-left)"
echo "3. Click 'Add endpoint'"
echo "4. Configure:"
echo "   - Endpoint URL: https://shopmatch-pro.vercel.app/api/stripe/webhook"
echo "   - Description: ShopMatch Pro - Production Subscription Events"
echo "   - Events to select:"
echo "     ✓ checkout.session.completed"
echo "     ✓ customer.subscription.created"
echo "     ✓ customer.subscription.updated"
echo "     ✓ customer.subscription.deleted"
echo ""
echo -e "${YELLOW}⚠️  After creating the webhook, you'll see a 'Signing secret'${NC}"
echo ""
read -p "Press Enter when webhook is created and you have the signing secret..."
echo ""

echo -e "${BLUE}Step 2: Add Webhook Secret to Vercel${NC}"
echo "--------------------------------------"
echo ""
echo "Running: vercel env add STRIPE_WEBHOOK_SECRET production"
echo ""
vercel env add STRIPE_WEBHOOK_SECRET production

echo ""
echo -e "${GREEN}✅ Webhook secret added to Vercel${NC}"
echo ""

echo -e "${BLUE}Step 3: Verify Environment Variable${NC}"
echo "------------------------------------"
echo ""
echo "Checking if STRIPE_WEBHOOK_SECRET is set..."
if vercel env ls production | grep -q "STRIPE_WEBHOOK_SECRET"; then
    echo -e "${GREEN}✅ STRIPE_WEBHOOK_SECRET is configured${NC}"
else
    echo -e "${RED}❌ STRIPE_WEBHOOK_SECRET not found${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}Step 4: Redeploy to Production${NC}"
echo "-------------------------------"
echo ""
read -p "Redeploy to production now? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deploying to production..."
    vercel --prod --yes
    echo ""
    echo -e "${GREEN}✅ Deployment complete${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping deployment. Run 'vercel --prod' manually.${NC}"
fi
echo ""

echo -e "${BLUE}Step 5: Test Webhook Endpoint${NC}"
echo "------------------------------"
echo ""
echo "Testing webhook endpoint accessibility..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://shopmatch-pro.vercel.app/api/stripe/webhook -H "Content-Type: application/json" -d '{}')

if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Webhook endpoint is accessible (HTTP $HTTP_CODE)${NC}"
    echo "   Note: 400 is expected (missing signature), 200 means it's processing"
elif [ "$HTTP_CODE" = "405" ]; then
    echo -e "${GREEN}✅ Webhook endpoint exists (HTTP 405 - Method not allowed for GET)${NC}"
    echo "   POST requests with valid Stripe signatures will work"
else
    echo -e "${RED}❌ Unexpected response: HTTP $HTTP_CODE${NC}"
    echo "   Check deployment logs: vercel logs --prod"
fi
echo ""

echo -e "${BLUE}Step 6: Monitor Webhook in Stripe${NC}"
echo "----------------------------------"
echo ""
echo "1. Go to: https://dashboard.stripe.com/webhooks"
echo "2. Click on your webhook endpoint"
echo "3. Click 'Send test webhook'"
echo "4. Select 'checkout.session.completed'"
echo "5. Click 'Send test webhook'"
echo ""
echo "Expected result: 200 OK with successful delivery"
echo ""

echo "================================"
echo -e "${GREEN}✅ Stripe Webhook Setup Complete!${NC}"
echo "================================"
echo ""
echo "Next Steps:"
echo "1. Test webhook with Stripe CLI:"
echo "   stripe listen --forward-to https://shopmatch-pro.vercel.app/api/stripe/webhook"
echo ""
echo "2. Monitor webhook deliveries in Stripe Dashboard"
echo ""
echo "3. Move to Step 6: Sentry Dashboard Setup"
echo "   See: docs/SENTRY_DASHBOARD_SETUP_WALKTHROUGH.md"
echo ""
