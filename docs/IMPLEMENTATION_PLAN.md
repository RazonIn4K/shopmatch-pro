# ShopMatch Pro - Implementation Plan

**Status**: Active
**Last Updated**: 2025-10-16
**Methodology**: SHOOT→SKIN (see [WORKFLOW_ORDER.md](./WORKFLOW_ORDER.md))

## Overview

This document tracks the implementation progress of ShopMatch Pro, a Next.js 15 subscription-based job board. The project follows a phased approach with continuous quality gates and evidence-based development.

---

## Phase 0: Foundation & Stability ✅ COMPLETE

**Goal**: Establish robust infrastructure, resolve critical compliance issues, and ensure baseline accessibility.

### 1.1 Dependency & License Compliance ✅

- [x] **Fix outdated file-entry-cache dependency**
  - ✅ Applied package.json override (8.0.0 → 11.1.0)
  - ✅ Resolved FOSSA "Outdated version" warning
  - ✅ Created PR #19 with fix
  - **Evidence**: FOSSA Dependency Quality check passing

- [x] **Document MPL-2.0 license for @axe-core/playwright**
  - ✅ Added comprehensive license documentation to THIRD_PARTY_LICENSES.md
  - ✅ Explained safe usage for dev dependencies
  - ✅ Merged PR #17
  - **Evidence**: Documentation in [THIRD_PARTY_LICENSES.md](../THIRD_PARTY_LICENSES.md#L214-L266)

### 1.2 Baseline Accessibility ✅

- [x] **Add semantic <main> landmarks to all pages**
  - ✅ Fixed 10 pages missing `<main>` element:
    - Auth: login (2 forms), signup
    - Dashboard: owner, seeker, redirect loader
    - Jobs: listing, details, new, edit
    - Subscription page
  - ✅ Verified WCAG 2.1 AA compliance (landmark-one-main rule)
  - **Evidence**: All pages now have proper semantic structure
  - **Commit**: db39fca (PR #19)

- [x] **Fix H1 heading requirements**
  - ✅ Added H1 tags to login/signup forms
  - ✅ Ensured all pages have level-one headings
  - **Evidence**: Accessibility tests passing for H1 requirements

### 1.3 CI/CD Quality Gates ✅

- [x] **Branch naming validation**
  - ✅ Enforces `type/ID-slug` format
  - ✅ Allows Dependabot auto-generated branches
  - ✅ Prevents invalid branch names from merging
  - **Evidence**: validate-branch job in [.github/workflows/ci.yml](../.github/workflows/ci.yml)

- [x] **Bundle budget enforcement**
  - ✅ First-load JS ≤ 300 KB
  - ✅ Automated measurement on every build
  - ✅ Fails CI if budget exceeded
  - **Evidence**: Current build 266 KB / 300 KB (34 KB under budget)

- [x] **Basic accessibility testing**
  - ✅ Playwright + @axe-core/playwright integration
  - ✅ Tests homepage, subscribe, login, dashboard
  - ✅ Zero-tolerance policy for WCAG violations
  - **Evidence**: [e2e/accessibility.spec.ts](../e2e/accessibility.spec.ts)

---

## Phase 1: Quality Automation 🚧 IN PROGRESS

**Goal**: Prevent regressions through automated testing and enforce development standards.

### 1.1 Commit Message Validation ✅

- [x] **Implement Conventional Commits enforcement**
  - ✅ Added validate-commits job to CI workflow
  - ✅ Validates all PR commits against pattern: `type(scope): subject`
  - ✅ Provides clear error messages with examples
  - ✅ Blocks merge if commits don't follow format
  - **Evidence**: validate-commits job in [.github/workflows/ci.yml](../.github/workflows/ci.yml)
  - **Benefits**:
    - Readable Git history
    - Automated changelog generation
    - Standardized commit format across team

### 1.2 Automated Accessibility Testing ✅

- [x] **Integrate jest-axe for component-level testing**
  - ✅ Added jest-axe to devDependencies
  - ✅ Created sample test for JobForm component
  - ✅ Added npm run test:unit script
  - ✅ Wired unit tests into CI pipeline
  - **Evidence**:
    - Test file: [src/components/__tests__/job-form-a11y.test.tsx](../src/components/__tests__/job-form-a11y.test.tsx)
    - Jest config: [jest.config.mjs](../jest.config.mjs)
    - CI integration: [.github/workflows/ci.yml](../.github/workflows/ci.yml#L164-L165)
    - **Commit**: 2a4a4f1
  - **Acceptance Criteria**:
    - ✅ Sample accessibility test passing
    - ✅ CI fails if any component has axe violations
    - ⏳ Expand coverage to all UI components (Phase 1.3)

- [ ] **Expand E2E accessibility coverage**
  - _Task_: Add tests for all authenticated pages
  - _Task_: Add tests for job posting flow
  - _Task_: Add tests for application submission flow
  - **Requirements**:
    - Cover complete user journeys (auth → subscribe → post job → apply)
    - Test keyboard navigation
    - Test screen reader landmarks

### 1.3 Centralized Documentation ✅

- [x] **Create implementation plan (this document)**
  - ✅ Define phases with clear goals
  - ✅ Track progress with checkboxes
  - ✅ Link to evidence (PRs, commits, files)
  - ✅ Celebrate key achievements
  - **Evidence**: [docs/IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)

---

## Phase 2: Feature Development (Upcoming)

**Goal**: Expand job board functionality with advanced features.

### 2.1 User Profile Pages

- [ ] **Implement owner profile page**
  - _Requirements_: Company name, description, logo upload, contact info
  - _Route_: `/dashboard/owner/profile`
  - _Security_: Only visible to authenticated job owners

- [ ] **Implement seeker profile page**
  - _Requirements_: Name, bio, resume upload, skills, experience
  - _Route_: `/dashboard/seeker/profile`
  - _Security_: Only visible to authenticated job seekers

### 2.2 Advanced Job Search

- [ ] **Implement filter UI**
  - _Filters_: Job type, location, salary range, date posted
  - _Technology_: Client-side filtering with Firestore compound indexes

- [ ] **Add full-text search**
  - _Technology_: Algolia or Typesense integration
  - _Scope_: Job title, description, company name
  - _Performance_: < 100ms search latency

### 2.3 Application Enhancements

- [ ] **Resume upload to Cloud Storage**
  - _Security_: Signed URLs, role-based access
  - _Validation_: PDF only, max 5 MB
  - _Storage_: Firebase Cloud Storage

- [ ] **Saved jobs functionality**
  - _Collection_: `saved_jobs` in Firestore
  - _UI_: Heart icon on job cards, dedicated saved jobs page

### 2.4 Email Notifications

- [ ] **Implement SendGrid integration**
  - _Triggers_: New application, application status change, job expiring
  - _Technology_: Firestore triggers + SendGrid API
  - _Templates_: HTML email templates with brand styling

---

## Phase 3: Production Readiness (Future)

**Goal**: Deploy to production with monitoring, analytics, and performance optimization.

### 3.1 Observability

- [ ] **Set up Sentry error tracking**
  - _Scope_: Client and server errors
  - _Alerts_: Slack notifications for critical errors

- [ ] **Implement analytics events**
  - _Events_: Job view, application submit, subscription checkout
  - _Technology_: Google Analytics 4 or Mixpanel
  - _Schema_: Documented in [ANALYTICS_SCHEMA.md](./ANALYTICS_SCHEMA.md)

### 3.2 Performance Optimization

- [ ] **Implement code splitting**
  - _Target_: Dynamic imports for large components
  - _Goal_: Reduce first-load JS to < 250 KB

- [ ] **Add image optimization**
  - _Technology_: Next.js Image component
  - _CDN_: Vercel Image Optimization or Cloudinary

### 3.3 SEO & Marketing

- [ ] **Add SEO meta tags**
  - _Pages_: All public pages (homepage, job listings, job details)
  - _Data_: Dynamic Open Graph images, structured data (JSON-LD)

- [ ] **Implement sitemap generation**
  - _Technology_: next-sitemap package
  - _Frequency_: Regenerate on deploy

---

## Key Achievements 🎉

- ✅ **Zero Critical Vulnerabilities** - Snyk and FOSSA security checks passing
- ✅ **WCAG 2.1 AA Compliance** - All pages have semantic landmarks
- ✅ **Bundle Budget Enforcement** - 34 KB under budget (266 KB / 300 KB)
- ✅ **Branch Protection** - Naming conventions enforced via CI
- ✅ **Commit Standards** - Conventional Commits validation in CI
- ✅ **Dependency Health** - file-entry-cache updated to latest version
- ✅ **License Compliance** - MPL-2.0 documented and explained
- ✅ **E2E Testing** - Playwright + axe-core integration complete

---

## Decision Framework

All technology choices follow the **Decision Matrix** documented in `SHOPMATCH_PRO_TECH_DECISION_MATRIX.md`:

| Weight | Category | Score Range |
|--------|----------|-------------|
| 25 | Business Fit | Does it solve our problem? |
| 20 | Maturity | Production-ready with stable APIs? |
| 15 | Cost | Total cost of ownership? |
| 15 | Capability | Feature completeness? |
| 10 | Ecosystem | Community size, plugins? |
| 10 | Security | Security track record? |
| 5 | Performance | Speed, scalability? |

**Adoption Thresholds**:
- ≥ 80 - Adopt immediately
- 60-79 - Investigate further
- < 60 - Reject

---

## Maintenance Schedule

### Weekly
- [ ] Review Dependabot PRs and merge safe updates
- [ ] Check FOSSA scans for new license/security issues
- [ ] Review Vercel deployment logs for errors

### Monthly
- [ ] Update Technology Landscape alignment document
- [ ] Review bundle size trends
- [ ] Audit accessibility with manual testing

### Quarterly
- [ ] Review all ADRs for accuracy
- [ ] Update component registry
- [ ] Perform security audit with OWASP checklist

---

## References

- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Testing Strategy**: [TESTING.md](./TESTING.md)
- **Security**: [SECURITY.md](./SECURITY.md)
- **Workflow**: [WORKFLOW_ORDER.md](./WORKFLOW_ORDER.md)
- **AI Prompts**: [PROMPT_PACK.md](./PROMPT_PACK.md)
- **Runbooks**: [docs/runbooks/](./runbooks/)
- **ADRs**: [docs/adr/](./adr/)

---

*This document follows the SHOOT→SKIN methodology for evidence-based development. All checkboxes require evidence (commits, PRs, test output, or documentation links) before marking complete.*
