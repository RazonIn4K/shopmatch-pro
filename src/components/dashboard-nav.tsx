'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const navItems = [
  {
    label: 'Overview',
    href: '/dashboard',
    matches: ['/dashboard', '/dashboard/owner', '/dashboard/seeker'],
    description: 'Owner & seeker dashboards',
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    description: 'Executive-ready KPIs',
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <div className="border-b bg-muted/30">
      <nav className="container mx-auto flex flex-wrap items-center gap-2 py-4" aria-label="Dashboard navigation">
        {navItems.map((item) => {
          const isActive = item.matches
            ? item.matches.some((match) => pathname === match || pathname.startsWith(`${match}/`))
            : pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
