# Missing Database Tables Report

## Overview
After analyzing the codebase, **3 missing database tables** were found that are referenced in the application but missing from the SQL migrations.

---

## Missing Tables

### 1. **message_conversations**
**Location Referenced:** `/app/messages/page.tsx` (Line 53)

**Purpose:** Tracks conversation threads between pairs of users for direct messaging.

**Usage in Code:**
```typescript
.from('message_conversations')
```

**Table Structure:**
```sql
CREATE TABLE IF NOT EXISTS public.message_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id_2 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE,
  
  CONSTRAINT unique_conversation UNIQUE (LEAST(user_id_1, user_id_2), GREATEST(user_id_1, user_id_2)),
  CONSTRAINT different_users CHECK (user_id_1 != user_id_2)
);

CREATE INDEX idx_message_conversations_user_id_1 ON public.message_conversations(user_id_1);
CREATE INDEX idx_message_conversations_user_id_2 ON public.message_conversations(user_id_2);
CREATE INDEX idx_message_conversations_last_message ON public.message_conversations(last_message_at DESC);
```

---

### 2. **reputation_logs**
**Location Referenced:** `/app/actions/reputation.ts` (Line 28, 122)

**Purpose:** Audit log for tracking all reputation changes and transactions.

**Usage in Code:**
```typescript
await supabase.from('reputation_logs').insert({...})
.from('reputation_logs')
```

**Table Structure:**
```sql
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

CREATE INDEX idx_reputation_logs_user_id ON public.reputation_logs(user_id);
CREATE INDEX idx_reputation_logs_action_type ON public.reputation_logs(action_type);
CREATE INDEX idx_reputation_logs_created_at ON public.reputation_logs(created_at DESC);
```

---

### 3. **conversations**
**Location Referenced:** `/app/dashboard/page.tsx` (Line 193)

**Purpose:** General conversation/thread storage for group conversations and discussions.

**Usage in Code:**
```typescript
.from('conversations')
```

**Table Structure:**
```sql
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

CREATE INDEX idx_conversations_created_by ON public.conversations(created_by);
CREATE INDEX idx_conversations_is_group ON public.conversations(is_group);
CREATE INDEX idx_conversations_created_at ON public.conversations(created_at DESC);

-- Conversation members table
CREATE TABLE IF NOT EXISTS public.conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role VARCHAR(50) DEFAULT 'member',
  
  CONSTRAINT unique_conversation_member UNIQUE (conversation_id, user_id)
);

CREATE INDEX idx_conversation_members_conversation_id ON public.conversation_members(conversation_id);
CREATE INDEX idx_conversation_members_user_id ON public.conversation_members(user_id);
```

---

## How to Apply Missing Tables

### Option 1: Via Supabase SQL Editor (Recommended)
1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the sidebar
3. Create a new query
4. Copy and paste the SQL from `/scripts/019_missing_tables.sql`
5. Click **Run** to execute

### Option 2: Via migrations
The file `/scripts/019_missing_tables.sql` contains all the missing table definitions with proper indexes and RLS policies.

---

## Impact
- **Direct Impact:** These 3 tables are actively used in the code and will cause runtime errors if missing
- **Data Loss Risk:** Messages and reputation data won't be persisted
- **User Impact:** Users won't be able to send messages or view their reputation history

---

## Verification
After creating the tables, you can verify they exist by running:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

Look for:
- ✅ `message_conversations`
- ✅ `reputation_logs`
- ✅ `conversations`
- ✅ `conversation_members`

---

## Summary
All 3 missing tables are now documented and ready to be created. Execute the migration in `/scripts/019_missing_tables.sql` to complete your database schema.
