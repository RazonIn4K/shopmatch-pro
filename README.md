# ShopMatch Pro

A modern job board platform built with Next.js 15, Firebase, and Stripe. Connect job seekers with opportunities through a subscription-based model.

## 🎯 Project Status

**✅ MVP COMPLETE - Ready for Testing**

- All core features implemented
- Production build passing
- Dev server running on http://localhost:3001
- Awaiting Firebase and Stripe configuration

📊 [View Detailed Status Report →](./PROJECT_STATUS.md)

## 🚀 Quick Start

**Get started in 5 minutes:**

1. **Configure Environment Variables**
   ```bash
   # Edit .env.local with your Firebase and Stripe credentials
   # See QUICK_START.md for detailed instructions
   ```

2. **Validate Configuration**
   ```bash
   npm run validate-env
   ```

3. **Access the Application**
   ```
   Development server is already running at:
   http://localhost:3001
   ```

📖 [Read Full Quick Start Guide →](./QUICK_START.md)

## ✨ Features

### For Job Seekers
- 🔍 Browse and search job listings
- 📝 Apply to jobs with cover letters
- 📊 Track application status
- 🎯 Personalized dashboard

### For Employers (Subscription Required)
- ✍️ Post unlimited job listings
- 📋 Manage applications
- 📈 View application analytics
- 🎛️ Edit and close job postings

### Platform Features
- 🔐 Secure authentication (Email/Password + Google OAuth)
- 💳 Stripe subscription integration
- 🔄 Real-time updates with Firebase
- 📱 Fully responsive design
- ⚡ Built with Next.js 15 + Turbopack

## 📁 Tech Stack

- **Framework:** Next.js 15.5.4 with App Router and Turbopack
- **Language:** TypeScript (strict mode)
- **Authentication:** Firebase Auth with role-based access control
- **Database:** Cloud Firestore with security rules
- **Payments:** Stripe Checkout and Subscriptions
- **Styling:** Tailwind CSS v4 with shadcn/ui components
- **Forms:** React Hook Form + Zod validation
- **State Management:** React Context API

## 🛠️ Development Commands

```bash
# Start development server (currently running on port 3001)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Validate environment variables
npm run validate-env

# Create test users (after env setup)
npm run create-user
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICK_START.md](./QUICK_START.md) | 5-minute setup guide to get testing |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | Complete status report with metrics |
| [MVP_IMPLEMENTATION_PLAN.md](./MVP_IMPLEMENTATION_PLAN.md) | Detailed feature breakdown |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment guide |
| [CLAUDE.md](./CLAUDE.md) | Development patterns and architecture |

## 🏗️ Project Structure

```
shopmatch-pro/
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── (auth)/            # Authentication pages
│   │   ├── dashboard/         # Owner and seeker dashboards
│   │   ├── jobs/              # Job listing, detail, create, edit
│   │   ├── subscribe/         # Stripe subscription page
│   │   └── api/               # Backend API routes
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── job-card.tsx      # Job display card
│   │   ├── job-form.tsx      # Job creation/edit form
│   │   └── application-card.tsx
│   ├── lib/                   # Shared utilities
│   │   ├── firebase/         # Firebase client and admin
│   │   ├── stripe/           # Stripe configuration
│   │   └── contexts/         # React contexts
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
├── scripts/                   # Utility scripts
│   ├── validate-env.js       # Environment validation
│   └── create-user.js        # Test user creation
├── firestore.rules           # Firestore security rules
├── .env.local                # Environment variables (YOU NEED TO FILL THIS)
└── package.json              # Dependencies and scripts
```

## ⚙️ Environment Setup

**Required Environment Variables:**

See [.env.local.template](./.env.local.template) for complete list.

**Quick Setup:**

1. Copy `.env.local.template` to `.env.local` (already done)
2. Fill in Firebase credentials from Firebase Console
3. Fill in Stripe credentials from Stripe Dashboard
4. Run `npm run validate-env` to verify
5. Restart dev server if needed

**Detailed instructions:** [QUICK_START.md](./QUICK_START.md#1-configure-firebase-2-minutes)

## 🧪 Testing

### Manual Testing Checklist

- [ ] Configure environment variables
- [ ] Sign up as Owner account
- [ ] Subscribe to Pro plan (Stripe test mode)
- [ ] Create a job posting
- [ ] Sign up as Seeker account (incognito window)
- [ ] Browse jobs and view details
- [ ] Submit application
- [ ] Review application as Owner
- [ ] Update application status

**Detailed test flows:** [PROJECT_STATUS.md](./PROJECT_STATUS.md#-testing-checklist)

### Testing Stripe Webhooks Locally

To test the complete subscription flow with real Stripe webhook events:

**Prerequisites:**
- [Stripe CLI](https://stripe.com/docs/stripe-cli) installed
- `.env.local` configured with Stripe keys
- Dev server running on `localhost:3000`

**Steps:**

1. **Start Stripe webhook forwarding** (in a new terminal):
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copy the webhook signing secret (`whsec_...`) and update `STRIPE_WEBHOOK_SECRET` in `.env.local`

2. **Trigger a test checkout session completed event**:
   ```bash
   stripe trigger checkout.session.completed
   ```

3. **Watch the logs** to see:
   - Stripe CLI forwarding the webhook
   - Your app at `/api/stripe/webhook` processing the event
   - Firebase custom claims being updated
   - Console logs showing subscription activation

**What happens:**
- Stripe sends a webhook event to your local endpoint
- The webhook handler verifies the signature
- User subscription status is updated in Firebase (custom claims + Firestore)
- User gains access to Pro features instantly

**For production:** Configure webhook endpoints in [Stripe Dashboard](https://dashboard.stripe.com/webhooks) pointing to your deployed URL.

## 🔒 Security Features

- ✅ Firebase security rules for Firestore
- ✅ Role-based access control (owner/seeker)
- ✅ Stripe webhook signature verification
- ✅ Server-side authentication with Firebase Admin
- ✅ Custom claims for subscription access
- ✅ Input validation with Zod schemas
- ✅ Protected API routes with token verification

## 📊 Build Information

```
✓ Compiled successfully
✓ All TypeScript checks passing
✓ Zero ESLint errors
✓ 19 routes (8 pages, 11 API endpoints)
✓ Bundle size: 245 kB shared chunks
✓ Build time: ~3 seconds with Turbopack
```

## 🚀 Deployment

Ready to deploy to production? See [DEPLOYMENT.md](./DEPLOYMENT.md) for:

- Vercel deployment instructions
- Environment variable configuration
- Stripe webhook setup for production
- Firestore security rules deployment
- Post-deployment verification

## 🐛 Troubleshooting

### Common Issues

**Dev server won't start:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
npm run dev
```

**Firebase errors:**
- Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set
- Check `FIREBASE_PRIVATE_KEY` format (should include `\n`)
- Restart dev server after .env.local changes

**Stripe errors:**
- Verify `STRIPE_SECRET_KEY` starts with `sk_test_`
- Check `STRIPE_PRICE_ID_PRO` is correct
- Use test card `4242 4242 4242 4242` for testing

**More troubleshooting:** [QUICK_START.md](./QUICK_START.md#-troubleshooting)

## 📝 Next Steps

1. ✅ ~~Build production-ready MVP~~ (COMPLETE)
2. ⏳ Configure Firebase and Stripe credentials
3. ⏳ Test all user flows end-to-end
4. ⏳ Deploy to production (Vercel recommended)
5. ⏳ Set up monitoring and analytics

## 🤝 Contributing

This is a private MVP project. For questions or issues, refer to the documentation files listed above.

## 📄 License

Private project - all rights reserved.

---

**Built with ❤️ using Next.js 15, Firebase, and Stripe**

**Status:** Development server running → Ready for testing
**Last Updated:** 2025-10-10
