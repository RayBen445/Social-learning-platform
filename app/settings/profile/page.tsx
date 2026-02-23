'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { Upload, X, Loader2, ArrowLeft } from 'lucide-react'
import { AppNavbar } from '@/components/app-navbar'
import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Form state
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Banner upload state
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)

  // Academic info state
  const [institution, setInstitution] = useState('')
  const [faculty, setFaculty] = useState('')
  const [department, setDepartment] = useState('')
  const [level, setLevel] = useState('')
  const [academicSession, setAcademicSession] = useState('')

  // Skills & Interests state
  const [skills, setSkills] = useState('')
  const [interests, setInterests] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError
        setProfile(profileData)
        setFullName(profileData.full_name || '')
        setUsername(profileData.username || '')
        setBio(profileData.bio || '')
        setLocation(profileData.location || '')
        setWebsiteUrl(profileData.website_url || '')
        setAvatarPreview(profileData.avatar_url || null)
        setBannerPreview(profileData.banner_url || null)
        setInstitution(profileData.institution || '')
        setFaculty(profileData.faculty || '')
        setDepartment(profileData.department || '')
        setLevel(profileData.level || '')
        setAcademicSession(profileData.academic_session || '')
        setSkills(Array.isArray(profileData.skills) ? profileData.skills.join(', ') : (profileData.skills || ''))
        setInterests(Array.isArray(profileData.interests) ? profileData.interests.join(', ') : (profileData.interests || ''))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // Compute days remaining before username can be changed again
  const daysRemaining = useMemo((): number | null => {
    if (!profile?.username_last_changed_at) return null
    const lastChanged = new Date(profile.username_last_changed_at)
    const diffDays = Math.floor((Date.now() - lastChanged.getTime()) / (1000 * 60 * 60 * 24))
    const remaining = 60 - diffDays
    return remaining > 0 ? remaining : null
  }, [profile?.username_last_changed_at])

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image size must be less than 5MB'); return }
    setAvatarFile(file)
    setError(null)
    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  // Handle banner file selection
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image size must be less than 5MB'); return }
    setBannerFile(file)
    setError(null)
    const reader = new FileReader()
    reader.onloadend = () => setBannerPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  // Upload avatar to Supabase storage
  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return profile?.avatar_url || null
    try {
      setIsUploadingAvatar(true)
      const fileExt = avatarFile.name.split('.').pop()
      const filePath = `avatars/${userId}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('profiles').upload(filePath, avatarFile, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(filePath)
      return publicUrl
    } catch (err) {
      console.error('Avatar upload failed:', err)
      throw new Error('Failed to upload avatar')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Upload banner to Supabase storage
  const uploadBanner = async (userId: string): Promise<string | null> => {
    if (!bannerFile) return profile?.banner_url || null
    try {
      setIsUploadingBanner(true)
      const fileExt = bannerFile.name.split('.').pop()
      const filePath = `banners/${userId}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('profiles').upload(filePath, bannerFile, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(filePath)
      return publicUrl
    } catch (err) {
      console.error('Banner upload failed:', err)
      throw new Error('Failed to upload banner')
    } finally {
      setIsUploadingBanner(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const usernameChanged = profile?.username !== username
      if (usernameChanged && daysRemaining !== null) {
        setError('Username can only be changed once every 60 days')
        setIsSaving(false)
        return
      }

      let avatarUrl = profile?.avatar_url
      if (avatarFile) avatarUrl = await uploadAvatar(user.id)
      let bannerUrl = profile?.banner_url
      if (bannerFile) bannerUrl = await uploadBanner(user.id)

      const updateData: Record<string, any> = {
        full_name: fullName,
        bio,
        location,
        website_url: websiteUrl,
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
        institution,
        faculty,
        department,
        level,
        academic_session: academicSession,
        skills: skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        interests: interests.split(',').map((s: string) => s.trim()).filter(Boolean),
        updated_at: new Date().toISOString(),
      }

      if (usernameChanged) {
        updateData.username = username
        updateData.username_last_changed_at = new Date().toISOString()
      }

      const { error: updateError } = await supabase.from('profiles').update(updateData).eq('id', user.id)
      if (updateError) throw updateError

      setProfile((prev: any) => ({
        ...prev,
        full_name: fullName,
        username: usernameChanged ? username : prev.username,
        username_last_changed_at: usernameChanged ? new Date().toISOString() : prev.username_last_changed_at,
        bio,
        location,
        website_url: websiteUrl,
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
        institution,
        faculty,
        department,
        level,
        academic_session: academicSession,
        skills: skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        interests: interests.split(',').map((s: string) => s.trim()).filter(Boolean),
      }))
      setSuccess(true)
      setAvatarFile(null)
      setBannerFile(null)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-14 border-b bg-muted/40 animate-pulse" />
        <div className="container mx-auto max-w-2xl py-10 px-4 space-y-6">
          <div className="space-y-2">
            <div className="h-9 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="h-6 w-20 bg-muted animate-pulse rounded" />
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-full bg-muted animate-pulse flex-shrink-0" />
              <div className="space-y-2 flex-grow">
                <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                <div className="h-3 w-40 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="h-6 w-28 bg-muted animate-pulse rounded" />
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-10 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-4 w-12 bg-muted animate-pulse rounded" />
              <div className="h-24 bg-muted animate-pulse rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              <div className="h-10 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar user={profile} />

      <div className="container mx-auto max-w-2xl py-10 px-4">
        <div className="space-y-6">
          {/* Back navigation */}
          <Link href="/settings" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Settings
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your profile information</p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <CardContent className="pt-6 text-red-700 dark:text-red-200">{error}</CardContent>
            </Card>
          )}

          {success && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CardContent className="pt-6 text-green-700 dark:text-green-200">Profile saved successfully!</CardContent>
            </Card>
          )}

          {/* Cover Photo Card */}
          <Card>
            <CardHeader>
              <CardTitle>Cover Photo</CardTitle>
              <CardDescription>Upload a cover photo for your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted">
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-primary/80 to-primary" />
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <Label htmlFor="banner" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition w-fit">
                      <Upload className="h-4 w-4" />
                      Choose Image
                    </div>
                  </Label>
                  <input
                    id="banner"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="hidden"
                    disabled={isUploadingBanner}
                  />
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                  {(bannerFile || bannerPreview) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => { setBannerFile(null); setBannerPreview(null) }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avatar Card */}
          <Card>
            <CardHeader>
              <CardTitle>Avatar</CardTitle>
              <CardDescription>Upload your profile picture</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24 rounded-full bg-muted overflow-hidden flex-shrink-0">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <Upload className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow space-y-2">
                    <Label htmlFor="avatar" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition w-fit">
                        <Upload className="h-4 w-4" />
                        Choose Image
                      </div>
                    </Label>
                    <input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={isUploadingAvatar}
                    />
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                    {avatarFile && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => { setAvatarFile(null); setAvatarPreview(profile?.avatar_url || null) }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={daysRemaining !== null}
                  />
                  <p className="text-xs text-muted-foreground">
                    {daysRemaining !== null
                      ? `Username can be changed again in ${daysRemaining} days`
                      : 'Username can be changed once every 60 days'}
                  </p>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bio">Bio</Label>
                    <span className={`text-xs ${bio.length > 120 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {bio.length}/120
                    </span>
                  </div>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 120))}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    maxLength={120}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="websiteUrl">Website</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>

                <Button type="submit" disabled={isSaving || isUploadingAvatar || isUploadingBanner}>
                  {isSaving || isUploadingAvatar || isUploadingBanner ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Academic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
              <CardDescription>Changes to academic info will require re-verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="institution">Institution</Label>
                  <Input
                    id="institution"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. University of Lagos"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="faculty">Faculty / School</Label>
                    <Input
                      id="faculty"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      placeholder="e.g. Faculty of Science"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="level">Level / Year</Label>
                    <Select value={level} onValueChange={setLevel}>
                      <SelectTrigger id="level">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100 Level">100 Level</SelectItem>
                        <SelectItem value="200 Level">200 Level</SelectItem>
                        <SelectItem value="300 Level">300 Level</SelectItem>
                        <SelectItem value="400 Level">400 Level</SelectItem>
                        <SelectItem value="500 Level">500 Level</SelectItem>
                        <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="academicSession">Academic Session</Label>
                    <Input
                      id="academicSession"
                      value={academicSession}
                      onChange={(e) => setAcademicSession(e.target.value)}
                      placeholder="e.g. 2024/2025"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Interests Card */}
          <Card>
            <CardHeader>
              <CardTitle>Skills &amp; Interests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="skills">Skills</Label>
                  <Input
                    id="skills"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. Python, React, Data Analysis"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="interests">Interests</Label>
                  <Input
                    id="interests"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="e.g. Machine Learning, Web Dev"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
