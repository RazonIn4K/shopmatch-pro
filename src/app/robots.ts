import { MetadataRoute } from 'next'

/**
 * Generate robots.txt for search engine crawlers
 * Allows all crawlers and points to sitemap
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shopmatch-pro.vercel.app'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/', // Private: user dashboards
        '/api/', // Private: API routes
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
