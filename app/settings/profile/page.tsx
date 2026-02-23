'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { Upload, X, Loader2 } from 'lucide-react'
import { AppNavbar } from '@/components/app-navbar'

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
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  
  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

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
        setBio(profileData.bio || '')
        setLocation(profileData.location || '')
        setWebsiteUrl(profileData.website_url || '')
        setAvatarPreview(profileData.avatar_url || null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setAvatarFile(file)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Upload avatar to Supabase storage
  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return profile?.avatar_url || null

    try {
      setIsUploadingAvatar(true)
      
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, avatarFile, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (err) {
      console.error('Avatar upload failed:', err)
      throw new Error('Failed to upload avatar')
    } finally {
      setIsUploadingAvatar(false)
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

      // Upload avatar if changed
      let avatarUrl = profile?.avatar_url
      if (avatarFile) {
        avatarUrl = await uploadAvatar(user.id)
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          bio: bio,
          location: location,
          website_url: websiteUrl,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) throw updateError
      setProfile((prev: any) => ({ ...prev, full_name: fullName, bio, location, website_url: websiteUrl, avatar_url: avatarUrl }))
      setSuccess(true)
      setAvatarFile(null)
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

          <Card>
            <CardHeader>
              <CardTitle>Avatar</CardTitle>
              <CardDescription>Upload your profile picture</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Avatar Preview */}
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24 rounded-full bg-muted overflow-hidden flex-shrink-0">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="h-full w-full object-cover"
                      />
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
                        onClick={() => {
                          setAvatarFile(null)
                          setAvatarPreview(profile?.avatar_url || null)
                        }}
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

          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your profile details
              </CardDescription>
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

                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button type="submit" disabled={isSaving || isUploadingAvatar}>
                  {isSaving || isUploadingAvatar ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
