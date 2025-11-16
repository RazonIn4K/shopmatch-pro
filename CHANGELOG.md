# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - 2025-11-16

#### CI/CD Pipeline Enhancements
- **6-Job Automated CI Pipeline** in GitHub Actions ([#116](https://github.com/RazonIn4K/shopmatch-pro/pull/116))
  - Branch & commit validation (enforces naming conventions)
  - Build & quality checks (ESLint, TypeScript, bundle size)
  - Accessibility testing (axe-core, zero violations)
  - Local smoke tests (validates critical user flows)
  - Snyk security scanning (dependency vulnerability detection)
  - Production smoke tests (runs on main branch pushes)

#### Documentation
- **CLAUDE.md** - Comprehensive AI development guide
  - High-level architecture patterns (App Router, auth, data flows)
  - Critical user flows (job posting, applications, subscriptions)
  - Common gotchas and troubleshooting
  - Code patterns and templates
  - CI/CD pipeline documentation with GitHub secrets setup
- **CHANGELOG.md** - Version history and notable changes

#### Testing
- **Smoke Test Suite** (`e2e/smoke.spec.ts`)
  - 6 comprehensive tests covering critical paths
  - Landing page rendering
  - Authentication flows
  - Dashboard role-based access
  - Analytics page functionality
  - Job listing page
  - Graceful skip when GitHub secrets not configured

### Changed - 2025-11-16

#### Testing Improvements
- Smoke tests now skip gracefully when `DEMO_OWNER_EMAIL` and `DEMO_OWNER_PASSWORD` secrets are missing
- Added helpful warning messages guiding secret configuration
- Partial test coverage (unauthenticated tests) instead of complete failure

#### Documentation Updates
- Updated README.md with CI/CD achievements
  - Highlighted 0 npm vulnerabilities (verified 2025-11-16)
  - Added 6-job pipeline details
  - Enhanced security and testing descriptions
- Enhanced development tools section with Snyk and security tooling

### Security - 2025-11-16

#### Vulnerabilities Fixed
- **js-yaml prototype pollution** (GHSA-mh29-5h37-fv8m) - Moderate severity
  - Added npm override to force `js-yaml@^4.1.1`
  - Resolved 17 cascading vulnerabilities through Jest dependency chain
  - Achievement: **0 npm vulnerabilities** (verified with `npm audit`)

#### Security Enhancements
- Integrated Snyk security scanning in CI pipeline
  - Scans all npm dependencies
  - Threshold: low severity or higher
  - Respects `.snyk` policy file for ignored issues
  - Advisory only (continues on error to not block PRs)

---

## [0.1.0] - 2025-10-XX (Initial Release)

### Added

#### Core Features
- **Authentication System**
  - Email/password signup and login
  - Google OAuth integration
  - Role-based access control (Owner/Seeker)
  - Custom JWT claims for subscription status

- **Job Board Functionality**
  - Browse and search job listings
  - Job detail pages with full descriptions
  - Application submission with cover letters
  - Application tracking for seekers

- **Employer Features** (Subscription Required)
  - Create and edit job postings
  - Manage applications
  - View application analytics
  - Close job postings

- **Stripe Subscription Integration**
  - Checkout flow for Pro subscriptions
  - Webhook handling for payment events
  - Custom claims update on subscription
  - Instant access to Pro features

- **Analytics Dashboard**
  - KPI cards (jobs posted, matches, time-to-match, interview rate)
  - Conversion funnel visualization
  - Narrative insights
  - Config-driven demo metrics

#### Technical Infrastructure
- Next.js 15 with App Router
- TypeScript strict mode
- Firebase Authentication + Firestore
- Stripe payment processing
- Vercel deployment with auto-deploy
- Tailwind CSS v4 + shadcn/ui components

#### Documentation
- Comprehensive README with quick start
- Architecture documentation
- Security documentation
- API reference (OpenAPI 3.0)
- Deployment guides
- Runbooks for operations

#### Testing
- Playwright E2E tests
- Accessibility tests (axe-core)
- Firestore security rules tests
- Manual testing checklist

### Security
- Firebase security rules for Firestore
- Stripe webhook signature verification
- Input validation with Zod schemas
- Protected API routes with token verification
- RBAC enforcement at database level

---

## Release Notes Format

### Categories
- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Now removed features
- **Fixed**: Any bug fixes
- **Security**: Vulnerability fixes and security improvements

### Link Format
- `[version]` - Links to release tag
- `#123` - Links to pull request or issue

---

**Project Status**: ✅ Production-Ready MVP (Test Mode)
**Deployment**: https://shopmatch-pro.vercel.app
**Last Updated**: 2025-11-16
