# ADR 0004 — Server Data Layer under src/lib/server
**Date:** 2026-06-10 · **Status:** Accepted

## Context
API route handlers had accumulated inline Firestore queries, four duplicated Timestamp-to-Date transforms, and persistence-coupled business rules. PRs #188–#191 hardened individual routes but increased the spread. No written spec existed for the planned "PR 3B server data-layer extraction"; this ADR records the design as implemented (SMP-106) so the decision lives in the repo.

## Decision
- All Firestore access for domain data lives in `src/lib/server/` modules: `jobs.ts`, `applications.ts`, `users.ts`, with shared helpers in `firestore.ts` (`toDateValue`, `isMissingIndexError`).
- Route handlers keep HTTP concerns only: request parsing, Zod validation, auth guards, response shaping.
- Boundary rule: `src/lib/api/` holds request-scoped guards and error mapping (`verifyAuth`, `assertRole`, `ApiError`, rate limiters); `src/lib/server/` holds data access. The two directories are intentional — do not merge them.
- Data functions throw `ApiError` (status-bearing domain errors) for `handleApiError` to translate. Exception: the CSV export data function returns a discriminated result so the route can keep its distinct legacy 404 responses byte-identical.
- Transaction semantics from #190 (atomic application create + counter increment, dual duplicate checks) moved verbatim into `submitApplication`.

## Consequences
+ Single implementation of queries and transforms; transaction logic is unit-testable without HTTP plumbing
+ Route handlers shrank by roughly 580 lines with no contract change
– `ApiError` couples the data layer to HTTP status semantics (accepted as pragmatic for this codebase size)
– Stripe routes and `users/initialize-claims` still use the Admin SDK directly (deliberately out of scope; see follow-ups)

## Alternatives
Repository classes with dependency injection (rejected: overkill at this scale); keeping inline queries (rejected: duplication had already caused drift between the two job-transform copies).

## Follow-ups
- Convert the job detail page to SSR reusing `getJob` (the jobs list went SSR in #97; the detail page is the actual SEO target)
- Reuse `listJobs` in `src/app/sitemap.ts`
- Migrate the export route from manual token verification to `verifyAuth`
- Replace in-memory rate limiting with a durable store (per-instance on Vercel today)
