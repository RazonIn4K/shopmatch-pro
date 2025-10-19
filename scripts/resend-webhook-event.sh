#!/bin/bash

###############################################################################
# Webhook Event Resend Script
# 
# Purpose: Resend Stripe webhook event after PR #38 deployment
# Event: evt_1SJmMIP5UmVB5UbVu9lT8xU2 (customer.subscription.created)
# User: z1yTp5jKIHZMVi3i4auU92uot4c2 (playwright.final.test@example.com)
#
# Usage:
#   ./scripts/resend-webhook-event.sh [--verify-only]
#
# Options:
#   --verify-only    Only verify, don't resend event
#
# Date: October 19, 2025
###############################################################################

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Event details
EVENT_ID="evt_1SJmMIP5UmVB5UbVu9lT8xU2"
USER_ID="z1yTp5jKIHZMVi3i4auU92uot4c2"
CUSTOMER_ID="cus_TGIykeMXAXIMze"
USER_EMAIL="playwright.final.test@example.com"

# Parse arguments
VERIFY_ONLY=false
if [[ "$1" == "--verify-only" ]]; then
  VERIFY_ONLY=true
fi

###############################################################################
# Helper Functions
###############################################################################

print_header() {
  echo ""
  echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
  echo ""
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

check_command() {
  if ! command -v "$1" &> /dev/null; then
    print_error "$1 is not installed. Please install it first."
    exit 1
  fi
}

###############################################################################
# Pre-flight Checks
###############################################################################

print_header "Pre-flight Checks"

# Check required commands
print_info "Checking required tools..."
check_command "stripe"
check_command "curl"
check_command "jq"
print_success "All required tools are installed"

# Verify Stripe CLI is authenticated
print_info "Verifying Stripe CLI authentication..."
if ! stripe config --list &> /dev/null; then
  print_error "Stripe CLI not authenticated. Run 'stripe login' first."
  exit 1
fi
print_success "Stripe CLI is authenticated"

# Check production health
print_info "Checking production health..."
HEALTH_RESPONSE=$(curl -s https://shopmatch-pro.vercel.app/api/health)
if echo "$HEALTH_RESPONSE" | jq -e '.status == "ok"' > /dev/null 2>&1; then
  print_success "Production is healthy"
else
  print_error "Production health check failed"
  echo "$HEALTH_RESPONSE"
  exit 1
fi

###############################################################################
# Resend Event (if not verify-only)
###############################################################################

if [[ "$VERIFY_ONLY" == false ]]; then
  print_header "Resending Webhook Event"
  
  print_info "Event ID: $EVENT_ID"
  print_info "Type: customer.subscription.created"
  print_info "Customer: $CUSTOMER_ID"
  print_info "User: $USER_ID"
  
  echo ""
  read -p "Proceed with resending the event? (y/N) " -n 1 -r
  echo
  
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Event resend cancelled by user"
    exit 0
  fi
  
  print_info "Resending event via Stripe CLI..."
  
  if stripe events resend "$EVENT_ID" 2>&1 | tee /tmp/stripe_resend.log; then
    print_success "Event resent successfully"
    
    # Wait for processing
    print_info "Waiting 5 seconds for webhook processing..."
    sleep 5
  else
    print_error "Failed to resend event"
    cat /tmp/stripe_resend.log
    exit 1
  fi
fi

###############################################################################
# Verification
###############################################################################

print_header "Verification Steps"

# Step 1: Check Stripe Event Status
print_info "Step 1/5: Checking Stripe event status..."
EVENT_DATA=$(stripe events retrieve "$EVENT_ID" 2>/dev/null || echo "{}")

if echo "$EVENT_DATA" | jq -e '.id' > /dev/null 2>&1; then
  print_success "Event exists in Stripe"
  
  # Check webhook delivery
  WEBHOOK_ATTEMPTS=$(echo "$EVENT_DATA" | jq -r '.request.id // "none"')
  if [[ "$WEBHOOK_ATTEMPTS" != "none" ]]; then
    print_success "Event has webhook delivery attempts"
  else
    print_warning "No webhook delivery attempts found"
  fi
else
  print_error "Could not retrieve event from Stripe"
fi

# Step 2: Check Production Logs (last 10 minutes)
print_info "Step 2/5: Checking Vercel logs for webhook processing..."
print_warning "Note: Requires Vercel CLI authentication"

if command -v vercel &> /dev/null; then
  LOG_OUTPUT=$(vercel logs https://shopmatch-pro.vercel.app --since 10m 2>&1 || echo "")
  
  if echo "$LOG_OUTPUT" | grep -q "Activated subscription access for user $USER_ID"; then
    print_success "Found success log: Subscription activated for user $USER_ID"
  else
    print_warning "Success log not found in recent logs"
    print_info "This might mean:"
    print_info "  - Event hasn't been processed yet (wait longer)"
    print_info "  - Logs are older than 10 minutes"
    print_info "  - Event processing failed"
  fi
else
  print_warning "Vercel CLI not installed - skipping log check"
fi

# Step 3: Check Production Health
print_info "Step 3/5: Verifying production health..."
HEALTH=$(curl -s https://shopmatch-pro.vercel.app/api/health)
if echo "$HEALTH" | jq -e '.checks.stripe == true' > /dev/null 2>&1; then
  print_success "Stripe integration is healthy"
else
  print_error "Stripe integration health check failed"
fi

# Step 4: Verify Webhook Endpoint
print_info "Step 4/5: Checking webhook endpoint configuration..."
WEBHOOK_LIST=$(stripe webhook_endpoints list 2>/dev/null || echo "{}")

if echo "$WEBHOOK_LIST" | jq -e '.data[] | select(.url | contains("shopmatch-pro.vercel.app"))' > /dev/null 2>&1; then
  print_success "Webhook endpoint is configured"
  
  # Check if it's enabled
  WEBHOOK_STATUS=$(echo "$WEBHOOK_LIST" | jq -r '.data[] | select(.url | contains("shopmatch-pro.vercel.app")) | .status')
  if [[ "$WEBHOOK_STATUS" == "enabled" ]]; then
    print_success "Webhook endpoint is enabled"
  else
    print_warning "Webhook endpoint status: $WEBHOOK_STATUS"
  fi
else
  print_error "Webhook endpoint not found in Stripe"
fi

# Step 5: Manual Verification Checklist
print_info "Step 5/5: Manual verification required..."
echo ""
echo "Please verify the following manually:"
echo ""
echo "  1. Firestore Document:"
echo "     URL: https://console.firebase.google.com/project/shopmatch-pro/firestore"
echo "     Path: users/$USER_ID"
echo "     Check fields:"
echo "       - stripeCustomerId: $CUSTOMER_ID"
echo "       - subActive: true"
echo "       - subscriptionStatus: active"
echo ""
echo "  2. Firebase Custom Claims:"
echo "     URL: https://console.firebase.google.com/project/shopmatch-pro/authentication/users"
echo "     User: $USER_EMAIL"
echo "     Custom claims should include:"
echo "       - subActive: true"
echo "       - stripeCustomerId: $CUSTOMER_ID"
echo ""
echo "  3. Job Creation Test:"
echo "     URL: https://shopmatch-pro.vercel.app/login"
echo "     Login with: $USER_EMAIL"
echo "     Navigate to: https://shopmatch-pro.vercel.app/jobs/new"
echo "     Expected: Page loads successfully (no 403 error)"
echo ""

###############################################################################
# Summary
###############################################################################

print_header "Summary"

if [[ "$VERIFY_ONLY" == true ]]; then
  print_info "Verification completed (no event was resent)"
else
  print_success "Event resend process completed"
fi

echo ""
echo "Next steps:"
echo "  1. Complete manual verification steps above"
echo "  2. If issues persist, check Vercel logs:"
echo "     vercel logs https://shopmatch-pro.vercel.app --follow"
echo "  3. Review full guide:"
echo "     docs/WEBHOOK_EVENT_RESEND_GUIDE.md"
echo ""

print_info "Event ID: $EVENT_ID"
print_info "User ID: $USER_ID"
print_info "Customer ID: $CUSTOMER_ID"
echo ""

exit 0
