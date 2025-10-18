# SDK Generation from OpenAPI Specification

This guide covers how to regenerate client SDKs from the updated OpenAPI specification after API contract changes.

## Overview

The [API_REFERENCE.yml](./API_REFERENCE.yml) OpenAPI 3.0 specification serves as the single source of truth for API contracts. After updates (like PR #33's alignment with implementation), regenerate client SDKs to ensure type safety and correct HTTP methods.

## Why Regenerate SDKs?

**Critical Changes That Require Regeneration** (from PR #33):
1. ✅ **HTTP Method Changes**: PATCH → PUT for job updates
2. ✅ **Response Envelope Standardization**: All endpoints now return `{ message, <resource> }` format
3. ✅ **New Endpoints Added**: GET /api/applications/{id}, GET /api/applications/export
4. ✅ **Query Parameters Documented**: 8 params for jobs, 3 for applications
5. ✅ **Error Response Updates**: Added 400, 404, 409, 422, 429 schemas

**Without regeneration**, client code will:
- ❌ Use PATCH instead of PUT (405 Method Not Allowed errors)
- ❌ Expect wrong response shapes (TypeScript errors, runtime failures)
- ❌ Miss new endpoints (manual implementation required)
- ❌ Lack type-safe query parameters (runtime errors from typos)

## Prerequisites

1. **OpenAPI Specification**: [docs/API_REFERENCE.yml](./API_REFERENCE.yml) (must be up to date)
2. **Generator Tools**: OpenAPI Generator, swagger-codegen, or openapi-typescript
3. **Node.js**: v20+ (for npm packages)

## Recommended Generators

### 1. openapi-typescript (TypeScript Types Only)

**Best for**: Frontend applications that use fetch/axios directly and just need type safety.

**Installation**:
```bash
npm install --save-dev openapi-typescript
```

**Generate Types**:
```bash
npx openapi-typescript docs/API_REFERENCE.yml -o src/types/api.ts
```

**Usage in Code**:
```typescript
import type { paths } from '@/types/api'

type JobResponse = paths['/api/jobs']['post']['responses']['201']['content']['application/json']
// Type: { message: string; job: { id: string; title: string; ... } }

type JobUpdateRequest = paths['/api/jobs/{id}']['put']['requestBody']['content']['application/json']
// Type: { title?: string; description?: string; ... }

// Type-safe fetch
const response = await fetch('/api/jobs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify(jobData as JobUpdateRequest)
})

const result: JobResponse = await response.json()
```

**Pros**:
- ✅ Minimal overhead (types only, no runtime code)
- ✅ Works with existing fetch/axios code
- ✅ Fast compilation
- ✅ Full TypeScript IntelliSense support

**Cons**:
- ❌ No client library generated (must write fetch calls manually)
- ❌ No automatic request validation

---

### 2. OpenAPI Generator (Full Client SDK)

**Best for**: Applications that want a complete SDK with methods, validation, and error handling.

**Installation**:
```bash
npm install -g @openapitools/openapi-generator-cli
```

**Generate TypeScript SDK**:
```bash
openapi-generator-cli generate \
  -i docs/API_REFERENCE.yml \
  -g typescript-fetch \
  -o src/lib/api-client \
  --additional-properties=supportsES6=true,npmName=shopmatch-api-client,npmVersion=1.0.0
```

**Usage in Code**:
```typescript
import { Configuration, JobsApi } from '@/lib/api-client'

const config = new Configuration({
  basePath: 'https://shopmatch.example.com',
  accessToken: firebaseToken
})

const jobsApi = new JobsApi(config)

// Type-safe method calls
const newJob = await jobsApi.createJob({
  createJobRequest: {
    title: 'Senior Engineer',
    description: 'We are hiring...',
    company: 'ShopMatch Inc.',
    location: 'Remote',
    type: 'full-time',
    status: 'published'
  }
})
// Response: { message: string; job: Job }

// Update job (uses PUT, not PATCH after PR #33)
const updatedJob = await jobsApi.updateJob({
  id: jobId,
  updateJobRequest: { title: 'Staff Engineer' }
})

// Query parameters type-safe
const jobs = await jobsApi.listJobs({
  ownerId: userId,
  status: 'published',
  page: 1,
  limit: 20
})
// Response: { jobs: Job[]; pagination: { page, limit, total, totalPages } }
```

**Pros**:
- ✅ Complete SDK with typed methods
- ✅ Automatic serialization/deserialization
- ✅ Built-in error handling
- ✅ Request validation
- ✅ Full IntelliSense support

**Cons**:
- ❌ Larger bundle size (generated runtime code)
- ❌ Requires @openapitools/openapi-generator-cli dependency
- ❌ May generate unused code (tree-shaking helps)

---

### 3. swagger-codegen (Alternative Generator)

**Installation**:
```bash
npm install -g swagger-codegen
```

**Generate TypeScript Angular SDK**:
```bash
swagger-codegen generate \
  -i docs/API_REFERENCE.yml \
  -l typescript-angular \
  -o src/lib/api-client
```

**Similar to OpenAPI Generator** but with different template options. See [swagger.io/tools/swagger-codegen](https://swagger.io/tools/swagger-codegen/) for all languages.

---

## Workflow After API Changes

### 1. Verify OpenAPI Spec Accuracy

Before generating, ensure the spec matches implementation:

```bash
# Install validator
npm install -g @apidevtools/swagger-cli

# Validate spec syntax
swagger-cli validate docs/API_REFERENCE.yml
```

**Expected Output**:
```
docs/API_REFERENCE.yml is valid
```

### 2. Generate SDK

**For Type-Only Approach** (recommended for most cases):
```bash
npx openapi-typescript docs/API_REFERENCE.yml -o src/types/api.ts
```

**For Full SDK**:
```bash
openapi-generator-cli generate \
  -i docs/API_REFERENCE.yml \
  -g typescript-fetch \
  -o src/lib/api-client
```

### 3. Review Generated Code

**Check for Breaking Changes**:
```bash
# Compare old vs new types
git diff src/types/api.ts

# Or compare old vs new SDK
git diff src/lib/api-client/
```

**Key Changes to Review** (from PR #33):
- ✅ Job update method changed from `PATCH` → `PUT`
- ✅ Response types now include `{ message: string, <resource>: T }` envelope
- ✅ New endpoints: `getApplicationById()`, `exportApplications()`
- ✅ Query parameter types added for filtering and pagination

### 4. Update Calling Code

**Example: Fixing Job Update Call After PR #33**:

**Before (PATCH)**:
```typescript
// ❌ WRONG: This will fail with 405 Method Not Allowed
const response = await fetch(`/api/jobs/${id}`, {
  method: 'PATCH', // Wrong method
  body: JSON.stringify({ title: 'New Title' })
})
const job = await response.json() // Wrong: expects raw Job object
```

**After (PUT with Envelope)**:
```typescript
// ✅ CORRECT: Uses PUT and extracts from envelope
const response = await fetch(`/api/jobs/${id}`, {
  method: 'PUT', // Correct method
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ title: 'New Title' })
})

const { message, job } = await response.json() // Correct: envelope response
// Type: { message: string, job: Job }
```

### 5. Test Generated SDK

**Unit Test Example**:
```typescript
import { JobsApi } from '@/lib/api-client'
import { describe, it, expect } from '@jest/globals'

describe('Jobs API SDK', () => {
  it('should create job with correct envelope response', async () => {
    const api = new JobsApi({ accessToken: 'mock-token' })
    const response = await api.createJob({
      createJobRequest: {
        title: 'Test Job',
        description: 'Test description',
        company: 'Test Co',
        location: 'Remote',
        type: 'full-time',
        status: 'published'
      }
    })

    expect(response.message).toBe('Job created successfully')
    expect(response.job).toHaveProperty('id')
    expect(response.job.title).toBe('Test Job')
  })

  it('should use PUT for job updates (not PATCH)', async () => {
    // Mock fetch to verify method
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ message: 'Job updated', job: {} })
    }))

    const api = new JobsApi({ accessToken: 'mock-token' })
    await api.updateJob({ id: '123', updateJobRequest: { title: 'New' } })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'PUT' }) // Not PATCH
    )
  })
})
```

### 6. Commit Generated Code

```bash
git add src/types/api.ts  # Or src/lib/api-client/
git commit -m "chore: Regenerate API SDK from updated OpenAPI spec

Regenerated after PR #33 (API specification alignment).

**Breaking Changes**:
- Job update method: PATCH → PUT
- Response envelopes: All endpoints now return { message, <resource> }
- New endpoints: GET /api/applications/{id}, GET /api/applications/export
- Query parameters: Added 8 for jobs, 3 for applications

**Testing**:
- [x] Validated OpenAPI spec syntax
- [x] Regenerated TypeScript types/SDK
- [x] Updated calling code to use PUT for job updates
- [x] Verified response envelope extraction
- [x] Unit tests updated and passing

Related: PR #33 (API spec alignment)
"
```

---

## CI/CD Integration

**Automate SDK Regeneration on Spec Changes**:

**.github/workflows/regenerate-sdk.yml**:
```yaml
name: Regenerate API SDK

on:
  pull_request:
    paths:
      - 'docs/API_REFERENCE.yml'

jobs:
  regenerate-sdk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Validate OpenAPI Spec
        run: |
          npm install -g @apidevtools/swagger-cli
          swagger-cli validate docs/API_REFERENCE.yml

      - name: Regenerate TypeScript Types
        run: |
          npm install -g openapi-typescript
          npx openapi-typescript docs/API_REFERENCE.yml -o src/types/api.ts

      - name: Check for Changes
        run: |
          if ! git diff --quiet src/types/api.ts; then
            echo "❌ API types out of sync with spec"
            echo "Run: npx openapi-typescript docs/API_REFERENCE.yml -o src/types/api.ts"
            exit 1
          else
            echo "✅ API types in sync with spec"
          fi
```

**Alternative: Auto-Commit Regenerated SDK**:
```yaml
      - name: Commit Regenerated SDK
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add src/types/api.ts
          git commit -m "chore: Auto-regenerate API types from OpenAPI spec" || echo "No changes"
          git push
```

---

## Troubleshooting

### Issue: Generated types don't match response format

**Symptom**: TypeScript errors like `Property 'message' does not exist on type 'Job'`

**Cause**: OpenAPI spec not aligned with implementation (pre-PR #33)

**Solution**:
1. Verify docs/API_REFERENCE.yml has correct response schemas (should include envelope)
2. Regenerate SDK: `npx openapi-typescript docs/API_REFERENCE.yml -o src/types/api.ts`

### Issue: 405 Method Not Allowed on job updates

**Symptom**: PUT requests work, PATCH requests fail with 405

**Cause**: Generated SDK using PATCH (pre-PR #33 spec)

**Solution**: Regenerate SDK from updated spec (PR #33+) which documents PUT

### Issue: Missing endpoints in generated SDK

**Symptom**: `getApplicationById()` or `exportApplications()` methods not available

**Cause**: Generated from old spec (pre-PR #33) which didn't document these endpoints

**Solution**: Regenerate SDK from updated spec (PR #33+)

### Issue: Validator reports errors in OpenAPI spec

**Symptom**: `swagger-cli validate docs/API_REFERENCE.yml` fails

**Cause**: Syntax errors or invalid schema references

**Solution**:
```bash
# Get detailed error output
swagger-cli validate docs/API_REFERENCE.yml --debug

# Common fixes:
# 1. Check for missing $ref targets
# 2. Ensure required fields are defined
# 3. Verify enum values match implementation
```

---

## Best Practices

### 1. Version SDK Independently

**Package SDK as Separate NPM Package**:
```bash
# In src/lib/api-client/
npm init -y
npm publish

# In main app:
npm install @shopmatch/api-client
```

**Benefits**:
- ✅ Version SDK independently from app
- ✅ Share SDK across multiple frontend apps (web, mobile, admin panel)
- ✅ Track breaking changes via semantic versioning

### 2. Add SDK Tests

**Include Generated Tests in CI**:
```bash
# Install test dependencies in SDK package
cd src/lib/api-client
npm install --save-dev jest @types/jest ts-jest

# Run SDK tests
npm test
```

### 3. Document SDK Usage

**Include README in Generated SDK**:
```markdown
# ShopMatch Pro API Client

TypeScript SDK for ShopMatch Pro REST API.

## Installation
\`\`\`bash
npm install @shopmatch/api-client
\`\`\`

## Usage
\`\`\`typescript
import { JobsApi, Configuration } from '@shopmatch/api-client'

const api = new JobsApi(new Configuration({ accessToken: firebaseToken }))
const jobs = await api.listJobs({ status: 'published' })
\`\`\`
```

### 4. Keep Spec and Implementation in Sync

**Add Pre-Commit Hook**:
```bash
# .husky/pre-commit
npm run validate-openapi
```

**package.json**:
```json
{
  "scripts": {
    "validate-openapi": "swagger-cli validate docs/API_REFERENCE.yml"
  }
}
```

---

## Related Documentation

- [API_REFERENCE.yml](./API_REFERENCE.yml) - OpenAPI 3.0 specification (source of truth)
- [PRODUCTION_VERIFICATION.md](./PRODUCTION_VERIFICATION.md) - Production deployment checklist
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment steps and environment setup
- [TESTING.md](./TESTING.md) - Testing strategy and quality gates

---

## Summary

**When to Regenerate**:
- ✅ After OpenAPI spec changes (like PR #33)
- ✅ When adding new endpoints
- ✅ When changing HTTP methods or response formats
- ✅ When adding query parameters or request bodies

**How to Regenerate**:
1. Validate spec: `swagger-cli validate docs/API_REFERENCE.yml`
2. Generate types/SDK: `npx openapi-typescript docs/API_REFERENCE.yml -o src/types/api.ts`
3. Review changes: `git diff src/types/api.ts`
4. Update calling code to use new types/methods
5. Test thoroughly (unit + integration)
6. Commit regenerated code

**Next Steps**:
- Set up CI workflow to validate spec on changes
- Consider publishing SDK as separate npm package
- Add SDK unit tests
- Document SDK usage in main README
