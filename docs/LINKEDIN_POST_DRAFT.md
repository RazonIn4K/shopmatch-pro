# LinkedIn Post Drafts for ShopMatch Pro

Use one of these after recording. Replace `[Loom Link]` with the final video URL.

## Version 1 - Short Demo Post

```text
I just refreshed ShopMatch Pro, a deployed SaaS job board demo I built to prove full-stack product execution beyond a static portfolio page.

What it shows:
- Next.js 15.5, React 19, TypeScript 5.9
- Firebase Auth and Firestore
- Stripe test-mode subscriptions and webhook handling
- Employer and job seeker demo flows
- Application tracking and analytics
- GitHub Actions CI, CodeQL, Snyk, Playwright smoke tests, accessibility checks, and Firestore rules tests

Current verification:
- Live production health check passes
- CI and CodeQL are green
- Dependabot has zero open alerts
- Production dependency audit is clean

This is intentionally a test-mode portfolio demo, not a live hiring marketplace. The point is to show the engineering loop: product surface, auth, billing, data access, security checks, deployment, and documentation.

Live demo: https://shopmatch.highencodelearning.com
Code: https://github.com/RazonIn4K/shopmatch-pro
Walkthrough: [Loom Link]

#NextJS #TypeScript #Firebase #Stripe #FullStackDevelopment #SoftwareEngineering
```

## Version 2 - Technical Audience

```text
ShopMatch Pro is my current full-stack SaaS proof project.

The interesting part is not just the UI. It is the operational surface around it:

1. Auth and authorization
Firebase Auth handles login, while roles and entitlement checks protect employer-only flows.

2. Billing path
Stripe Checkout and webhook verification run in test mode so the subscription flow can be demonstrated safely.

3. Data security
Firestore rules backstop application and job access. Rules are tested in CI with the Firebase emulator.

4. Quality gates
The current main branch is green across build, lint, typecheck, unit tests, local smoke, production smoke, accessibility, Firestore rules, Snyk, and CodeQL.

5. Honest security posture
Dependabot has zero open alerts and production dependencies audit clean. The full audit still tracks three dev-only Firebase Tools/OpenTelemetry moderate advisories, documented in the repo rather than hand-waved.

Live: https://shopmatch.highencodelearning.com
Repo: https://github.com/RazonIn4K/shopmatch-pro
Walkthrough: [Loom Link]

#SoftwareArchitecture #DevOps #CICD #WebSecurity #NextJS
```

## Version 3 - Client/Founder Framing

```text
A good SaaS demo should prove more than "I can make screens."

ShopMatch Pro is a deployed job board demo that shows the pieces a real product needs:
- Auth
- Paid access
- Public listings
- Admin workflows
- Applications
- Analytics
- Production smoke tests
- Security and dependency checks
- Clear runbooks and documentation

It is running in test mode at:
https://shopmatch.highencodelearning.com

The repo is public here:
https://github.com/RazonIn4K/shopmatch-pro

I recorded a walkthrough showing the product flow and the engineering proof behind it:
[Loom Link]

If you need a focused SaaS MVP, client portal, marketplace workflow, or secure demo app, this is the kind of system I can build and harden end to end.

#SaaS #FullStackDeveloper #ProductEngineering #NextJS #Firebase #Stripe
```

## Claims To Keep Consistent

Safe:
- "test-mode SaaS demo"
- "production dependency audit is clean"
- "zero open Dependabot alerts"
- "latest CI is green"
- "deployed on Vercel"

Avoid:
- "zero vulnerabilities" without qualification
- "real payments"
- "live hiring marketplace"
- "GitLab scanning is active" until `GITLAB_MIRROR_TOKEN` is configured
