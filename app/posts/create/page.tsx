'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AppNavbar } from '@/components/app-navbar'
import { BottomNav } from '@/components/bottom-nav'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Paperclip, Link2, BarChart2, AtSign, Hash, X, Plus } from 'lucide-react'

interface Profile {
  id: string
  username: string
  full_name: string
  avatar_url: string | null
  institution: string | null
  department: string | null
  level: string | null
}

const SOFT_LIMIT = 2000

export default function CreatePostPage() {
  const supabase = createClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [navbarUser, setNavbarUser] = useState<{ username?: string; full_name?: string; avatar_url?: string } | null>(null)

  const [content, setContent] = useState('')
  const [showTitle, setShowTitle] = useState(false)
  const [title, setTitle] = useState('')
  const [visibility, setVisibility] = useState<'everyone' | 'school' | 'course' | 'group'>('everyone')

  const [links, setLinks] = useState<string[]>([])
  const [linkInput, setLinkInput] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)

  const [pollOptions, setPollOptions] = useState<string[]>(['', ''])
  const [showPoll, setShowPoll] = useState(false)

  const [showTagPicker, setShowTagPicker] = useState(false)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([])

  const [isPosting, setIsPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, institution, department, level')
        .eq('id', user.id)
        .single()
      if (data) {
        setProfile(data)
        setNavbarUser({ username: data.username, full_name: data.full_name, avatar_url: data.avatar_url })
      }
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    const fetchTopics = async () => {
      const { data } = await supabase.from('topics').select('id, name').limit(50)
      if (data) setTopics(data)
    }
    fetchTopics()
  }, [])

  const autoExpand = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  const addLink = () => {
    const trimmed = linkInput.trim()
    if (trimmed && !links.includes(trimmed)) {
      setLinks([...links, trimmed])
    }
    setLinkInput('')
  }

  const removeLink = (url: string) => setLinks(links.filter((l) => l !== url))

  const updatePollOption = (index: number, value: string) => {
    const next = [...pollOptions]
    next[index] = value
    setPollOptions(next)
  }

  const addPollOption = () => {
    if (pollOptions.length < 4) setPollOptions([...pollOptions, ''])
  }

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) setPollOptions(pollOptions.filter((_, i) => i !== index))
  }

  const toggleTopic = (id: string) => {
    if (selectedTopics.includes(id)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== id))
    } else if (selectedTopics.length < 3) {
      setSelectedTopics([...selectedTopics, id])
    }
  }

  const handleMention = () => {
    setContent((c) => c + '@')
    setTimeout(() => contentRef.current?.focus(), 0)
  }

  const handleSubmit = async () => {
    if (!content.trim()) return
    setIsPosting(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          title: title.trim() || null,
          content: content.trim(),
          excerpt: content.trim().slice(0, 150),
          is_published: true,
        })
        .select()
        .single()

      if (postError) throw postError

      if (selectedTopics.length > 0) {
        const { error: topicError } = await supabase
          .from('post_topics')
          .insert(selectedTopics.map((topic_id) => ({ post_id: post.id, topic_id })))
        if (topicError) throw topicError
      }

      router.push(`/posts/${post.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post')
    } finally {
      setIsPosting(false)
    }
  }

  const charCount = content.length
  const charCountColor =
    charCount >= SOFT_LIMIT ? 'text-red-500' : charCount >= 1600 ? 'text-orange-500' : 'text-muted-foreground'

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const contextLine = [profile?.institution, profile?.department, profile?.level]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar user={navbarUser ?? undefined} />

      <div className="container mx-auto max-w-2xl py-6 px-4 pb-20 md:pb-6">
        {/* Header: avatar + name + visibility */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-semibold text-primary">{initials}</span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-sm leading-none">{profile?.full_name ?? '…'}</span>
            {contextLine && (
              <span className="text-xs text-muted-foreground">{contextLine}</span>
            )}
            <Select
              value={visibility}
              onValueChange={(v) => setVisibility(v as typeof visibility)}
            >
              <SelectTrigger className="h-6 text-xs px-2 py-0 w-auto border-dashed gap-1 mt-0.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="school">My School</SelectItem>
                <SelectItem value="course">My Course</SelectItem>
                <SelectItem value="group">My Group</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Composer card */}
        <Card className="border shadow-sm">
          <CardContent className="p-0">
            {/* Optional title */}
            {showTitle && (
              <div className="flex items-center gap-2 px-4 pt-4">
                <Input
                  placeholder="Add a title…"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-0 border-b rounded-none px-0 text-base font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <button
                  type="button"
                  onClick={() => { setShowTitle(false); setTitle('') }}
                  className="text-muted-foreground hover:text-foreground flex-shrink-0"
                  aria-label="Remove title"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Main textarea */}
            <Textarea
              ref={contentRef}
              placeholder="Share something with your classmates…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onInput={autoExpand}
              rows={4}
              className="resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-4 text-base min-h-[100px]"
            />

            {/* Character counter + add title toggle */}
            <div className="flex items-center justify-between px-4 pb-2">
              <button
                type="button"
                onClick={() => setShowTitle(true)}
                className={`text-xs text-muted-foreground hover:text-foreground transition ${showTitle ? 'invisible' : ''}`}
              >
                ＋ Add title
              </button>
              <span className={`text-xs tabular-nums ${charCountColor}`}>
                {charCount}/{SOFT_LIMIT}
              </span>
            </div>

            {/* Link chips */}
            {links.length > 0 && (
              <div className="flex flex-wrap gap-2 px-4 pb-3">
                {links.map((url) => (
                  <span
                    key={url}
                    className="inline-flex items-center gap-1 bg-muted text-xs px-2 py-1 rounded-full max-w-[200px]"
                  >
                    <span className="truncate">{url}</span>
                    <button type="button" onClick={() => removeLink(url)} aria-label="Remove link">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Link input */}
            {showLinkInput && (
              <div className="flex items-center gap-2 px-4 pb-3">
                <Input
                  placeholder="Paste a URL…"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink() } }}
                  className="h-8 text-sm"
                />
                <Button type="button" size="sm" variant="secondary" onClick={addLink} className="h-8">
                  Add
                </Button>
                <button
                  type="button"
                  onClick={() => { setShowLinkInput(false); setLinkInput('') }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Poll builder */}
            {showPoll && (
              <div className="px-4 pb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Poll</span>
                  <button
                    type="button"
                    onClick={() => { setShowPoll(false); setPollOptions(['', '']) }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={(e) => updatePollOption(i, e.target.value)}
                      className="h-8 text-sm"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePollOption(i)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Remove option"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 4 && (
                  <button
                    type="button"
                    onClick={addPollOption}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="w-3 h-3" /> Add option
                  </button>
                )}
              </div>
            )}

            {/* Tag picker */}
            {showTagPicker && (
              <div className="px-4 pb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Topics <span className="normal-case font-normal">({selectedTopics.length}/3)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowTagPicker(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => {
                    const selected = selectedTopics.includes(topic.id)
                    const disabled = !selected && selectedTopics.length >= 3
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => toggleTopic(topic.id)}
                        className={`px-3 py-1 rounded-full text-xs transition ${
                          selected
                            ? 'bg-primary text-primary-foreground'
                            : disabled
                            ? 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {topic.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center gap-1 px-3 py-2 border-t">
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={() => { /* file handling placeholder */ }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${showLinkInput ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setShowLinkInput((v) => !v)}
                title="Add link"
              >
                <Link2 className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${showPoll ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setShowPoll((v) => !v)}
                title="Add poll"
              >
                <BarChart2 className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={handleMention}
                title="Mention someone"
              >
                <AtSign className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${showTagPicker ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setShowTagPicker((v) => !v)}
                title="Add topics"
              >
                <Hash className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="mt-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between mt-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPosting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPosting || !content.trim()}
          >
            {isPosting ? 'Posting…' : 'Post'}
          </Button>
        </div>
      </div>

      <BottomNav username={navbarUser?.username} />
    </div>
  )
}
