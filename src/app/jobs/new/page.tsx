'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { useAuth } from '@/lib/contexts/AuthContext'
import { auth } from '@/lib/firebase/client'
import { JobForm } from '@/components/job-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { JobFormValues } from '@/types'
import { useEffect } from 'react'

export default function NewJobPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please sign in to create a job')
      router.push('/login')
    } else if (!loading && user?.role !== 'owner') {
      toast.error('Only job owners can create jobs')
      router.push('/subscribe')
    }
  }, [user, loading, router])

  const handleSubmit = async (values: JobFormValues) => {
    if (!user) {
      toast.error('Please sign in to create a job')
      router.push('/login')
      return
    }

    try {
      // Get ID token from Firebase auth current user
      const currentUser = auth.currentUser
      if (!currentUser) {
        toast.error('Please sign in to create a job')
        router.push('/login')
        return
      }

      const token = await currentUser.getIdToken()
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403) {
          toast.error('Active subscription required to create jobs')
          router.push('/subscribe')
          return
        }
        throw new Error(data.error || 'Failed to create job')
      }

      toast.success('Job created successfully!')
      router.push(`/jobs/${data.job.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create job')
    }
  }

  if (loading || !user) {
    return (
      <div className="container mx-auto py-12">
        <div className="mx-auto max-w-4xl">
          <div className="h-96 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12">
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Create Job Posting</CardTitle>
            <CardDescription>
              Fill out the details below to create a new job listing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JobForm
              mode="create"
              onSubmit={handleSubmit}
              onCancel={() => router.push('/dashboard/owner')}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
