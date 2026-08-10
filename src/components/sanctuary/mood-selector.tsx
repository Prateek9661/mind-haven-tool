import { CloudRain, Focus, Waves, Moon } from "lucide-react";

import { MOODS, type MoodId } from "@/lib/sanctuary";
import { cn } from "@/lib/utils";

const ICONS = {
  overwhelmed: CloudRain,
  focus: Focus,
  anxious: Waves,
  unwind: Moon,
} as const;

export function MoodSelector({
  active,
  onSelect,
}: {
  active: MoodId | null;
  onSelect: (mood: MoodId) => void;
}) {
  const activeMood = MOODS.find((mood) => mood.id === active) ?? null;

  return (
    <section className="animate-float-up" aria-label="Mood selector">
      <h2 className="text-center text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        How are you arriving today?
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MOODS.map((mood) => {
          const Icon = ICONS[mood.id];
          const isActive = mood.id === active;
          return (
            <button
              key={mood.id}
              type="button"
              onClick={() => onSelect(mood.id)}
              aria-pressed={isActive}
              className={cn(
                "glass-card group flex min-h-24 items-center gap-4 px-5 py-5 text-left transition-all duration-500",
                "hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]",
                isActive && "bg-secondary/80 ring-2 ring-ring/50",
              )}
            >
              <span
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-2xl bg-accent text-primary transition-colors",
                  isActive && "bg-primary text-primary-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 text-base font-medium leading-tight text-foreground">
                {mood.label}
              </span>
            </button>
          );
        })}
      </div>
      <p
        className={cn(
          "mt-5 text-center text-sm text-muted-foreground transition-all duration-700",
          activeMood ? "opacity-100" : "opacity-0",
        )}
      >
        {activeMood?.note ?? "\u00a0"}
      </p>
    </section>
  );
}
