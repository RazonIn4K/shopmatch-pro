# Quick Fix Checklist ✅

**Site:** https://shopmatch-pro.vercel.app/  
**Issue:** Demo not working - login fails, jobs page shows error

---

## 🚨 Critical Path (30 min)

### ☐ 1. Create Demo Users (5 min)

```bash
npm run create-demo-users
```

**Expected output:**
```
✅ Created: owner@test.com
✅ Created: seeker@test.com
🎉 All demo users created successfully!
```

**If it fails:**
- Check `.env.local` has Firebase credentials
- Run: `gcloud auth application-default login`
- See: `docs/DEMO_SETUP_GUIDE.md`

---

### ☐ 2. Seed Demo Data (5 min)

```bash
npm run seed-demo-data
```

**Expected output:**
```
✅ Created: 6 sample jobs
✅ Created: 3 sample applications
🎉 Demo data seeded successfully!
```

---

### ☐ 3. Configure Vercel (10 min)

**Go to:** Vercel Dashboard → shopmatch-pro → Settings → Environment Variables

**Add these 3 variables:**

| Variable | Value | Where to Find |
|----------|-------|---------------|
| `FIREBASE_PROJECT_ID` | `shopmatch-pro` | Firebase Console → Project Settings |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-xxxxx@...` | Firebase Console → Service Accounts |
| `FIREBASE_PRIVATE_KEY` | `"-----BEGIN...-----"` | Firebase Console → Service Accounts → Generate Key |

**Important:** 
- Private key must include `BEGIN` and `END` markers
- Wrap in quotes: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"`

**Then:** Redeploy or trigger new deployment

---

### ☐ 4. Test Manually (5 min)

**Test Employer Login:**
1. Go to: https://shopmatch-pro.vercel.app/login
2. Email: `owner@test.com`
3. Password: `testtest123`
4. ✅ Should redirect to dashboard
5. ✅ Should see posted jobs

**Test Job Seeker Login:**
1. Logout
2. Login with: `seeker@test.com` / `testtest123`
3. ✅ Should redirect to dashboard
4. ✅ Should see applications

**Test Jobs Browse:**
1. Go to: https://shopmatch-pro.vercel.app/jobs
2. ✅ Should see 6 jobs (not error message)
3. ✅ Can click to view details

---

### ☐ 5. Run Automated Tests (5 min)

```bash
BASE_URL=https://shopmatch-pro.vercel.app npm run test:e2e
```

**Expected:**
```
✅ 41 tests passed
```

---

## 🔍 Troubleshooting

### Issue: "FIREBASE_PROJECT_ID is required"
**Fix:** Create/check `.env.local` file with Firebase credentials

### Issue: "Demo owner account not found"
**Fix:** Run `npm run create-demo-users` first

### Issue: Jobs API still returns 500
**Fix:** Check Vercel environment variables are set correctly, then redeploy

### Issue: Login still fails with "invalid-credential"
**Fix:** Check Firebase Console → Authentication to see if users exist

---

## 📊 Success Criteria

After completing all steps, verify:

- ✅ Can login with `owner@test.com` / `testtest123`
- ✅ Can login with `seeker@test.com` / `testtest123`
- ✅ Jobs page loads without errors
- ✅ Jobs page shows 6 sample jobs
- ✅ Employer dashboard shows jobs
- ✅ Job seeker dashboard shows applications
- ✅ All E2E tests pass

---

## 📚 Full Documentation

- **Quick Start:** This file (you're reading it!)
- **Detailed Setup:** `docs/DEMO_SETUP_GUIDE.md`
- **Technical Report:** `docs/DEMO_ISSUES_REPORT.md`
- **Executive Summary:** `docs/FIX_SUMMARY.md`

---

## 🆘 Need Help?

1. Review documentation above
2. Check Firebase Console for users/data
3. Check Vercel logs for errors
4. Run diagnostics: `npx playwright test demo-diagnostics.spec.ts`

---

**Estimated Total Time:** 30 minutes  
**Complexity:** Low (mostly configuration)  
**Impact:** High (makes demo fully functional)
