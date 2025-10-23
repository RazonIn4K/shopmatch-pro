# Testing Strategy

## Pyramid
- **Unit (Jest):** utils, hooks (`use-orchestration`-like), rules helpers
- **Component (React Testing Library):** forms, dialogs
- **E2E (Playwright):** auth flows, role routing, jobs CRUD, Stripe demo path
- **Rules (Emulator):** allow/deny matrices for users/jobs/applications

## Commands
- `npm run test:unit` — Jest unit/component suite
- `npm run test:unit:watch` — Jest with watch mode for development
- `npm run test:unit:coverage` — Generate coverage report
- `npm run test:e2e` — Playwright regression suite
- `npm run test:a11y` — Accessibility smoke tests (axe-core via Playwright)
- `npm run test:rules` — Firestore security rules via emulator
- `npm run lint` — ESLint + TypeScript checks
- `npm run typecheck` — TypeScript compiler (no emit)

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

**Color Contrast Verification**:

ShopMatch Pro uses CSS custom properties (variables) for theming. Understanding how these variables resolve to actual colors is critical for accessibility compliance.

**CSS Variable Resolution**:
```css
/* src/app/globals.css */
:root {
  --foreground: 0 0% 3.9%;  /* HSL: 3.9% lightness = very dark gray */
}

.dark {
  --foreground: 0 0% 98%;   /* HSL: 98% lightness = very light gray */
}
```

When you use `text-foreground` in a component:
```typescript
<h1 className="text-foreground">Welcome to ShopMatch Pro</h1>
```

Tailwind CSS resolves this to:
```css
color: hsl(0 0% 3.9%);  /* ≈ rgb(10, 10, 10) - nearly black */
```

**Verified Contrast Ratios** (as of 2025-01-22):
- `text-foreground` on white background: **21:1** (exceeds 4.5:1 WCAG AA requirement)
- `text-blue-600` links: **7:1** (exceeds 4.5:1 requirement)
- Dark mode `text-foreground` on dark background: **18:1** (exceeds requirement)

**How to Verify Contrast Ratios**:

1. **Inspect Production HTML**:
   ```bash
   curl -s https://shopmatch-pro.vercel.app/login | grep -A 2 "text-foreground"
   ```

2. **Check Computed Color in Browser**:
   - Right-click element → Inspect
   - Go to Computed tab
   - Look for `color` property
   - Browser shows actual RGB/HSL value

3. **Calculate Contrast Ratio**:
   - Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
   - Or use browser DevTools (Chrome: inspect → Accessibility → Contrast)
   - Enter foreground and background colors
   - Verify ratio meets WCAG AA (4.5:1 for normal text, 3:1 for large text)

**Common Pitfalls**:
- ❌ Don't assume `text-foreground` is `text-gray-600` - it's a CSS variable
- ❌ Don't test contrast in dev mode only - always verify production deployment
- ❌ Don't forget dark mode - test both light and dark themes
- ✅ Do check computed colors in browser DevTools
- ✅ Do use automated tools (axe-core) to catch issues early
