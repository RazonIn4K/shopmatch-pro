'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/lib/contexts/AuthContext'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (user.role === 'owner') {
        router.push('/dashboard/owner')
      } else if (user.role === 'seeker') {
        router.push('/dashboard/seeker')
      } else {
        router.push('/jobs')
      }
    }
  }, [user, loading, router])

  return (
    <main className="container mx-auto py-12">
      <div className="flex items-center justify-center">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      </div>
    </main>
  )
}
