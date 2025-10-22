'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { useAuth } from '@/lib/contexts/AuthContext'
import { auth } from '@/lib/firebase/client'
import { ApplicationCard } from '@/components/application-card'
import { ApplicationDetailDialog } from '@/components/application-detail-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Application } from '@/types'

export default function SeekerDashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (!authLoading && user?.role !== 'seeker') {
      toast.error('Access denied: Seeker account required')
      router.push('/dashboard/owner')
      return
    }

    if (user && user.role === 'seeker') {
      fetchApplications()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router])

  const fetchApplications = async () => {
    if (!user) return

    try {
      // Get ID token from Firebase auth current user
      const currentUser = auth.currentUser
      if (!currentUser) {
        toast.error('Authentication required')
        return
      }

      const token = await currentUser.getIdToken()
      const response = await fetch(`/api/applications?seekerId=${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      setApplications(data.applications || [])
    } catch {
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  if (loading || authLoading) {
    return (
      <main className="container mx-auto flex-1 py-12">
        <div className="space-y-6">
          <div className="h-12 w-48 animate-pulse rounded-md bg-muted" />
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  const totalApplications = applications.length
  const pendingApplications = applications.filter((a) => a.status === 'pending').length
  const acceptedApplications = applications.filter((a) => a.status === 'accepted').length

  return (
    <main className="container mx-auto flex-1 py-12">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Seeker Dashboard</h1>
            <p className="text-muted-foreground">Track your job applications</p>
          </div>
          <Button onClick={() => router.push('/jobs')}>Browse Jobs</Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Applications</CardDescription>
              <CardTitle className="text-4xl">{totalApplications}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Submitted applications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Review</CardDescription>
              <CardTitle className="text-4xl">{pendingApplications}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Awaiting response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Accepted</CardDescription>
              <CardTitle className="text-4xl">{acceptedApplications}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Positive responses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">My Applications</h2>
          {applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="mb-4 text-muted-foreground">You haven&apos;t applied to any jobs yet</p>
                <Button onClick={() => router.push('/jobs')}>Browse Available Jobs</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  mode="seeker"
                  onViewDetails={() => {
                    setSelectedApplication(app)
                    setDialogOpen(true)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Application Detail Dialog */}
      <ApplicationDetailDialog
        application={selectedApplication}
        mode="seeker"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </main>
  )
}
