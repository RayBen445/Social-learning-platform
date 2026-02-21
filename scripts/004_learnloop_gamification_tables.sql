-- LearnLoop Database Schema - Part 4: Gamification Tables

-- =====================================================
-- 15. ACHIEVEMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  points_reward INT DEFAULT 0,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('posts', 'comments', 'votes', 'followers', 'topics', 'streaks')),
  requirement_value INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are viewable by everyone" ON public.achievements FOR SELECT USING (true);

-- =====================================================
-- 16. USER_ACHIEVEMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User achievements are viewable by everyone" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "System can insert achievements" ON public.user_achievements FOR INSERT WITH CHECK (true);

-- =====================================================
-- 17. LEADERBOARDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rank INT,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INT DEFAULT 0,
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'all_time')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period)
);

ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaderboards are viewable by everyone" ON public.leaderboards FOR SELECT USING (true);
CREATE POLICY "System can update leaderboards" ON public.leaderboards FOR ALL USING (true);

-- =====================================================
-- 18. ACTIVITY_STREAKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.activity_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.activity_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activity streaks are viewable by everyone" ON public.activity_streaks FOR SELECT USING (true);
CREATE POLICY "Users can see their streaks" ON public.activity_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can update streaks" ON public.activity_streaks FOR ALL USING (true);

-- Create indexes for gamification tables
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
CREATE INDEX idx_leaderboards_period ON public.leaderboards(period);
CREATE INDEX idx_leaderboards_rank ON public.leaderboards(rank);
CREATE INDEX idx_activity_streaks_user_id ON public.activity_streaks(user_id);
