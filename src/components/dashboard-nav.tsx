'use client'

import { BarChart3, BriefcaseBusiness, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const navItems = [
  {
    label: 'Overview',
    href: '/dashboard',
    matches: ['/dashboard', '/dashboard/owner', '/dashboard/seeker'],
    icon: LayoutDashboard,
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <div className="border-b bg-card/80 shadow-sm">
      <nav className="container mx-auto flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between" aria-label="Dashboard navigation">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BriefcaseBusiness className="size-4" aria-hidden="true" />
          </span>
          <span>ShopMatch Pro</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => {
            const isActive = item.matches
              ? item.matches.some((match) => pathname === match || pathname.startsWith(`${match}/`))
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
