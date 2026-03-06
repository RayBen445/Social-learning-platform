-- LearnLoop Database Schema - Phase 8: Real-Time Collaboration & Q&A
-- This script adds tables for group chat, Q&A system, and discussion forums

-- =====================================================
-- GROUP CHAT MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'file', 'poll', 'system')) DEFAULT 'text',
  file_url TEXT,
  file_name TEXT,
  mentions UUID[],
  edited_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  reaction_count INT DEFAULT 0,
  reply_to_id UUID REFERENCES public.group_messages(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Messages viewable by group members" ON public.group_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid())
);

-- =====================================================
-- MESSAGE REACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.group_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Q&A QUESTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.qa_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  subject TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  tags TEXT[],
  is_published BOOLEAN DEFAULT TRUE,
  view_count INT DEFAULT 0,
  answer_count INT DEFAULT 0,
  upvote_count INT DEFAULT 0,
  best_answer_id UUID,
  solved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.qa_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Questions viewable if published" ON public.qa_questions FOR SELECT USING (is_published = TRUE OR auth.uid() = user_id);

-- =====================================================
-- Q&A ANSWERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.qa_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.qa_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_best_answer BOOLEAN DEFAULT FALSE,
  helpful_count INT DEFAULT 0,
  unhelpful_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.qa_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Answers viewable with question" ON public.qa_answers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.qa_questions WHERE id = question_id AND is_published = TRUE)
);

-- =====================================================
-- ANSWER RATINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.answer_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID NOT NULL REFERENCES public.qa_answers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INT CHECK (rating IN (-1, 1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(answer_id, user_id)
);

ALTER TABLE public.answer_ratings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- DISCUSSION FORUMS TABLE (Subject-based)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.discussion_forums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  moderator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  icon_url TEXT,
  member_count INT DEFAULT 0,
  thread_count INT DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(subject)
);

ALTER TABLE public.discussion_forums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Forums viewable by everyone" ON public.discussion_forums FOR SELECT USING (is_archived = FALSE);

-- =====================================================
-- DISCUSSION THREADS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.discussion_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id UUID NOT NULL REFERENCES public.discussion_forums(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  upvote_count INT DEFAULT 0,
  last_reply_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.discussion_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Threads viewable unless locked" ON public.discussion_threads FOR SELECT USING (
  is_locked = FALSE OR EXISTS (SELECT 1 FROM public.discussion_forums WHERE id = forum_id AND moderator_id = auth.uid())
);

-- =====================================================
-- DISCUSSION REPLIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.discussion_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvote_count INT DEFAULT 0,
  is_marked_helpful BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Replies viewable with thread" ON public.discussion_replies FOR SELECT USING (true);

-- =====================================================
-- FORUM SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.forum_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  forum_id UUID NOT NULL REFERENCES public.discussion_forums(id) ON DELETE CASCADE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_muted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, forum_id)
);

ALTER TABLE public.forum_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own subscriptions" ON public.forum_subscriptions FOR SELECT USING (auth.uid() = user_id);
