# Firestore Rules Spec

## Collections
- `users/{uid}` — role, profile (owner/seeker)
- `jobs/{id}` — ownerId, title, desc, status
- `applications/{id}` — jobId, seekerId, status, notes
- `events/{id}` — analytics

## Allow/Deny Matrix (sample)
| Actor | users | jobs | applications | events |
|---|---|---|---|---|
| anon | read: none | read: list public | create: none | create: limited |
| seeker | read: self | read: public | create: own app; read: own | create: limited |
| owner | read: self | create+read+update own | read apps for own jobs; update status | create: limited |
| admin | all | all | all | all |

## Emulator Tests
- Owner cannot read other owners’ jobs
- Seeker cannot update application status
- Events writes allowed at limited rate
