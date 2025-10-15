# ShopMatch Pro — Documentation Index

> Canonical documentation set for MVP + team simulation. Aligned with **Technology Landscape 2025** (decision matrix, S-tiers) and your **Universal Framework**.

**Project:** shopmatch-pro · **S-Tier:** S2 (Standardized) · **Updated:** 2025-10-15

## Core
- [ARCHITECTURE.md](ARCHITECTURE.md) — diagrams, data flows, dependencies
- [API_REFERENCE.yml](API_REFERENCE.yml) — OpenAPI surface (server routes + webhook)
- [SECURITY.md](SECURITY.md) — auth, roles, Firestore rules model, secrets, threat model
- [TESTING.md](TESTING.md) — test pyramid, commands, coverage, environments
- [DEPLOYMENT.md](DEPLOYMENT.md) — Vercel + Stripe webhook checklist
- [OBSERVABILITY.md](OBSERVABILITY.md) — events, logs, metrics, dashboards
- [ANALYTICS_SCHEMA.md](ANALYTICS_SCHEMA.md) — PM event taxonomy + schema
- [FIRESTORE_RULES_SPEC.md](FIRESTORE_RULES_SPEC.md) — rules spec + emulator tests
- [AI_TOOLING_SETUP.md](AI_TOOLING_SETUP.md) — Complete AI configuration (Claude, Copilot, CI gates)

## Governance
- [adr/0001-payments-stripe.md](adr/0001-payments-stripe.md)
- [adr/0002-auth-firestore.md](adr/0002-auth-firestore.md)
- [adr/0003-hosting-vercel.md](adr/0003-hosting-vercel.md)

## Operations
- [runbooks/STRIPE_WEBHOOK_RUNBOOK.md](runbooks/STRIPE_WEBHOOK_RUNBOOK.md)
- [INCIDENT_RESPONSE.md](INCIDENT_RESPONSE.md)

## Team Simulation & Workflow
- [WORKFLOW_ORDER.md](WORKFLOW_ORDER.md) — end-to-end order of work & gates
- [PROMPT_PACK.md](PROMPT_PACK.md) — persona prompts (PM, TL, QA, Sec, PP)
- [PLAYBOOK_SHOPMATCH.md](PLAYBOOK_SHOPMATCH.md) — SOP for each task (SHOOT → SKIN)
- [../CONTRIBUTING.md](../CONTRIBUTING.md) — How to contribute using AI personas
- [../.github/pull_request_template.md](../.github/pull_request_template.md) — PR template with evidence requirements

## GitHub Templates
- [../.github/ISSUE_TEMPLATE/bug_report.md](../.github/ISSUE_TEMPLATE/bug_report.md) — Bug report template
- [../.github/ISSUE_TEMPLATE/feature_request.md](../.github/ISSUE_TEMPLATE/feature_request.md) — Feature request template

## Root-Level Documentation
- [../CLAUDE.md](../CLAUDE.md) — AI-powered development guide and architecture reference
- [../MVP_IMPLEMENTATION_PLAN.md](../MVP_IMPLEMENTATION_PLAN.md) — Phase-by-phase feature breakdown, data models, API specs
- [../README.md](../README.md) — Project overview, quick start, tech stack
- [../DEPLOYMENT.md](../DEPLOYMENT.md) — Production deployment guide

## Project Status (external docs you already have)
- /CAREER/Portfolio-Projects/ShopMatchPro/**SHOPMATCH_PRO_EXECUTION_JOURNAL.md**
- /CAREER/Portfolio-Projects/ShopMatchPro/**SHOPMATCH_PRO_COMPONENT_REGISTRY.md**
- /CAREER/Portfolio-Projects/ShopMatchPro/**SHOPMATCH_PRO_TECH_DECISION_MATRIX.md**
- /CAREER/Portfolio-Projects/ShopMatchPro/**SHOPMATCH_PRO_LANDSCAPE_ALIGNMENT.md**
- /CAREER/Portfolio-Projects/ShopMatchPro/**SHOPMATCH_PRO_CURRENT_ROADMAP.md**
