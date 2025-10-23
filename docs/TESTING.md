# Testing Strategy

## Pyramid
- **Unit (Jest):** utils, hooks (`use-orchestration`-like), rules helpers
- **Component (React Testing Library):** forms, dialogs
- **E2E (Playwright):** auth flows, role routing, jobs CRUD, Stripe demo path
- **Rules (Emulator):** allow/deny matrices for users/jobs/applications

## Commands

### Test Execution
- `npm run test:unit` — Jest unit/component tests
- `npm run test:unit:watch` — Jest with watch mode for development
- `npm run test:unit:coverage` — Generate coverage report
- `npm run test:e2e` — Playwright E2E tests (requires server on :3000)
- `npm run test:e2e:ui` — Playwright UI mode (interactive debugging)
- `npm run test:e2e:headed` — Run tests with visible browser
- `npm run test:e2e:debug` — Playwright debugger (step-through mode)
- `npm run test:a11y` — Accessibility tests (axe-core via Playwright)

### Code Quality
- `npm run lint` — ESLint + TypeScript checks
- `npm run build` — Production build (includes TypeScript compilation)

### Firebase Emulator Testing
Firestore security rules are tested locally via Firebase emulators:

```bash
# Install Firebase Tools globally (one-time setup)
npm install -g firebase-tools

# Start Firestore emulator
firebase emulators:start --only firestore

# In another terminal, run tests that interact with Firestore
npm run test:unit

# Stop emulators: Ctrl+C
```

**Note**: Most unit tests use mocked Firebase services. Emulator testing is primarily for validating Firestore security rules behavior.

## Budgets & Gates

### Performance Budgets

**First-Load JS Budget (≤ 300 KB)**:
- Measured via Playwright in headless Chromium
- Counts only JavaScript loaded on initial page visit
- Excludes prefetch requests and Next.js data fetches
- Reports compressed bytes (what users actually download)
- Script: `scripts/ci/measure-first-load.mjs`
- Local test: `FIRST_LOAD_BUDGET_KB=300 node scripts/ci/measure-first-load.mjs`
- CI artifact: `first-load-report.json` (uploaded on every build)

**Lighthouse Budgets** (`lighthouse-budgets.json`):
- Script: ≤ 300 KB
- Stylesheet: ≤ 50 KB
- Total resources: ≤ 1024 KB (1 MB)
- Time to Interactive: ≤ 5000ms
- First Contentful Paint: ≤ 2000ms

### Accessibility Gates

**Axe-core Automated Testing**:
- Zero tolerance for WCAG violations
- Tests 3 critical pages: `/`, `/dashboard`, `/subscribe`
- Runs in CI on every PR
- Reports uploaded as artifacts
- Uses `@axe-core/playwright` for accurate browser context

**Manual Accessibility Checklist**:
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader announces all interactive elements
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)
- [ ] Focus indicators visible on all focusable elements
- [ ] Forms have proper labels and error messages
