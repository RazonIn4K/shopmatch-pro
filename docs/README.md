# ShopMatch Pro — Documentation Index

> Canonical documentation set for production-ready job board platform. Aligned with **Technology Landscape 2025** (decision matrix, S-tiers) and your **Universal Framework**.

**Project:** shopmatch-pro · **S-Tier:** S2 (Standardized) · **Status:** ✅ Production Ready · **Updated:** 2025-10-19

## 🎯 Production Status
- [PRODUCTION_READINESS_ASSESSMENT.md](PRODUCTION_READINESS_ASSESSMENT.md) — **Current production readiness assessment** (2025-10-26) ✅
- [PRODUCTION_LAUNCH_COMPLETE.md](PRODUCTION_LAUNCH_COMPLETE.md) — Complete production verification & launch report ✅
- [MONITORING_CHECKLIST.md](MONITORING_CHECKLIST.md) — Daily/weekly monitoring procedures
- [FUTURE_ROADMAP.md](FUTURE_ROADMAP.md) — 12-month feature roadmap
- [PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md) — Production deployment reference

## 📐 Core Architecture
- [ARCHITECTURE.md](ARCHITECTURE.md) — System diagrams, data flows, component architecture
- [SECURITY.md](SECURITY.md) — Auth, roles, Firestore rules, threat model
- [TESTING.md](TESTING.md) — Test pyramid, commands, coverage budgets
- [DEPLOYMENT.md](DEPLOYMENT.md) — Vercel deployment + Stripe webhook setup
- [OBSERVABILITY.md](OBSERVABILITY.md) — Events, logs, metrics, dashboards
- [PERFORMANCE_MONITORING.md](PERFORMANCE_MONITORING.md) — Sentry Performance + Vercel Analytics setup
- [ANALYTICS_SCHEMA.md](ANALYTICS_SCHEMA.md) — Product analytics event taxonomy
- [FIRESTORE_RULES_SPEC.md](FIRESTORE_RULES_SPEC.md) — Security rules specification
- [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) — Complete env var reference

## 🔧 Setup & Configuration
- [GITHUB_SETUP_GUIDE.md](GITHUB_SETUP_GUIDE.md) — Complete repository setup (15 min)
- [GITHUB_GUI_SETUP_CHECKLIST.md](GITHUB_GUI_SETUP_CHECKLIST.md) — Quick setup checklist
- [RULESET_QUICK_REFERENCE.md](RULESET_QUICK_REFERENCE.md) — Branch protection reference
- [REPOSITORY_GUARDRAILS.md](REPOSITORY_GUARDRAILS.md) — Technical deep dive
- [VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md) — Smoke and full test procedures
- [AI_TOOLING_SETUP.md](AI_TOOLING_SETUP.md) — AI tool integration (Claude, Copilot)
- [SENTRY_SETUP_GUIDE.md](SENTRY_SETUP_GUIDE.md) — Error tracking setup (15-20 min)
- [DASHBOARD_SETUP_GUIDE.md](DASHBOARD_SETUP_GUIDE.md) — Performance monitoring dashboard setup (10 min)

## 📋 Governance (ADRs)
- [adr/0001-payments-stripe.md](adr/0001-payments-stripe.md) — Why Stripe over alternatives
- [adr/0002-auth-firestore.md](adr/0002-auth-firestore.md) — Why Firebase Auth over alternatives
- [adr/0003-hosting-vercel.md](adr/0003-hosting-vercel.md) — Why Vercel over alternatives

## 🚨 Operations & Runbooks
- [runbooks/STRIPE_WEBHOOK_RUNBOOK.md](runbooks/STRIPE_WEBHOOK_RUNBOOK.md) — Stripe webhook troubleshooting
- [WEBHOOK_EVENT_RESEND_GUIDE.md](WEBHOOK_EVENT_RESEND_GUIDE.md) — Webhook event resend tool
- [INCIDENT_RESPONSE.md](INCIDENT_RESPONSE.md) — Incident response procedures

## Team Simulation & Workflow
- [WORKFLOW_ORDER.md](WORKFLOW_ORDER.md) — end-to-end order of work & gates
- [PROMPT_PACK.md](PROMPT_PACK.md) — persona prompts (PM, TL, QA, Sec, PP)
- [PLAYBOOK_SHOPMATCH.md](PLAYBOOK_SHOPMATCH.md) — SOP for each task (SHOOT → SKIN)
- [../CONTRIBUTING.md](../CONTRIBUTING.md) — How to contribute using AI personas
- [../.github/pull_request_template.md](../.github/pull_request_template.md) — PR template with evidence requirements

## GitHub Configuration
- [../.github/SETTINGS_QUICK_START.md](../.github/SETTINGS_QUICK_START.md) — 10-minute GitHub settings setup
- [../.github/CODEOWNERS](../.github/CODEOWNERS) — Code ownership matrix for auto-review requests
- [../.github/copilot-instructions.md](../.github/copilot-instructions.md) — GitHub Copilot review standards
- [../.github/dependabot.yml](../.github/dependabot.yml) — Automated dependency updates

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
