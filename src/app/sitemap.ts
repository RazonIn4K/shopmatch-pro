import { MetadataRoute } from 'next'

import { adminDb } from '@/lib/firebase/admin'

/**
 * Generate sitemap for Google Search Console
 * Includes static routes and all published job listings
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shopmatch-pro.vercel.app'

  // Fetch all published jobs for dynamic URLs
  const publishedJobs = await getPublishedJobIds()

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'hourly', // Job listings update frequently
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/subscribe`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/legal/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Dynamic job routes
  const jobRoutes: MetadataRoute.Sitemap = publishedJobs.map((job) => ({
    url: `${baseUrl}/jobs/${job.id}`,
    lastModified: job.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8, // Individual jobs are high priority for SEO
  }))

  return [...staticRoutes, ...jobRoutes]
}

/**
 * Fetch all published job IDs and update timestamps from Firestore
 */
async function getPublishedJobIds(): Promise<Array<{ id: string; updatedAt: Date }>> {
  try {
    const snapshot = await adminDb
      .collection('jobs')
      .where('status', '==', 'published')
      .select('updatedAt') // Only fetch ID and updatedAt for efficiency
      .get()

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    }))
  } catch (error) {
    console.error('Error fetching jobs for sitemap:', error)
    // Return empty array on error (fail gracefully)
    return []
  }
}
