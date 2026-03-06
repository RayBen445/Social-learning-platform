-- LearnLoop Database Schema - Phase 4: Gamification Expansion
-- This script enhances gamification with badges, weekly challenges, and leaderboards

-- =====================================================
-- BADGES TABLE (Enhanced)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  badge_category TEXT CHECK (badge_category IN ('achievement', 'streak', 'learning', 'community', 'expert')),
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  requirement_type TEXT CHECK (requirement_type IN ('count', 'streak', 'score', 'milestone')),
  requirement_value INT,
  xp_reward INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges viewable by everyone" ON public.badges FOR SELECT USING (true);

-- =====================================================
-- USER BADGES TABLE (Enhanced)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- WEEKLY CHALLENGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  objectives TEXT[] DEFAULT ARRAY[]::TEXT[],
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  xp_reward INT DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(week_start)
);

ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges viewable by everyone" ON public.weekly_challenges FOR SELECT USING (true);

-- =====================================================
-- USER WEEKLY CHALLENGE PROGRESS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_weekly_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  objectives_completed INT DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  xp_earned INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE public.user_weekly_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own progress" ON public.user_weekly_progress FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- LEADERBOARDS TABLE (Multi-category)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE DEFAULT CURRENT_DATE,
  category TEXT CHECK (category IN ('overall_xp', 'weekly_xp', 'study_streak', 'posts_created', 'helpful_votes', 'badges_earned', 'course_completion', 'monthly_xp')),
  rank INT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(snapshot_date, category, user_id)
);

ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaderboard viewable by everyone" ON public.leaderboard_snapshots FOR SELECT USING (true);

-- =====================================================
-- USER XP TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  total_xp INT DEFAULT 0,
  weekly_xp INT DEFAULT 0,
  monthly_xp INT DEFAULT 0,
  level INT DEFAULT 1,
  xp_to_next_level INT DEFAULT 100,
  current_level_xp INT DEFAULT 0,
  last_xp_activity TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own XP" ON public.user_xp FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- XP TRANSACTION LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  xp_amount INT NOT NULL,
  transaction_type TEXT CHECK (transaction_type IN ('post_created', 'comment_made', 'post_upvoted', 'challenge_completed', 'badge_earned', 'tutoring', 'resource_shared', 'streak_bonus', 'other')),
  subject_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own transactions" ON public.xp_transactions FOR SELECT USING (auth.uid() = user_id);
