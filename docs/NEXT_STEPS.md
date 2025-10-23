# Next Steps Implementation Guide

**Status:** ✅ Baseline complete  
**Reviewed:** October 23, 2025  
**Focus:** Optional follow-up items now that production monitoring and repo hygiene are in place

---

## ✅ What’s Already Done

- Production smoke tests merged (PR #64) and running on every push to `main`
- Firestore `jobs.status` index shipped (PR #62) for dashboard performance
- Google Search Console verifier deployed via PR #67 (`public/googlee573592846ba27d6.html`)
- Stale Dependabot & experimentation branches/PRs cleaned up
- CI guardrails (branch naming, commit lint, accessibility, build budgets) enforced

---

## 🔄 Optional Next Actions

### 1. Activate Google Search Console
- Visit [Google Search Console](https://search.google.com/search-console)
- Add property: `https://shopmatch-pro.vercel.app`
- Choose **HTML file** verification (already live on production)
- Once verified, enable performance and indexing reports

### 2. Monitor Production Smoke Tests
- Every push to `main` runs the `Production Smoke Tests` job in GitHub Actions
- Review the workflow for pass/fail status; artifacts upload automatically on failure
- For manual spot checks, run:
  ```bash
  BASE_URL=https://shopmatch-pro.vercel.app npx playwright test e2e/verify-demo-login.spec.ts --reporter=line
  ```

### 3. Track Dependabot Updates
- Closed PRs #44 and #45 will respawn with updated dependency bumps
- Ensure new automation branches use the enforced naming convention (`dependabot/...` already whitelisted)
- Review, update changelog, and merge as they arrive

### 4. Confirm Branch Hygiene (Monthly)
- Run `git fetch --prune` to keep local refs tidy
- Review `git branch -r` for any merged branches that can be deleted
- Keep `ci`-prefixed branches for infrastructure work; avoid `chore/` branch types (blocked by CI)

---

## 📚 Reference Documents

| Topic | Where to Look |
|-------|---------------|
| CI guardrails & workflow jobs | `.github/workflows/ci.yml`, `docs/AI_TOOLING_SETUP.md` |
| Production verification evidence | `docs/VERIFICATION_SUMMARY.md` |
| Repository status snapshot | `docs/IMPLEMENTATION_READY.md` |
| Monitoring cadence | `docs/MONITORING_CHECKLIST.md`, `docs/PRODUCTION_LAUNCH_COMPLETE.md` |

---

## 🧭 Staying Aligned

- Keep documentation synchronized with each infrastructure change (update `CHANGELOG.md`, relevant guides)
- Use branch naming: `type/ID-slug` with `ci` for infra/automation (`ci/MISC-###-short-slug`)
- Continue leveraging smoke tests and accessibility checks before major demos or marketing pushes

Baseline is stable. Pick up the next feature with confidence, and revisit these optional tasks as capacity allows.

