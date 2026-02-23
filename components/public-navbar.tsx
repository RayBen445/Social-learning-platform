import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'

export function PublicNavbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Logo href="/" size="sm" showText={true} />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/sign-up">Sign Up</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
