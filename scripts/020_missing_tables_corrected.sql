-- CORRECTED Missing Tables Migration
-- This version fixes the syntax error with the unique constraint

-- 1. message_conversations table
CREATE TABLE IF NOT EXISTS public.message_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id_2 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE,
  
  CONSTRAINT different_users CHECK (user_id_1 != user_id_2)
);

-- Create unique index for order-independent conversation uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_conversation ON public.message_conversations (
  CASE WHEN user_id_1 < user_id_2 THEN user_id_1 ELSE user_id_2 END,
  CASE WHEN user_id_1 < user_id_2 THEN user_id_2 ELSE user_id_1 END
) WHERE is_archived = FALSE;

CREATE INDEX IF NOT EXISTS idx_message_conversations_user_id_1 ON public.message_conversations(user_id_1);
CREATE INDEX IF NOT EXISTS idx_message_conversations_user_id_2 ON public.message_conversations(user_id_2);
CREATE INDEX IF NOT EXISTS idx_message_conversations_last_message ON public.message_conversations(last_message_at DESC);

-- 2. reputation_logs table
CREATE TABLE IF NOT EXISTS public.reputation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  change_amount INTEGER NOT NULL,
  related_entity_id UUID,
  related_entity_type VARCHAR(50),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reputation_logs_user_id ON public.reputation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_reputation_logs_action_type ON public.reputation_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_reputation_logs_created_at ON public.reputation_logs(created_at DESC);

-- 3. conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  description TEXT,
  is_group BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON public.conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_is_group ON public.conversations(is_group);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON public.conversations(created_at DESC);

-- 4. conversation_members table
CREATE TABLE IF NOT EXISTS public.conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role VARCHAR(50) DEFAULT 'member',
  
  CONSTRAINT unique_conversation_member UNIQUE (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_members_conversation_id ON public.conversation_members(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_members_user_id ON public.conversation_members(user_id);

-- Enable Row Level Security
ALTER TABLE public.message_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_conversations
CREATE POLICY "Users can view their own message conversations"
  ON public.message_conversations FOR SELECT
  USING (auth.uid() IN (user_id_1, user_id_2));

CREATE POLICY "Users can create message conversations"
  ON public.message_conversations FOR INSERT
  WITH CHECK (auth.uid() IN (user_id_1, user_id_2));

CREATE POLICY "Users can update their own message conversations"
  ON public.message_conversations FOR UPDATE
  USING (auth.uid() IN (user_id_1, user_id_2))
  WITH CHECK (auth.uid() IN (user_id_1, user_id_2));

-- RLS Policies for reputation_logs
CREATE POLICY "Users can view their own reputation logs"
  ON public.reputation_logs FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT id FROM public.profiles WHERE is_admin = true
  ));

CREATE POLICY "System can insert reputation logs"
  ON public.reputation_logs FOR INSERT
  WITH CHECK (true);

-- RLS Policies for conversations
CREATE POLICY "Members can view their conversations"
  ON public.conversations FOR SELECT
  USING (
    created_by = auth.uid() OR
    id IN (SELECT conversation_id FROM public.conversation_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- RLS Policies for conversation_members
CREATE POLICY "Members can view conversation members"
  ON public.conversation_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE created_by = auth.uid()
    ) OR
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_members 
      WHERE user_id = auth.uid()
    )
  );
