"use client"

import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Application, ApplicationStatus } from '@/types'

export type ApplicationCardMode = 'owner' | 'seeker'

export interface ApplicationCardProps {
  application: Application
  mode: ApplicationCardMode
  onStatusChange?: (status: ApplicationStatus) => void
  onViewDetails?: () => void
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

export function ApplicationCard({ application, mode, onStatusChange, onViewDetails }: ApplicationCardProps) {
  return (
    <Card className="h-full transition-shadow hover:shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-lg leading-tight">
            {mode === 'owner' ? application.seekerName : application.jobTitle}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {mode === 'owner'
              ? application.seekerEmail
              : `${application.company} • ${application.jobType ?? ''}`}
          </p>
        </div>
        <Badge className={cn('capitalize', statusVariant(application.status))}>
          {application.status}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">Submitted:</span>
            <span>{formatDate(application.createdAt)}</span>
          </div>
          {application.phone && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">Phone:</span>
              <span>{application.phone}</span>
            </div>
          )}
        </div>

        {application.coverLetter && (
          <div className="rounded-md border border-dashed border-muted bg-muted/50 p-4">
            <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {application.coverLetter}
            </p>
          </div>
        )}

        {mode === 'owner' && application.notes && (
          <div className="rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-700">
            <span className="font-medium text-emerald-800">Notes:</span> {application.notes}
          </div>
        )}

        {application.resumeUrl && (
          <a
            href={application.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View resume
          </a>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="link" className="px-0" onClick={onViewDetails}>
          View full details
        </Button>

        {mode === 'owner' && onStatusChange && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onStatusChange('reviewed')}>
              Mark reviewed
            </Button>
            <Button variant="outline" size="sm" onClick={() => onStatusChange('accepted')}>
              Accept
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => onStatusChange('rejected')}
            >
              Reject
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
