-- Add new structured fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS partner_name TEXT,
ADD COLUMN IF NOT EXISTS love_language TEXT,
ADD COLUMN IF NOT EXISTS dietary_preferences TEXT,
ADD COLUMN IF NOT EXISTS favorite_activities TEXT,
ADD COLUMN IF NOT EXISTS last_period_start DATE,
ADD COLUMN IF NOT EXISTS average_cycle_length INTEGER DEFAULT 28,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Add helpful comment
COMMENT ON COLUMN public.profiles.love_language IS 'Primary love language: Words of Affirmation, Acts of Service, Receiving Gifts, Quality Time, Physical Touch';
COMMENT ON COLUMN public.profiles.average_cycle_length IS 'Average menstrual cycle length in days (typically 21-35 days)';
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Whether user has completed the initial onboarding wizard';