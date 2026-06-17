# ShopMatch Pro Loom Recording Prep - 2026-06-17

Use this as the final preflight before recording the ShopMatch Pro walkthrough.

## Verified State

- Live site: `https://shopmatch.highencodelearning.com`
- GitHub main before this prep pass: `03b911f0d3e2e1c4e5f6db4eb81f5019f79e25d3`
- GitLab mirror before this prep pass: `03b911f0d3e2e1c4e5f6db4eb81f5019f79e25d3`
- Latest completed main-branch CI before this prep pass: green
- Local checks after the recording-prep changes:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:unit`
  - `npm run test:rules`
  - `npm run build`
  - `FIRST_LOAD_BUDGET_KB=300 node scripts/ci/measure-first-load.mjs build-output.txt`
  - `BASE_URL=http://localhost:3000 npx playwright test e2e/smoke.spec.ts e2e/accessibility.spec.ts --workers=1`
  - `npx next start -p 3010`
  - `BASE_URL=http://127.0.0.1:3010 npx playwright test e2e/smoke.spec.ts e2e/accessibility.spec.ts --workers=1`
- First-load result after route-scoping Firebase auth: homepage `169.68 KB` against the `300 KB` budget.
- Focused smoke/accessibility result: 8 passed, 2 authenticated checks skipped locally because demo credentials were not exported in the shell.

## Recording Order

1. Open `https://shopmatch.highencodelearning.com`.
2. Clear the cookie banner before starting the take.
3. Start on the homepage and call out the `DEMO` banner.
4. Show the seeded credentials card, but do not dwell on the password.
5. Click `Browse demo jobs` and show the first polished listings.
6. Open `Try demo login`.
7. Sign in as `owner@test.com` and wait for any toast to clear.
8. Show `/dashboard/owner`, then optionally `/dashboard/analytics`.
9. Switch to GitHub Actions only if the latest `main` run after the final commit is green.
10. Close on the live homepage or repository README.

## Safe Claims

- "This is a deployed, test-mode SaaS portfolio demo."
- "The product surface includes auth, listings, applications, dashboards, analytics, Stripe test-mode billing, Firestore rules, and production smoke tests."
- "The public landing page is kept lean by loading Firebase auth only on routes that need authentication."
- "Local production measurement has the homepage at 169.68 KB first-load JS against a 300 KB CI budget."
- "Main branch CI, CodeQL, FOSSA, Snyk, and the GitLab mirror should be rechecked immediately before recording."

## Avoid

- Do not imply real payments or real hiring activity.
- Do not claim every open PR is green while Dependabot checks are still rerunning.
- Do not claim GitLab scanner results are current unless the mirror workflow completed after the commit shown on camera.
- Do not create new customer-looking data on camera.
