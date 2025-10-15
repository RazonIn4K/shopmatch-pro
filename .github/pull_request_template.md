## Summary
<!-- What was changed and why? Be concise but complete. -->

## Linked Issues
Fixes #
Related: #

---

## Definition of Ready (DoR)
<!-- Confirm these items were completed BEFORE starting implementation -->

- [ ] **Branch name** follows `type/ID-slug` format (enforced by CI)
- [ ] **Linked Issue/ADR** with clear acceptance criteria
- [ ] **Analytics events defined** (if applicable): event name, properties, user/session IDs
- [ ] **Performance budget** confirmed (if adding new routes/pages)
- [ ] **Security review scope** identified (auth, rate-limiting, validation, secrets)

---

## Definition of Done (DoD)
<!-- All items MUST be checked before requesting review -->

### Quality Gates (Automated)
- [ ] **All CI checks passing** (validate-branch, build, test, typecheck, first-load JS, accessibility, CodeQL)
- [ ] **First-load JS** ≤ 300 KB (see artifact: `first-load-report.json`)
- [ ] **Accessibility** zero violations (if UI changes - see artifact: `accessibility-results/`)
- [ ] **CodeQL security scanning** passed (no new high/critical issues)

### Code Quality
- [ ] **Tests updated** (unit, component, and/or E2E as applicable)
- [ ] **TypeScript strict mode** passing (no `any`, proper types, awaited promises)
- [ ] **Error handling** implemented (try/catch, error boundaries, fallback UI)
- [ ] **Input validation** added (Zod schemas for forms/API routes)

### Security & Performance
- [ ] **Authentication/authorization** checked (Firebase token verification, custom claims, role checks)
- [ ] **Rate limiting** considered (for public API routes)
- [ ] **No secrets in code** (use env vars, verified by Secret Scanning)
- [ ] **No PII in logs** (especially Stripe webhook logs)
- [ ] **Code splitting** used (dynamic imports for large components/routes)

### Observability
- [ ] **Analytics events** instrumented (if feature adds user interactions)
- [ ] **Error logging** added (structured logs with context)
- [ ] **Performance markers** added (if applicable - Core Web Vitals)

### Documentation
- [ ] **Code comments** added (for complex logic, security decisions, performance trade-offs)
- [ ] **README/docs updated** (if adding new features, API routes, or configuration)
- [ ] **ADR created** (if making architectural decisions)
- [ ] **Runbook updated** (if changing operational procedures)

### Review Checklist
- [ ] **CODEOWNERS approved** (required for critical paths: Stripe, Auth, Firestore, CI, Analytics)
- [ ] **GitHub Copilot auto-review** completed (see copilot-instructions.md guidelines)
- [ ] **Self-review completed** (read your own diff, check for debug code, TODOs, console.logs)

---

## Evidence
<!-- Attach artifacts and links to prove quality gates passed -->

### Test Results
- [ ] **E2E test output** or Playwright report link: <!-- paste link or screenshot -->
- [ ] **Test coverage %**: <!-- current coverage, link to report -->

### Performance
- [ ] **First-load JS report**: Attach `first-load-report.json` from CI artifacts
- [ ] **Lighthouse scores** (if applicable): <!-- screenshot or report link -->

### Accessibility
- [ ] **Axe report**: <!-- confirm zero violations or attach report -->
- [ ] **Keyboard navigation tested**: <!-- describe Tab/Enter/Escape flows -->
- [ ] **Screen reader tested**: <!-- tool used, issues found/fixed -->

### Security
- [ ] **Security review notes**: <!-- rate-limiting, validation, auth checks performed -->
- [ ] **CodeQL scan results**: <!-- link to scan or confirm no new issues -->

### Visual Changes
- [ ] **Screenshots** (before/after): <!-- attach for UI changes -->
- [ ] **Screen recording** (if interaction-heavy): <!-- link to Loom, CloudApp, etc. -->

---

## Review Playbook (AI + Human)
<!-- This section guides reviewers through the process -->

1. **GitHub Copilot (auto-review)** — Runs automatically using `.github/copilot-instructions.md`
2. **Codex (Senior Tech Lead)** — Comment `@Codex` to request 3-tier review (Blockers → High Impact → Nits)
3. **Human Code Owner(s)** — Required per CODEOWNERS for critical paths
4. **Quality Gates** — All CI checks must be green (enforced by branch protection)

---

## Notes
<!-- Additional context, trade-offs, future work, or reviewer guidance -->

### Risks
<!-- Document any risks introduced by this change -->
- **L2 (Data)**: <!-- Firestore schema, indexes, migrations -->
- **L4 (API)**: <!-- New routes, breaking changes, rate limits -->
- **L5 (Integration)**: <!-- Firebase, Stripe, external services -->
- **L6 (Auth/Security)**: <!-- Authentication, authorization, secrets -->
- **L9 (UX/UI)**: <!-- Accessibility, responsive design, loading states -->

### Future Work
<!-- Items intentionally deferred to future PRs -->
- [ ] TODO item 1
- [ ] TODO item 2

### Related Documentation
<!-- Links to relevant docs, ADRs, runbooks -->
- [ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- [SECURITY.md](../docs/SECURITY.md)
- [TESTING.md](../docs/TESTING.md)
- [OBSERVABILITY.md](../docs/OBSERVABILITY.md)
