# ShopMatch Pro - Loom Walkthrough Script

**Duration**: 10-12 minutes
**Audience**: Hiring managers, potential clients, technical recruiters
**Goal**: Showcase full-stack development capabilities and production-grade implementation

---

## 🎬 Pre-Recording Checklist

- [ ] Open https://shopmatch-pro.vercel.app in browser
- [ ] Have Stripe test card ready: `4242 4242 4242 4242`
- [ ] Close unnecessary tabs/notifications
- [ ] Test audio levels
- [ ] Prepare two browser windows/profiles:
  - Window 1: Regular (for Owner account)
  - Window 2: Incognito (for Seeker account)

---

## 📝 Script Overview

**Total Time**: ~12 minutes

1. Introduction (30 sec)
2. Landing Page & Architecture (1 min)
3. Job Seeker Flow (2 min)
4. Owner Flow - Subscription (2 min)
5. Owner Flow - Job Posting (1.5 min)
6. Application Management (1.5 min)
7. Analytics Dashboard (1.5 min)
8. Technical Highlights (2 min)
9. Closing (30 sec)

---

## 🎤 Detailed Script

### 1. Introduction (30 seconds)

**[Start recording - show landing page]**

> "Hi, I'm David, and I'm excited to walk you through ShopMatch Pro - a production-grade SaaS job board platform I built to demonstrate full-stack development capabilities with modern authentication, payment processing, and professional development practices.

> This is a real, deployed application running on Vercel. It showcases TypeScript, Next.js 15, Firebase authentication and database, Stripe payment integration, and a comprehensive CI/CD pipeline. Let's dive in."

**[Pause briefly]**

---

### 2. Landing Page & Architecture (1 minute)

**[Scroll through landing page]**

> "Starting with the landing page, you'll notice a clean, professional design built with Tailwind CSS v4 and shadcn/ui components. Everything is fully responsive.

> **[Point to features]** The platform serves two user types: job seekers who can browse and apply to jobs for free, and employers who need a Pro subscription to post jobs and manage applications.

> **[Open browser DevTools → Network tab briefly]** Under the hood, this is built with Next.js 15's App Router using server components for optimal performance. You can see the first-load JavaScript is only 177 KB - 41% under budget - thanks to code splitting and optimization.

> **[Close DevTools]** The backend uses Firebase Firestore for the database with comprehensive security rules, and Firebase Auth for authentication with custom JWT claims for role and subscription management."

---

### 3. Job Seeker Flow (2 minutes)

**[Click "Browse Jobs" or navigate to /jobs]**

> "Let's start with the job seeker experience. Here's the job listing page showing all published positions.

> **[Scroll through jobs]** Each job card shows key information - title, company, location, salary range, and how long ago it was posted. These are real-time from Firestore.

> **[Click on a job]** When you click into a job, you get the full details including requirements, skills needed, and a complete description.

> **[Scroll to application form]** To apply, you need to be logged in. Let me show you the authentication flow.

> **[Click Sign In, then switch to Sign Up]** The signup process supports both email/password and Google OAuth. I'll create a quick job seeker account.

> **[Fill out form]**
> - Email: `demo-seeker@example.com`
> - Password: `Test123!`
> - Role: Job Seeker
> - Name: Sarah Johnson

> **[Submit]** Notice how after signup, you're immediately logged in and redirected. This uses Firebase Authentication with server-side token verification.

> **[Go back to job detail, scroll to application form]** Now I can submit an application. The form validates input with Zod schemas on both client and server.

> **[Fill out application with sample text]** Let me submit this application...

> **[Submit and show success]** Perfect! The application is submitted, and you can see real-time feedback. On the backend, this created a document in Firestore, incremented the job's application counter, and denormalized the job data for efficient querying."

---

### 4. Owner Flow - Subscription (2 minutes)

**[Open incognito window or new profile]**

> "Now let's see the employer side. I'll sign up as an employer.

> **[Navigate to signup]** Creating an owner account...

> **[Fill out form]**
> - Email: `demo-owner@example.com`
> - Password: `Test123!`
> - Role: Employer
> - Company: Tech Innovations Inc.

> **[After signup, navigate to dashboard]** After signup, owners land on their dashboard. But notice - I can't create jobs yet because I don't have a subscription.

> **[Click "Subscribe to Post Jobs" or navigate to /subscribe]** To post jobs, employers need a Pro subscription. This is where Stripe integration comes in.

> **[Show subscription page]** The Pro plan is $49/month and gives unlimited job postings. Let me walk you through the payment flow.

> **[Click "Subscribe Now"]** This creates a Stripe Checkout session on the server, passing the user ID as metadata.

> **[On Stripe checkout page]** We're now on Stripe's hosted checkout page - this is Stripe's secure payment form, not something I built, which ensures PCI compliance.

> **[Fill out payment form]**
> - Email: demo-owner@example.com
> - Card: `4242 4242 4242 4242`
> - Expiry: Any future date (12/25)
> - CVC: 123
> - Name: Demo Owner

> **[Submit payment]** When the payment processes, Stripe sends a webhook to my backend...

> **[After redirect back to app]** And there we go! I'm redirected back with an active subscription. Behind the scenes, the webhook handler verified the Stripe signature, updated the user's custom claims in Firebase, and synchronized the subscription status. The user gets instant access without needing to log out and back in."

---

### 5. Owner Flow - Job Posting (1.5 minutes)

**[Navigate to "Post a Job" or /jobs/new]**

> "Now that I have a subscription, I can create job postings. Let's create one.

> **[Fill out job form - speak while typing]** The form uses React Hook Form with Zod validation. I'll create a posting for a Senior Full-Stack Developer position...

> **[Fill in key fields]**
> - Title: Senior Full-Stack Developer
> - Company: Tech Innovations Inc.
> - Location: Remote
> - Type: Full-time
> - Salary: $120k-$160k
> - Requirements: (add 2-3 items)
> - Skills: (add tags like React, TypeScript, Node.js)
> - Description: (brief description)

> **[Submit]** When I submit, this goes through server-side validation, checks my subscription status via custom claims, and creates the job in Firestore.

> **[After submission, view job]** And here's the published job! Notice the URL is shareable, and this job now appears in the public listing."

---

### 6. Application Management (1.5 minutes)

**[Navigate to dashboard or applications page]**

> "Let's see how application management works. Going back to the dashboard...

> **[Show applications list]** Here I can see all applications received for my jobs. This shows the applicant's name, which job they applied for, when they applied, and the current status.

> **[Click on an application to view details]** When I open an application, I can see the full cover letter and all details.

> **[Change status dropdown]** I can update the status - from 'Applied' to 'Reviewing', 'Interview', 'Rejected', or 'Hired'.

> **[Update status to 'Interview']** This updates in real-time using Firestore. In a production version, this could trigger email notifications to the applicant.

> The application data is denormalized - meaning we store a snapshot of the job and applicant info at application time. This prevents historical data from changing if a job is edited later, and improves read performance since we don't need to join multiple collections."

---

### 7. Analytics Dashboard (1.5 minutes)

**[Navigate to /dashboard/analytics]**

> "One of the features I'm particularly proud of is the analytics dashboard.

> **[Show analytics page]** This displays key performance indicators - jobs posted, matches generated, average time to match, and interview rate.

> **[Scroll to conversion funnel]** The conversion funnel visualizes the hiring pipeline from job views through to successful hires. This helps employers identify drop-off points.

> **[Show insights section]** The narrative insights highlight top-performing roles and competitive markets.

> What's interesting here is that this is **config-driven** - the metrics are loaded from a centralized configuration file, making it easy to swap out for different verticals like course marketplaces or e-commerce platforms.

> **[Show responsive behavior if possible]** Everything is fully responsive and uses the same design tokens as the rest of the dashboard."

---

### 8. Technical Highlights (2 minutes)

**[Navigate to GitHub repo or show README]**

> "Let me quickly highlight some of the technical achievements that make this a production-grade application.

> **[Show GitHub repo or README]**

> **Security**: This project has **zero npm vulnerabilities**, verified through automated npm audit and Snyk scanning in the CI pipeline. I fixed a moderate-severity prototype pollution vulnerability in a transitive dependency using npm overrides.

> **CI/CD Pipeline**: Every pull request runs through a 6-job automated pipeline that includes:
> - Branch and commit validation enforcing naming conventions
> - ESLint and TypeScript strict mode checks
> - Bundle size validation with a 300KB budget
> - Accessibility testing with Playwright and axe-core
> - Comprehensive smoke tests that validate critical user flows
> - Snyk security scanning for dependency vulnerabilities

> **[If showing CI, show GitHub Actions]** On every push to main, production smoke tests run against the live deployment to ensure nothing broke.

> **Architecture**: The application uses:
> - Next.js 15 Server Components for optimal performance
> - TypeScript strict mode throughout
> - Firebase security rules that enforce role-based access control at the database level
> - Custom JWT claims for subscription status, eliminating the need for database queries on every request
> - Stripe webhook signature verification to prevent spoofed payment events
> - Zod schemas for input validation at all type boundaries

> **Documentation**: I created comprehensive documentation including:
> - CLAUDE.md - An AI development guide with architecture patterns and common gotchas
> - CHANGELOG.md following Keep a Changelog format
> - API reference in OpenAPI 3.0 spec
> - Architecture diagrams and runbooks for operations

> **Testing**: Beyond the automated CI tests, there are Playwright E2E tests for critical flows, accessibility verification, and manual testing checklists."

---

### 9. Closing (30 seconds)

**[Return to landing page or dashboard]**

> "So that's ShopMatch Pro - a full-stack SaaS platform demonstrating:
> - Complex authentication with multiple providers
> - Payment processing and subscription management
> - Role-based access control
> - Real-time database operations
> - Comprehensive CI/CD automation
> - Production deployment and monitoring

> The live application is deployed at shopmatch-pro.vercel.app, and all the code is available on GitHub with detailed documentation.

> Thank you for watching! If you'd like to discuss this project or explore working together, feel free to reach out."

**[End recording]**

---

## 📌 Pro Tips for Recording

### Before Recording:
1. **Practice once without recording** - Get comfortable with the flow
2. **Close extra tabs** - Only have what you need
3. **Disable notifications** - No interruptions
4. **Check audio** - Test your microphone levels
5. **Use test accounts** - Don't use real email addresses on screen

### During Recording:
1. **Speak clearly and at a moderate pace** - People can speed up playback if needed
2. **Use your mouse cursor** to point at important elements
3. **Don't worry about perfection** - Authenticity > polish
4. **If you make a small mistake**, just keep going - you can trim in post
5. **Show enthusiasm** - Your passion for the project will come through

### Recording Options:
- **Option A**: Follow the full 12-minute script for comprehensive walkthrough
- **Option B**: Create a shorter 5-7 minute version hitting just sections 1, 3, 4, 5, 8, 9
- **Option C**: Record multiple short clips (2-3 min each) for different audiences

### After Recording:
1. **Trim the beginning/end** - Remove any dead air
2. **Add captions** if Loom doesn't auto-generate them
3. **Pin the link** to your GitHub repo README
4. **Share on LinkedIn** with the post we draft

---

## 🎯 Key Talking Points to Emphasize

Hiring managers care about:
- ✅ **Production-ready code** ("zero vulnerabilities", "comprehensive testing")
- ✅ **Professional practices** ("CI/CD pipeline", "security scanning")
- ✅ **Business value** ("subscription management", "real-time updates")
- ✅ **Modern tech stack** ("Next.js 15", "TypeScript strict mode")
- ✅ **Problem-solving** ("fixed security vulnerability", "optimized performance")

---

## 📱 Alternative: Quick 5-Minute Version

If you want a shorter demo, use this structure:

1. **Intro** (30 sec) - Project overview
2. **Quick tour** (1 min) - Show landing, jobs, dashboard
3. **Key feature demo** (2 min) - Stripe subscription flow OR job application flow (pick one)
4. **Technical highlights** (1 min) - CI/CD, security, architecture
5. **Close** (30 sec) - Links and CTA

This gives you a concise, shareable video for LinkedIn/portfolio.

---

**Good luck with your recording!** 🎬

Remember: You don't need to be perfect. Your knowledge and passion for the project will shine through naturally.
