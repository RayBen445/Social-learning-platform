-- LearnLoop Database Schema - Phase 5: Course Content & Learning Paths
-- This script adds tables for course structures, syllabi, and learning paths

-- =====================================================
-- COURSE CHAPTERS/MODULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INT NOT NULL,
  duration_minutes INT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published modules viewable" ON public.course_modules FOR SELECT USING (is_published = TRUE OR EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND created_by = auth.uid()));

-- =====================================================
-- COURSE LESSONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('video', 'text', 'interactive', 'quiz', 'assignment')),
  video_url TEXT,
  estimated_duration_minutes INT,
  order_index INT NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published lessons viewable" ON public.course_lessons FOR SELECT USING (is_published = TRUE OR EXISTS (SELECT 1 FROM public.course_modules cm JOIN public.courses c ON cm.course_id = c.id WHERE cm.id = module_id AND c.created_by = auth.uid()));

-- =====================================================
-- LESSON PROGRESS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  completion_percentage INT DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own progress" ON public.lesson_progress FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- LEARNING PATHS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration_weeks INT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT FALSE,
  follower_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published paths viewable" ON public.learning_paths FOR SELECT USING (is_published = TRUE OR auth.uid() = created_by);

-- =====================================================
-- LEARNING PATH COURSES (Junction)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.path_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  order_index INT NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(path_id, course_id)
);

ALTER TABLE public.path_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Path courses viewable with path" ON public.path_courses FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.learning_paths WHERE id = path_id AND (is_published = TRUE OR created_by = auth.uid()))
);

-- =====================================================
-- USER LEARNING PATH ENROLLMENT
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_path_enrollment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_percentage INT DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  status TEXT CHECK (status IN ('enrolled', 'in_progress', 'completed', 'abandoned')) DEFAULT 'enrolled',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, path_id)
);

ALTER TABLE public.user_path_enrollment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own enrollments" ON public.user_path_enrollment FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- SUBJECT RESOURCE LIBRARIES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.subject_libraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  resource_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subject_libraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Libraries viewable by everyone" ON public.subject_libraries FOR SELECT USING (true);

-- =====================================================
-- SUBJECT RESOURCES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.subject_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID NOT NULL REFERENCES public.subject_libraries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  resource_url TEXT,
  resource_type TEXT CHECK (resource_type IN ('textbook', 'video', 'article', 'tool', 'practice_problem', 'other')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subject_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resources viewable by everyone" ON public.subject_resources FOR SELECT USING (true);
