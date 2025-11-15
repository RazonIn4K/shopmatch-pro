"use client"

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/lib/contexts/AuthContext'

interface DashboardAuthGuardProps {
  children: ReactNode
}

export function DashboardAuthGuard({ children }: DashboardAuthGuardProps): ReactNode {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user, router])

  if (loading || !user) {
    return (
      <main className="container mx-auto flex-1 py-12">
        <h1 className="sr-only">Dashboard Loading</h1>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        </div>
      </main>
    )
  }

  return <>{children}</>
}
