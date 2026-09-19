CREATE TABLE public.mood_checkins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feeling text NOT NULL CHECK (feeling IN ('better','same','worse')),
  mood text,
  session_title text,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mood_checkins TO authenticated;
GRANT ALL ON public.mood_checkins TO service_role;

ALTER TABLE public.mood_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own check-ins" ON public.mood_checkins FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own check-ins" ON public.mood_checkins FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own check-ins" ON public.mood_checkins FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own check-ins" ON public.mood_checkins FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX mood_checkins_user_created_idx ON public.mood_checkins (user_id, created_at DESC);

CREATE TRIGGER mood_checkins_set_updated_at BEFORE UPDATE ON public.mood_checkins FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();