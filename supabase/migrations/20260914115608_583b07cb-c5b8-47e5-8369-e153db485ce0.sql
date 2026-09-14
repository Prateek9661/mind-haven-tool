ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS primary_struggle text,
  ADD COLUMN IF NOT EXISTS goal text,
  ADD COLUMN IF NOT EXISTS condition_note text,
  ADD COLUMN IF NOT EXISTS personalised_greeting text,
  ADD COLUMN IF NOT EXISTS suggested_mood text,
  ADD COLUMN IF NOT EXISTS personalised_at timestamptz;