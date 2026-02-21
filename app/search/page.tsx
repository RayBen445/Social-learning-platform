'use client'

import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState<any>({
    posts: [],
    users: [],
    topics: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const supabase = createClient()

  useEffect(() => {
    if (query) {
      performSearch(query)
    }
  }, [query])

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults({ posts: [], users: [], topics: [] })
      return
    }

    setIsLoading(true)

    try {
      // Search posts
      const { data: posts } = await supabase
        .from('posts')
        .select('id, title, excerpt, created_at, upvote_count, user:profiles(username)')
        .eq('is_published', true)
        .or(
          `title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`
        )
        .limit(20)

      // Search users
      const { data: users } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio, is_verified')
        .or(`full_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`)
        .limit(10)

      // Search topics
      const { data: topics } = await supabase
        .from('topics')
        .select('id, name, slug, post_count')
        .ilike('name', `%${searchTerm}%`)
        .limit(10)

      setResults({
        posts: posts || [],
        users: users || [],
        topics: topics || [],
      })
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const totalResults =
    results.posts.length + results.users.length + results.topics.length

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl py-10">
        <div className="space-y-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="space-y-2">
            <h1 className="text-3xl font-bold">Search LearnLoop</h1>
            <div className="flex gap-2">
              <Input
                placeholder="Search posts, users, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow"
              />
            </div>
          </form>

          {/* Results */}
          {isLoading ? (
            <div className="text-center text-muted-foreground">
              Searching...
            </div>
          ) : query ? (
            <>
              {/* Results Summary */}
              <div className="text-sm text-muted-foreground">
                Found {totalResults} result{totalResults !== 1 ? 's' : ''} for &quot;{query}&quot;
              </div>

              {/* Tabs */}
              <div className="flex gap-4 border-b">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 ${
                    activeTab === 'all'
                      ? 'border-b-2 border-primary font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`px-4 py-2 ${
                    activeTab === 'posts'
                      ? 'border-b-2 border-primary font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  Posts ({results.posts.length})
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-2 ${
                    activeTab === 'users'
                      ? 'border-b-2 border-primary font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  Users ({results.users.length})
                </button>
                <button
                  onClick={() => setActiveTab('topics')}
                  className={`px-4 py-2 ${
                    activeTab === 'topics'
                      ? 'border-b-2 border-primary font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  Topics ({results.topics.length})
                </button>
              </div>

              {/* Posts Results */}
              {(activeTab === 'all' || activeTab === 'posts') && (
                <div className="space-y-3">
                  {results.posts.length > 0 ? (
                    results.posts.map((post: any) => (
                      <Link key={post.id} href={`/posts/${post.id}`}>
                        <Card className="hover:bg-muted/50 cursor-pointer transition">
                          <CardContent className="pt-6">
                            <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                            {post.excerpt && (
                              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                                {post.excerpt}
                              </p>
                            )}
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span>By {post.user?.username}</span>
                              <span>{post.upvote_count} upvotes</span>
                              <span>
                                {new Date(post.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="pt-6 text-center text-muted-foreground">
                        No posts found
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Users Results */}
              {(activeTab === 'all' || activeTab === 'users') && (
                <div className="space-y-3">
                  {results.users.length > 0 ? (
                    results.users.map((user: any) => (
                      <Link key={user.id} href={`/profile/${user.username}`}>
                        <Card className="hover:bg-muted/50 cursor-pointer transition">
                          <CardContent className="pt-6">
                            <div className="flex gap-4 items-start">
                              <div className="h-12 w-12 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                                {user.avatar_url ? (
                                  <img
                                    src={user.avatar_url}
                                    alt={user.full_name || user.username}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                                    {user.username.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold">
                                    {user.full_name || user.username}
                                  </span>
                                  {user.is_verified && (
                                    <span className="text-blue-600 text-sm">✓</span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  @{user.username}
                                </p>
                                {user.bio && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {user.bio}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="pt-6 text-center text-muted-foreground">
                        No users found
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Topics Results */}
              {(activeTab === 'all' || activeTab === 'topics') && (
                <div className="space-y-3">
                  {results.topics.length > 0 ? (
                    results.topics.map((topic: any) => (
                      <Link key={topic.id} href={`/topics/${topic.slug}`}>
                        <Card className="hover:bg-muted/50 cursor-pointer transition">
                          <CardContent className="pt-6">
                            <h3 className="font-bold text-lg mb-1">{topic.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {topic.post_count} posts
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="pt-6 text-center text-muted-foreground">
                        No topics found
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>Enter a search term to get started</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
