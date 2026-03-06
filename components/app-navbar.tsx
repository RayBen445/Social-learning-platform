'use client'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import Link from 'next/link'
import {
  Home, Compass, Mail, Bell, Settings, LogOut,
  Search as SearchIcon, Menu, BookOpen, Users, User,
} from 'lucide-react'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AppNavbarProps {
  user?: {
    username?: string
    full_name?: string
    avatar_url?: string
  }
}

export function AppNavbar({ user }: AppNavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/explore', label: 'Explore', icon: Compass },
    { href: '/courses', label: 'Courses', icon: BookOpen },
    { href: '/groups', label: 'Groups', icon: Users },
    { href: '/messages', label: 'Messages', icon: Mail },
    { href: '/notifications', label: 'Notifications', icon: Bell },
  ]

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const avatarInitial = (user?.full_name || user?.username || '?').charAt(0).toUpperCase()

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Logo href="/dashboard" size="sm" showText={true} />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
            <Link href="/search">
              <SearchIcon className="h-4 w-4" />
              <span className="hidden md:inline ml-1.5 text-xs text-muted-foreground">Search</span>
            </Link>
          </Button>

          {user ? (
            <>
              <Button asChild size="sm">
                <Link href="/posts/create">Create</Link>
              </Button>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name || user.username || 'User'}
                        className="h-8 w-8 rounded-full border-2 border-border object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full border-2 border-border bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                        {avatarInitial}
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-semibold truncate">{user.full_name || user.username}</p>
                    {user.username && (
                      <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.username}`} className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/sign-up">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button size="sm" variant="ghost">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              {user && (
                <div className="flex items-center gap-3 px-2 py-4 border-b mb-2">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover border" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                      {avatarInitial}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{user.full_name || user.username}</p>
                    {user.username && <p className="text-xs text-muted-foreground truncate">@{user.username}</p>}
                  </div>
                </div>
              )}
              <div className="space-y-1">
                {navItems.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive(href)
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </Link>
                ))}
                <Link
                  href="/search"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <SearchIcon className="h-5 w-5" />
                  <span>Search</span>
                </Link>
              </div>
              {user ? (
                <div className="absolute bottom-6 left-4 right-4 space-y-1 border-t pt-4">
                  <Link
                    href={`/profile/${user.username}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => { setIsOpen(false); handleSignOut() }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-destructive transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="absolute bottom-6 left-4 right-4 space-y-2 border-t pt-4">
                  <Button asChild className="w-full" onClick={() => setIsOpen(false)}>
                    <Link href="/auth/sign-up">Sign Up</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
