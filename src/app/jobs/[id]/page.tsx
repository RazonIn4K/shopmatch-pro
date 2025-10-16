'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { useAuth } from '@/lib/contexts/AuthContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { Job } from '@/types'

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    async function fetchJob() {
      try {
        const headers: HeadersInit = {}
        if (user) {
          const token = await user.getIdToken()
          headers.Authorization = `Bearer ${token}`
        }

        const response = await fetch(`/api/jobs/${jobId}`, { headers })
        if (!response.ok) {
          throw new Error('Failed to fetch job')
        }
        const data = await response.json()
        setJob(data.job)
      } catch {
        toast.error('Failed to load job details')
        router.push('/jobs')
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [jobId, user, router])

  const handleApply = async () => {
    if (!user) {
      toast.error('Please sign in to apply')
      router.push('/login')
      return
    }

    if (user.role !== 'seeker') {
      toast.error('Only job seekers can apply to jobs')
      return
    }

    setApplying(true)
    try {
      const token = await user.getIdToken()
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ coverLetter, phone }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }

      toast.success('Application submitted successfully!')
      setShowApplyForm(false)
      setCoverLetter('')
      setPhone('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <main className="container mx-auto py-12">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="h-12 w-2/3 animate-pulse rounded-md bg-muted" />
          <div className="h-96 animate-pulse rounded-lg bg-muted" />
        </div>
      </main>
    )
  }

  if (!job) {
    return (
      <main className="container mx-auto py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Job not found</h2>
          <Button onClick={() => router.push('/jobs')} className="mt-4">
            Browse Jobs
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <Button variant="ghost" onClick={() => router.push('/jobs')}>
          ← Back to jobs
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold leading-none tracking-tight">{job.title}</h1>
                <CardDescription className="text-lg">{job.company}</CardDescription>
              </div>
              <div className="flex flex-col gap-2">
                <Badge variant="secondary" className="capitalize">
                  {job.type.replace('-', ' ')}
                </Badge>
                {job.remote && <Badge variant="outline">Remote</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>📍 {job.location}</span>
              {job.salary && (
                <span>
                  💰 {job.salary.min && `$${job.salary.min.toLocaleString()}`}
                  {job.salary.min && job.salary.max && ' - '}
                  {job.salary.max && `$${job.salary.max.toLocaleString()}`}
                  {job.salary.period && ` / ${job.salary.period}`}
                </span>
              )}
              {job.experience && <span>📊 {job.experience} level</span>}
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">Description</h3>
              <p className="whitespace-pre-wrap text-muted-foreground">{job.description}</p>
            </div>

            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h3 className="mb-2 text-lg font-semibold">Requirements</h3>
                <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                  {job.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.skills && job.skills.length > 0 && (
              <div>
                <h3 className="mb-2 text-lg font-semibold">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {user?.role === 'seeker' && job.status === 'published' && (
              <div className="border-t pt-6">
                {!showApplyForm ? (
                  <Button onClick={() => setShowApplyForm(true)} size="lg" className="w-full">
                    Apply Now
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Submit Your Application</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                        <Textarea
                          id="coverLetter"
                          placeholder="Tell us why you're a great fit for this position..."
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          rows={6}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number (Optional)</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleApply} disabled={applying} className="flex-1">
                          {applying ? 'Submitting...' : 'Submit Application'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowApplyForm(false)}
                          disabled={applying}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!user && (
              <div className="border-t pt-6">
                <Button onClick={() => router.push('/login')} size="lg" className="w-full">
                  Sign in to Apply
                </Button>
              </div>
            )}

            {user?.role === 'owner' && (
              <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                You are viewing this job as an owner. Only job seekers can apply.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
