import type { ReactNode } from 'react'

import { DashboardNav } from '@/components/dashboard-nav'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="bg-background">
        {children}
      </div>
    </div>
  )
}
