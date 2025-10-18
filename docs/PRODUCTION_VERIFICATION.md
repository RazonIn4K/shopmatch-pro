# Production Deployment Verification Checklist

This document provides a step-by-step checklist to perform after deploying a new version of the application to production (Vercel). The goal is to ensure all integrated services (Vercel, Firebase, Stripe) are functioning correctly.

---

## Phase 1: Initial Deployment & Health Check

**Objective**: Verify the deployment was successful and the application is online.

- [ ] **Vercel Deployment**: Confirm the Vercel deployment completed successfully with no build errors.
- [ ] **Environment Variables**: Double-check that all production environment variables (including secrets) are correctly configured in the Vercel project settings.
- [ ] **Homepage Access**: Navigate to the production URL. The homepage should load without errors.
- [ ] **API Health Check**: Access the health check endpoint at `[your-production-url]/api/health`.
  - **Expected Output**: `{"status":"ok","checks":{"firebase":true,"stripe":true,"environment":true}}`

---

## Phase 2: Authentication & User Creation

**Objective**: Verify that user sign-up and authentication flows are working.

- [ ] **Create Seeker Account**:
  - [ ] Sign up for a new account using the "Job Seeker" role.
  - [ ] Verify you are logged in and redirected to the seeker dashboard.
  - [ ] In the Firebase Console, check the **Authentication** tab to see the new user.
  - [ ] In the Firebase Console, check the **Firestore Database** `users` collection for the new user document with `role: 'seeker'`.

- [ ] **Create Owner Account**:
  - [ ] Log out, then sign up for another new account using the "Employer" role.
  - [ ] Verify you are logged in and redirected to the owner dashboard.
  - [ ] Check Firebase for the new user and Firestore document with `role: 'owner'`.

---

## Phase 3: Stripe Subscription Flow (Critical Path)

**Objective**: Verify the entire payment and subscription activation flow. **This replaces the `ngrok` workflow.**

- [ ] **Configure Production Webhook**: Follow the guide in `docs/STRIPE_WEBHOOK_PRODUCTION_SETUP.md` to point a Stripe webhook to your live Vercel URL.
- [ ] **Initiate Checkout**:
  - [ ] As the "Owner" user, navigate to the subscription page.
  - [ ] Click the button to subscribe to the Pro plan.
  - [ ] You should be redirected to a Stripe Checkout page.
- [ ] **Complete Payment**:
  - [ ] Use a Stripe test card (e.g., `4242...`) to complete the payment.
  - [ ] Verify you are redirected back to the application's success page.
- [ ] **Verify Webhook Success**:
  - [ ] In the **Stripe Dashboard**, go to the **Events** log and confirm a `checkout.session.completed` event was sent successfully (200 OK response).
  - [ ] In the **Vercel Dashboard**, check the real-time logs for the `/api/stripe/webhook` function and look for a success message.
  - [ ] In the **Firebase Console**, inspect the "Owner" user in the **Authentication** tab. The `subActive` custom claim should now be `true`.
- [ ] **Verify UI Access**: Refresh the application. The "Owner" user should now have access to pro features (e.g., the "Post a Job" button should be enabled).

---

## Phase 4: Core Application Logic

**Objective**: Test the main job board functionality from both user perspectives.

- [ ] **Job Creation (Owner)**:
  - [ ] As the subscribed "Owner", create and publish a new job posting.
  - [ ] Verify the new job appears in the owner's dashboard and in the main job listings.
  - [ ] Check the `jobs` collection in Firestore to see the new document.

- [ ] **Job Application (Seeker)**:
  - [ ] Log out and log back in as the "Seeker" user.
  - [ ] Find and apply for the job created by the "Owner".
  - [ ] Verify the application appears in the seeker's dashboard.
  - [ ] Check the `applications` collection in Firestore for the new document.

- [ ] **Application Review (Owner)**:
  - [ ] Log out and log back in as the "Owner".
  - [ ] Navigate to the application review dashboard.
  - [ ] Verify the seeker's application is visible.
  - [ ] Update the application's status (e.g., to "Reviewed").

- [ ] **Status Verification (Seeker)**:
  - [ ] Log back in as the "Seeker".
  - [ ] Verify the application status has been updated in the seeker's dashboard.

---

**If all checks pass, the deployment is considered successful.**