import type { ReactNode } from 'react'

import { AuthProvider } from '@/lib/contexts/AuthContext'

export default function JobDetailLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
