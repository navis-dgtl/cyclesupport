-- Drop the existing unique constraint on entry_date alone
ALTER TABLE public.cycle_entries DROP CONSTRAINT IF EXISTS cycle_entries_entry_date_key;

-- Add a composite unique constraint for entry_date and user_id
ALTER TABLE public.cycle_entries ADD CONSTRAINT cycle_entries_entry_date_user_id_key UNIQUE (entry_date, user_id);