import { Metadata } from 'next'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getAnalyticsDataset,
  type BarDatum,
  type SummaryMetric,
  type FunnelStage,
  type Insight,
} from './demo-metrics'

export const metadata: Metadata = {
  title: 'Analytics | ShopMatch Pro',
}

const dataset = getAnalyticsDataset()

function SummaryCard({ label, value, trend, trendVariant = 'neutral' }: SummaryMetric) {
  const trendColor =
    trendVariant === 'positive'
      ? 'text-emerald-600'
      : trendVariant === 'negative'
        ? 'text-red-500'
        : 'text-muted-foreground'

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-4xl">{value}</CardTitle>
      </CardHeader>
      {trend && (
        <CardContent>
          <p className={`text-sm font-medium ${trendColor}`}>{trend}</p>
        </CardContent>
      )}
    </Card>
  )
}

function BarList({ title, description, data }: { title: string; description: string; data: BarDatum[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(item.value, 100)}%` }}
                role="presentation"
                aria-hidden="true"
              />
            </div>
            {item.helper && <p className="text-xs text-muted-foreground">{item.helper}</p>}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function FunnelCard({ data }: { data: FunnelStage[] }) {
  const maxValue = Math.max(...data.map((item) => item.value))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
        <CardDescription>From first view through confirmed hire.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((stage) => (
          <div key={stage.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>{stage.label}</span>
              <span>{stage.value}</span>
            </div>
            <div className="h-3 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-chart-2"
                style={{ width: `${(stage.value / maxValue) * 100}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function InsightList({ data }: { data: Insight[] }) {
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

export default function AnalyticsReportPage() {
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
          <SummaryCard key={card.label} {...card} />
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
