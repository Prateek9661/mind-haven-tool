import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";

import { AccountNav } from "@/components/sanctuary/account-nav";
import { PersonalCard } from "@/components/sanctuary/personal-card";
import { WelcomeBanner } from "@/components/sanctuary/welcome-banner";
import { MoodSelector } from "@/components/sanctuary/mood-selector";
import { BreathingVisualizer } from "@/components/sanctuary/breathing-visualizer";
import { SoundPlayer } from "@/components/sanctuary/sound-player";
import { CoachChat } from "@/components/sanctuary/coach-chat";
import { SessionFeedback } from "@/components/sanctuary/session-feedback";
import { MoodChart } from "@/components/sanctuary/mood-chart";
import { Toaster } from "@/components/ui/sonner";
import { usePersonalProfile } from "@/hooks/use-personal-profile";
import {
  roleTone,
  sectionOrder,
  sessionFromContext,
  type SectionId,
  type SessionPlan,
} from "@/lib/personalisation";
import { MOODS, type MoodId, type TrackId } from "@/lib/sanctuary";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Velora — Calm, Focus & Breathe" },
      {
        name: "description",
        content:
          "A calming digital sanctuary with guided 4-7-8 breathing, ambient soundscapes, mood-based focus sessions and a warm AI mind coach.",
      },
      { property: "og:title", content: "Velora — Calm, Focus & Breathe" },
      {
        property: "og:description",
        content:
          "Destress in minutes: guided breathing, ambient sound, and an empathetic AI mind coach for students, workers and everyday calm.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { profile } = usePersonalProfile();
  const [mood, setMood] = useState<MoodId | null>(null);
  const [track, setTrack] = useState<TrackId | null>(null);
  const [playing, setPlaying] = useState(false);

  const session = sessionFromContext(profile);
  const order = sectionOrder(profile);
  const tone = roleTone(profile?.role);

  const handleMood = (next: MoodId) => {
    setMood(next);
    const moodTrack = MOODS.find((m) => m.id === next)?.track ?? null;
    setTrack(moodTrack);
    setPlaying(Boolean(moodTrack));
  };

  const startSession = useCallback(
    (section: SectionId) => {
      if (session) {
        setMood(session.mood);
        setTrack(session.track);
        setPlaying(true);
      }
      window.requestAnimationFrame(() => {
        document.getElementById(`section-${section}`)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    },
    [session],
  );

  const sections: Record<SectionId, React.ReactNode> = {
    breathing: <BreathingVisualizer />,
    sounds: (
      <SoundPlayer
        activeTrack={track}
        playing={playing}
        onChange={(nextTrack, nextPlaying) => {
          setTrack(nextTrack);
          setPlaying(nextPlaying);
        }}
      />
    ),
    coach: <CoachChat mood={mood} intro={tone.coachIntro} />,
  };

  return (
    <main className="sanctuary-bg min-h-screen">
      <AccountNav />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-5 py-14 sm:px-8 sm:py-20">
        <WelcomeBanner />
        <PersonalCard onStartSession={startSession} />
        <MoodSelector active={mood} onSelect={handleMood} heading={tone.moodHeading} />
        {order.map((section, index) => (
          <div
            key={section}
            id={`section-${section}`}
            className={cn(
              "scroll-mt-6 rounded-[calc(var(--radius)+0.75rem)] transition-shadow",
              index === 0 &&
                session &&
                "ring-1 ring-primary/25 shadow-[var(--shadow-lift)] sm:-mx-4 sm:p-4",
            )}
          >
            {sections[section]}
          </div>
        ))}
        <footer className="pb-4 text-center text-sm text-muted-foreground">
          Breathe out. You made it to the end of the page — that&apos;s a small win.
        </footer>
      </div>
      <Toaster />
    </main>
  );
}
