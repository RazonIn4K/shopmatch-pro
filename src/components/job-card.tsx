"use client"

import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Job, JobStatus, JobType } from '@/types'

type JobCardVariant = 'default' | 'compact'

export interface JobCardProps {
  job: Job
  variant?: JobCardVariant
  showActions?: boolean
  onView?: (jobId: string) => void
  onEdit?: (jobId: string) => void
  onDelete?: (jobId: string) => void
}

function formatSalary(job: Job) {
  if (!job.salary) return 'Compensation: negotiable'
  const { min, max, currency, period } = job.salary
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency ?? 'USD',
    maximumFractionDigits: 0,
  })

  if (min && max) {
    return `${formatter.format(min)} – ${formatter.format(max)} ${period ?? 'yearly'}`
  }
  if (min) {
    return `From ${formatter.format(min)} ${period ?? 'yearly'}`
  }
  if (max) {
    return `Up to ${formatter.format(max)} ${period ?? 'yearly'}`
  }
  return 'Compensation: negotiable'
}

function formatDate(value: Job['createdAt']) {
  if (!value) return 'Just now'
  if (value instanceof Date) {
    return value.toLocaleDateString()
  }
  // Firestore Timestamp compatibility.
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toLocaleDateString()
  }
  return new Date(value as string).toLocaleDateString()
}

function statusLabel(status: JobStatus) {
  switch (status) {
    case 'draft':
      return 'Draft'
    case 'published':
      return 'Published'
    case 'closed':
      return 'Closed'
    default:
      return status
  }
}

function typeLabel(type: JobType) {
  switch (type) {
    case 'full-time':
      return 'Full-time'
    case 'part-time':
      return 'Part-time'
    case 'contract':
      return 'Contract'
    case 'freelance':
      return 'Freelance'
    default:
      return type
  }
}

export function JobCard({
  job,
  variant = 'default',
  showActions = false,
  onView,
  onEdit,
  onDelete,
}: JobCardProps) {
  const handleView = React.useCallback(() => onView?.(job.id ?? ''), [job.id, onView])
  const handleEdit = React.useCallback(() => onEdit?.(job.id ?? ''), [job.id, onEdit])
  const handleDelete = React.useCallback(() => onDelete?.(job.id ?? ''), [job.id, onDelete])

  return (
    <Card
      className={cn(
        'transition-shadow hover:shadow-lg',
        variant === 'compact' ? 'border-muted/70' : 'border-border',
      )}
    >
      <CardHeader className={cn(variant === 'compact' ? 'pb-4' : 'pb-6')}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold leading-tight">{job.title}</CardTitle>
            <CardDescription className="text-sm font-medium text-foreground">
              {job.company}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <Badge variant="secondary">{typeLabel(job.type)}</Badge>
            <Badge
              className={cn({
                'bg-emerald-500/10 text-emerald-600': job.status === 'published',
                'bg-amber-500/10 text-amber-600': job.status === 'draft',
                'bg-rose-500/10 text-rose-600': job.status === 'closed',
              })}
            >
              {statusLabel(job.status)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn('space-y-4', variant === 'compact' && 'py-0')}>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-foreground">{job.location}</span>
            {job.remote && <Badge variant="outline">Remote</Badge>}
          </span>
          <span className="inline-flex items-center gap-1">{formatSalary(job)}</span>
          <span className="inline-flex items-center gap-1">
            Updated {formatDate(job.updatedAt ?? job.createdAt)}
          </span>
        </div>
        {variant === 'default' && (
          <p className="line-clamp-3 text-sm text-muted-foreground">{job.description}</p>
        )}
        {variant === 'default' && job.skills?.length ? (
          <div className="flex flex-wrap gap-2">
            {job.skills.slice(0, 6).map((skill) => (
              <Badge key={skill} variant="outline" className="capitalize">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 6 && (
              <span className="text-xs text-muted-foreground">
                +{job.skills.length - 6} more
              </span>
            )}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className={cn('flex items-center justify-between', variant === 'compact' && 'pt-3')}>
        <Button variant="link" onClick={handleView} className="px-0">
          View details
        </Button>
        {showActions && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              Edit
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
