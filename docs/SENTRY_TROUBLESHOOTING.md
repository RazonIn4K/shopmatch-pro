# Sentry Integration Troubleshooting Guide

**Date**: October 20, 2025  
**Status**: 🔧 Fixing Source Map Upload Issues

---

## ✅ Current Status

### What's Working
- ✅ Server-side error tracking (API routes)
- ✅ Sentry SDK installed (@sentry/nextjs v6.6.0)
- ✅ Configuration files created
- ✅ Test endpoint working
- ✅ NEXT_PUBLIC_SENTRY_DSN configured in Vercel

### What's Not Working
- ⚠️ Client-side Sentry not loading in browser (`window.Sentry` is undefined)
- ⚠️ Source map upload failing during build

---

## 🔍 Root Cause Analysis

### Issue 1: Project Configuration Mismatch
**Error Message:**
```
error: API request failed
Caused by:
    sentry reported an error: One or more projects are invalid (http status: 400)
```

**Cause**: The `next.config.ts` had incorrect org/project names:
- **Configured**: `org: "shopmatch-pro"`, `project: "shopmatch-pro"`
- **Actual**: `org: "davidortizhighencodelearningco"`, `project: "javascript-nextjs"`

**Fix Applied**: ✅ Updated `next.config.ts` lines 13-14 with correct values

### Issue 2: Missing SENTRY_AUTH_TOKEN
**Cause**: The Sentry webpack plugin requires an auth token to upload source maps during build. Without it:
- Source maps don't upload
- Client-side SDK may not initialize properly
- Stack traces show minified code instead of source code

**Fix Required**: Create and configure auth token (see Step 2 below)

---

## 🚀 Next Steps (10 Minutes)

### Step 1: Commit Configuration Fix ✅ COMPLETED

The org/project names have been fixed in `next.config.ts`.

**Commit and push:**
```bash
git add next.config.ts
git commit -m "fix(sentry): correct org and project names for source map upload"
git push origin main
```

---

### Step 2: Create Sentry Auth Token (5 minutes)

1. **Go to Sentry Dashboard**:
   ```
   https://davidortizhighencodelearningco.sentry.io/settings/account/api/auth-tokens/
   ```

2. **Create New Token**:
   - Click **"Create New Token"**
   - **Name**: `Vercel Source Maps Upload`
   - **Scopes** (select these):
     - ✅ `project:releases` (Create, edit, and delete project releases)
     - ✅ `project:write` (Write project data)
     - ✅ `org:read` (Read organization data)
   - Click **"Create Token"**

3. **Copy the Token**:
   - Format: `sntrys_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - ⚠️ **IMPORTANT**: Save this immediately - you won't be able to see it again!

---

### Step 3: Add Auth Token to Vercel (3 minutes)

**Option A: Via Vercel Dashboard** (Recommended)

1. Go to: https://vercel.com/razonin4k/shopmatch-pro/settings/environment-variables

2. Click **"Add New"**:
   - **Key**: `SENTRY_AUTH_TOKEN`
   - **Value**: (paste the token from Step 2)
   - **Environments**: Select **Production** only
   - Click **"Save"**

**Option B: Via Vercel CLI**

```bash
vercel env add SENTRY_AUTH_TOKEN production
# Paste token when prompted
```

---

### Step 4: Redeploy to Production (2 minutes)

```bash
# Option A: Trigger deployment via git push
git push origin main

# Option B: Manual redeploy via CLI
vercel --prod

# Option C: Redeploy via Vercel Dashboard
# Go to: https://vercel.com/razonin4k/shopmatch-pro
# Click "Redeploy" on latest deployment
```

---

### Step 5: Verify Client-Side Sentry Loads

**After deployment completes (~2 minutes):**

1. **Open production site**:
   ```
   https://shopmatch-pro.vercel.app
   ```

2. **Open browser console** (F12 or Cmd+Option+I)

3. **Check if Sentry is loaded**:
   ```javascript
   console.log(window.Sentry);
   ```

   **Expected Result** ✅:
   ```javascript
   {
     captureException: ƒ,
     captureMessage: ƒ,
     init: ƒ,
     // ... many more methods
   }
   ```

   **If still undefined** ❌:
   - Check Vercel build logs for Sentry initialization
   - Verify NEXT_PUBLIC_SENTRY_DSN is set in production
   - Check browser network tab for Sentry SDK load errors

4. **Test error capture**:
   ```javascript
   // In browser console
   window.Sentry.captureMessage("Test from browser console");
   ```

5. **Verify in Sentry Dashboard**:
   - Go to: https://davidortizhighencodelearningco.sentry.io/issues/
   - Should see: "Test from browser console"
   - Environment: `production`

---

## 📊 Verification Checklist

After completing all steps:

- [ ] **Configuration Fixed**
  - `next.config.ts` has correct org: `davidortizhighencodelearningco`
  - `next.config.ts` has correct project: `javascript-nextjs`
  - Changes committed and pushed

- [ ] **Auth Token Created**
  - Token has correct scopes (project:releases, project:write, org:read)
  - Token saved securely

- [ ] **Vercel Environment Variables**
  - `NEXT_PUBLIC_SENTRY_DSN` set (already done ✅)
  - `SENTRY_AUTH_TOKEN` added to production

- [ ] **Deployment Successful**
  - Build completed without errors
  - No "One or more projects are invalid" errors
  - Source maps uploaded successfully

- [ ] **Client-Side Sentry Working**
  - `window.Sentry` is defined in browser console
  - Test error captured successfully
  - Error appears in Sentry dashboard with full stack trace

---

## 🔍 Build Log Verification

**Look for these lines in Vercel build logs:**

### Success Indicators ✅
```
[@sentry/nextjs] Setting up Sentry for Next.js...
[@sentry/nextjs] Successfully set up Sentry.
```

```
Sentry Bundler Plugin execution
> Bundled 304 files for upload
> Bundle ID: 7b36386b-507a-51e8-9e43-17a7d9315b93
✓ Source maps successfully uploaded to Sentry
```

### Failure Indicators ❌
```
error: API request failed
Caused by:
    sentry reported an error: One or more projects are invalid (http status: 400)
```
→ **Fix**: Verify org/project names in `next.config.ts`

```
error: API request failed
Caused by:
    Authentication credentials were not provided
```
→ **Fix**: Add `SENTRY_AUTH_TOKEN` to Vercel

---

## 🛠️ Alternative: Disable Source Map Upload (Not Recommended)

If you want to skip source map upload temporarily (e.g., for testing):

**Edit `next.config.ts`:**
```typescript
export default withSentryConfig(nextConfig, {
  org: "davidortizhighencodelearningco",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  
  // Disable source map upload
  disableServerWebpackPlugin: true,  // ← Add this
  disableClientWebpackPlugin: true,  // ← Add this
  
  widenClientFileUpload: true,
  // ... rest of config
});
```

⚠️ **Downside**: Stack traces will show minified code, making debugging harder.

---

## 📈 Expected Timeline

- **Step 1**: Commit config fix (1 min) ✅ DONE
- **Step 2**: Create auth token (5 min)
- **Step 3**: Add to Vercel (3 min)
- **Step 4**: Redeploy (2 min build time)
- **Step 5**: Verify (2 min)

**Total**: ~15 minutes to complete resolution

---

## 🆘 Still Not Working?

### Debug Checklist

1. **Check Vercel Environment Variables**:
   ```bash
   vercel env ls production
   ```
   Should show:
   - `NEXT_PUBLIC_SENTRY_DSN` ✅
   - `SENTRY_AUTH_TOKEN` ✅

2. **Verify Sentry DSN Format**:
   ```
   https://[PUBLIC_KEY]@o[ORG_ID].ingest.us.sentry.io/[PROJECT_ID]
   ```
   Your DSN:
   ```
   https://94c2cdf2fb501171effd924aee04d172@o4509136303226880.ingest.us.sentry.io/4509136305324032
   ```

3. **Check Sentry Project Settings**:
   - Go to: https://davidortizhighencodelearningco.sentry.io/settings/projects/javascript-nextjs/
   - Verify project is not disabled
   - Check rate limits aren't exceeded

4. **Review Full Build Logs**:
   - Go to Vercel → Deployments → [Latest] → Build Logs
   - Search for "sentry" or "error"
   - Copy full error message for debugging

5. **Test Server-Side First**:
   ```bash
   curl "https://shopmatch-pro.vercel.app/api/sentry-test?error=true"
   ```
   If this doesn't work, the DSN is incorrect or not set.

---

## 📞 Quick Reference

**Sentry Dashboard**:
```
https://davidortizhighencodelearningco.sentry.io/issues/
```

**Sentry Auth Tokens**:
```
https://davidortizhighencodelearningco.sentry.io/settings/account/api/auth-tokens/
```

**Vercel Environment Variables**:
```
https://vercel.com/razonin4k/shopmatch-pro/settings/environment-variables
```

**Vercel Deployments**:
```
https://vercel.com/razonin4k/shopmatch-pro
```

---

## 🎯 Success Criteria

**Sentry integration is fully working when:**

1. ✅ Server-side errors captured (API routes, server components)
2. ✅ Client-side errors captured (browser JavaScript errors)
3. ✅ `window.Sentry` is defined in production
4. ✅ Source maps upload successfully during build
5. ✅ Stack traces show readable source code (not minified)
6. ✅ No build errors related to Sentry

---

**Last Updated**: October 20, 2025 - 11:30 AM UTC-05:00  
**Status**: Configuration fixed, awaiting auth token setup and redeploy  
**Next Action**: Create Sentry auth token → Add to Vercel → Redeploy
