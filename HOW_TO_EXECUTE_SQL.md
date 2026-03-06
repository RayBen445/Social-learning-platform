# How to Execute SQL Migrations in Supabase

## Step-by-Step Guide

### Option 1: Using Supabase Dashboard (Easiest)

**Step 1: Go to Supabase Dashboard**
1. Open https://supabase.com in your browser
2. Sign in to your account
3. Select your "LearnLoop" project

**Step 2: Navigate to SQL Editor**
1. Look at the left sidebar
2. Click on **"SQL Editor"** (or **"SQL"**)
3. You should see a blank SQL editor

**Step 3: Copy the SQL**
1. Open the file `/scripts/019_missing_tables.sql` in this project
2. Copy ALL the SQL code (Ctrl+A, then Ctrl+C)

**Step 4: Paste and Execute**
1. Paste the SQL into the Supabase SQL Editor (Ctrl+V)
2. Click the **"Run"** button (it's usually a play button ▶️ in the top right)
3. Wait for it to complete - you should see a success message

**Step 5: Verify**
1. Go to **"Table Editor"** in the left sidebar
2. Look for these new tables:
   - `message_conversations`
   - `reputation_logs`
   - `conversations`
   - `conversation_members`

---

### Option 2: Execute Individual SQL Files (If Option 1 doesn't work)

You can also run the migration script through your CLI:

```bash
# From your project root directory
psql -h [your-db-host] -U [your-db-user] -d [your-db-name] -f scripts/019_missing_tables.sql
```

Replace the bracketed values with your Supabase database credentials.

---

### Option 3: Copy-Paste Individual Sections

If you want to execute gradually, here are the main SQL statements:

#### 1. Message Conversations Table
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

#### 2. Reputation Logs Table
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

#### 3. Conversations & Conversation Members Tables
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

## Visual Guide for Supabase Dashboard

1. **Login to Supabase** → https://supabase.com
   
2. **Select Project**
   ```
   Dashboard → [Your Project Name]
   ```

3. **Find SQL Editor**
   ```
   Left Sidebar → SQL Editor
   (or look for a "SQL" option)
   ```

4. **Paste & Execute**
   ```
   1. Click in the editor area
   2. Paste the SQL (Ctrl+V)
   3. Click "Run" or press Ctrl+Enter
   4. Check for green success message
   ```

5. **Verify Tables Created**
   ```
   Left Sidebar → Table Editor
   Look for the 4 new tables in the list
   ```

---

## If You Get an Error

**Common Issues:**

1. **Error: "profiles" table doesn't exist**
   - This means your core tables haven't been created yet
   - Run all the migration scripts first: `001_learnloop_core_tables.sql`, `002_`, `003_`, etc.

2. **Error: "Table already exists"**
   - Don't worry! This is just saying the table is already there
   - You can safely ignore this

3. **Connection refused**
   - Make sure you're logged into Supabase
   - Verify your project credentials

---

## Need Help?

If you're still stuck:
1. Check the Supabase documentation: https://supabase.com/docs
2. Message the error you're getting - we can help troubleshoot!

---

**Once executed, your database will be fully set up and ready to use!** ✅
