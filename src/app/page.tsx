import {
  ArrowRight,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  CreditCard,
  DatabaseZap,
  Github,
  LockKeyhole,
  Search,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import Link from "next/link";

const proofCards = [
  {
    icon: BriefcaseBusiness,
    title: "Job marketplace core",
    body: "Employers can post roles, seekers can browse listings, and applications move through a structured dashboard.",
  },
  {
    icon: CreditCard,
    title: "Stripe subscription path",
    body: "Checkout, customer portal, webhook handling, and entitlement checks are wired as a realistic SaaS billing flow.",
  },
  {
    icon: ShieldCheck,
    title: "Production guardrails",
    body: "Firebase Admin access, Firestore rules, typed validation, Sentry monitoring, and CI checks are part of the build.",
  },
];

const stackItems = [
  "Next.js 15.5",
  "React 19",
  "TypeScript",
  "Firebase",
  "Stripe",
  "Sentry",
  "Tailwind CSS",
  "Vercel",
];

const workflow = [
  "Owner signs up and activates a subscription",
  "Owner posts a role with validated fields",
  "Seeker browses and submits an application",
  "Dashboard tracks activity, metrics, and exports",
];

const demoAccounts = [
  { role: "Employer", email: "owner@test.com", password: "testtest123" },
  { role: "Job Seeker", email: "seeker@test.com", password: "testtest123" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4f6f3] text-[#171a16]">
      <section className="border-b border-[#d9ded4] bg-[#111812] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 items-center rounded-md bg-[#e7a83b] px-3 text-sm font-bold text-[#111812]">
              DEMO
            </span>
            <p className="text-sm text-white/72">
              Portfolio build in test mode. No real transactions are processed.
            </p>
          </div>
          <a
            href="https://github.com/RazonIn4K/shopmatch-pro"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/82 hover:text-white"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            Source on GitHub
          </a>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
        <div>
          <p className="text-sm font-bold uppercase text-[#0f766e]">ShopMatch Pro</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black leading-none text-[#171a16] md:text-6xl">
            A working SaaS job board, built like a real product.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5d6659]">
            This demo shows the full operational loop: auth, paid access, job posting,
            application intake, dashboards, analytics, and production monitoring.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/jobs"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#0f766e] px-5 text-base font-bold text-white transition hover:bg-[#115e59]"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
              Browse demo jobs
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[#bfc8bb] bg-white px-5 text-base font-bold text-[#171a16] transition hover:border-[#171a16]"
            >
              <UserRoundCheck className="h-5 w-5" aria-hidden="true" />
              Try demo login
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-[#d9ded4] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e3e7df] pb-4">
            <div>
              <p className="text-sm font-bold text-[#0f766e]">System snapshot</p>
              <h2 className="mt-1 text-2xl font-black">Demo coverage</h2>
            </div>
            <DatabaseZap className="h-8 w-8 text-[#d18421]" aria-hidden="true" />
          </div>

          <div className="mt-5 grid gap-3">
            {workflow.map((item, index) => (
              <div
                className="flex items-start gap-3 rounded-md border border-[#e3e7df] bg-[#fafaf8] p-4"
                key={item}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#111812] text-sm font-bold text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-[#4f584c]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        {proofCards.map((card) => {
          const Icon = card.icon;
          return (
            <article className="rounded-lg border border-[#d9ded4] bg-white p-6 shadow-sm" key={card.title}>
              <Icon className="h-7 w-7 text-[#0f766e]" aria-hidden="true" />
              <h2 className="mt-5 text-xl font-black">{card.title}</h2>
              <p className="mt-3 leading-7 text-[#5d6659]">{card.body}</p>
            </article>
          );
        })}
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div className="rounded-lg border border-[#d9ded4] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <LockKeyhole className="h-6 w-6 text-[#0f766e]" aria-hidden="true" />
            <h2 className="text-2xl font-black">Sandbox access</h2>
          </div>
          <p className="mt-3 leading-7 text-[#5d6659]">
            Use the seeded accounts to inspect both sides of the marketplace. Stripe is configured
            for test mode only.
          </p>

          <div className="mt-5 grid gap-3">
            {demoAccounts.map((account) => (
              <div className="rounded-md border border-[#e3e7df] bg-[#fafaf8] p-4" key={account.role}>
                <p className="font-bold">{account.role}</p>
                <p className="mt-2 font-mono text-sm text-[#4f584c]">{account.email}</p>
                <p className="font-mono text-sm text-[#4f584c]">{account.password}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 rounded-md bg-[#f5ead8] p-3 text-sm font-semibold text-[#6f4612]">
            Stripe test card: 4242 4242 4242 4242, any future date, any CVC.
          </p>
        </div>

        <div className="rounded-lg border border-[#d9ded4] bg-[#111812] p-6 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <ChartNoAxesCombined className="h-6 w-6 text-[#e7a83b]" aria-hidden="true" />
            <h2 className="text-2xl font-black">Technical stack</h2>
          </div>
          <p className="mt-3 max-w-2xl leading-7 text-white/68">
            The stack is intentionally close to a real client SaaS build, so the portfolio proof is
            stronger than a static mockup.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {stackItems.map((item) => (
              <span
                className="rounded-md border border-white/14 bg-white/8 px-4 py-2 text-sm font-semibold text-white/82"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="/dashboard/analytics"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#e7a83b] px-5 font-bold text-[#111812] transition hover:bg-[#f0bb58]"
            >
              View analytics dashboard
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
