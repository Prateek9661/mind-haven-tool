import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type Phase = { key: "inhale" | "hold" | "exhale"; label: string; seconds: number };

const CYCLE: Phase[] = [
  { key: "inhale", label: "Breathe in", seconds: 4 },
  { key: "hold", label: "Hold", seconds: 7 },
  { key: "exhale", label: "Breathe out", seconds: 8 },
];

export function BreathingVisualizer() {
  const [running, setRunning] = useState(true);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [remaining, setRemaining] = useState(CYCLE[0]!.seconds);
  const [cycles, setCycles] = useState(0);
  const tick = useRef<number | null>(null);

  const phase = CYCLE[phaseIndex]!;

  useEffect(() => {
    if (!running) return;
    tick.current = window.setInterval(() => {
      setRemaining((value) => {
        if (value > 1) return value - 1;
        setPhaseIndex((index) => {
          const next = (index + 1) % CYCLE.length;
          if (next === 0) setCycles((c) => c + 1);
          setRemaining(CYCLE[next]!.seconds);
          return next;
        });
        return CYCLE[(phaseIndex + 1) % CYCLE.length]!.seconds;
      });
    }, 1000);
    return () => {
      if (tick.current) window.clearInterval(tick.current);
    };
  }, [running, phaseIndex]);

  const scale = useMemo(() => {
    if (phase.key === "inhale") return 1;
    if (phase.key === "hold") return 1;
    return 0.62;
  }, [phase.key]);

  const transition =
    phase.key === "inhale" ? "4s" : phase.key === "exhale" ? "8s" : "0.6s";

  return (
    <section
      className="glass-card animate-float-up flex flex-col items-center gap-8 px-6 py-12 sm:px-12"
      aria-label="Breathing visualizer"
    >
      <div className="text-center">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          4 · 7 · 8 breathing
        </h2>
        <p className="mt-2 text-base text-muted-foreground">
          Follow the light. Let it carry your breath.
        </p>
      </div>

      <div className="relative grid h-72 w-72 place-items-center sm:h-80 sm:w-80">
        <div
          className="absolute inset-0 rounded-full opacity-60 blur-2xl transition-transform ease-in-out"
          style={{
            background: "var(--gradient-glow)",
            transform: `scale(${running ? scale * 1.05 : 0.8})`,
            transitionDuration: running ? transition : "1.5s",
          }}
          aria-hidden
        />
        <div
          className="absolute size-56 rounded-full border border-border/70 sm:size-64"
          aria-hidden
        />
        <div
          className="relative grid size-56 place-items-center rounded-full transition-transform ease-in-out sm:size-64"
          style={{
            background: "var(--gradient-glow)",
            boxShadow: "var(--shadow-glow)",
            transform: `scale(${running ? scale : 0.75})`,
            transitionDuration: running ? transition : "1.5s",
          }}
        >
          <div className="text-center">
            <p className="text-xl font-semibold text-foreground sm:text-2xl">{phase.label}</p>
            <p className="mt-1 text-4xl font-light tabular-nums text-primary">{remaining}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setRunning((value) => !value)}
          className="min-h-12 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {running ? "Pause the guide" : "Begin breathing"}
        </button>
        <button
          type="button"
          onClick={() => {
            setPhaseIndex(0);
            setRemaining(CYCLE[0]!.seconds);
            setCycles(0);
          }}
          className="min-h-12 rounded-full bg-secondary px-7 text-sm font-medium text-primary transition-colors hover:bg-accent"
        >
          Restart
        </button>
      </div>

      <p className={cn("text-sm text-muted-foreground", cycles === 0 && "opacity-70")}>
        {cycles === 0
          ? "One round is about 19 seconds. Four rounds is plenty."
          : `${cycles} calm ${cycles === 1 ? "round" : "rounds"} completed.`}
      </p>
    </section>
  );
}
