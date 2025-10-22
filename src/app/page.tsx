import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Demo Notice Banner */}
      <div className="bg-yellow-50 border-b-2 border-yellow-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-200 text-yellow-800">
            DEMO PROJECT
          </span>
          <p className="text-sm text-gray-700">
            This is a <strong>portfolio demonstration</strong> in test mode. No real transactions occur.{" "}
            <a 
              href="https://github.com/RazonIn4K/shopmatch-pro" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-blue-600"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            ShopMatch Pro
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            A production-grade SaaS job board platform demonstrating full-stack development capabilities
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 mb-8">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Portfolio Project - Test Mode Only
          </div>
        </div>

        {/* Key Features */}
        <h2 className="text-3xl font-bold text-center text-gray-900 mt-16 mb-8">
          Key Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-blue-600 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Full-Stack SaaS</h3>
            <p className="text-gray-600">
              Complete authentication, database, payment processing, and real-time features
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-green-600 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Production-Ready</h3>
            <p className="text-gray-600">
              Security rules, type safety, error handling, and professional code quality
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-purple-600 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Modern Stack</h3>
            <p className="text-gray-600">
              Next.js 15, TypeScript, Firebase, Stripe, Tailwind CSS, and more
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Browse Demo Jobs
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Try Demo Login
          </Link>
          <a
            href="https://github.com/RazonIn4K/shopmatch-pro"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-900 text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            View Source Code
          </a>
        </div>

        {/* Test Credentials */}
        <div className="mt-16 bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Test Credentials
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-4 rounded border border-gray-200">
              <p className="font-semibold text-gray-700 mb-2">Employer Account</p>
              <p className="text-gray-600 font-mono text-xs">owner@test.com</p>
              <p className="text-gray-600 font-mono text-xs">testtest123</p>
            </div>
            <div className="bg-white p-4 rounded border border-gray-200">
              <p className="font-semibold text-gray-700 mb-2">Job Seeker Account</p>
              <p className="text-gray-600 font-mono text-xs">seeker@test.com</p>
              <p className="text-gray-600 font-mono text-xs">testtest123</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            💳 Test Stripe: 4242 4242 4242 4242 | Any future date | Any CVC
          </p>
        </div>

        {/* Tech Stack */}
        <div className="mt-16 text-center">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">
            Built With
          </h2>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <span className="px-4 py-2 bg-white border border-gray-200 rounded-full">Next.js 15</span>
            <span className="px-4 py-2 bg-white border border-gray-200 rounded-full">TypeScript</span>
            <span className="px-4 py-2 bg-white border border-gray-200 rounded-full">Firebase</span>
            <span className="px-4 py-2 bg-white border border-gray-200 rounded-full">Stripe</span>
            <span className="px-4 py-2 bg-white border border-gray-200 rounded-full">Tailwind CSS</span>
            <span className="px-4 py-2 bg-white border border-gray-200 rounded-full">Vercel</span>
          </div>
        </div>
      </div>
    </main>
  );
}
