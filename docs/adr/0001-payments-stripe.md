# ADR 0001 — Payments via Stripe Checkout
**Date:** 2025-10-15 · **Status:** Accepted

## Context
Subscriptions required; PCI scope should remain minimal.

## Decision
Use **Stripe Checkout** and **Customer Portal**; process webhooks server-side with signature verification and Node runtime.

## Consequences
+ PCI offload, mature tooling
– External dependency; must maintain webhook runbook

## Alternatives
Braintree, LemonSqueezy (pros/cons documented but scored lower via Decision Matrix).
