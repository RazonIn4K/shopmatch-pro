'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { JobCard } from '@/components/job-card'
import { Button } from '@/components/ui/button'
import type { Job } from '@/types'

export default function JobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch('/api/jobs')
        if (!response.ok) {
          throw new Error('Failed to fetch jobs')
        }
        const data = await response.json()
        setJobs(data.jobs || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const handleViewJob = (jobId: string) => {
    router.push(`/jobs/${jobId}`)
  }

  if (loading) {
    return (
      <main className="container mx-auto py-12">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container mx-auto py-12">
        <h1 className="sr-only">Browse Jobs - ShopMatch Pro</h1>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <h2 className="text-lg font-semibold text-destructive">Error loading jobs</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            Retry
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse Jobs</h1>
          <p className="text-muted-foreground">
            Explore {jobs.length} {jobs.length === 1 ? 'opportunity' : 'opportunities'}
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
            <JobCard key={job.id} job={job} onView={handleViewJob} />
          ))}
        </div>
      )}
    </main>
  )
}
