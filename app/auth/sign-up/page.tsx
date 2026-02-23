'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
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
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PasswordInput } from '@/components/auth/password-input'
import { PasswordStrengthIndicator } from '@/components/auth/password-strength-indicator'
import { Logo } from '@/components/logo'
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Building2,
  BookOpen,
  User,
  Upload,
} from 'lucide-react'
import { handleSignUpEmail } from '@/app/actions/send-emails'

// ─── Types ────────────────────────────────────────────────────────────────────

type VerificationMethod = 'email' | 'id'

const STEP_META = [
  {
    title: 'Account Details',
    description: 'Set up your login credentials',
    icon: User,
  },
  {
    title: 'Your Institution',
    description: 'Tell us where you study',
    icon: Building2,
  },
  {
    title: 'Academic Info',
    description: 'Share your academic background',
    icon: BookOpen,
  },
  {
    title: 'Your Profile',
    description: 'Personalise your LearnLoop presence',
    icon: GraduationCap,
  },
] as const

// ─── Component ────────────────────────────────────────────────────────────────

export default function SignUpPage() {
  const router = useRouter()

  // Navigation state
  const [step, setStep] = useState(1)
  const [isComplete, setIsComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1 — Account Details
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Step 2 — Institution
  const [institution, setInstitution] = useState('')
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>('email')
  const [studentIdFile, setStudentIdFile] = useState<File | null>(null)

  // Step 3 — Academic Info
  const [facultyField, setFacultyField] = useState('')
  const [department, setDepartment] = useState('')
  const [level, setLevel] = useState('')
  const [academicSession, setAcademicSession] = useState('')

  // Step 4 — Profile
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null)
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState('')

  const photoInputRef = useRef<HTMLInputElement>(null)
  const studentIdInputRef = useRef<HTMLInputElement>(null)

  // ─── Validation ─────────────────────────────────────────────────────────────

  const validateStep1 = async (): Promise<string | null> => {
    if (!fullName.trim()) return 'Full name is required'
    if (!username.trim()) return 'Username is required'
    if (!email.trim()) return 'Email is required'
    if (!password) return 'Password is required'
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
    if (!/[!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]/.test(password))
      return 'Password must contain at least one special character'
    if (password !== confirmPassword) return 'Passwords do not match'
    return null
  }

  const validateStep2 = (): string | null => {
    if (!institution.trim()) return 'Institution name is required'
    return null
  }

  const validateStep3 = (): string | null => {
    if (!department.trim()) return 'Department is required'
    return null
  }

  // ─── Navigation ─────────────────────────────────────────────────────────────

  const handleNext = async () => {
    setError(null)
    let validationError: string | null = null

    if (step === 1) validationError = await validateStep1()
    else if (step === 2) validationError = validateStep2()
    else if (step === 3) validationError = validateStep3()

    if (validationError) {
      setError(validationError)
      return
    }

    setStep((s) => s + 1)
  }

  const handleBack = () => {
    setError(null)
    setStep((s) => s - 1)
  }

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setError(null)
    setIsLoading(true)

    const supabase = createClient()

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
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

      // Note: student ID file upload would be processed post-signup once storage is configured
      if (studentIdFile) {
        console.info('Student ID file queued for upload after account verification:', studentIdFile.name)
      }

      // Update extended profile fields (profile row created by DB trigger; may not exist yet — that's OK)
      if (data.user) {
        const parsedInterests = interests
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)

        try {
          await supabase
            .from('profiles')
            .update({
              institution,
              faculty: facultyField,
              department,
              level,
              academic_session: academicSession,
              skills: parsedInterests,
              interests: parsedInterests,
            })
            .eq('id', data.user.id)
        } catch (profileErr) {
          // Profile row may not be ready yet; this is non-fatal
          console.warn('[SignUp] Profile update skipped — row may not exist yet:', profileErr)
        }
      }

      // Send verification email
      const verificationLink = `${window.location.origin}/auth/callback?email=${encodeURIComponent(email)}&type=email`
      const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      const emailResult = await handleSignUpEmail(email, verificationLink, verificationCode)

      if (!emailResult?.success) {
        console.warn('Verification email may have failed to send, but account was created successfully')
      }

      // Show completion screen, then redirect
      setIsComplete(true)
      setTimeout(() => {
        router.push(`/auth/sign-up-success?email=${encodeURIComponent(email)}`)
      }, 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign up')
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setProfilePhoto(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setProfilePhotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setProfilePhotoPreview(null)
    }
  }

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentIdFile(e.target.files?.[0] ?? null)
  }

  // ─── Completion Screen ───────────────────────────────────────────────────────

  if (isComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 text-center px-4">
          <Logo size="lg" showText={false} />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Welcome to LearnLoop</h2>
            <p className="text-muted-foreground">Your academic space is ready.</p>
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  // ─── Step content ────────────────────────────────────────────────────────────

  const currentMeta = STEP_META[step - 1]
  const StepIcon = currentMeta.icon

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 md:p-10">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo size="lg" showText={false} />
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Step {step} of 4</span>
            <span>{step * 25}%</span>
          </div>
          <Progress value={step * 25} className="h-2" />
        </div>

        {/* Step card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <StepIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>{currentMeta.title}</CardTitle>
                <CardDescription>{currentMeta.description}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* ── Step 1 ── */}
            {step === 1 && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="johndoe"
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
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    required
                    error={
                      confirmPassword && password !== confirmPassword
                        ? 'Passwords do not match'
                        : undefined
                    }
                  />
                </div>
              </>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="institution">Institution Name *</Label>
                  <Input
                    id="institution"
                    placeholder="e.g. University of Lagos"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Verification Method</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        {
                          value: 'email' as VerificationMethod,
                          label: 'School Email',
                          description: 'Use your .edu or institutional email',
                        },
                        {
                          value: 'id' as VerificationMethod,
                          label: 'Student ID',
                          description: 'Upload your student ID document',
                        },
                      ] as const
                    ).map(({ value, label, description }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setVerificationMethod(value)}
                        className={`rounded-lg border p-3 text-left transition-colors ${
                          verificationMethod === value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <p className="text-sm font-medium">{label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {verificationMethod === 'id' && (
                  <div className="grid gap-2">
                    <Label htmlFor="studentId">Student ID Document</Label>
                    <input
                      ref={studentIdInputRef}
                      id="studentId"
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleStudentIdChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => studentIdInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      {studentIdFile ? studentIdFile.name : 'Choose file…'}
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* ── Step 3 ── */}
            {step === 3 && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="faculty">Faculty / School</Label>
                  <Input
                    id="faculty"
                    placeholder="e.g. Faculty of Engineering"
                    value={facultyField}
                    onChange={(e) => setFacultyField(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    placeholder="e.g. Computer Science"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="level">Level / Year</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        '100 Level',
                        '200 Level',
                        '300 Level',
                        '400 Level',
                        '500 Level',
                        'Postgraduate',
                        'PhD',
                      ].map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="academicSession">Academic Session</Label>
                  <Input
                    id="academicSession"
                    placeholder="e.g. 2024/2025"
                    value={academicSession}
                    onChange={(e) => setAcademicSession(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* ── Step 4 ── */}
            {step === 4 && (
              <>
                {/* Profile photo */}
                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-muted transition-colors hover:border-primary"
                  >
                    {profilePhotoPreview ? (
                      <Image
                        src={profilePhotoPreview}
                        alt="Profile preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                    )}
                  </button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePhotoChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    {profilePhoto ? profilePhoto.name : 'Upload profile photo (optional)'}
                  </p>
                </div>

                {/* Bio */}
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bio">Short Academic Bio</Label>
                    <span className="text-xs text-muted-foreground">{bio.length}/120</span>
                  </div>
                  <Textarea
                    id="bio"
                    placeholder="Tell the community a bit about your academic journey…"
                    maxLength={120}
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                {/* Interests */}
                <div className="grid gap-2">
                  <Label htmlFor="interests">Study Interests</Label>
                  <Input
                    id="interests"
                    placeholder="e.g. Machine Learning, Web Development"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Separate with commas</p>
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
              )}

              {step < 4 ? (
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleNext}
                  disabled={isLoading}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up…
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
              )}
            </div>

            {/* Login link */}
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-medium underline underline-offset-4 hover:text-primary"
              >
                Log in
              </Link>
            </p>
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
  )
}
