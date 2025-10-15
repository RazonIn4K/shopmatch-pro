"use client"

import * as React from 'react'
import { toast } from 'sonner'

import { useAuth } from '@/lib/contexts/AuthContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { Application, ApplicationStatus } from '@/types'

export type ApplicationDetailMode = 'owner' | 'seeker'

export interface ApplicationDetailDialogProps {
  application: Application | null
  mode: ApplicationDetailMode
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusUpdated?: (application: Application) => void
}

function formatDate(value: Application['createdAt']) {
  if (!value) return 'Unknown date'
  if (value instanceof Date) return value.toLocaleString()
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toLocaleString()
  }
  return new Date(value as string).toLocaleString()
}

function statusVariant(status: ApplicationStatus) {
  switch (status) {
    case 'pending':
      return 'bg-amber-500/10 text-amber-600'
    case 'reviewed':
      return 'bg-blue-500/10 text-blue-600'
    case 'accepted':
      return 'bg-emerald-500/10 text-emerald-600'
    case 'rejected':
      return 'bg-rose-500/10 text-rose-600'
    default:
      return 'bg-muted text-foreground'
  }
}

export function ApplicationDetailDialog({
  application,
  mode,
  open,
  onOpenChange,
  onStatusUpdated,
}: ApplicationDetailDialogProps) {
  const { user } = useAuth()
  const [notes, setNotes] = React.useState('')
  const [updating, setUpdating] = React.useState(false)

  // Reset notes when application changes
  React.useEffect(() => {
    setNotes(application?.notes ?? '')
  }, [application])

  const handleStatusUpdate = async (status: ApplicationStatus) => {
    if (!application) return

    setUpdating(true)
    try {
      // Get ID token from AuthContext user
      if (!user) {
        toast.error('Authentication required')
        return
      }

      const token = await user.getIdToken()

      const response = await fetch(`/api/applications/${application.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, notes }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update application')
      }

      const data = await response.json()
      toast.success('Application status updated successfully')

      // Notify parent component
      if (onStatusUpdated && data.application) {
        onStatusUpdated(data.application)
      }

      // Close dialog after successful update
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update application')
    } finally {
      setUpdating(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!application) return

    // Save notes with current status (no status change)
    setUpdating(true)
    try {
      if (!user) {
        toast.error('Authentication required')
        return
      }

      const token = await user.getIdToken()

      const response = await fetch(`/api/applications/${application.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: application.status, notes }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save notes')
      }

      const data = await response.json()
      toast.success('Notes saved successfully')

      // Notify parent component
      if (onStatusUpdated && data.application) {
        onStatusUpdated(data.application)
      }

      // Close dialog after successful save
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save notes')
    } finally {
      setUpdating(false)
    }
  }

  if (!application) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl">
                {mode === 'owner' ? application.seekerName : application.jobTitle}
              </DialogTitle>
              <DialogDescription>
                {mode === 'owner'
                  ? `Application for ${application.jobTitle}`
                  : `${application.company} • ${application.jobType ?? ''}`}
              </DialogDescription>
            </div>
            <Badge className={cn('capitalize', statusVariant(application.status))}>
              {application.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Applicant Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {mode === 'owner' ? 'Applicant Information' : 'Contact Information'}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs text-muted-foreground">
                  {mode === 'owner' ? 'Name' : 'Your Name'}
                </Label>
                <p className="text-sm font-medium">{application.seekerName}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="text-sm font-medium">{application.seekerEmail}</p>
              </div>
              {application.phone && (
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p className="text-sm font-medium">{application.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Job Information (Seeker view) */}
          {mode === 'seeker' && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Job Details
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Position</Label>
                  <p className="text-sm font-medium">{application.jobTitle}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Company</Label>
                  <p className="text-sm font-medium">{application.company}</p>
                </div>
                {application.jobType && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Type</Label>
                    <p className="text-sm font-medium capitalize">{application.jobType}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Timeline
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs text-muted-foreground">Submitted</Label>
                <p className="text-sm">{formatDate(application.createdAt)}</p>
              </div>
              {application.reviewedAt && (
                <div>
                  <Label className="text-xs text-muted-foreground">Reviewed</Label>
                  <p className="text-sm">{formatDate(application.reviewedAt)}</p>
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground">Last Updated</Label>
                <p className="text-sm">{formatDate(application.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          {application.coverLetter && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Cover Letter
              </h3>
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {application.coverLetter}
                </p>
              </div>
            </div>
          )}

          {/* Resume */}
          {application.resumeUrl && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Resume
              </h3>
              <a
                href={application.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                Download Resume
              </a>
            </div>
          )}

          {/* Owner Notes */}
          {mode === 'owner' && (
            <div className="space-y-3">
              <Label htmlFor="notes" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Internal Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this application (visible only to you)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                maxLength={2000}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {notes.length}/2000 characters
              </p>
            </div>
          )}

          {/* Display existing notes for seeker */}
          {mode === 'seeker' && application.notes && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Employer Feedback
              </h3>
              <div className="rounded-lg bg-emerald-500/10 p-4">
                <p className="text-sm text-emerald-700">{application.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Owner Actions */}
        {mode === 'owner' && (
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={handleSaveNotes}
                disabled={updating}
              >
                Save Notes
              </Button>
              {application.status !== 'reviewed' && (
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate('reviewed')}
                  disabled={updating}
                >
                  Mark as Reviewed
                </Button>
              )}
              {application.status !== 'accepted' && (
                <Button
                  variant="default"
                  onClick={() => handleStatusUpdate('accepted')}
                  disabled={updating}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Accept
                </Button>
              )}
              {application.status !== 'rejected' && (
                <Button
                  variant="destructive"
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={updating}
                >
                  Reject
                </Button>
              )}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
