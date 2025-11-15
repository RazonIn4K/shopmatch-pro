export type MetricDatasetKey = 'jobBoard' | 'courseMarketplace'

export type SummaryMetric = {
  label: string
  value: string
  trend?: string
  trendVariant?: 'positive' | 'negative' | 'neutral'
}

export type BarDatum = {
  label: string
  value: number
  helper?: string
}

export type FunnelStage = {
  label: string
  value: number
}

export type Insight = {
  title: string
  value: string
  description: string
}

export interface AnalyticsDataset {
  label: string
  summary: SummaryMetric[]
  distribution: BarDatum[]
  velocity: BarDatum[]
  funnel: FunnelStage[]
  insights: Insight[]
}

const datasets: Record<MetricDatasetKey, AnalyticsDataset> = {
  jobBoard: {
    label: 'Job Board',
    summary: [
      { label: 'Jobs Posted (QTD)', value: '128', trend: '+18% vs last quarter', trendVariant: 'positive' },
      { label: 'Matches Generated', value: '342', trend: '+9% vs last quarter', trendVariant: 'positive' },
      { label: 'Avg. Time-to-Match', value: '4.2 days', trend: '-1.1 days faster', trendVariant: 'positive' },
      { label: 'Interview Rate', value: '41%', trend: '+6 pts', trendVariant: 'positive' },
    ],
    distribution: [
      { label: 'Engineering', value: 38, helper: '+6 new roles this month' },
      { label: 'Design', value: 22 },
      { label: 'Marketing', value: 18 },
      { label: 'Operations', value: 12 },
      { label: 'Customer Success', value: 10 },
    ],
    velocity: [
      { label: 'Week 1', value: 42 },
      { label: 'Week 2', value: 51 },
      { label: 'Week 3', value: 63 },
      { label: 'Week 4', value: 58 },
    ],
    funnel: [
      { label: 'Job Views', value: 1000 },
      { label: 'Applications', value: 640 },
      { label: 'Qualified Matches', value: 240 },
      { label: 'Interviews', value: 140 },
      { label: 'Hires', value: 46 },
    ],
    insights: [
      {
        title: 'Top Performing Role',
        value: 'Senior Product Designer',
        description: 'Avg. 5 days from post to accepted match',
      },
      {
        title: 'Most Competitive Market',
        value: 'AI/ML Engineering',
        description: '9.5 qualified submissions per posting',
      },
      {
        title: 'Pipeline Health',
        value: 'Stable',
        description: '3.2x applicant-to-role ratio across strategic segments',
      },
    ],
  },
  courseMarketplace: {
    label: 'Course Marketplace',
    summary: [
      { label: 'Courses Launched (QTD)', value: '56', trend: '+24% vs last quarter', trendVariant: 'positive' },
      { label: 'Enrollments', value: '1,980', trend: '+12% vs last quarter', trendVariant: 'positive' },
      { label: 'Completion Rate', value: '68%', trend: '+8 pts', trendVariant: 'positive' },
      { label: 'Avg. Time-to-LTV', value: '21 days', trend: '-4 days faster', trendVariant: 'positive' },
    ],
    distribution: [
      { label: 'Product & Design', value: 26, helper: '+4 new cohorts this month' },
      { label: 'Engineering', value: 18 },
      { label: 'Marketing', value: 12 },
    ],
    velocity: [
      { label: 'Week 1', value: 420 },
      { label: 'Week 2', value: 470 },
      { label: 'Week 3', value: 520 },
      { label: 'Week 4', value: 570 },
    ],
    funnel: [
      { label: 'Landing Page Visits', value: 5200 },
      { label: 'Trial Signups', value: 1800 },
      { label: 'Paid Enrollments', value: 910 },
      { label: 'Course Completions', value: 620 },
      { label: 'Upsells', value: 210 },
    ],
    insights: [
      {
        title: 'Hot Cohort',
        value: 'No-Code MVP Sprint',
        description: '90% satisfaction with 3.7x upsell rate',
      },
      {
        title: 'Acquisition Channel',
        value: 'Partner webinars',
        description: '31% of new enrollments with lowest CPA',
      },
      {
        title: 'Churn Watch',
        value: 'Retention steady',
        description: 'Completion rate above 65% for four consecutive weeks',
      },
    ],
  },
}

export const ACTIVE_METRIC_DATASET: MetricDatasetKey = 'jobBoard'

export function getAnalyticsDataset(dataset: MetricDatasetKey = ACTIVE_METRIC_DATASET) {
  return datasets[dataset]
}
