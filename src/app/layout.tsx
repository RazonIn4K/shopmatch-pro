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
  title: 'ShopMatch Pro - Find Your Perfect Job Match',
  description: 'Connect employers with talented job seekers. Post jobs, apply to positions, and find your perfect career match with ShopMatch Pro.',
  keywords: ['jobs', 'employment', 'career', 'hiring', 'job board', 'recruitment'],
  authors: [{ name: 'ShopMatch Pro Team' }],
  creator: 'ShopMatch Pro',
  publisher: 'ShopMatch Pro',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ShopMatch Pro - Find Your Perfect Job Match',
    description: 'Connect employers with talented job seekers. Post jobs, apply to positions, and find your perfect career match.',
    url: '/',
    siteName: 'ShopMatch Pro',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopMatch Pro - Find Your Perfect Job Match',
    description: 'Connect employers with talented job seekers. Post jobs, apply to positions, and find your perfect career match.',
    creator: '@shopmatchpro',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
 * - Semantic HTML structure with <main> landmark for accessibility
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
          <main>
            {children}
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
