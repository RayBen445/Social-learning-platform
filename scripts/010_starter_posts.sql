-- LearnLoop Starter Posts Seed
-- Run AFTER 008_seed_admin_bot_users.sql
-- These 5 posts are created by the admin/bot accounts to populate the feed
-- Replace the UUIDs below with the actual admin and bot profile IDs from your database.
--
-- To find the IDs, run:
--   SELECT id, username FROM public.profiles WHERE username IN ('learnloop_admin', 'learnloop_bot');

-- ─── Configuration ────────────────────────────────────────────────────────────
-- Set these to the real IDs before running.
DO $$
DECLARE
  v_admin_id  uuid;
  v_bot_id    uuid;
  v_post1_id  uuid := gen_random_uuid();
  v_post2_id  uuid := gen_random_uuid();
  v_post3_id  uuid := gen_random_uuid();
  v_post4_id  uuid := gen_random_uuid();
  v_post5_id  uuid := gen_random_uuid();
BEGIN

  -- Look up admin and bot by username
  SELECT id INTO v_admin_id FROM public.profiles WHERE username = 'learnloop_admin' LIMIT 1;
  SELECT id INTO v_bot_id   FROM public.profiles WHERE username = 'learnloop_bot'   LIMIT 1;

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Admin profile not found. Run 008_seed_admin_bot_users.sql first.';
  END IF;

  IF v_bot_id IS NULL THEN
    RAISE EXCEPTION 'Bot profile not found. Run 008_seed_admin_bot_users.sql first.';
  END IF;

  -- ─── Post 1: Welcome to Learnloop ─────────────────────────────────────────
  INSERT INTO public.posts (
    id, user_id, title, content, excerpt, is_published, created_at, updated_at
  ) VALUES (
    v_post1_id,
    v_admin_id,
    'Welcome to Learnloop 🎓',
    E'Welcome to Learnloop — your verified academic social space.\n\n'
    'Learnloop is built for students, by a team that understands academic life. '
    'This is a place to connect with classmates, share knowledge, find study partners, '
    'and stay on top of your courses — without the noise of regular social media.\n\n'
    'Here, your identity is academic. Your connections are based on shared courses, '
    'departments, and goals — not followers.\n\n'
    'We''re glad you''re here. Start by completing your academic profile so your '
    'classmates can find you.',
    'Welcome to Learnloop — your verified academic social space. Built for students.',
    true,
    now() - interval '5 days',
    now() - interval '5 days'
  ) ON CONFLICT (id) DO NOTHING;

  -- ─── Post 2: How Verification Works ────────────────────────────────────────
  INSERT INTO public.posts (
    id, user_id, title, content, excerpt, is_published, created_at, updated_at
  ) VALUES (
    v_post2_id,
    v_admin_id,
    'How Verification Works on Learnloop',
    E'Verification is the foundation of Learnloop''s trust system.\n\n'
    '**Why we verify**\n'
    'Learnloop is a school-first platform. Verification ensures that everyone you '
    'interact with is a real student from a real institution — no bots, no imposters.\n\n'
    '**How to get verified**\n'
    '1. Go to Settings → Academic & Verification\n'
    '2. Add your institution, faculty, department, and level\n'
    '3. Submit your school email or student ID for review\n'
    '4. Our team reviews within 24–48 hours\n\n'
    '**Verification badges**\n'
    '🎓 Verified Student — your student status is confirmed\n'
    '🏫 Institution Verified — your school is a verified partner institution\n\n'
    'Verified users unlock full messaging, course groups, and appear in department searches.',
    'Verification ensures everyone on Learnloop is a real, school-confirmed student.',
    true,
    now() - interval '4 days',
    now() - interval '4 days'
  ) ON CONFLICT (id) DO NOTHING;

  -- ─── Post 3: Community Guidelines ──────────────────────────────────────────
  INSERT INTO public.posts (
    id, user_id, title, content, excerpt, is_published, created_at, updated_at
  ) VALUES (
    v_post3_id,
    v_admin_id,
    'Community Guidelines — Keep Learnloop a Safe Space',
    E'Learnloop works best when everyone treats it as a serious academic environment.\n\n'
    '**What we expect from every member**\n'
    '• Be respectful — treat classmates as you would in a classroom\n'
    '• Share knowledge generously — helpful replies are the heart of this platform\n'
    '• Keep discussions academic and constructive\n'
    '• No harassment, spam, or misinformation\n'
    '• No impersonation of other students or institutions\n\n'
    '**What we will not tolerate**\n'
    '• Bullying or targeted harassment\n'
    '• Sharing exam answers or facilitating academic dishonesty\n'
    '• Posting inappropriate or offensive content\n'
    '• Spam or unsolicited promotion\n\n'
    '**Reporting**\n'
    'If you see something that violates these guidelines, use the Report button '
    'on any post, comment, or profile. Our moderation team reviews all reports.\n\n'
    'Full guidelines: learnloop.app/legal/code-of-conduct',
    'Learnloop works best when everyone treats it as a serious academic environment.',
    true,
    now() - interval '3 days',
    now() - interval '3 days'
  ) ON CONFLICT (id) DO NOTHING;

  -- ─── Post 4: How to Find Classmates ────────────────────────────────────────
  INSERT INTO public.posts (
    id, user_id, title, content, excerpt, is_published, created_at, updated_at
  ) VALUES (
    v_post4_id,
    v_bot_id,
    'How to Find Classmates on Learnloop',
    E'One of the most powerful things about Learnloop is how it connects you with '
    'the right people — not random users, but students who share your courses, '
    'department, and academic goals.\n\n'
    '**Finding classmates**\n'
    '1. Complete your academic profile (institution, department, level)\n'
    '2. Use Search and filter by department or level\n'
    '3. Browse your course groups — everyone enrolled in the same course is there\n'
    '4. Check your department group for everyone in your faculty\n\n'
    '**Adding courses**\n'
    'Go to Courses → Browse Courses to find and enrol in your current semester courses. '
    'Once you enrol, you''re automatically connected with other students in the same course.\n\n'
    '**Study groups**\n'
    'Can''t find a study group? Create one at Groups → Create Group. '
    'Invite classmates directly from their profile.',
    'Learnloop connects you with classmates based on your courses, department, and goals.',
    true,
    now() - interval '2 days',
    now() - interval '2 days'
  ) ON CONFLICT (id) DO NOTHING;

  -- ─── Post 5: How Groups and Courses Work ────────────────────────────────────
  INSERT INTO public.posts (
    id, user_id, title, content, excerpt, is_published, created_at, updated_at
  ) VALUES (
    v_post5_id,
    v_bot_id,
    'How Groups and Courses Work on Learnloop',
    E'Groups and courses are the core of how Learnloop organises your academic life.\n\n'
    '**Courses**\n'
    'Each course you enrol in has its own space. Inside a course:\n'
    '• Post questions, notes, and updates\n'
    '• See who else is taking the same course\n'
    '• Get course-specific announcements\n'
    '• Find study partners\n\n'
    'Enrol in your courses at: Courses → Browse Courses\n\n'
    '**Groups**\n'
    'Groups are flexible spaces for collaboration:\n'
    '• Course groups — tied to a specific course\n'
    '• Study groups — small teams for exam prep\n'
    '• Project groups — for coursework and team projects\n'
    '• Department groups — everyone in your department\n\n'
    '**Creating a group**\n'
    'Any verified student can create a group. Go to Groups → Create Group, '
    'choose the type, add a name, and invite members.\n\n'
    '**Archived groups**\n'
    'When a semester ends, groups can be archived. Archived groups are read-only '
    'and accessible from your profile for reference.',
    'Groups and courses are the core of how Learnloop organises your academic life.',
    true,
    now() - interval '1 day',
    now() - interval '1 day'
  ) ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Starter posts seeded successfully (admin_id=%, bot_id=%)', v_admin_id, v_bot_id;
END $$;
