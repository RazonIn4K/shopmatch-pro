'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { useAuth } from '@/lib/contexts/AuthContext'
import { JobForm } from '@/components/job-form'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import type { Job, JobFormValues } from '@/types'

export default function EditJobPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchJob() {
      if (!user) return

      try {
        const token = await user.getIdToken()
        const response = await fetch(`/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch job')
        }

        const data = await response.json()

        // Verify user is the owner
        if (data.job.ownerId !== user.uid) {
          toast.error('You do not have permission to edit this job')
          router.push('/dashboard/owner')
          return
        }

        setJob(data.job)
      } catch {
        toast.error('Failed to load job')
        router.push('/dashboard/owner')
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      fetchJob()
    } else if (!authLoading && !user) {
      toast.error('Please sign in to edit jobs')
      router.push('/login')
    }
  }, [jobId, user, authLoading, router])

  const handleSubmit = async (values: JobFormValues) => {
    if (!user) return

    try {
      const token = await user.getIdToken()
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update job')
      }

      toast.success('Job updated successfully!')
      router.push(`/jobs/${jobId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update job')
    }
  }

  if (loading || authLoading || !job) {
    return (
      <main className="container mx-auto flex-1 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="h-96 animate-pulse rounded-lg bg-muted" />
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto flex-1 py-12">
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-semibold leading-none tracking-tight">Edit Job Posting</h1>
            <CardDescription>
              Update the job details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JobForm
              mode="edit"
              initialValues={{
                title: job.title,
                company: job.company,
                description: job.description,
                type: job.type,
                location: job.location,
                remote: job.remote,
                salary: job.salary,
                requirements: job.requirements || [],
                skills: job.skills || [],
                experience: job.experience,
                status: job.status,
              }}
              onSubmit={handleSubmit}
              onCancel={() => router.push(`/jobs/${jobId}`)}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
