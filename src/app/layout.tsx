/**
 * Root Layout for ShopMatch Pro
 *
 * This is the main layout component that wraps all pages in the application.
 * It provides global providers, styling, and essential meta configuration.
 *
 * Features:
 * - Toast notification system
 * - Global CSS and typography
 * - Meta tags and SEO configuration
 * - Responsive viewport configuration
 */

import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { getMetadataBase } from '@/lib/env'
import { Footer } from '@/components/footer'
import { CookieConsent } from '@/components/cookie-consent'

/**
 * Application metadata for SEO and social sharing
 *
 * Configured for ShopMatch Pro job board platform.
 * Update these values based on your specific branding and SEO requirements.
 */
export const metadata: Metadata = {
  title: 'ShopMatch Pro - Portfolio Demo Project',
  description: 'Portfolio demonstration of a production-grade SaaS job board platform. Built with Next.js 16, Firebase, Stripe, and TypeScript. This is a test/demo project - no real transactions occur.',
  keywords: ['portfolio', 'demo', 'nextjs', 'typescript', 'firebase', 'stripe', 'full-stack', 'web development'],
  authors: [{ name: 'David Ortiz' }],
  creator: 'David Ortiz',
  publisher: 'David Ortiz',
  manifest: '/manifest.webmanifest',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: getMetadataBase(),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'ShopMatch Pro - Portfolio Demo Project',
    description: 'Portfolio demonstration of a production-grade SaaS platform. Test mode only - no real transactions.',
    url: '/',
    siteName: 'ShopMatch Pro Demo',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'ShopMatch Pro portfolio SaaS demo preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopMatch Pro - Portfolio Demo',
    description: 'Portfolio demonstration project showcasing full-stack SaaS development. Test mode only.',
    creator: '@shopmatchpro',
    images: ['/twitter-image.png'],
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

export const viewport: Viewport = {
  themeColor: '#0f766e',
  colorScheme: 'light',
}

/**
 * Root Layout Component
 *
 * Provides essential application-wide configuration and providers:
 * - HTML document structure and language
 * - Global CSS styles and typography
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
      <body>
        <div className="flex flex-col min-h-screen">
          {children}
          <Footer />
        </div>
        <CookieConsent />
        <Toaster />
      </body>
    </html>
  )
}
