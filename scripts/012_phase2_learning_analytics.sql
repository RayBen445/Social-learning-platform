-- LearnLoop Database Schema - Phase 2: Learning Analytics & Progress Tracking
-- This script adds tables for tracking user progress, study streaks, and learning analytics

-- =====================================================
-- USER STUDY SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT,
  duration_minutes INT NOT NULL,
  focus_score INT CHECK (focus_score >= 0 AND focus_score <= 100),
  efficiency_score INT CHECK (efficiency_score >= 0 AND efficiency_score <= 100),
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own study sessions" ON public.study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create study sessions" ON public.study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own study sessions" ON public.study_sessions FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- STUDY STREAKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.study_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_session_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.study_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own streak" ON public.study_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own streak" ON public.study_streaks FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- LEARNING GOALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  target_date DATE NOT NULL,
  status TEXT CHECK (status IN ('active', 'completed', 'abandoned')) DEFAULT 'active',
  progress_percentage INT DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own goals" ON public.learning_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create goals" ON public.learning_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.learning_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.learning_goals FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- USER COURSE PROGRESS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_percentage INT DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  total_lessons INT DEFAULT 0,
  completed_lessons INT DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('enrolled', 'in_progress', 'completed', 'archived')) DEFAULT 'enrolled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own progress" ON public.course_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.course_progress FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- DAILY STUDY CHALLENGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  objective TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  xp_reward INT DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges viewable by everyone" ON public.daily_challenges FOR SELECT USING (true);

-- =====================================================
-- USER CHALLENGE PROGRESS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  completed_at TIMESTAMP WITH TIME ZONE,
  xp_earned INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own progress" ON public.user_challenge_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_challenge_progress FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- USER ANALYTICS SUMMARY TABLE (for performance)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  total_study_hours INT DEFAULT 0,
  total_sessions INT DEFAULT 0,
  average_session_duration INT DEFAULT 0,
  topics_studied INT DEFAULT 0,
  avg_focus_score INT DEFAULT 0,
  preferred_study_time TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own analytics" ON public.user_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own analytics" ON public.user_analytics FOR UPDATE USING (auth.uid() = user_id);
