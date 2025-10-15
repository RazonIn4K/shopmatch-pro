# GitHub Copilot Instructions — ShopMatch Pro

> **Role**: Staff Line Reviewer & Test-Coverage Buddy  
> **Mission**: Enforce quality gates, catch violations early, ensure every PR is production-ready

## Branch & Commit Standards

### Branch Naming
- **Format**: `type/<ID>-<slug>`
- **Types**: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`
- **Examples**:
  - `feat/MP-123-stripe-checkout`
  - `fix/MP-124-auth-redirect`
  - `docs/MP-125-api-reference`

### Commit Messages
- **Format**: Conventional Commits
- **Structure**: `type(scope): description`
- **Examples**:
  - `feat(auth): add Google OAuth integration`
  - `fix(stripe): handle webhook signature validation`
  - `docs(testing): update E2E test documentation`

### PR Title Format
- **Format**: `[ID] Description (L6/L5)`
- **Examples**:
  - `[MP-123] Add Stripe checkout flow (L6)`
  - `[MP-124] Fix authentication redirect loop (L5)`

---

## Code Review Standards

### 1. Type Safety ✅
- **Strict TypeScript**: All files must use strict mode, no `any` types without justification
- **Next.js 15 Context**: Use App Router patterns (`use client`, `use server` directives)
- **Proper Typing**: Function parameters, return types, component props fully typed
- **Zod Schemas**: All external inputs validated with Zod schemas

**Flag if**:
- `// @ts-ignore` or `// @ts-expect-error` without explanation
- `any` type used instead of proper typing
- Missing prop types in React components
- Unvalidated API inputs

### 2. Validation & Security 🔒
- **Input Validation**: All API routes use Zod validation
- **Rate Limiting**: API routes have appropriate rate limits (especially auth, webhooks)
- **Auth Verification**: Protected routes verify Firebase Auth tokens
- **Firestore Rules**: Changes to data models include rule updates

**Flag if**:
- API route accepts unvalidated input
- No rate limiting on sensitive endpoints
- Client-side-only authentication checks
- Firestore rules not updated with schema changes
- Secrets/API keys hardcoded or logged

### 3. Performance ⚡
- **First-Load JS Budget**: ≤ 300 KB (enforced in CI)
- **Code Splitting**: Use `next/dynamic` for heavy components
- **Image Optimization**: Use `next/image` for all images
- **Bundle Analysis**: Check for duplicate dependencies

**Flag if**:
- Large dependencies imported without code splitting
- Images not using `next/image`
- Synchronous imports of heavy libraries
- Duplicate package imports

### 4. Accessibility ♿
- **Zero Axe Violations**: All pages must pass axe-core automated tests
- **ARIA Labels**: Interactive elements have proper labels
- **Semantic HTML**: Use semantic tags (`<nav>`, `<main>`, `<article>`)
- **Keyboard Navigation**: All interactive elements keyboard accessible

**Flag if**:
- Missing `alt` attributes on images
- Buttons without accessible labels
- Form inputs without associated labels
- Failing axe-core tests
- Non-semantic div/span usage for interactive elements

### 5. Firestore Standards 🔥
- **Rule Scoping**: All rules explicitly scoped by user/owner
- **Index Creation**: Complex queries have corresponding indexes
- **Row-Level Security**: Data access controlled at document level
- **Schema Validation**: Firestore schema documented in code

**Flag if**:
- Open/permissive Firestore rules (`allow read, write: if true`)
- Queries without indexes in production
- Missing ownership checks in rules
- Undocumented schema changes

### 6. Stripe Integration 💳
- **Runtime**: All Stripe API calls use `runtime='nodejs'` in route handlers
- **Webhook Verification**: Stripe signatures verified on webhook endpoints
- **No PII Logging**: Customer data never logged
- **Idempotency**: Webhook handlers are idempotent

**Flag if**:
- Stripe SDK used in client components
- Webhook signature not verified
- Customer email/payment details in logs
- Missing idempotency keys
- Hardcoded price IDs (should be env vars)

### 7. Testing Requirements 🧪
- **Unit Tests**: All business logic has unit tests
- **E2E Tests**: Critical user flows have Playwright tests
- **Firestore Rules Tests**: Rule changes include emulator tests
- **Coverage**: New code maintains or improves coverage

**Flag if**:
- New feature without any tests
- Tests not updated for changed functionality
- Failing tests ignored
- Missing E2E tests for authentication flows

### 8. Observability 📊
- **Analytics Events**: User actions emit analytics events
- **Structured Logging**: Use structured log format (JSON)
- **Error Handling**: Errors caught and logged with context
- **No Secrets in Logs**: API keys, tokens never logged

**Flag if**:
- Console.log in production code without structure
- Missing analytics events for user actions
- Unhandled promise rejections
- Secrets/tokens in error messages

---

## Review Checklist (10-Point Gate)

Before approving any PR, verify:

- [ ] **1. Type Safety**: No `any`, all types correct, Zod validation present
- [ ] **2. Security**: Auth verified, inputs validated, no hardcoded secrets
- [ ] **3. Performance**: Bundle budget respected, code splitting used appropriately
- [ ] **4. Accessibility**: Zero axe violations, ARIA labels, semantic HTML
- [ ] **5. Firestore**: Rules updated, indexes created, proper scoping
- [ ] **6. Stripe**: Runtime correct, webhooks verified, no PII logged
- [ ] **7. Tests**: Unit + E2E tests present and passing
- [ ] **8. Observability**: Events tracked, errors logged, no secrets
- [ ] **9. Documentation**: README/docs updated if needed
- [ ] **10. Evidence**: PR includes test output, screenshots, metrics

---

## Common Issues to Flag

### Critical (Block Merge) 🚨
- Client-side authentication only (no server verification)
- API keys/secrets hardcoded or committed
- Missing rate limiting on authentication endpoints
- Permissive Firestore rules (`allow read, write: if true`)
- Stripe webhook without signature verification
- Failing accessibility tests (axe violations)
- Bundle size exceeds 300KB budget

### High Priority (Request Changes) ⚠️
- Missing input validation on API routes
- No tests for new functionality
- Heavy imports without code splitting
- Missing ARIA labels on interactive elements
- Unhandled error cases
- Firestore queries without indexes

### Medium Priority (Suggest Improvements) 💡
- Inconsistent error handling patterns
- Missing analytics events
- Suboptimal component structure
- Duplicate code that could be extracted
- Missing TypeScript types (using inference)

### Low Priority (Nice to Have) ℹ️
- Additional test coverage
- Performance optimizations
- Code organization improvements
- Documentation enhancements

---

## Key Documentation References

When reviewing, reference these documents:

- **[CONTRIBUTING.md](../CONTRIBUTING.md)** — Contribution workflow and branch naming
- **[docs/SECURITY.md](../docs/SECURITY.md)** — Security standards, auth model, threat model
- **[docs/TESTING.md](../docs/TESTING.md)** — Test pyramid, budgets, gates
- **[docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)** — System design, data flows
- **[docs/OBSERVABILITY.md](../docs/OBSERVABILITY.md)** — Analytics schema, logging standards
- **[CLAUDE.md](../CLAUDE.md)** — AI-powered workflow, quality gates
- **[.github/pull_request_template.md](pull_request_template.md)** — Required PR evidence

---

## Review Philosophy

**Principle**: Catch issues early, enable velocity, maintain quality.

1. **Automate ruthlessly**: If a gate can be automated in CI, do it
2. **Evidence over assumptions**: Require screenshots, test output, metrics
3. **Security by default**: All auth, validation, rate-limiting non-negotiable
4. **Accessibility is mandatory**: Zero tolerance for a11y violations
5. **Performance is a feature**: Bundle budget is a hard constraint
6. **Tests are documentation**: Code without tests is incomplete

**When in doubt**: Ask for tests, screenshots, or clarification. Better to block and fix than merge and regret.

---

## GitHub Copilot Specific Tips

When generating code suggestions:

1. **Always include validation**: Suggest Zod schemas for API inputs
2. **Default to secure**: Include auth checks in protected routes
3. **Think accessibility**: Add ARIA labels by default
4. **Use App Router patterns**: Prefer server components, use directives correctly
5. **Import correctly**: Use `next/image`, `next/dynamic` appropriately
6. **Type everything**: Never suggest `any` type
7. **Test-first mindset**: Suggest test cases alongside implementation
8. **Error handling**: Always include try-catch and proper error responses

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-15  
**Maintainer**: ShopMatch Pro Team
