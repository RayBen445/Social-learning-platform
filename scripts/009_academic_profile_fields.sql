-- LearnLoop Schema Extension: Academic Profile Fields, Groups, Courses, User Preferences

-- Add academic fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS faculty TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS academic_session TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_id_encrypted TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS academic_focus TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username_last_changed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pending_deletion_at TIMESTAMP WITH TIME ZONE;

-- User Preferences Table (notification + appearance settings stored as JSON)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Notification prefs
  notif_direct_messages BOOLEAN DEFAULT TRUE,
  notif_mentions BOOLEAN DEFAULT TRUE,
  notif_course_announcements BOOLEAN DEFAULT TRUE,
  notif_group_activity BOOLEAN DEFAULT TRUE,
  notif_verification_updates BOOLEAN DEFAULT TRUE,
  notif_system_notices BOOLEAN DEFAULT TRUE,
  notif_delivery_push BOOLEAN DEFAULT TRUE,
  notif_delivery_email BOOLEAN DEFAULT TRUE,
  notif_delivery_in_app BOOLEAN DEFAULT TRUE,
  -- Messaging prefs
  msg_requests_enabled BOOLEAN DEFAULT TRUE,
  msg_group_invites TEXT DEFAULT 'everyone' CHECK (msg_group_invites IN ('everyone', 'connections', 'nobody')),
  msg_auto_mute_groups BOOLEAN DEFAULT FALSE,
  msg_file_download TEXT DEFAULT 'wifi' CHECK (msg_file_download IN ('always', 'wifi', 'never')),
  -- Privacy prefs
  privacy_profile_visibility TEXT DEFAULT 'everyone' CHECK (privacy_profile_visibility IN ('everyone', 'school', 'connections')),
  privacy_who_can_message TEXT DEFAULT 'everyone' CHECK (privacy_who_can_message IN ('everyone', 'same_school', 'same_course', 'connections')),
  privacy_show_last_seen BOOLEAN DEFAULT TRUE,
  privacy_read_receipts BOOLEAN DEFAULT TRUE,
  privacy_appear_offline BOOLEAN DEFAULT FALSE,
  -- Appearance prefs
  appearance_view TEXT DEFAULT 'comfortable' CHECK (appearance_view IN ('comfortable', 'compact')),
  appearance_font_size TEXT DEFAULT 'medium' CHECK (appearance_font_size IN ('small', 'medium', 'large')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);

-- Groups Table
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  group_type TEXT NOT NULL CHECK (group_type IN ('course', 'department', 'project', 'organization', 'study', 'exam')),
  institution TEXT,
  faculty TEXT,
  department TEXT,
  course_code TEXT,
  academic_session TEXT,
  cover_image_url TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  member_count INT DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Groups are viewable by everyone" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create groups" ON public.groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Group creators can update" ON public.groups FOR UPDATE USING (auth.uid() = created_by);

-- Group Memberships
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group members are viewable by everyone" ON public.group_members FOR SELECT USING (true);
CREATE POLICY "Users can join groups" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON public.group_members FOR DELETE USING (auth.uid() = user_id);

-- Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  institution TEXT,
  faculty TEXT,
  department TEXT NOT NULL,
  level TEXT,
  academic_session TEXT,
  credit_units INT,
  instructor TEXT,
  member_count INT DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(code, institution, academic_session)
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Courses are viewable by everyone" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create courses" ON public.courses FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Course Enrollments
CREATE TABLE IF NOT EXISTS public.course_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

ALTER TABLE public.course_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Course members are viewable by everyone" ON public.course_members FOR SELECT USING (true);
CREATE POLICY "Users can enroll in courses" ON public.course_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unenroll" ON public.course_members FOR DELETE USING (auth.uid() = user_id);

-- Appeals Table
CREATE TABLE IF NOT EXISTS public.appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'resolved', 'dismissed')),
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own appeals" ON public.appeals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can submit appeals" ON public.appeals FOR INSERT WITH CHECK (auth.uid() = user_id);
