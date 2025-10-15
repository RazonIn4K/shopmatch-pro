# ADR 0002 — Auth & Data via Firebase (Auth + Firestore)
**Date:** 2025-10-15 · **Status:** Accepted

## Context
Fast MVP with RBAC and server-verified claims; minimal ops.

## Decision
Use Firebase Auth (email + Google) with **custom claims** and Firestore for app data.

## Consequences
+ Speed, rules-based security, low ops
– Complex relational queries; indexing discipline required
