import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppNavbar } from '@/components/app-navbar'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { User, Shield, ChevronRight } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const sections = [
    {
      href: '/settings/profile',
      icon: User,
      title: 'Profile',
      description: 'Update your name, bio, avatar, location, and website',
    },
    {
      href: '/settings/privacy',
      icon: Shield,
      title: 'Privacy & Safety',
      description: 'Manage blocked users, muted accounts, and messaging preferences',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar user={profile ?? undefined} />

      <div className="container mx-auto max-w-2xl py-10 px-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences</p>
          </div>

          <div className="space-y-3">
            {sections.map(({ href, icon: Icon, title, description }) => (
              <Link key={href} href={href}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center gap-4 py-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold">{title}</p>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
