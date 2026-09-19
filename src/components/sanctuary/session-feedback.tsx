import { useState } from "react";
import { Heart, MessageCircleHeart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCheckins, type Feeling } from "@/hooks/use-checkins";
import { alternativeSession, type SectionId, type SessionPlan } from "@/lib/personalisation";
import { MOODS, type MoodId } from "@/lib/sanctuary";

const OPTIONS: { id: Feeling; label: string }[] = [
  { id: "better", label: "I feel better" },
  { id: "same", label: "About the same" },
  { id: "worse", label: "Still not good" },
];

export function SessionFeedback({
  session,
  mood,
  onTryAlternative,
  onOpenCoach,
}: {
  session: SessionPlan | null;
  mood: MoodId | null;
  onTryAlternative: (plan: SessionPlan) => void;
  onOpenCoach: (section: SectionId) => void;
}) {
  const { user, save } = useCheckins();
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  if (!user) return null;

  const moodLabel = MOODS.find((m) => m.id === mood)?.label ?? null;
  const alternative = alternativeSession(session);

  const store = async (value: Feeling, text?: string) => {
    try {
      await save.mutateAsync({
        feeling: value,
        mood: moodLabel,
        sessionTitle: session?.title ?? null,
        note: text?.trim() ? text.trim() : null,
      });
      setDone(true);
    } catch (error) {
      console.error(error);
      toast.error("Your check-in couldn't be saved just now. Please try again.");
    }
  };

  const pick = (value: Feeling) => {
    setFeeling(value);
    if (value === "better") void store(value);
  };

  return (
    <section className="glass-card animate-float-up px-6 py-7 sm:px-9" aria-label="How you feel now">
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-primary">
          <Heart className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          {!feeling ? (
            <>
              <p className="font-display text-xl font-light text-foreground">
                {session ? `You've been with "${session.title}".` : "You've had a moment here."}{" "}
                How do you feel now?
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Whatever the answer is, it helps Velora shape the next moment for you.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => pick(option.id)}
                    className="min-h-11 rounded-full bg-secondary px-5 text-sm font-medium text-primary transition-colors hover:bg-accent"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          ) : feeling === "better" ? (
            <>
              <p className="font-display text-xl font-light text-foreground">
                That&apos;s lovely to hear.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                You gave yourself a few honest minutes and your body answered. Carry that softness
                into the next thing — and come back whenever the day gets loud again.
              </p>
            </>
          ) : !done ? (
            <>
              <p className="font-display text-xl font-light text-foreground">
                Thank you for being honest.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Let&apos;s understand it better. In a line or two — what is still sitting with you
                right now?
              </p>
              <Textarea
                value={note}
                onChange={(event) => setNote(event.currentTarget.value)}
                placeholder="It's still my workload… my chest feels tight… I couldn't switch off…"
                className="mt-4 min-h-24 rounded-2xl text-base"
              />
              <Button
                type="button"
                onClick={() => void store(feeling, note)}
                disabled={save.isPending}
                className="mt-4 min-h-11 rounded-full"
              >
                Guide me from here
              </Button>
            </>
          ) : (
            <>
              <p className="font-display text-xl font-light text-foreground">
                Then let&apos;s try a gentler way in.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Some days one practice isn&apos;t the right fit, and that&apos;s not a failure of
                yours. Here&apos;s another shape for the next few minutes.
              </p>
              <div className="mt-4 rounded-2xl bg-secondary/60 px-5 py-4">
                <p className="font-display text-lg font-light text-primary">{alternative.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{alternative.intro}</p>
                <ol className="mt-3 space-y-2">
                  {alternative.steps.map((step, index) => (
                    <li key={step.label} className="flex items-start gap-3 text-sm text-foreground">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-background text-xs font-medium text-primary">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{step.label}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => onTryAlternative(alternative)}
                  className="min-h-11 rounded-full"
                >
                  Try this instead
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenCoach("coach")}
                  className="min-h-11 rounded-full"
                >
                  <MessageCircleHeart className="size-4" aria-hidden />
                  Talk it through
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
