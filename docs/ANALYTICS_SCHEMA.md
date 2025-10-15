# Analytics Event Schema

| Event | Core Properties | Notes |
|---|---|---|
| AUTH_SIGNUP | userId (hash), provider, ts | no email stored |
| ROLE_INITIALIZED | userId, role, ts | claims set |
| SUBSCRIBE_CLICK | userId, planId, ts | |
| CHECKOUT_COMPLETE | userId, sessionId, ts | from webhook |
| JOB_POSTED | userId, jobId, ts | owner only |
| APPLICATION_SUBMITTED | userId, jobId, applicationId, ts | |
| ERROR_CLIENT | route, code, ts | message redacted |
| ERROR_API | route, code, ts | sanitized |

**Storage:** Firestore `events` collection (read-only role planned).  
**PII:** Redact; log lengths/ids instead of full text where possible.
