import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, SkipForward, Sparkles, X } from "lucide-react";

import { CueAudio } from "@/lib/cue-audio";
import {
  EXERCISES,
  exerciseLength,
  exerciseSeconds,
  type Exercise,
} from "@/lib/exercises";
import { cn } from "@/lib/utils";

function stepAt(exercise: Exercise, elapsed: number) {
  let total = 0;
  for (let index = 0; index < exercise.steps.length; index++) {
    total += exercise.steps[index]!.seconds;
    if (elapsed < total) return { index, endsAt: total };
  }
  return { index: exercise.steps.length - 1, endsAt: total };
}

function clock(seconds: number) {
  const value = Math.max(0, Math.round(seconds));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}

export function ExercisePlayer({
  recommended,
  onComplete,
  onBegin,
}: {
  recommended?: Exercise | null;
  onComplete?: (exercise: Exercise) => void;
  onBegin?: () => void;
}) {
  const [active, setActive] = useState<Exercise | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const cue = useRef<CueAudio | null>(null);
  const lastStep = useRef(-1);

  useEffect(() => {
    cue.current = new CueAudio();
    return () => {
      cue.current?.dispose();
      cue.current = null;
    };
  }, []);

  const total = active ? exerciseSeconds(active) : 0;

  useEffect(() => {
    if (!active || !running) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [active, running]);

  const current = active ? stepAt(active, Math.min(elapsed, total - 1)) : null;

  // step chime
  useEffect(() => {
    if (!active || !current || finished) return;
    if (lastStep.current !== current.index) {
      if (lastStep.current !== -1) cue.current?.chime("step");
      lastStep.current = current.index;
    }
  }, [active, current, finished]);

  // completion
  useEffect(() => {
    if (!active || finished || elapsed < total) return;
    setRunning(false);
    setFinished(true);
    cue.current?.hum(false);
    cue.current?.chime("end");
    onComplete?.(active);
  }, [active, elapsed, total, finished, onComplete]);

  const start = (exercise: Exercise) => {
    onBegin?.();
    lastStep.current = -1;
    setActive(exercise);
    setElapsed(0);
    setFinished(false);
    setRunning(true);
    cue.current?.chime("step");
    if (exercise.hum) cue.current?.hum(true);
  };

  const finish = () => {
    cue.current?.hum(false);
    setActive(null);
    setRunning(false);
    setFinished(false);
    setElapsed(0);
    lastStep.current = -1;
  };

  const skip = () => {
    if (!active || !current) return;
    setElapsed(current.endsAt);
  };

  const progress = total ? Math.min(1, elapsed / total) : 0;
  const ring = useMemo(
    () => `conic-gradient(var(--primary) ${progress * 360}deg, transparent 0deg)`,
    [progress],
  );

  return (
    <section className="animate-float-up" aria-label="Guided audio exercises">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Guided exercises
        </h2>
        <p className="text-base text-muted-foreground">
          Short practices that run themselves — a soft chime marks each step, so you can close your
          eyes.
        </p>
      </div>

      {active ? (
        <div className="glass-card mt-6 flex flex-col items-center gap-6 px-6 py-10 sm:px-12">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {active.title}
          </p>

          <div
            className="grid size-44 place-items-center rounded-full p-[3px] sm:size-52"
            style={{ background: ring }}
          >
            <div className="grid size-full place-items-center rounded-full bg-card text-center">
              <div>
                <p className="text-3xl font-light tabular-nums text-primary">
                  {clock(total - elapsed)}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {finished ? "complete" : "remaining"}
                </p>
              </div>
            </div>
          </div>

          <p className="max-w-lg text-center font-display text-2xl font-light leading-relaxed text-foreground">
            {finished
              ? "That's the whole practice. Well done for staying with it."
              : (current ? active.steps[current.index]!.text : "")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {!finished ? (
              <>
                <button
                  type="button"
                  onClick={() => setRunning((value) => !value)}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {running ? <Pause className="size-4" /> : <Play className="size-4" />}
                  {running ? "Pause" : "Resume"}
                </button>
                <button
                  type="button"
                  onClick={skip}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-secondary px-6 text-sm font-medium text-primary transition-colors hover:bg-accent"
                >
                  <SkipForward className="size-4" />
                  Skip step
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={finish}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-secondary px-6 text-sm font-medium text-primary transition-colors hover:bg-accent"
            >
              <X className="size-4" />
              {finished ? "Close" : "Finish"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {EXERCISES.map((exercise) => {
            const picked = recommended?.id === exercise.id;
            return (
              <div
                key={exercise.id}
                className={cn(
                  "glass-card flex flex-col gap-3 px-5 py-5",
                  picked && "ring-1 ring-primary/30",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-base font-medium text-foreground">{exercise.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{exercise.subtitle}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">
                    {exerciseLength(exercise)}
                  </span>
                </div>
                {picked ? (
                  <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-primary">
                    <Sparkles className="size-3.5" aria-hidden />
                    Picked for you
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => start(exercise)}
                  className="mt-auto min-h-11 self-start rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Begin
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
