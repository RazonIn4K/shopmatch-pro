#!/bin/bash
# Production Verification Script
# Verifies all production systems are operational

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

FAILED_CHECKS=0

echo "🔍 ShopMatch Pro - Production Verification"
echo "=========================================="
echo ""

# Function to check and report
check() {
    local name=$1
    local command=$2
    local expected=$3
    
    echo -n "Checking $name... "
    
    if eval "$command"; then
        echo -e "${GREEN}✅ PASS${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

echo -e "${BLUE}=== Basic Health ===${NC}"
echo ""

# Health endpoint
check "Health API" \
    "curl -sf https://shopmatch-pro.vercel.app/api/health | jq -e '.status == \"ok\"' > /dev/null" \
    "200 OK"

# Homepage
check "Homepage" \
    "curl -sf -o /dev/null -w '%{http_code}' https://shopmatch-pro.vercel.app | grep -q '200'" \
    "200 OK"

echo ""
echo -e "${BLUE}=== Security Headers ===${NC}"
echo ""

# Check each security header
check "X-Content-Type-Options" \
    "curl -sI https://shopmatch-pro.vercel.app | grep -qi 'x-content-type-options: nosniff'" \
    "nosniff"

check "X-Frame-Options" \
    "curl -sI https://shopmatch-pro.vercel.app | grep -qi 'x-frame-options: DENY'" \
    "DENY"

check "X-XSS-Protection" \
    "curl -sI https://shopmatch-pro.vercel.app | grep -qi 'x-xss-protection'" \
    "enabled"

check "Referrer-Policy" \
    "curl -sI https://shopmatch-pro.vercel.app | grep -qi 'referrer-policy'" \
    "present"

check "Permissions-Policy" \
    "curl -sI https://shopmatch-pro.vercel.app | grep -qi 'permissions-policy'" \
    "present"

echo ""
echo -e "${BLUE}=== Legal Pages ===${NC}"
echo ""

check "Terms of Service" \
    "curl -sf -o /dev/null -w '%{http_code}' https://shopmatch-pro.vercel.app/legal/terms | grep -q '200'" \
    "200 OK"

check "Privacy Policy" \
    "curl -sf -o /dev/null -w '%{http_code}' https://shopmatch-pro.vercel.app/legal/privacy | grep -q '200'" \
    "200 OK"

echo ""
echo -e "${BLUE}=== API Endpoints ===${NC}"
echo ""

check "Sentry Test Endpoint" \
    "curl -sf https://shopmatch-pro.vercel.app/api/sentry-test | jq -e '.status == \"ok\"' > /dev/null" \
    "200 OK"

# Stripe webhook (expect 400 or 405 without valid signature)
echo -n "Checking Stripe Webhook... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://shopmatch-pro.vercel.app/api/stripe/webhook -H "Content-Type: application/json" -d '{}')
if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "405" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC} (HTTP $HTTP_CODE)"
else
    echo -e "${RED}❌ FAIL${NC} (HTTP $HTTP_CODE)"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

echo ""
echo -e "${BLUE}=== Environment Variables ===${NC}"
echo ""

# Check Vercel environment variables (requires Vercel CLI auth)
if command -v vercel &> /dev/null; then
    echo "Checking Vercel environment variables..."
    
    REQUIRED_VARS=(
        "NEXT_PUBLIC_FIREBASE_API_KEY"
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
        "NEXT_PUBLIC_SENTRY_DSN"
        "FIREBASE_PROJECT_ID"
        "FIREBASE_CLIENT_EMAIL"
        "FIREBASE_PRIVATE_KEY"
        "STRIPE_SECRET_KEY"
        "STRIPE_WEBHOOK_SECRET"
        "STRIPE_PRICE_ID_PRO"
    )
    
    for var in "${REQUIRED_VARS[@]}"; do
        echo -n "  $var... "
        if vercel env ls production 2>/dev/null | grep -q "$var"; then
            echo -e "${GREEN}✅${NC}"
        else
            echo -e "${RED}❌${NC}"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
        fi
    done
else
    echo -e "${YELLOW}⚠️  Vercel CLI not found, skipping environment variable checks${NC}"
fi

echo ""
echo -e "${BLUE}=== Sentry Error Tracking ===${NC}"
echo ""

# Test Sentry error capture
echo -n "Testing Sentry error capture... "
RESPONSE=$(curl -sf "https://shopmatch-pro.vercel.app/api/sentry-test?error=true")
if echo "$RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    echo "  Check Sentry dashboard: https://davidortizhighencodelearningco.sentry.io/issues/"
else
    echo -e "${RED}❌ FAIL${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

echo ""
echo "=========================================="

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Production is healthy.${NC}"
    echo ""
    echo "Production URL: https://shopmatch-pro.vercel.app/"
    exit 0
else
    echo -e "${RED}❌ $FAILED_CHECKS check(s) failed.${NC}"
    echo ""
    echo "Review the failures above and check:"
    echo "1. Vercel deployment logs: vercel logs --prod"
    echo "2. Sentry dashboard: https://davidortizhighencodelearningco.sentry.io/issues/"
    echo "3. Stripe webhook logs: https://dashboard.stripe.com/webhooks"
    exit 1
fi
