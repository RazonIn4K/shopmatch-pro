/**
 * Root Layout for ShopMatch Pro
 *
 * This is the main layout component that wraps all pages in the application.
 * It provides global providers, styling, and essential meta configuration.
 *
 * Features:
 * - Authentication context provider
 * - Toast notification system
 * - Global CSS and font loading
 * - Meta tags and SEO configuration
 * - Responsive viewport configuration
 */

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/contexts/AuthContext'
import { Toaster } from '@/components/ui/sonner'
import { getMetadataBase } from '@/lib/env'
import { Footer } from '@/components/footer'
import { CookieConsent } from '@/components/cookie-consent'

/**
 * Inter font configuration for consistent typography
 *
 * Inter is chosen for its excellent readability and modern appearance.
 * Subset configuration optimizes bundle size by including only necessary characters.
 */
const inter = Inter({ subsets: ['latin'] })

/**
 * Application metadata for SEO and social sharing
 *
 * Configured for ShopMatch Pro job board platform.
 * Update these values based on your specific branding and SEO requirements.
 */
export const metadata: Metadata = {
  title: 'ShopMatch Pro - Portfolio Demo Project',
  description: 'Portfolio demonstration of a production-grade SaaS job board platform. Built with Next.js 15, Firebase, Stripe, and TypeScript. This is a test/demo project - no real transactions occur.',
  keywords: ['portfolio', 'demo', 'nextjs', 'typescript', 'firebase', 'stripe', 'full-stack', 'web development'],
  authors: [{ name: 'David Ortiz' }],
  creator: 'David Ortiz',
  publisher: 'David Ortiz',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: getMetadataBase(),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ShopMatch Pro - Portfolio Demo Project',
    description: 'Portfolio demonstration of a production-grade SaaS platform. Test mode only - no real transactions.',
    url: '/',
    siteName: 'ShopMatch Pro Demo',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopMatch Pro - Portfolio Demo',
    description: 'Portfolio demonstration project showcasing full-stack SaaS development. Test mode only.',
    creator: '@shopmatchpro',
  },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  other: {
    'demo-project': 'true',
    'test-mode': 'true',
  },
}

/**
 * Root Layout Component
 *
 * Provides essential application-wide configuration and providers:
 * - HTML document structure and language
 * - Global CSS styles and font configuration
 * - Authentication context for user state management
 * - Toast notification system for user feedback
 * - Meta tags and SEO configuration
 *
 * @param children - Page components to be rendered within the layout
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <CookieConsent />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
