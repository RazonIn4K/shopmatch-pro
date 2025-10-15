# Testing Strategy

## Pyramid
- **Unit (Jest):** utils, hooks (`use-orchestration`-like), rules helpers
- **Component (React Testing Library):** forms, dialogs
- **E2E (Playwright):** auth flows, role routing, jobs CRUD, Stripe demo path
- **Rules (Emulator):** allow/deny matrices for users/jobs/applications

## Commands
- `npm run test` — unit/component
- `npm run test:e2e` — Playwright
- `npm run emulators` — Firestore rules tests
- `npm run typecheck` — TS
- `npm run lint` — ESLint + a11y

## Budgets & Gates
- First-load JS ≤ 300 kB (CI fails above)
- Axe a11y checks pass on key pages
