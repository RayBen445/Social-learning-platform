import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import CommentSection from '@/components/posts/comment-section'
import BookmarkButton from '@/components/posts/bookmark-button'
import ShareButton from '@/components/posts/share-button'
import ReportPostButton from '@/components/posts/report-post-button'
import { VerifiedBadge } from '@/components/users/verified-badge'
import { Suspense } from 'react'
import { AppNavbar } from '@/components/app-navbar'
import { BottomNav } from '@/components/bottom-nav'
import { DeletePostButton } from '@/components/posts/delete-post-button'
import { PostBody } from '@/components/posts/post-body'
import { Pencil, Trash2, MoreHorizontal, MessageCircle, Bookmark, Share2, Flag, Eye } from 'lucide-react'

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
      user:profiles(id, username, full_name, avatar_url, is_verified, verification_type, institution, department, level),
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
      user:profiles(id, username, full_name, avatar_url, is_verified, verification_type)
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

  const isOwnPost = currentUser?.id === post.user?.id

  const editWindowMinutes = 30
  const postAgeMs = Date.now() - new Date(post.created_at).getTime()
  const canEdit = isOwnPost && postAgeMs < editWindowMinutes * 60 * 1000

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AppNavbar user={currentProfile ?? undefined} />
      <div className="container mx-auto max-w-3xl px-4 py-8">
        {/* Post Article */}
        <article className="mb-8">
          {/* Post Header */}
          <div className="flex items-start gap-3 mb-6">
            {/* Clickable avatar */}
            <Link href={`/profile/${post.user?.username}`} className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-muted overflow-hidden border-2 border-border">
                {post.user?.avatar_url ? (
                  <img src={post.user.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {post.user?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </Link>

            <div className="flex-grow min-w-0">
              {/* Name + badge row */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link href={`/profile/${post.user?.username}`} className="font-semibold hover:underline text-sm">
                  {post.user?.full_name || post.user?.username}
                </Link>
                {post.user?.is_verified && (
                  <VerifiedBadge verificationType={post.user.verification_type} size="xs" />
                )}
              </div>
              {/* Academic context */}
              {(post.user?.institution || post.user?.department || post.user?.level) && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {[post.user?.institution, post.user?.department, post.user?.level].filter(Boolean).join(' · ')}
                </p>
              )}
              {/* Timestamp */}
              <p className="text-xs text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Poster-only controls (top right) */}
            {isOwnPost && (
              <div className="flex items-center gap-1 flex-shrink-0">
                {canEdit && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/posts/${post.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                )}
                <DeletePostButton postId={post.id} />
              </div>
            )}
          </div>

          {/* Post Title */}
          {post.title && <h1 className="text-2xl font-bold mb-4 leading-tight">{post.title}</h1>}

          {/* Post Body */}
          {isOwnPost ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {post.content.split('\n').map((p: string, i: number) =>
                p.trim() ? <p key={i} className="mb-3 leading-relaxed">{p}</p> : <br key={i} />
              )}
            </div>
          ) : (
            <PostBody content={post.content} />
          )}

          {/* Topic Tags */}
          {post.post_topics && post.post_topics.length > 0 && (
            <div className="mt-6 mb-2 flex flex-wrap gap-2">
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

          {/* Post Footer */}
          {isOwnPost ? (
            <div className="flex items-center justify-between border-t border-b py-3 mt-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" /> {post.comment_count} replies
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" /> {post.view_count} views
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BookmarkButton postId={id} currentUser={currentUser} />
                <ShareButton postId={id} postTitle={post.title || ''} />
                {canEdit && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/posts/${post.id}/edit`}>
                      <Pencil className="h-4 w-4 mr-1" />Edit
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between border-t border-b py-3 mt-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MessageCircle className="h-4 w-4" /> {post.comment_count} replies
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BookmarkButton postId={id} currentUser={currentUser} />
                <ShareButton postId={id} postTitle={post.title || ''} />
                <ReportPostButton postId={id} postAuthorId={post.user?.id ?? ''} />
              </div>
            </div>
          )}
        </article>

        {/* Comments Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Discussion ({post.comment_count})</h2>

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
              comments.map((comment: any) => {
                const isPostAuthorComment = comment.user?.id === post.user?.id
                return (
                  <Card
                    key={comment.id}
                    className={isPostAuthorComment ? 'bg-primary/5 border-l-2 border-primary' : ''}
                  >
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
                            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                              {comment.user?.username?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href={`/profile/${comment.user?.username}`}
                              className="font-semibold hover:underline text-sm"
                            >
                              {comment.user?.full_name || comment.user?.username}
                            </Link>
                            {comment.user?.is_verified && (
                              <VerifiedBadge verificationType={comment.user.verification_type} size="xs" />
                            )}
                            {isPostAuthorComment && (
                              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                                Author
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed">{comment.content}</p>
                          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                            <button className="hover:text-foreground">Reply</button>
                            {isOwnPost && (
                              <button className="hover:text-foreground flex items-center gap-1">
                                👍 Helpful
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
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
      <BottomNav username={currentProfile?.username} />
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
