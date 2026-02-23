import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import PostVoteButton from '@/components/posts/post-vote-button'
import CommentSection from '@/components/posts/comment-section'
import BookmarkButton from '@/components/posts/bookmark-button'
import ShareButton from '@/components/posts/share-button'
import { VerifiedBadge } from '@/components/users/verified-badge'
import { Suspense } from 'react'
import { AppNavbar } from '@/components/app-navbar'

interface PostPageProps {
  params: Promise<{
    id: string
  }>
}

function PostLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl py-10">
        {/* Article skeleton */}
        <div className="mb-8 space-y-4">
          <div className="h-10 w-3/4 bg-muted animate-pulse rounded" />
          <div className="h-5 w-1/2 bg-muted animate-pulse rounded" />
          <div className="flex items-center gap-3 py-4 border-y">
            <div className="h-12 w-12 rounded-full bg-muted animate-pulse flex-shrink-0" />
            <div className="space-y-2">
              <div className="h-4 w-28 bg-muted animate-pulse rounded" />
              <div className="h-3 w-40 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="space-y-3 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
        {/* Comments skeleton */}
        <div className="space-y-4">
          <div className="h-8 w-40 bg-muted animate-pulse rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg border" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function PostPage({ params }: PostPageProps) {
  return (
    <Suspense fallback={<PostLoading />}>
      <PostContent params={params} />
    </Suspense>
  )
}

async function PostContent({ params }: PostPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch post
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select(
      `
      *,
      user:profiles(id, username, full_name, avatar_url, is_verified),
      post_topics(
        topics(id, name, slug)
      )
    `
    )
    .eq('id', id)
    .single()

  if (postError || !post) {
    notFound()
  }

  // Fetch comments
  const { data: comments } = await supabase
    .from('comments')
    .select(
      `
      *,
      user:profiles(id, username, full_name, avatar_url, is_verified),
      comment_votes(vote_type)
    `
    )
    .eq('post_id', id)
    .is('parent_comment_id', null)
    .order('created_at', { ascending: false })

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  const { data: currentProfile } = currentUser
    ? await supabase.from('profiles').select('username, full_name, avatar_url').eq('id', currentUser.id).single()
    : { data: null }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar user={currentProfile ?? undefined} />
      <div className="container mx-auto max-w-3xl py-10">
        {/* Post Header */}
        <article className="mb-8">
          <div className="mb-4 space-y-2">
            <h1 className="text-4xl font-bold">{post.title}</h1>
            {post.excerpt && <p className="text-lg text-muted-foreground">{post.excerpt}</p>}
          </div>

          {/* Author Info */}
          <div className="flex items-center gap-3 py-4 border-y">
            <div className="h-12 w-12 rounded-full bg-muted overflow-hidden">
              {post.user?.avatar_url ? (
                <img
                  src={post.user.avatar_url}
                  alt={post.user.full_name || post.user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                  {post.user?.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${post.user?.username}`}
                  className="font-bold hover:underline"
                >
                  {post.user?.full_name || post.user?.username}
                </Link>
                {post.user?.is_verified && (
                  <VerifiedBadge verificationType={post.user.verification_type} />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                @{post.user?.username} · {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none py-8">
            <p>{post.content}</p>
          </div>

          {/* Topics */}
          {post.post_topics && post.post_topics.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {post.post_topics.map((pt: any) => (
                <Link
                  key={pt.topics.id}
                  href={`/topics/${pt.topics.slug}`}
                  className="rounded-full bg-muted px-3 py-1 text-sm hover:bg-muted/80"
                >
                  {pt.topics.name}
                </Link>
              ))}
            </div>
          )}

          {/* Stats and Actions */}
          <div className="flex flex-wrap gap-4 items-center border-t py-4">
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>{post.upvote_count} upvotes</span>
              <span>{post.comment_count} comments</span>
              <span>{post.view_count} views</span>
            </div>

            <div className="flex-grow" />

            <div className="flex gap-2">
              <PostVoteButton postId={id} currentUser={currentUser} />
              <BookmarkButton postId={id} currentUser={currentUser} />
              <ShareButton postId={id} postTitle={post.title} />
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Comments ({post.comment_count})</h2>

          {currentUser ? (
            <CommentSection postId={id} currentUser={currentUser} />
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">Sign in to comment</p>
                <Button asChild>
                  <Link href="/auth/login">Log In</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments && comments.length > 0 ? (
              comments.map((comment: any) => (
                <Card key={comment.id}>
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                        {comment.user?.avatar_url ? (
                          <img
                            src={comment.user.avatar_url}
                            alt={comment.user.full_name || comment.user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                            {comment.user?.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/profile/${comment.user?.username}`}
                            className="font-bold hover:underline"
                          >
                            {comment.user?.full_name || comment.user?.username}
                          </Link>
                          {comment.user?.is_verified && (
                            <VerifiedBadge verificationType={comment.user.verification_type} size="xs" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-2">{comment.content}</p>
                        <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                          <button className="hover:text-foreground">👍 {comment.upvote_count}</button>
                          <button className="hover:text-foreground">👎 {comment.downvote_count}</button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No comments yet. Be the first to comment!
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PostPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('title, excerpt')
    .eq('id', id)
    .single()

  return {
    title: post?.title ? `${post.title} - LearnLoop` : 'LearnLoop',
    description: post?.excerpt || '',
  }
}
