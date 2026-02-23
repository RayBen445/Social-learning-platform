-- LearnLoop Seeding Script - Admin and Bot Users
-- This script creates system admin and bot accounts for LearnLoop
-- Generated passwords are included below

-- Bot User Account
-- Email: bot@learnloop.app
-- Password: Bot#2026LearnLoop$Secure9876
-- Role: System bot for automated tasks

-- Admin User Account
-- Email: admin@learnloop.app  
-- Password: Admin#2026LearnLoop$Secure5432
-- Role: Platform administrator with moderation privileges

-- Note: These are placeholder credentials for the seeding script.
-- In production, you should:
-- 1. Use Supabase Auth's built-in admin API to create users
-- 2. Store passwords securely (never in plain text)
-- 3. Use environment variables for sensitive data

-- Create Bot User via Supabase Auth (manual step)
-- Use Supabase Dashboard > Authentication > Add user
-- Email: bot@learnloop.app
-- Password: Bot#2026LearnLoop$Secure9876
-- Then run the insert below after user is created

-- Insert Bot User Profile (run after creating auth user)
INSERT INTO public.profiles (
  id,
  username,
  full_name,
  bio,
  status,
  is_verified,
  verification_type,
  reputation_points,
  total_posts,
  total_comments,
  total_followers,
  total_following
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid, -- Replace with actual bot user ID from auth.users
  'learnloop_bot',
  'LearnLoop Bot',
  'Official LearnLoop system bot for announcements and automated tasks',
  'online',
  TRUE,
  'bot',
  0,
  0,
  0,
  0,
  0
) ON CONFLICT (id) DO NOTHING;

-- Create Admin User via Supabase Auth (manual step)
-- Use Supabase Dashboard > Authentication > Add user
-- Email: admin@learnloop.app
-- Password: Admin#2026LearnLoop$Secure5432
-- Then run the insert below after user is created

-- Insert Admin User Profile (run after creating auth user)
INSERT INTO public.profiles (
  id,
  username,
  full_name,
  bio,
  status,
  is_verified,
  verification_type,
  reputation_points,
  total_posts,
  total_comments,
  total_followers,
  total_following
) VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid, -- Replace with actual admin user ID from auth.users
  'learnloop_admin',
  'LearnLoop Administrator',
  'Platform administrator and community moderator',
  'online',
  TRUE,
  'system',
  0,
  0,
  0,
  0,
  0
) ON CONFLICT (id) DO NOTHING;

-- Create initial achievements for gamification system
INSERT INTO public.achievements (
  name,
  slug,
  description,
  points_reward,
  requirement_type,
  requirement_value
) VALUES
  ('First Post', 'first_post', 'Create your first post on LearnLoop', 10, 'posts', 1),
  ('Engaged Learner', 'engaged_learner', 'Write 10 comments to help others', 25, 'comments', 10),
  ('Popular Post', 'popular_post', 'Get your post to 50 upvotes', 50, 'votes', 50),
  ('Topic Master', 'topic_master', 'Subscribe to 5 different topics', 20, 'topics', 5),
  ('Community Builder', 'community_builder', 'Gain 50 followers', 75, 'followers', 50),
  ('Consistent Contributor', 'consistent_contributor', 'Maintain a 7-day activity streak', 60, 'streaks', 7)
ON CONFLICT (slug) DO NOTHING;

-- Create a welcome post from the bot user
-- Run after inserting bot user profile
INSERT INTO public.posts (
  id,
  user_id,
  title,
  content,
  excerpt,
  is_pinned,
  is_published
) VALUES (
  '00000000-0000-0000-0000-000000000010'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Welcome to LearnLoop! 🎉',
  E'# Welcome to LearnLoop!\n\nHi there! I''m the LearnLoop Bot, and I''m here to help you get started on your learning journey.\n\n## What is LearnLoop?\n\nLearnLoop is a social learning platform where curious minds come together to share knowledge, spark discussions, and grow together. Whether you''re a student, teacher, hobbyist, or lifelong learner — you belong here.\n\n## How to Get Started\n\n1. **Complete your profile** – Add a photo and bio so others can get to know you.\n2. **Follow topics** – Subscribe to subjects you care about (Math, Science, Programming, and more).\n3. **Create your first post** – Share something you''ve learned recently!\n4. **Engage with the community** – Like, comment, and reply to posts from other learners.\n\n## Community Guidelines\n\n- Be respectful and kind to fellow learners.\n- Share accurate information and cite your sources.\n- Constructive feedback is always welcome.\n- Report any content that violates our guidelines.\n\nWe''re excited to have you here. Happy learning! 🚀\n\n— *The LearnLoop Team*',
  'Welcome to LearnLoop! Learn how to get started, explore topics, and connect with fellow learners on this social learning platform.',
  TRUE,
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- Update bot user post count
UPDATE public.profiles
SET total_posts = 1
WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;

-- Create sample topics for the platform
INSERT INTO public.topics (
  name,
  slug,
  description,
  color_hex,
  created_by
) VALUES
  ('Mathematics', 'mathematics', 'Discuss mathematics topics including algebra, calculus, geometry, and more', '#3B82F6', '00000000-0000-0000-0000-000000000002'::uuid),
  ('Science', 'science', 'Explore physics, chemistry, biology, and other sciences', '#10B981', '00000000-0000-0000-0000-000000000002'::uuid),
  ('Programming', 'programming', 'Learn and discuss coding, algorithms, and software development', '#F59E0B', '00000000-0000-0000-0000-000000000002'::uuid),
  ('History', 'history', 'Explore historical events, periods, and important figures', '#8B5CF6', '00000000-0000-0000-0000-000000000002'::uuid),
  ('Literature', 'literature', 'Discuss books, writing, poetry, and literary analysis', '#EC4899', '00000000-0000-0000-0000-000000000002'::uuid),
  ('Art & Design', 'art-design', 'Share and discuss visual arts, design, and creative projects', '#EF4444', '00000000-0000-0000-0000-000000000002'::uuid),
  ('Languages', 'languages', 'Learn and practice different languages with the community', '#06B6D4', '00000000-0000-0000-0000-000000000002'::uuid),
  ('General Discussion', 'general-discussion', 'Off-topic discussions and general questions about LearnLoop', '#6B7280', '00000000-0000-0000-0000-000000000002'::uuid)
ON CONFLICT (slug) DO NOTHING;
