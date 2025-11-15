import { Metadata } from 'next'

import { AnalyticsDashboard } from './analytics-dashboard'
import { getAnalyticsDataset } from './demo-metrics'

export const metadata: Metadata = {
  title: 'Analytics | ShopMatch Pro',
}

export default function AnalyticsReportPage() {
  const dataset = getAnalyticsDataset()

  return <AnalyticsDashboard dataset={dataset} />
}
