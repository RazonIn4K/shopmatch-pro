# Firestore Rules Spec (v2)

Authorization model enforced by `firestore.rules` and verified by
`npm run test:rules` (emulator-backed, runs in CI).

## Principles

1. **Claims over document reads** — `role` and `subActive` come from JWT
   custom claims (`request.auth.token`), set by `/api/users/initialize-claims`
   and the Stripe webhook. Rules never read `users/{uid}` to authorize.
2. **Canonical ownership** — `jobs/{jobId}.ownerId` is the single source of
   truth for who owns an application. The denormalized
   `applications.ownerId` is verified against it at create and locked at
   update; reads verify against the job document, so a spoofed `ownerId`
   grants nothing.
3. **Server-only fields** — billing/entitlement fields on users and system
   counters on jobs change only via the Admin SDK (which bypasses rules).
4. **Default deny** — collections without a match block (and the explicit
   `events` block) are inaccessible to clients.

## Collections

### `users/{uid}` — self-only
| Op | Rule |
|---|---|
| read | self only |
| create | self; `uid` matches; `role` in `owner`/`seeker`; `subActive == false`; no billing keys (`stripeCustomerId`, `subscriptionId`, `subscriptionStatus`) |
| update | self; may not change `uid`, `role`, `subActive`, or billing keys |
| delete | denied |

### `jobs/{jobId}`
| Op | Rule |
|---|---|
| read | anyone if `status == 'published'`; owner in any status |
| create | `role == 'owner'` claim + `subActive` claim; `ownerId == auth.uid`; counters start at 0 |
| update | owner; may not change `ownerId`, `createdAt`, `applicationCount`, `viewCount` |
| delete | owner |

### `applications/{applicationId}`
| Op | Rule |
|---|---|
| read | seeker (own) or canonical job owner (via `jobs/{jobId}` lookup) |
| create | `role == 'seeker'` claim; `seekerId == auth.uid`; linked job `published`; `ownerId` equals the job's `ownerId`; `status == 'pending'`; no `notes`/`reviewedAt` |
| update | canonical job owner; only `status`, `notes`, `updatedAt`, `reviewedAt` may change; `status` must be a valid value |
| delete | seeker (withdraw own application) |

### `events/{eventId}` — deny all
Telemetry is written server-side via `/api/events` (Admin SDK). Clients have
no direct access.

## Operational dependency

Rules v2 authorizes via custom claims, so **all existing users must have
`role`/`subActive` claims before deployment**:

```bash
node scripts/backfill-claims.js --dry-run   # inspect
node scripts/backfill-claims.js             # apply
```

Users receive new claims on their next token refresh (sign out/in or
`user.getIdToken(true)`).

## Testing

```bash
npm run test:rules   # firebase emulators:exec --only firestore … (requires Java)
```

Covered invariants (`test-firestore-rules.js`):
1. Spoofed `applications.ownerId` grants no read access; canonical owner reads succeed
2. Create rejects non-canonical `ownerId`
3. Immutable application fields locked on update
4. User documents are self-only readable
5. Clients cannot set or flip `subActive`/billing fields
6. Applications only against published jobs
7. Seekers cannot change application status
