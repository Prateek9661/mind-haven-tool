import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

export function usePersonalProfile() {
  const { user, loading } = useSession();

  const query = useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "full_name, occupation, age, avatar_path, role, primary_struggle, goal, condition_note, personalised_greeting, suggested_mood",
        )
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return { user, loading, profile: query.data ?? null };
}
