'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, MessageSquare, Users, User } from 'lucide-react'

interface BottomNavProps {
  username?: string
}

export function BottomNav({ username }: BottomNavProps) {
  const pathname = usePathname()

  const items = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/courses', label: 'Courses', icon: BookOpen },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
    { href: '/groups', label: 'Groups', icon: Users },
    { href: username ? `/profile/${username}` : '/settings', label: 'Profile', icon: User },
  ]

  // Exact match for dashboard to prevent all routes from matching (prefix would always be true)
  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-0 ${
              isActive(href)
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive(href) ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-medium truncate">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
