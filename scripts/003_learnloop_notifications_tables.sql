-- LearnLoop Database Schema - Part 3: Notifications & Messaging Tables

-- =====================================================
-- 12. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('comment', 'vote', 'follow', 'mention', 'reshare', 'reply')),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Notifications are auto-created" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can mark notifications as read" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 13. DIRECT_MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (sender_id != recipient_id)
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their messages" ON public.direct_messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);
CREATE POLICY "Users can send messages" ON public.direct_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can delete their messages" ON public.direct_messages FOR DELETE USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);
CREATE POLICY "Recipients can mark as read" ON public.direct_messages FOR UPDATE USING (auth.uid() = recipient_id);

-- =====================================================
-- 14. MESSAGE_TYPING_STATUS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.message_typing_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '5 seconds',
  UNIQUE(user_id, recipient_id)
);

ALTER TABLE public.message_typing_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see typing status" ON public.message_typing_status FOR SELECT USING (
  auth.uid() = recipient_id
);
CREATE POLICY "Users can update their typing status" ON public.message_typing_status FOR ALL USING (
  auth.uid() = user_id
);

-- Create indexes for notifications and messaging
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_direct_messages_sender_id ON public.direct_messages(sender_id);
CREATE INDEX idx_direct_messages_recipient_id ON public.direct_messages(recipient_id);
CREATE INDEX idx_direct_messages_created_at ON public.direct_messages(created_at DESC);
CREATE INDEX idx_message_typing_status_recipient_id ON public.message_typing_status(recipient_id);
