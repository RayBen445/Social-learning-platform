-- LearnLoop Database Schema - Phase 7: Admin & Moderation Dashboard
-- This script adds tables for advanced moderation, content analytics, and platform insights

-- =====================================================
-- CONTENT MODERATION QUEUE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  content_type TEXT CHECK (content_type IN ('post', 'comment', 'group', 'user', 'message')),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reported_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  reason_category TEXT CHECK (reason_category IN ('inappropriate', 'spam', 'harassment', 'misinformation', 'copyright', 'other')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'escalated')) DEFAULT 'pending',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  moderator_notes TEXT,
  action_taken TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can see moderation queue" ON public.moderation_queue FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_verified = TRUE)
);

-- =====================================================
-- MODERATION ACTIONS LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_id UUID,
  target_type TEXT CHECK (target_type IN ('user', 'post', 'comment', 'group')),
  action_type TEXT CHECK (action_type IN ('warning', 'mute', 'suspend', 'ban', 'delete', 'edit')),
  reason TEXT,
  duration_days INT,
  is_permanent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can see actions" ON public.moderation_actions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_verified = TRUE)
);

-- =====================================================
-- CONTENT ANALYTICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.content_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_posts INT DEFAULT 0,
  total_comments INT DEFAULT 0,
  total_upvotes INT DEFAULT 0,
  total_users_active INT DEFAULT 0,
  new_users INT DEFAULT 0,
  top_subject TEXT,
  engagement_rate DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

ALTER TABLE public.content_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can see analytics" ON public.content_analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_verified = TRUE)
);

-- =====================================================
-- USER ANALYTICS TABLE (For admin dashboard)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_growth_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_users INT DEFAULT 0,
  active_users INT DEFAULT 0,
  new_signups INT DEFAULT 0,
  retention_rate DECIMAL(5,2),
  churn_rate DECIMAL(5,2),
  avg_session_duration INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

ALTER TABLE public.user_growth_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can see analytics" ON public.user_growth_analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_verified = TRUE)
);

-- =====================================================
-- PLATFORM HEALTH METRICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.platform_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_posts INT DEFAULT 0,
  total_comments INT DEFAULT 0,
  total_groups INT DEFAULT 0,
  total_courses INT DEFAULT 0,
  avg_post_length INT,
  most_active_hour INT,
  peak_concurrency INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

ALTER TABLE public.platform_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can see metrics" ON public.platform_metrics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_verified = TRUE)
);

-- =====================================================
-- ADMIN AUDIT LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type TEXT,
  target_type TEXT,
  target_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can see audit log" ON public.admin_audit_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_verified = TRUE)
);

-- =====================================================
-- REPORT STATISTICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.report_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_reports INT DEFAULT 0,
  resolved_reports INT DEFAULT 0,
  avg_resolution_time_hours INT,
  most_common_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

ALTER TABLE public.report_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can see statistics" ON public.report_statistics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_verified = TRUE)
);
