'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { handleSignUpEmail } from '@/app/actions/send-emails'
import { PasswordInput } from '@/components/auth/password-input'
import { PasswordStrengthIndicator } from '@/components/auth/password-strength-indicator'
import { Logo } from '@/components/logo'
import { Loader2 } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    // Validation
    if (!email || !password || !repeatPassword || !username) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setIsLoading(false)
      return
    }

    // Check password strength
    const { checkPasswordStrength } = await import('@/lib/password-strength')
    const { strength } = checkPasswordStrength(password)
    if (strength === 'weak' || strength === 'fair') {
      setError('Password is not strong enough. Please use a stronger password.')
      setIsLoading(false)
      return
    }

    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/callback`,
          data: {
            username,
            full_name: fullName,
          },
        },
      })
      if (signUpError) throw signUpError

      // Verification link from Supabase
      const verificationLink = `${window.location.origin}/auth/callback?email=${encodeURIComponent(email)}&type=email`
      const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase()

      // Send verification email via Resend
      const emailResult = await handleSignUpEmail(email, verificationLink, verificationCode)
      
      if (!emailResult?.success) {
        console.warn('Verification email may have failed to send, but account created successfully')
      }

      router.push(`/auth/sign-up-success?email=${encodeURIComponent(email)}`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred during sign up')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 md:p-10">
      <div className="w-full max-w-md">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Logo size="lg" showText={false} />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Join LearnLoop</h1>
              <p className="text-muted-foreground">
                Start learning and sharing knowledge with our community
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>
                Sign up to get started on your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="johndoe"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

            <div className="grid gap-2">
              <PasswordInput
                label="Password"
                placeholder="Enter a strong password"
                value={password}
                onChange={setPassword}
                required
              />
              <PasswordStrengthIndicator password={password} />
            </div>
            <div className="grid gap-2">
              <PasswordInput
                label="Confirm Password"
                placeholder="Repeat your password"
                value={repeatPassword}
                onChange={setRepeatPassword}
                required
                error={password !== repeatPassword && repeatPassword ? 'Passwords do not match' : undefined}
              />
            </div>

                  {error && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Sign Up'
                    )}
                  </Button>
                </div>

                <div className="mt-4 text-center text-sm">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="font-medium underline underline-offset-4 hover:text-primary"
                  >
                    Log in
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Terms */}
          <p className="text-center text-xs text-muted-foreground">
            By signing up, you agree to our{' '}
            <Link href="/legal/terms" className="underline hover:text-primary">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/legal/privacy" className="underline hover:text-primary">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
