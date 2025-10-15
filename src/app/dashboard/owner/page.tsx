'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { useAuth } from '@/lib/contexts/AuthContext'
import { JobCard } from '@/components/job-card'
import { ApplicationCard } from '@/components/application-card'
import { ApplicationDetailDialog } from '@/components/application-detail-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Job, Application } from '@/types'

export default function OwnerDashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (!authLoading && user?.role !== 'owner') {
      toast.error('Access denied: Owner account required')
      router.push('/subscribe')
      return
    }

    if (user && user.role === 'owner') {
      fetchDashboardData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router])

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      // Get ID token from AuthContext user
      if (!user) {
        toast.error('Authentication required')
        return
      }

      const token = await user.getIdToken()

      // Fetch owner's jobs
      const jobsResponse = await fetch(`/api/jobs?ownerId=${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const jobsData = await jobsResponse.json()

      // Fetch applications for owner's jobs
      const appsResponse = await fetch(`/api/applications?ownerId=${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const appsData = await appsResponse.json()

      setJobs(jobsData.jobs || [])
      setApplications(appsData.applications || [])
    } catch {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return

    try {
      if (!user) {
        toast.error('Authentication required')
        return
      }

      const token = await user.getIdToken()
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error('Failed to delete job')

      toast.success('Job deleted successfully')
      setJobs(jobs.filter((j) => j.id !== jobId))
    } catch {
      toast.error('Failed to delete job')
    }
  }

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application)
    setDialogOpen(true)
  }

  const handleApplicationUpdated = (updatedApplication: Application) => {
    // Update local state with the updated application
    setApplications(
      applications.map((app) =>
        app.id === updatedApplication.id ? updatedApplication : app
      )
    )
    // Refresh dashboard data to get updated counts
    fetchDashboardData()
  }

  if (loading || authLoading) {
    return (
      <div className="container mx-auto py-12">
        <div className="space-y-6">
          <div className="h-12 w-48 animate-pulse rounded-md bg-muted" />
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const activeJobs = jobs.filter((j) => j.status === 'published').length
  const totalApplications = jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0)
  const pendingApplications = applications.filter((a) => a.status === 'pending').length

  return (
    <div className="container mx-auto py-12">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Owner Dashboard</h1>
            <p className="text-muted-foreground">Manage your job postings and applications</p>
          </div>
          <Button onClick={() => router.push('/jobs/new')}>Create New Job</Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Jobs</CardDescription>
              <CardTitle className="text-4xl">{activeJobs}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {jobs.length} total jobs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Applications</CardDescription>
              <CardTitle className="text-4xl">{totalApplications}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {pendingApplications} pending review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Response Rate</CardDescription>
              <CardTitle className="text-4xl">
                {totalApplications > 0
                  ? Math.round(
                      ((totalApplications - pendingApplications) / totalApplications) * 100
                    )
                  : 0}
                %
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Applications reviewed</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Recent Applications</h2>
          {applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No applications yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {applications.slice(0, 6).map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  mode="owner"
                  onViewDetails={() => handleViewApplication(app)}
                  onStatusChange={() => handleViewApplication(app)}
                />
              ))}
            </div>
          )}
        </div>

        {/* My Jobs */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">My Jobs</h2>
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="mb-4 text-muted-foreground">You haven&apos;t created any jobs yet</p>
                <Button onClick={() => router.push('/jobs/new')}>Create Your First Job</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  showActions
                  onView={(id) => router.push(`/jobs/${id}`)}
                  onEdit={(id) => router.push(`/jobs/${id}/edit`)}
                  onDelete={handleDeleteJob}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Application Detail Dialog */}
      <ApplicationDetailDialog
        application={selectedApplication}
        mode="owner"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onStatusUpdated={handleApplicationUpdated}
      />
    </div>
  )
}
