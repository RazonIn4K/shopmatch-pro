#!/bin/bash

# Webhook Event Monitor for ShopMatch Pro
# Real-time monitoring of Stripe webhook event delivery
#
# Usage:
#   ./scripts/monitor-webhook-events.sh           # Show recent events (last 24h)
#   ./scripts/monitor-webhook-events.sh --watch   # Auto-refresh every 5 seconds
#   ./scripts/monitor-webhook-events.sh --tail    # Show last 10 events only
#   ./scripts/monitor-webhook-events.sh --help    # Show help

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
WEBHOOK_URL="https://shopmatch-pro.vercel.app/api/stripe/webhook"
LIMIT=50
WATCH_MODE=false
TAIL_MODE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --watch)
            WATCH_MODE=true
            shift
            ;;
        --tail)
            TAIL_MODE=true
            LIMIT=10
            shift
            ;;
        --help|-h)
            echo "Webhook Event Monitor for ShopMatch Pro"
            echo ""
            echo "Usage:"
            echo "  $0           # Show recent events (last 24h)"
            echo "  $0 --watch   # Auto-refresh every 5 seconds"
            echo "  $0 --tail    # Show last 10 events only"
            echo ""
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Run with --help for usage information"
            exit 1
            ;;
    esac
done

# Check Stripe CLI availability
check_stripe_cli() {
    if ! command -v stripe &> /dev/null; then
        echo -e "${RED}❌ Stripe CLI not found${NC}"
        echo "Install with: brew install stripe/stripe-cli/stripe"
        echo "Documentation: https://stripe.com/docs/stripe-cli"
        exit 1
    fi

    # Check authentication
    if ! stripe config --list &> /dev/null 2>&1; then
        echo -e "${RED}❌ Stripe CLI not authenticated${NC}"
        echo "Login with: stripe login"
        exit 1
    fi
}

# Format timestamp
format_time() {
    local timestamp=$1
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        date -r "$timestamp" "+%H:%M:%S"
    else
        # Linux
        date -d "@$timestamp" "+%H:%M:%S"
    fi
}

# Format event type (shorten for display)
format_event_type() {
    local type=$1
    echo "$type" | sed 's/customer.subscription./sub./g' | sed 's/checkout.session./session./g'
}

# Get status symbol
get_status_symbol() {
    local status=$1
    case $status in
        succeeded)
            echo -e "${GREEN}✅${NC}"
            ;;
        failed)
            echo -e "${RED}❌${NC}"
            ;;
        pending)
            echo -e "${YELLOW}⏳${NC}"
            ;;
        *)
            echo -e "${CYAN}•${NC}"
            ;;
    esac
}

# Fetch and display webhook events
display_events() {
    # Clear screen in watch mode
    if $WATCH_MODE; then
        clear
    fi

    echo -e "${BOLD}╔════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}║           Stripe Webhook Event Monitor - ShopMatch Pro               ║${NC}"
    echo -e "${BOLD}╠════════════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${BOLD}║ Endpoint: $(printf '%-60s' "$WEBHOOK_URL") ║${NC}"
    echo -e "${BOLD}╚════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Fetch events from Stripe
    echo -e "${CYAN}Fetching events...${NC}"

    # Get events using Stripe CLI
    EVENTS=$(stripe events list --limit $LIMIT 2>&1)

    if echo "$EVENTS" | grep -q "Error"; then
        echo -e "${RED}❌ Failed to fetch events${NC}"
        echo "$EVENTS"
        return 1
    fi

    # Parse and display events (simplified output)
    echo ""
    echo -e "${BOLD}Recent Webhook Events:${NC}"
    echo ""
    printf "${BOLD}%-10s %-30s %-10s %-10s${NC}\n" "Time" "Event Type" "Status" "Response"
    echo "────────────────────────────────────────────────────────────────────────"

    # Parse events and display (simplified - show all recent events)
    EVENT_COUNT=0

    # Parse event list output from Stripe CLI
    while IFS= read -r line; do
        # Look for event ID lines (format: "evt_... checkout.session.completed")
        if echo "$line" | grep -q "^evt_"; then
            # Extract event ID and type from the line
            EVENT_ID=$(echo "$line" | awk '{print $1}')
            EVENT_TYPE=$(echo "$line" | awk '{print $2}')

            # Get detailed event info to extract timestamp
            EVENT_DETAILS=$(stripe events retrieve "$EVENT_ID" 2>/dev/null)

            if [ -n "$EVENT_DETAILS" ]; then
                # Extract timestamp
                CREATED=$(echo "$EVENT_DETAILS" | grep "created:" | head -n 1 | awk '{print $2}')

                # Format and display
                if [ -n "$CREATED" ]; then
                    TIME_FORMATTED=$(format_time "$CREATED")
                else
                    TIME_FORMATTED="--:--:--"
                fi

                TYPE_FORMATTED=$(format_event_type "$EVENT_TYPE")
                STATUS_SYMBOL=$(get_status_symbol "succeeded")

                printf "%-10s %-30s %-10s %-10s\n" "$TIME_FORMATTED" "$TYPE_FORMATTED" "$STATUS_SYMBOL" "Sent"

                ((EVENT_COUNT++))

                # Limit output in tail mode
                if $TAIL_MODE && [ $EVENT_COUNT -ge 10 ]; then
                    break
                fi
            fi
        fi
    done <<< "$EVENTS"

    echo ""
    echo -e "${CYAN}Total events shown: $EVENT_COUNT${NC}"

    if $WATCH_MODE; then
        echo ""
        echo -e "${YELLOW}Refreshing in 5 seconds... (Press Ctrl+C to stop)${NC}"
    fi
}

# Main execution
main() {
    check_stripe_cli

    if $WATCH_MODE; then
        echo -e "${BLUE}Starting watch mode (refresh every 5 seconds)...${NC}"
        echo ""

        while true; do
            display_events
            sleep 5
        done
    else
        display_events
        echo ""
        echo -e "${GREEN}✅ Event monitoring complete${NC}"
        echo ""
        echo "Tips:"
        echo "  • Use --watch for real-time monitoring"
        echo "  • Use --tail to show last 10 events only"
        echo "  • Check Stripe Dashboard for detailed event info:"
        echo "    https://dashboard.stripe.com/test/events"
        echo ""
    fi
}

main
