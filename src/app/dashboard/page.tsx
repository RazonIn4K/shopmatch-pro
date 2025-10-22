'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { useAuth } from '@/lib/contexts/AuthContext'
import { auth } from '@/lib/firebase/client'

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  const [isRefreshingToken, setIsRefreshingToken] = useState(false)
  const [refreshMessage, setRefreshMessage] = useState('Loading...')

  // Check if redirected from successful subscription
  const isSubscriptionSuccess = searchParams.get('success') === 'true'

  useEffect(() => {
    async function handleSubscriptionSuccess() {
      const shouldHandleSuccess = isSubscriptionSuccess && user
      const canRefreshToken = !isRefreshingToken

      if (shouldHandleSuccess && canRefreshToken) {
        // User just completed subscription - refresh their token to get updated custom claims
        setIsRefreshingToken(true)
        setRefreshMessage('Setting up your subscription...')

        try {
          const currentUser = auth.currentUser
          if (currentUser) {
            // Force token refresh to get updated custom claims (subActive: true)
            await currentUser.getIdToken(true)
            setRefreshMessage('Subscription activated! Redirecting...')

            // Wait a brief moment for the success message to be visible
            await new Promise(resolve => setTimeout(resolve, 800))
          }
        } catch (error) {
          console.error('Error refreshing token:', error)
          // Continue anyway - user can manually refresh if needed
        } finally {
          setIsRefreshingToken(false)
          // Remove success param and proceed to role-based redirect
          router.replace('/dashboard')
        }
        return
      }
    }

    handleSubscriptionSuccess()
  }, [isSubscriptionSuccess, user, isRefreshingToken, router])

  useEffect(() => {
    const isReadyForRedirect = !loading && !isRefreshingToken && !isSubscriptionSuccess
    if (!isReadyForRedirect) {
      return
    }

    if (!user) {
      router.push('/login')
    } else if (user.role === 'owner') {
      router.push('/dashboard/owner')
    } else if (user.role === 'seeker') {
      router.push('/dashboard/seeker')
    } else {
      router.push('/jobs')
    }
  }, [user, loading, router, isRefreshingToken, isSubscriptionSuccess])

  return (
    <main className="container mx-auto flex-1 py-12">
      <h1 className="sr-only">Dashboard Loading</h1>
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        {isRefreshingToken && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {refreshMessage}
          </p>
        )}
      </div>
    </main>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <main className="container mx-auto flex-1 py-12">
        <h1 className="sr-only">Dashboard Loading</h1>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        </div>
      </main>
    }>
      <DashboardContent />
    </Suspense>
  )
}
