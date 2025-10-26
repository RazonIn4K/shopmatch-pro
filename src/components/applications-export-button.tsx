/**
 * Applications Export Button Component
 *
 * Lazy-loaded button that exports applications to CSV.
 * Uses dynamic import to avoid including export logic in main bundle.
 *
 * @example
 * ```tsx
 * import { ApplicationsExportButton } from '@/components/applications-export-button'
 *
 * // In owner dashboard:
 * <ApplicationsExportButton />
 * ```
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/contexts/AuthContext'

interface ExportState {
  loading: boolean
  error: string | null
  success: boolean
}

export function ApplicationsExportButton() {
  const { user } = useAuth()
  const [state, setState] = useState<ExportState>({
    loading: false,
    error: null,
    success: false,
  })
  const { loading, error, success } = state
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current)
      }
    }
  }, [])

  const handleExport = useCallback(async () => {
    if (loading) {
      return
    }

    if (!user) {
      if (isMountedRef.current) {
        setState({ loading: false, error: 'Please sign in to export applications', success: false })
      }
      return
    }

    if (isMountedRef.current) {
      setState({ loading: true, error: null, success: false })
    }

    try {
      // Get fresh ID token
      const idToken = await user.getIdToken()
      if (!idToken) {
        throw new Error('Authentication required')
      }

      // Call export API
      const response = await fetch('/api/applications/export', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)

        if (response.status === 429) {
          const retryMinutes = Math.ceil((errorData?.retryAfter || 3600) / 60)
          throw new Error(
            `Rate limit exceeded. You can export up to 5 times per hour. Please try again in ${retryMinutes} minutes.`
          )
        }

        if (response.status === 403) {
          throw new Error('Only job owners can export applications')
        }

        if (response.status === 404) {
          throw new Error(errorData?.message || 'No applications found to export')
        }

        throw new Error(errorData?.message || 'Export failed. Please try again.')
      }

      // Download CSV file
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `applications-${Date.now()}.csv`

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="([^"]+)"/)
        if (match) {
          filename = match[1]
        }
      }

      // Trigger download
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()

      // Cleanup
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      if (!isMountedRef.current) {
        return
      }

      setState({ loading: false, error: null, success: true })

      // Reset success message after 3 seconds
      resetTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) {
          return
        }
        setState(prev => ({ ...prev, success: false }))
        resetTimerRef.current = null
      }, 3000)
    } catch (error) {
      console.error('Export error:', error)
      if (isMountedRef.current) {
        setState({
          loading: false,
          error: error instanceof Error ? error.message : 'Export failed',
          success: false,
        })
      }
    }
  }, [loading, user])

  return (
    <div className="space-y-2">
      <Button
        onClick={handleExport}
        disabled={loading}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            <span>Export to CSV</span>
          </>
        )}
      </Button>

      {error && (
        <div className="text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="text-sm text-green-600" role="status">
          ✓ Applications exported successfully
        </div>
      )}
    </div>
  )
}
