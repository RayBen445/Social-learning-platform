-- LearnLoop Database Schema - Phase 6: User Experience Improvements
-- This script adds tables for advanced notifications, email digests, and enhanced profiles

-- =====================================================
-- NOTIFICATION PREFERENCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  -- Post & Comment Notifications
  notify_on_post_reply BOOLEAN DEFAULT TRUE,
  notify_on_comment_reply BOOLEAN DEFAULT TRUE,
  notify_on_upvote BOOLEAN DEFAULT TRUE,
  notify_on_mention BOOLEAN DEFAULT TRUE,
  -- Group Notifications
  notify_on_group_update BOOLEAN DEFAULT TRUE,
  notify_on_schedule BOOLEAN DEFAULT TRUE,
  notify_on_resource BOOLEAN DEFAULT TRUE,
  -- Social Notifications
  notify_on_new_follower BOOLEAN DEFAULT TRUE,
  notify_on_friend_post BOOLEAN DEFAULT TRUE,
  -- Learning Notifications
  notify_on_challenge BOOLEAN DEFAULT TRUE,
  notify_on_goal_milestone BOOLEAN DEFAULT TRUE,
  -- Message Notifications
  notify_on_direct_message BOOLEAN DEFAULT TRUE,
  -- Email Digest
  enable_email_digest BOOLEAN DEFAULT TRUE,
  digest_frequency TEXT CHECK (digest_frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  -- Do not disturb
  dnd_enabled BOOLEAN DEFAULT FALSE,
  dnd_start_time TIME,
  dnd_end_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences" ON public.notification_preferences FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- EMAIL DIGESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.email_digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sent_date DATE NOT NULL,
  digest_type TEXT CHECK (digest_type IN ('daily', 'weekly', 'biweekly', 'monthly')),
  subject TEXT,
  content_summary TEXT,
  post_count INT DEFAULT 0,
  engagement_count INT DEFAULT 0,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, sent_date, digest_type)
);

ALTER TABLE public.email_digests ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TOPIC SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.topic_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_muted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

ALTER TABLE public.topic_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own subscriptions" ON public.topic_subscriptions FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- SUBJECT EXPERTISE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.subject_expertise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_of_study INT,
  verified BOOLEAN DEFAULT FALSE,
  help_count INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subject)
);

ALTER TABLE public.subject_expertise ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Expertise visible to everyone" ON public.subject_expertise FOR SELECT USING (true);

-- =====================================================
-- ENHANCED PROFILES TABLE (User additional fields)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profile_extra_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  headline TEXT,
  expertise_tags TEXT[],
  interests TEXT[],
  social_links JSONB,
  theme_preference TEXT CHECK (theme_preference IN ('light', 'dark', 'auto')) DEFAULT 'auto',
  language_preference TEXT DEFAULT 'en',
  newsletter_subscribed BOOLEAN DEFAULT TRUE,
  public_profile BOOLEAN DEFAULT TRUE,
  show_online_status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profile_extra_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can update own fields" ON public.profile_extra_fields FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- USER ACTIVITY LOG (for feed/trending)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT CHECK (activity_type IN ('post_created', 'post_upvoted', 'comment_created', 'goal_completed', 'badge_earned', 'challenge_completed', 'joined_group', 'made_connection')),
  subject_id UUID,
  subject_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activities viewable by followers" ON public.user_activity_log FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.followers WHERE following_id = user_id AND follower_id = auth.uid())
);
