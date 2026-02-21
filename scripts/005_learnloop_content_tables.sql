-- LearnLoop Database Schema - Part 5: Content Organization Tables

-- =====================================================
-- 19. COLLECTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  cover_image_url TEXT,
  post_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public collections are viewable" ON public.collections FOR SELECT USING (
  is_public = true OR auth.uid() = user_id
);
CREATE POLICY "Users can create collections" ON public.collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own collections" ON public.collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own collections" ON public.collections FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 20. COLLECTION_POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.collection_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  order_index INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, post_id)
);

ALTER TABLE public.collection_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collection posts follow collection visibility" ON public.collection_posts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND (c.is_public = true OR c.user_id = auth.uid()))
);
CREATE POLICY "Users can manage their collection posts" ON public.collection_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND c.user_id = auth.uid())
);

-- =====================================================
-- 21. SERIES_TABLE (for organizing posts as series/threads)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  post_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Series are viewable by everyone" ON public.series FOR SELECT USING (true);
CREATE POLICY "Users can create series" ON public.series FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own series" ON public.series FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own series" ON public.series FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 22. SERIES_POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.series_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  part_number INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(series_id, post_id),
  UNIQUE(series_id, part_number)
);

ALTER TABLE public.series_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Series posts are viewable by everyone" ON public.series_posts FOR SELECT USING (true);
CREATE POLICY "Series owners can manage posts" ON public.series_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.series s WHERE s.id = series_id AND s.user_id = auth.uid())
);

-- =====================================================
-- 23. POST_TAGS TABLE (for advanced tagging beyond topics)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.post_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  tag_category TEXT CHECK (tag_category IN ('subject', 'difficulty', 'resource_type', 'custom')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, tag_name, tag_category)
);

ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Post tags are viewable by everyone" ON public.post_tags FOR SELECT USING (true);
CREATE POLICY "Post owners can manage tags" ON public.post_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.user_id = auth.uid())
);

-- =====================================================
-- 24. MENTIONS TABLE (for tracking @mentions)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentioned_by_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL)
);

ALTER TABLE public.mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentions are viewable by everyone" ON public.mentions FOR SELECT USING (true);
CREATE POLICY "Users can create mentions" ON public.mentions FOR INSERT WITH CHECK (auth.uid() = mentioned_by_user_id);

-- Create indexes for content organization tables
CREATE INDEX idx_collections_user_id ON public.collections(user_id);
CREATE INDEX idx_collection_posts_collection_id ON public.collection_posts(collection_id);
CREATE INDEX idx_collection_posts_post_id ON public.collection_posts(post_id);
CREATE INDEX idx_series_user_id ON public.series(user_id);
CREATE INDEX idx_series_posts_series_id ON public.series_posts(series_id);
CREATE INDEX idx_series_posts_post_id ON public.series_posts(post_id);
CREATE INDEX idx_post_tags_post_id ON public.post_tags(post_id);
CREATE INDEX idx_post_tags_tag_name ON public.post_tags(tag_name);
CREATE INDEX idx_mentions_mentioned_user_id ON public.mentions(mentioned_user_id);
CREATE INDEX idx_mentions_post_id ON public.mentions(post_id);
CREATE INDEX idx_mentions_comment_id ON public.mentions(comment_id);
