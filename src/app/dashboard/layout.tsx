import type { ReactNode } from 'react'

import { DashboardNav } from '@/components/dashboard-nav'
import { DashboardAuthGuard } from '@/components/dashboard-auth-guard'
import { AuthProvider } from '@/lib/contexts/AuthContext'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthProvider>
      <DashboardAuthGuard>
        <div className="min-h-screen bg-background">
          <DashboardNav />
          <div className="bg-background">
            {children}
          </div>
        </div>
      </DashboardAuthGuard>
    </AuthProvider>
  )
}
