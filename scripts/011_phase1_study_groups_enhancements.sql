-- LearnLoop Database Schema - Phase 1: Study Groups Enhancements
-- This script adds enhancements for study groups, schedules, and resources

-- =====================================================
-- STUDY GROUP SCHEDULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.group_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INT DEFAULT 60,
  session_type TEXT CHECK (session_type IN ('study', 'discussion', 'project', 'exam_prep', 'other')),
  location TEXT,
  is_virtual BOOLEAN DEFAULT TRUE,
  meeting_link TEXT,
  max_participants INT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.group_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group schedules viewable by members" ON public.group_schedules FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_schedules.group_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.groups WHERE id = group_schedules.group_id AND created_by = auth.uid())
);

CREATE POLICY "Group admins can manage schedules" ON public.group_schedules FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND created_by = auth.uid())
);

-- =====================================================
-- GROUP SCHEDULE RSVPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.group_schedule_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.group_schedules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('interested', 'attending', 'maybe', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(schedule_id, user_id)
);

ALTER TABLE public.group_schedule_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see RSVPs for their groups" ON public.group_schedule_rsvps FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = (SELECT group_id FROM public.group_schedules WHERE id = schedule_id) AND user_id = auth.uid())
);

-- =====================================================
-- GROUP RESOURCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.group_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT CHECK (resource_type IN ('document', 'link', 'video', 'textbook', 'notes', 'other')),
  resource_url TEXT,
  file_key TEXT,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  download_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.group_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resources viewable by group members" ON public.group_resources FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_resources.group_id AND user_id = auth.uid())
);

CREATE POLICY "Members can upload resources" ON public.group_resources FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_resources.group_id AND user_id = auth.uid())
);

-- =====================================================
-- GROUP ANNOUNCEMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.group_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.group_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Announcements viewable by members" ON public.group_announcements FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_announcements.group_id AND user_id = auth.uid())
);

-- =====================================================
-- GROUP ACTIVITY FEED TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.group_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT CHECK (activity_type IN ('joined', 'left', 'posted', 'commented', 'resource_added', 'schedule_created', 'announcement_created')),
  subject_id UUID,
  subject_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.group_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activities viewable by members" ON public.group_activities FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_activities.group_id AND user_id = auth.uid())
);

-- =====================================================
-- GROUP MEMBER ROLES TABLE (for enhanced permissions)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.group_member_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'moderator', 'member')) DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.group_member_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Roles viewable by group members" ON public.group_member_roles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_member_roles.group_id AND user_id = auth.uid())
);
