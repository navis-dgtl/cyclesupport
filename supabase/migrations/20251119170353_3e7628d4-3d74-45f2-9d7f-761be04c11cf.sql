-- Delete existing test data (since we're adding user authentication)
DELETE FROM public.chat_messages;
DELETE FROM public.cycle_entries;
DELETE FROM public.conversations;

-- Add user_id columns to existing tables
ALTER TABLE public.cycle_entries ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL;
ALTER TABLE public.conversations ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL;

-- Update RLS policies to be user-specific
DROP POLICY IF EXISTS "Allow all operations on cycle_entries" ON public.cycle_entries;
DROP POLICY IF EXISTS "Allow all operations on conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow all operations on chat_messages" ON public.chat_messages;

-- Cycle entries policies - users can only access their own entries
CREATE POLICY "Users can view their own cycle entries"
ON public.cycle_entries
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cycle entries"
ON public.cycle_entries
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cycle entries"
ON public.cycle_entries
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cycle entries"
ON public.cycle_entries
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Conversations policies - users can only access their own conversations
CREATE POLICY "Users can view their own conversations"
ON public.conversations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
ON public.conversations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
ON public.conversations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Chat messages policies - users can only access messages in their conversations
CREATE POLICY "Users can view their own chat messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = chat_messages.conversation_id
    AND conversations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own chat messages"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = chat_messages.conversation_id
    AND conversations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own chat messages"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = chat_messages.conversation_id
    AND conversations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own chat messages"
ON public.chat_messages
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = chat_messages.conversation_id
    AND conversations.user_id = auth.uid()
  )
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cycle_entries_user_id ON public.cycle_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);