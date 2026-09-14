import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { MOODS, type MoodId } from "@/lib/sanctuary";

export function PersonalCard({ onSuggestMood }: { onSuggestMood: (mood: MoodId) => void }) {
  const { user, loading } = useSession();
  const applied = useRef(false);

  const { data } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data: row, error } = await supabase
        .from("profiles")
        .select(
          "full_name, occupation, age, country, avatar_path, role, primary_struggle, goal, condition_note, personalised_greeting, suggested_mood",
        )
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return row;
    },
  });

  const suggested = data?.suggested_mood as MoodId | null | undefined;
  const mood = MOODS.find((m) => m.id === suggested) ?? null;

  useEffect(() => {
    if (!mood || applied.current) return;
    applied.current = true;
    onSuggestMood(mood.id);
  }, [mood, onSuggestMood]);

  if (loading) return null;

  if (!user) {
    return (
      <section className="glass-card animate-float-up px-6 py-5 text-center sm:px-8">
        <p className="text-sm text-muted-foreground">
          <Link to="/auth" className="font-medium text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>{" "}
          to tell Velora about your days and get a sanctuary shaped around you.
        </p>
      </section>
    );
  }

  if (!data?.personalised_greeting) {
    return (
      <section className="glass-card animate-float-up px-6 py-5 text-center sm:px-8">
        <p className="text-sm text-muted-foreground">
          Tell Velora a little about how you&apos;ve been feeling and it will shape this page for
          you.{" "}
          <Link
            to="/profile"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Personalise my sanctuary
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section
      className="glass-card animate-float-up px-6 py-7 sm:px-9"
      aria-label="Your personalised suggestion"
    >
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-primary">
          <Sparkles className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-display text-xl font-light leading-relaxed text-foreground sm:text-2xl">
            {data.personalised_greeting}
          </p>
          {mood ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Suggested for you: <span className="text-primary">{mood.label}</span> — {mood.note}
            </p>
          ) : null}
          <Link
            to="/profile"
            className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Update how you&apos;re feeling
          </Link>
        </div>
      </div>
    </section>
  );
}
