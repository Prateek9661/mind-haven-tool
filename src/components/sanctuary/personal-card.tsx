import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import { usePersonalProfile } from "@/hooks/use-personal-profile";
import { sessionFromContext, type SectionId } from "@/lib/personalisation";
import { Button } from "@/components/ui/button";

export function PersonalCard({
  onStartSession,
}: {
  onStartSession: (section: SectionId) => void;
}) {
  const { user, loading, profile } = usePersonalProfile();

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

  const session = sessionFromContext(profile);

  if (!profile?.personalised_greeting && !session) {
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

  const lead = session?.steps.find((step) => step.section !== "affirmation")?.section as
    | SectionId
    | undefined;

  return (
    <section
      className="glass-card animate-float-up px-6 py-7 sm:px-9"
      aria-label="Your personalised session"
    >
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-primary">
          <Sparkles className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          {profile?.personalised_greeting ? (
            <p className="font-display text-xl font-light leading-relaxed text-foreground sm:text-2xl">
              {profile.personalised_greeting}
            </p>
          ) : null}

          {session ? (
            <div className="mt-5">
              <p className="font-display text-lg font-light text-primary">{session.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{session.intro}</p>
              <ol className="mt-4 space-y-3">
                {session.steps.map((step, index) => (
                  <li key={step.label} className="flex items-start gap-3 text-sm text-foreground">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-xs font-medium text-primary">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{step.label}</span>
                  </li>
                ))}
              </ol>
              {lead ? (
                <Button
                  type="button"
                  onClick={() => onStartSession(lead)}
                  className="mt-6 min-h-11 rounded-full"
                >
                  Start this session
                </Button>
              ) : null}
            </div>
          ) : null}

          <Link
            to="/profile"
            className="mt-5 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Update how you&apos;re feeling
          </Link>
        </div>
      </div>
    </section>
  );
}
