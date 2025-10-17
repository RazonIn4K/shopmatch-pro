# E2E Testing Guide

This directory contains end-to-end (E2E) tests using Playwright with axe-core accessibility testing.

## Quick Start

### Prerequisites
- Node.js 20+ installed
- Dependencies installed: `npm install`
- Playwright browsers installed: `npx playwright install chromium`

### Running Tests

**Option 1: Automated Setup (Recommended)**
```bash
# Set up test environment, start dev server, and run tests
./e2e/utils/setup-test-env.sh
npm run dev  # In separate terminal
npm run test:e2e
```

**Option 2: Manual Setup**
```bash
# 1. Copy test environment configuration
cp .env.test.local .env.local

# 2. Clear Next.js cache (required to pick up new env vars)
rm -rf .next

# 3. Start dev server
npm run dev  # Dev server will start on http://localhost:3000

# 4. Run tests (in separate terminal)
npm run test:e2e
```

**Option 3: CI/Automated Pipeline**
```bash
# For CI environments (automatically handled by GitHub Actions)
cp .env.test.local .env.local && rm -rf .next && npm run dev &
npm run test:e2e
```

### Restoring Production Environment

After running E2E tests, restore your production environment:
```bash
# If backup exists
cp .env.local.backup .env.local && rm -rf .next

# Or manually restore your production .env.local file
```

## Test Environment

### Environment Variables

E2E tests require mock Firebase credentials to avoid triggering real Firebase connections during automated tests. The test environment is configured in [.env.test.local](../.env.test.local):

```bash
NEXT_PUBLIC_AUTH_TEST_MODE=mock  # Skips Firebase listener in AuthContext
NEXT_PUBLIC_FIREBASE_API_KEY=test-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=test-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=test-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=test-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
```

### Why Mock Mode is Required

The `NEXT_PUBLIC_AUTH_TEST_MODE=mock` flag is critical for E2E tests because:

1. **Prevents Firebase Initialization**: Skips real Firebase Auth listener in `AuthContext`
2. **Deterministic State**: Provides immediate unauthenticated state (`loading=false, user=null`)
3. **Faster Tests**: No network requests or auth delays
4. **No Firebase Required**: Tests work without valid Firebase credentials

Without mock mode, pages like `/dashboard` and `/subscribe` would be stuck in loading state because the `AuthContext` would wait for Firebase to initialize.

## Test Structure

### Current Test Coverage

| Test | Purpose | Accessibility Standards |
|------|---------|------------------------|
| Homepage | Public landing page | WCAG 2.0 Level A/AA, Section 508 |
| Login Page | Authentication UI | WCAG 2.0 Level A/AA, Section 508 |
| Dashboard (Unauthenticated) | Redirect to login | WCAG 2.0 Level A/AA, Section 508 |
| Subscribe Page | Payment/subscription flow | WCAG 2.0 Level A/AA, Section 508 |

### Test Organization

```
e2e/
├── accessibility.spec.ts   # Main accessibility test suite
├── utils/
│   ├── setup-test-env.sh   # Environment setup script
│   └── README.md           # This file
└── README.md               # Test documentation
```

## Accessibility Testing

### axe-core Integration

Tests use [@axe-core/playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright) to automatically detect WCAG violations. The test configuration enforces:

- **WCAG 2.0 Level A** compliance
- **WCAG 2.0 Level AA** compliance
- **Section 508** compliance

### Zero Tolerance Policy

All tests enforce a zero tolerance policy for accessibility violations:
```typescript
expect(accessibilityScanResults.violations).toEqual([])
```

Any violations will fail the test with detailed output including:
- Violation ID and description
- Impact level (critical, serious, moderate, minor)
- Affected elements (HTML snippet)
- Remediation guidance (help URL)

### Example Violation Output

```bash
Accessibility violations found on subscribe page:
- label: Form elements must have labels
  Impact: critical
  Help: https://dequeuniversity.com/rules/axe/4.10/label
  Affected elements: 1
    1. <input type="email" name="email" />
       Fix any of the following:
         Form element does not have an implicit (wrapped) <label>
         Form element does not have an explicit <label>
         aria-label attribute does not exist or is empty
```

## Debugging Tests

### Interactive UI Mode

Run tests with Playwright's interactive UI:
```bash
npm run test:e2e -- --ui
```

This allows you to:
- Step through test execution
- Inspect DOM at each step
- View accessibility violations in real-time
- Debug test failures interactively

### Headed Mode

Run tests with visible browser:
```bash
npm run test:e2e -- --headed
```

### Debug Mode

Run tests with debugger breakpoints:
```bash
npm run test:e2e -- --debug
```

### View HTML Report

After tests complete, view detailed HTML report:
```bash
npx playwright show-report --host 127.0.0.1
```

The report includes:
- Test execution timeline
- Screenshots on failure
- Video recordings (on failure)
- Accessibility scan results
- Network activity

## Writing New Tests

### Adding a New Page Test

```typescript
test('new page should have no accessibility violations', async ({ page }) => {
  // Navigate to page
  await page.goto('/new-page')

  // Wait for page to fully render (adjust selector as needed)
  await page.waitForSelector('main h1', { timeout: 5000, state: 'visible' })

  // Run accessibility scan
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(AXE_CONTEXT.runOnly.values)
    .analyze()

  // Assert zero violations
  expect(accessibilityScanResults.violations).toEqual([])

  // Optional: Log violations for debugging
  if (accessibilityScanResults.violations.length > 0) {
    console.error('Accessibility violations found:')
    accessibilityScanResults.violations.forEach(violation => {
      console.error(`- ${violation.id}: ${violation.description}`)
      console.error(`  Impact: ${violation.impact}`)
    })
  }
})
```

### Testing Authenticated Pages

For pages that require authentication, you have two options:

**Option 1: Test the redirect behavior (current approach)**
```typescript
test('protected page redirects to login', async ({ page }) => {
  await page.goto('/protected-page')

  // Wait for redirect to login
  await page.waitForURL('**/login', { timeout: 10000 })
  await page.waitForSelector('main h1', { timeout: 5000, state: 'visible' })

  // Test accessibility of login page (where user is redirected)
  const results = await new AxeBuilder({ page })
    .withTags(AXE_CONTEXT.runOnly.values)
    .analyze()

  expect(results.violations).toEqual([])
})
```

**Option 2: Mock authenticated state (future enhancement)**
```typescript
// TODO: Implement test user creation and authentication flow
// This would allow testing authenticated pages directly
```

## CI/CD Integration

### GitHub Actions Workflow

E2E tests are integrated into the CI pipeline ([.github/workflows/ci.yml](../.github/workflows/ci.yml)):

```yaml
- name: E2E Accessibility Tests
  run: |
    cp .env.test.local .env.local
    rm -rf .next
    npm run dev &
    npx wait-on http://localhost:3000
    npm run test:e2e
```

### Artifacts

On test failure, CI uploads the following artifacts:
- HTML test report
- Screenshots of failed tests
- Video recordings
- Accessibility scan results

Access artifacts via GitHub Actions → Workflow run → Artifacts section.

## Troubleshooting

### Tests Timeout Waiting for Elements

**Symptom**: `TimeoutError: page.waitForSelector: Timeout 5000ms exceeded`

**Cause**: Page is stuck in loading state due to AuthContext not receiving mock mode flag.

**Solution**:
1. Verify `.env.local` contains `NEXT_PUBLIC_AUTH_TEST_MODE=mock`
2. Clear Next.js cache: `rm -rf .next`
3. Restart dev server: `pkill -f "next dev" && npm run dev`

### Pages Show "Loading..." Instead of Content

**Symptom**: Page renders loading skeleton indefinitely.

**Cause**: `NEXT_PUBLIC_AUTH_TEST_MODE` not set at build time.

**Solution**:
1. Run setup script: `./e2e/utils/setup-test-env.sh`
2. Ensure `.next/` directory is deleted before starting dev server
3. Restart dev server to pick up new env vars

### Accessibility Violations Reported

**Symptom**: Tests fail with accessibility violations logged to console.

**Solution**:
1. Review violation details in test output
2. Fix accessibility issues in source code
3. Rerun tests to verify fixes
4. Consult [axe-core rules documentation](https://dequeuniversity.com/rules/axe/)

### Port 3000 Already in Use

**Symptom**: Dev server fails to start with "EADDRINUSE: address already in use ::1:3000"

**Solution**:
```bash
# Kill existing Next.js processes
pkill -f "next dev"

# Or find and kill specific process
lsof -ti:3000 | xargs kill
```

## Performance Tips

### Reduce Test Execution Time

1. **Run specific test**:
   ```bash
   npm run test:e2e -- --grep="homepage"
   ```

2. **Run in parallel** (default in local, serial in CI):
   ```bash
   npm run test:e2e -- --workers=4
   ```

3. **Skip slow tests during development**:
   ```bash
   npm run test:e2e -- --grep-invert="slow"
   ```

### Optimize Playwright Configuration

See [playwright.config.ts](../playwright.config.ts) for:
- Timeout settings
- Worker configuration
- Retry logic
- Video/screenshot settings

## Related Documentation

- [Playwright Documentation](https://playwright.dev)
- [axe-core Playwright Integration](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)
- [WCAG 2.0 Guidelines](https://www.w3.org/WAI/WCAG20/quickref/)
- [Section 508 Standards](https://www.section508.gov/)
- [ShopMatch Pro Testing Strategy](../docs/TESTING.md)

## Contributing

When adding new pages or features:

1. **Write accessibility tests first** (TDD approach)
2. **Run tests locally** before pushing
3. **Fix violations immediately** (don't defer)
4. **Update this README** if adding new test patterns
5. **Ensure CI passes** before merging PRs

## Support

For questions or issues with E2E testing:
- Review [docs/TESTING.md](../docs/TESTING.md)
- Check [GitHub Issues](https://github.com/your-org/shopmatch-pro/issues)
- Consult Playwright's [debugging guide](https://playwright.dev/docs/debug)
