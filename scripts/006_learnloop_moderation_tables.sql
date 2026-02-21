-- LearnLoop Database Schema - Part 6: Moderation & Blocking Tables

-- =====================================================
-- 25. BLOCKED_USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own blocks" ON public.blocked_users FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "Users can block users" ON public.blocked_users FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "Users can unblock users" ON public.blocked_users FOR DELETE USING (auth.uid() = blocker_id);

-- =====================================================
-- 26. REPORTS TABLE (for content reporting)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'hate_speech', 'inappropriate_content', 'misinformation', 'copyright', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL OR reported_user_id IS NOT NULL)
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own reports" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Admins can see all reports" ON public.reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_verified = TRUE)
);
CREATE POLICY "Users can report content" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- =====================================================
-- 27. MUTED_TOPICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.muted_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

ALTER TABLE public.muted_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own muted topics" ON public.muted_topics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can mute topics" ON public.muted_topics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unmute topics" ON public.muted_topics FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 28. MUTED_USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.muted_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  muted_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, muted_user_id),
  CHECK (user_id != muted_user_id)
);

ALTER TABLE public.muted_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own muted users" ON public.muted_users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can mute users" ON public.muted_users FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unmute users" ON public.muted_users FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 29. FLAG_COMMENTS TABLE (for flagging inappropriate comments)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.flag_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  flagger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, flagger_id)
);

ALTER TABLE public.flag_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can flag comments" ON public.flag_comments FOR INSERT WITH CHECK (auth.uid() = flagger_id);

-- Create indexes for moderation tables
CREATE INDEX idx_blocked_users_blocker_id ON public.blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked_id ON public.blocked_users(blocked_id);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX idx_muted_topics_user_id ON public.muted_topics(user_id);
CREATE INDEX idx_muted_users_user_id ON public.muted_users(user_id);
CREATE INDEX idx_flag_comments_comment_id ON public.flag_comments(comment_id);
