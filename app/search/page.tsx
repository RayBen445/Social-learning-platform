'use client'

import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { AppNavbar } from '@/components/app-navbar'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Search, Users, FileText, Tag, X, Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function SearchContent() {
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
  const [userProfile, setUserProfile] = useState<any>(null)
  
  // Filter states
  const [filters, setFilters] = useState({
    filterType: 'all', // all, posts, users, topics
    sortBy: 'recent', // recent, trending, oldest
    dateRange: 'any', // any, week, month, year
  })
  
  const supabase = createClient()

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', user.id)
          .single()
        setUserProfile(profile)
      }
    }
    fetchProfile()
  }, [])

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
      const now = new Date()
      let dateFilter = new Date()
      
      // Apply date filter
      switch(filters.dateRange) {
        case 'week':
          dateFilter.setDate(dateFilter.getDate() - 7)
          break
        case 'month':
          dateFilter.setMonth(dateFilter.getMonth() - 1)
          break
        case 'year':
          dateFilter.setFullYear(dateFilter.getFullYear() - 1)
          break
        default:
          dateFilter = new Date('1970-01-01')
      }

      // Search posts
      let postQuery = supabase
        .from('posts')
        .select('id, title, excerpt, created_at, upvote_count, user:profiles(username, avatar_url)')
        .eq('is_published', true)
        .or(
          `title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`
        )
        .gte('created_at', dateFilter.toISOString())

      if(filters.sortBy === 'trending') {
        postQuery = postQuery.order('upvote_count', { ascending: false })
      } else if(filters.sortBy === 'oldest') {
        postQuery = postQuery.order('created_at', { ascending: true })
      } else {
        postQuery = postQuery.order('created_at', { ascending: false })
      }
      
      const { data: posts } = await postQuery.limit(20)

      // Search users
      const { data: users } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio, is_verified, total_followers')
        .or(`full_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`)
        .order('total_followers', { ascending: false })
        .limit(10)

      // Search topics
      const { data: topics } = await supabase
        .from('topics')
        .select('id, name, slug, post_count')
        .ilike('name', `%${searchTerm}%`)
        .order('post_count', { ascending: false })
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
      <AppNavbar user={userProfile} />
      
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Filter Type */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  <h3 className="font-bold text-lg">Filters</h3>
                </div>
                
                <div className="space-y-2">
                  {['all', 'posts', 'users', 'topics'].map((type) => (
                    <Label key={type} className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded">
                      <Checkbox
                        checked={filters.filterType === type}
                        onCheckedChange={() => setFilters({ ...filters, filterType: type })}
                      />
                      <span className="capitalize font-medium">{type === 'all' ? 'All Results' : type}</span>
                    </Label>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="space-y-3">
                <h4 className="font-bold">Sort By</h4>
                <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="trending">Most Trending</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <h4 className="font-bold">Date Range</h4>
                <Select value={filters.dateRange} onValueChange={(value) => setFilters({ ...filters, dateRange: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Time</SelectItem>
                    <SelectItem value="week">Past Week</SelectItem>
                    <SelectItem value="month">Past Month</SelectItem>
                    <SelectItem value="year">Past Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Filters */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ filterType: 'all', sortBy: 'recent', dateRange: 'any' })}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="space-y-2">
              <h1 className="text-4xl font-bold">Search</h1>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Posts, users, topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">Search</Button>
              </div>
            </form>

            {/* Results */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin inline-block h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                <p className="text-muted-foreground">Searching...</p>
              </div>
            ) : query ? (
              <>
                {/* Results Summary */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Found <span className="font-bold text-foreground">{totalResults}</span> result{totalResults !== 1 ? 's' : ''} for &quot;<span className="font-bold">{query}</span>&quot;
                  </div>
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
                        <Card className="hover:border-primary hover:shadow-md cursor-pointer transition border-2">
                          <CardContent className="p-4">
                            <div className="flex gap-3">
                              {post.user?.avatar_url && (
                                <img
                                  src={post.user.avatar_url}
                                  alt={post.user.username}
                                  className="h-10 w-10 rounded-full flex-shrink-0"
                                />
                              )}
                              <div className="flex-grow min-w-0">
                                <h3 className="font-bold text-base mb-1 line-clamp-1">{post.title}</h3>
                                {post.excerpt && (
                                  <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                                    {post.excerpt}
                                  </p>
                                )}
                                <div className="flex gap-3 text-xs text-muted-foreground">
                                  <span className="font-medium">@{post.user?.username}</span>
                                  <span>👍 {post.upvote_count}</span>
                                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="py-8 text-center">
                        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="text-muted-foreground">No posts found</p>
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
    </div>
  )
}

function SearchLoadingFallback() {
  return (
    <div className="flex min-h-screen w-full flex-col p-4 md:p-10">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded dark:bg-gray-800 animate-pulse w-1/3" />
        </div>
        <div className="h-10 bg-gray-200 rounded dark:bg-gray-800 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoadingFallback />}>
      <SearchContent />
    </Suspense>
  )
}
