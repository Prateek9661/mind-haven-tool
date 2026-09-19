import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

export type Feeling = "better" | "same" | "worse";

export type Checkin = {
  id: string;
  feeling: Feeling;
  mood: string | null;
  session_title: string | null;
  note: string | null;
  created_at: string;
};

export const FEELING_SCORE: Record<Feeling, number> = { worse: 1, same: 2, better: 3 };

export function useCheckins() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["checkins", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<Checkin[]> => {
      const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString();
      const { data, error } = await supabase
        .from("mood_checkins")
        .select("id, feeling, mood, session_title, note, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Checkin[];
    },
  });

  const save = useMutation({
    mutationFn: async (input: {
      feeling: Feeling;
      mood?: string | null;
      sessionTitle?: string | null;
      note?: string | null;
    }) => {
      if (!user?.id) throw new Error("Not signed in");
      const { error } = await supabase.from("mood_checkins").insert({
        user_id: user.id,
        feeling: input.feeling,
        mood: input.mood ?? null,
        session_title: input.sessionTitle ?? null,
        note: input.note ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["checkins", user?.id] });
    },
  });

  return { user, checkins: query.data ?? [], loading: query.isLoading, save };
}
