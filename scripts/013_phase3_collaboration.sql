-- LearnLoop Database Schema - Phase 3: Study Buddy Matching & Live Collaboration
-- This script adds tables for study buddy matching, live rooms, and peer tutoring

-- =====================================================
-- STUDY BUDDY MATCHING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.study_buddy_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  subjects TEXT[] DEFAULT ARRAY[]::TEXT[],
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  preferred_study_time TEXT[],
  learning_style TEXT[] DEFAULT ARRAY[]::TEXT[],
  timezone TEXT,
  bio TEXT,
  looking_for_tutoring BOOLEAN DEFAULT FALSE,
  available_to_tutor BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.study_buddy_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Preferences visible to user" ON public.study_buddy_preferences FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.study_buddy_connections WHERE (requester_id = auth.uid() OR recipient_id = auth.uid())));

-- =====================================================
-- STUDY BUDDY CONNECTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.study_buddy_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('requested', 'accepted', 'declined', 'blocked')) DEFAULT 'requested',
  common_subjects TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, recipient_id),
  CHECK (requester_id != recipient_id)
);

ALTER TABLE public.study_buddy_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their connections" ON public.study_buddy_connections FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

-- =====================================================
-- LIVE STUDY ROOMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.live_study_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_name TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  room_type TEXT CHECK (room_type IN ('study_session', 'discussion', 'tutoring', 'group_project', 'exam_prep')),
  max_participants INT DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  video_enabled BOOLEAN DEFAULT TRUE,
  audio_enabled BOOLEAN DEFAULT TRUE,
  whiteboard_enabled BOOLEAN DEFAULT TRUE,
  screen_share_enabled BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.live_study_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active rooms viewable by everyone" ON public.live_study_rooms FOR SELECT USING (is_active = TRUE);

-- =====================================================
-- LIVE ROOM PARTICIPANTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.live_room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.live_study_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INT,
  UNIQUE(room_id, user_id)
);

ALTER TABLE public.live_room_participants ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PEER TUTORING REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tutoring_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  description TEXT,
  preferred_tutor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  budget_xp INT,
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.tutoring_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Requests visible to student and tutors" ON public.tutoring_requests FOR SELECT USING (
  auth.uid() = student_id OR 
  status = 'open' OR
  (EXISTS (SELECT 1 FROM public.tutoring_assignments WHERE request_id = tutoring_requests.id AND tutor_id = auth.uid()))
);

-- =====================================================
-- TUTORING ASSIGNMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tutoring_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.tutoring_requests(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')) DEFAULT 'pending',
  completion_notes TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(request_id, tutor_id)
);

ALTER TABLE public.tutoring_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assignments visible to involved users" ON public.tutoring_assignments FOR SELECT USING (
  auth.uid() = tutor_id OR 
  EXISTS (SELECT 1 FROM public.tutoring_requests WHERE id = request_id AND student_id = auth.uid())
);
