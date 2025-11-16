"use client"

import { useCallback, useEffect, type KeyboardEvent, type ReactElement } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { trackEvent } from '@/lib/telemetry/client'
import { cn } from '@/lib/utils'

import type {
  AnalyticsDataset,
  BarDatum,
  SummaryMetric,
  FunnelStage,
  Insight,
} from './demo-metrics'

interface AnalyticsDashboardProps {
  dataset: AnalyticsDataset
}

interface InteractiveSummaryProps extends SummaryMetric {
  onInteract?: (metric: SummaryMetric) => void
}

function SummaryCard({ label, value, trend, trendVariant = 'neutral', onInteract }: InteractiveSummaryProps): ReactElement {
  const trendColorMap: Record<NonNullable<SummaryMetric['trendVariant']>, string> = {
    positive: 'text-emerald-600',
    negative: 'text-red-500',
    neutral: 'text-muted-foreground',
  }

  const trendColor = trendColorMap[trendVariant]

  const handleActivate = (): void => {
    if (onInteract) {
      onInteract({ label, value, trend, trendVariant })
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleActivate()
    }
  }

  return (
    <Card data-testid="kpi"
      role="button"
      tabIndex={0}
      aria-label={`View ${label} metric details`}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      className={cn(
        'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'
      )}
    >
      <CardHeader className="pb-3">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-4xl">{value}</CardTitle>
      </CardHeader>
      {trend && (
        <CardContent>
          <p className={cn('text-sm font-medium', trendColor)}>{trend}</p>
        </CardContent>
      )}
    </Card>
  )
}

function BarList({ title, description, data }: { title: string; description: string; data: BarDatum[] }): ReactElement {
  const maxValue = data.reduce((max, item) => Math.max(max, item.value), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0
          const ariaLabel = `${item.label}: ${item.value}${maxValue > 0 ? ` (${percentage.toFixed(0)}% of maximum)` : ''}`

          return (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
              <div className="h-2 rounded-full bg-muted" role="img" aria-label={ariaLabel}>
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${percentage}%` }}
                  aria-hidden="true"
                />
              </div>
              {item.helper && <p className="text-xs text-muted-foreground">{item.helper}</p>}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function FunnelCard({ data }: { data: FunnelStage[] }): ReactElement {
  const maxValue = data.reduce((max, item) => Math.max(max, item.value), 0)

  return (
    <Card data-testid="funnel">
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
        <CardDescription>From first view through confirmed hire.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((stage) => {
          const percentage = maxValue > 0 ? (stage.value / maxValue) * 100 : 0
          const ariaLabel = `${stage.label}: ${stage.value}${maxValue > 0 ? ` (${percentage.toFixed(0)}% of maximum)` : ''}`

          return (
            <div key={stage.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>{stage.label}</span>
                <span>{stage.value}</span>
              </div>
              <div className="h-3 rounded-full bg-muted" role="img" aria-label={ariaLabel}>
                <div
                  className="h-full rounded-full bg-chart-2"
                  style={{ width: `${percentage}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function InsightList({ data }: { data: Insight[] }): ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights &amp; Highlights</CardTitle>
        <CardDescription>Context for executive reviews.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((insight) => (
          <div key={insight.title} className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{insight.title}</p>
            <p className="text-lg font-semibold">{insight.value}</p>
            <p className="text-sm text-muted-foreground">{insight.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function AnalyticsDashboard({ dataset }: AnalyticsDashboardProps): ReactElement {
  useEffect(() => {
    console.log('AnalyticsDashboard dataset received:', dataset)
  }, [dataset])

  useEffect(() => {
    void trackEvent('analytics_page_viewed', { dataset: dataset.label })
  }, [dataset.label])

  const handleSummaryInteract = useCallback(
    (metric: SummaryMetric) => {
      void trackEvent('analytics_kpi_interacted', {
        dataset: dataset.label,
        metric: metric.label,
      })
    },
    [dataset.label]
  )

  return (
    <main className="container mx-auto flex-1 space-y-8 py-12">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">Reports</Badge>
          <p className="text-sm text-muted-foreground">Executive summary refreshed hourly</p>
        </div>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics &amp; Insights</h1>
            <p className="text-muted-foreground">
              Snapshot of hiring velocity, match quality, and conversion health for ShopMatch Pro customers.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>Data window: Last 30 days</span>
            <span className="hidden md:inline">•</span>
            <span>Timezone: UTC</span>
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dataset.summary.map((card) => (
          <SummaryCard key={card.label} {...card} onInteract={handleSummaryInteract} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <BarList
          title="Job Distribution"
          description="Share of active postings by category. Use to balance recruiter capacity."
          data={dataset.distribution}
        />
        <BarList
          title="Matches Per Week"
          description="Week-over-week velocity. Targets set at 50 matches/week."
          data={dataset.velocity}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <FunnelCard data={dataset.funnel} />
        <InsightList data={dataset.insights} />
      </section>
    </main>
  )
}
