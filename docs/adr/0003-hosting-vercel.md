# ADR 0003 — Hosting via Vercel (Next.js)
**Date:** 2025-10-15 · **Status:** Proposed

## Context
SSR, preview deploys, and env management for Next.js.

## Decision
Deploy via **Vercel**; keep Stripe webhook on Node runtime route.

## Consequences
+ Fit for framework; easy previews
– Vendor lock-in; monitor build minutes and costs
