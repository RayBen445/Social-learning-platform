-- LearnLoop Database Schema - Part 2: Engagement Tables
-- Votes, bookmarks, follows, and related features

-- =====================================================
-- 6. POST_VOTES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.post_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Post votes are viewable by everyone" ON public.post_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote on posts" ON public.post_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own votes" ON public.post_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own votes" ON public.post_votes FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 7. COMMENT_VOTES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.comment_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comment votes are viewable by everyone" ON public.comment_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote on comments" ON public.comment_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own votes" ON public.comment_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own votes" ON public.comment_votes FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 8. BOOKMARKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can bookmark posts" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 9. FOLLOWS TABLE (for following users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow users" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow users" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- =====================================================
-- 10. TOPIC_SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.topic_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

ALTER TABLE public.topic_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subscriptions are viewable by everyone" ON public.topic_subscriptions FOR SELECT USING (true);
CREATE POLICY "Users can subscribe to topics" ON public.topic_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsubscribe from topics" ON public.topic_subscriptions FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 11. RESHARES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.reshares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE public.reshares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reshares are viewable by everyone" ON public.reshares FOR SELECT USING (true);
CREATE POLICY "Users can reshare posts" ON public.reshares FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove reshares" ON public.reshares FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for engagement tables
CREATE INDEX idx_post_votes_user_id ON public.post_votes(user_id);
CREATE INDEX idx_post_votes_post_id ON public.post_votes(post_id);
CREATE INDEX idx_comment_votes_user_id ON public.comment_votes(user_id);
CREATE INDEX idx_comment_votes_comment_id ON public.comment_votes(comment_id);
CREATE INDEX idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_following_id ON public.follows(following_id);
CREATE INDEX idx_topic_subscriptions_user_id ON public.topic_subscriptions(user_id);
CREATE INDEX idx_topic_subscriptions_topic_id ON public.topic_subscriptions(topic_id);
CREATE INDEX idx_reshares_user_id ON public.reshares(user_id);
