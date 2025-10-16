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

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/contexts/AuthContext'
import { auth } from '@/lib/firebase/client'

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

  const handleExport = async () => {
    if (!user) {
      setState({ loading: false, error: 'Please sign in to export applications', success: false })
      return
    }

    setState({ loading: true, error: null, success: false })

    try {
      // Get fresh ID token
      const idToken = await auth.currentUser?.getIdToken()
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

      setState({ loading: false, error: null, success: true })

      // Reset success message after 3 seconds
      setTimeout(() => {
        setState((prev) => ({ ...prev, success: false }))
      }, 3000)
    } catch (error) {
      console.error('Export error:', error)
      setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Export failed',
        success: false,
      })
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleExport}
        disabled={state.loading}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {state.loading ? (
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

      {state.error && (
        <div className="text-sm text-destructive" role="alert">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="text-sm text-green-600" role="status">
          ✓ Applications exported successfully
        </div>
      )}
    </div>
  )
}
