import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { WelcomeBanner } from "@/components/sanctuary/welcome-banner";
import { MoodSelector } from "@/components/sanctuary/mood-selector";
import { BreathingVisualizer } from "@/components/sanctuary/breathing-visualizer";
import { SoundPlayer } from "@/components/sanctuary/sound-player";
import { CoachChat } from "@/components/sanctuary/coach-chat";
import { Toaster } from "@/components/ui/sonner";
import { MOODS, type MoodId, type TrackId } from "@/lib/sanctuary";

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
  const [mood, setMood] = useState<MoodId | null>(null);
  const [track, setTrack] = useState<TrackId | null>(null);
  const [playing, setPlaying] = useState(false);

  const handleMood = (next: MoodId) => {
    setMood(next);
    const moodTrack = MOODS.find((m) => m.id === next)?.track ?? null;
    setTrack(moodTrack);
    setPlaying(Boolean(moodTrack));
  };

  return (
    <main className="sanctuary-bg min-h-screen">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-5 py-14 sm:px-8 sm:py-20">
        <WelcomeBanner />
        <MoodSelector active={mood} onSelect={handleMood} />
        <BreathingVisualizer />
        <SoundPlayer
          activeTrack={track}
          playing={playing}
          onChange={(nextTrack, nextPlaying) => {
            setTrack(nextTrack);
            setPlaying(nextPlaying);
          }}
        />
        <CoachChat mood={mood} />
        <footer className="pb-4 text-center text-sm text-muted-foreground">
          Breathe out. You made it to the end of the page — that&apos;s a small win.
        </footer>
      </div>
      <Toaster />
    </main>
  );
}
