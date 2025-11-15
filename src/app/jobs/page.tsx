import { Metadata } from 'next'

import { JobCard } from '@/components/job-card'
import type { Job } from '@/types'

// Generate SEO-optimized metadata for the jobs page
export const metadata: Metadata = {
  title: 'Browse Jobs | ShopMatch Pro',
  description:
    'Explore thousands of job opportunities in tech, design, marketing, and more. Find your dream job with ShopMatch Pro.',
  openGraph: {
    title: 'Browse Jobs | ShopMatch Pro',
    description:
      'Explore thousands of job opportunities in tech, design, marketing, and more. Find your dream job with ShopMatch Pro.',
    type: 'website',
    url: 'https://shopmatch-pro.vercel.app/jobs',
    images: [
      {
        url: '/og-image-jobs.png',
        width: 1200,
        height: 630,
        alt: 'ShopMatch Pro - Find Your Dream Job',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Jobs | ShopMatch Pro',
    description:
      'Explore thousands of job opportunities in tech, design, marketing, and more.',
    images: ['/og-image-jobs.png'],
  },
  alternates: {
    canonical: 'https://shopmatch-pro.vercel.app/jobs',
  },
}

// Server-side data fetching
async function getPublishedJobs(): Promise<{ jobs: Job[]; total: number }> {
  try {
    // In production, use absolute URL; in development, use localhost
    const baseUrl =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const response = await fetch(`${baseUrl}/api/jobs?limit=100`, {
      cache: 'no-store', // Always fetch fresh data
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error(`Failed to fetch jobs: ${response.status} ${response.statusText}`)
      return { jobs: [], total: 0 }
    }

    const data = await response.json()
    return {
      jobs: data.jobs || [],
      total: data.pagination?.total || 0,
    }
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return { jobs: [], total: 0 }
  }
}

// Generate JSON-LD structured data for SEO
function generateJobPostingsStructuredData(jobs: Job[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: jobs.map((job, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'JobPosting',
        title: job.title,
        description: job.description,
        datePosted: job.publishedAt || job.createdAt,
        hiringOrganization: {
          '@type': 'Organization',
          name: job.company,
        },
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: job.location || 'Remote',
          },
        },
        employmentType: job.type?.toUpperCase().replace('-', '_') || 'FULL_TIME',
        ...(job.salary && {
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: job.salary.currency || 'USD',
            value: {
              '@type': 'QuantitativeValue',
              minValue: job.salary.min,
              maxValue: job.salary.max,
              unitText: 'YEAR',
            },
          },
        }),
      },
    })),
  }
}

function serializeStructuredData(data: unknown) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

export default async function JobsPage() {
  const { jobs, total } = await getPublishedJobs()

  return (
    <>
      {/* JSON-LD Structured Data for Google Jobs */}
      {jobs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeStructuredData(generateJobPostingsStructuredData(jobs)),
          }}
        />
      )}

      <main className="container mx-auto flex-1 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Browse Jobs</h1>
            <p className="text-muted-foreground">
              {total > 0
                ? `Explore ${total} ${total === 1 ? 'opportunity' : 'opportunities'}`
                : 'Explore job opportunities'}
            </p>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <h3 className="text-lg font-semibold">No jobs available</h3>
            <p className="text-sm text-muted-foreground">
              Check back later for new opportunities
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} href={`/jobs/${job.id}`} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
