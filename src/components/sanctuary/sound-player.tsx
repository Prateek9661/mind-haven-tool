import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";

import { AmbientEngine } from "@/lib/ambient-audio";
import { TRACKS, type TrackId } from "@/lib/sanctuary";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

export function SoundPlayer({
  activeTrack,
  playing,
  onChange,
}: {
  activeTrack: TrackId | null;
  playing: boolean;
  onChange: (track: TrackId | null, playing: boolean) => void;
}) {
  const engine = useRef<AmbientEngine | null>(null);
  const [volume, setVolume] = useState(60);

  useEffect(() => {
    engine.current = new AmbientEngine();
    return () => {
      engine.current?.dispose();
      engine.current = null;
    };
  }, []);

  useEffect(() => {
    const instance = engine.current;
    if (!instance) return;
    if (playing && activeTrack) {
      void instance.play(activeTrack);
    } else {
      instance.stop();
    }
  }, [playing, activeTrack]);

  useEffect(() => {
    engine.current?.setVolume(volume / 100);
  }, [volume]);

  const toggle = (id: TrackId) => {
    if (activeTrack === id && playing) {
      onChange(id, false);
    } else {
      onChange(id, true);
    }
  };

  return (
    <section className="animate-float-up" aria-label="Ambient sound player">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Ambient sound & focus
        </h2>
        <p className="text-base text-muted-foreground">
          Softly generated soundscapes — nothing to download, nothing to wait for.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TRACKS.map((track) => {
          const isActive = activeTrack === track.id && playing;
          return (
            <div
              key={track.id}
              className={cn(
                "glass-card flex items-center gap-4 px-5 py-5 transition-all duration-500",
                isActive && "bg-accent/70 shadow-[var(--shadow-lift)]",
              )}
            >
              <button
                type="button"
                onClick={() => toggle(track.id)}
                aria-label={`${isActive ? "Pause" : "Play"} ${track.title}`}
                className={cn(
                  "grid size-14 shrink-0 place-items-center rounded-full bg-secondary text-primary transition-all",
                  "hover:scale-105 active:scale-95",
                  isActive && "bg-primary text-primary-foreground",
                )}
              >
                {isActive ? <Pause className="size-5" /> : <Play className="ml-0.5 size-5" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-medium text-foreground">{track.title}</p>
                <p className="truncate text-sm text-muted-foreground">{track.subtitle}</p>
              </div>
              <div className="flex h-8 shrink-0 items-end gap-1" aria-hidden>
                {[0, 1, 2, 3, 4].map((bar) => (
                  <span
                    key={bar}
                    className={cn(
                      "w-1 rounded-full bg-primary/45 transition-all duration-500",
                      isActive ? "h-7" : "h-2",
                    )}
                    style={
                      isActive
                        ? {
                            animation: `wave ${1 + bar * 0.18}s ease-in-out ${bar * 0.1}s infinite`,
                          }
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card mt-4 flex items-center gap-4 px-6 py-5">
        <Volume2 className="size-5 shrink-0 text-primary" aria-hidden />
        <Slider
          value={[volume]}
          onValueChange={(value) => setVolume(value[0] ?? 0)}
          max={100}
          step={1}
          aria-label="Volume"
          className="flex-1"
        />
        <span className="w-10 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
          {volume}
        </span>
      </div>
    </section>
  );
}
