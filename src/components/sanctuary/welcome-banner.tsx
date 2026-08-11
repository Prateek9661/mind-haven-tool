import { useEffect, useState } from "react";
import { Leaf, RefreshCw } from "lucide-react";

import { AFFIRMATIONS } from "@/lib/sanctuary";
import { cn } from "@/lib/utils";

export function WelcomeBanner() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setIndex(Math.floor(Math.random() * AFFIRMATIONS.length));
  }, []);

  const refresh = () => {
    setVisible(false);
    window.setTimeout(() => {
      setIndex((i) => (i + 1 + Math.floor(Math.random() * (AFFIRMATIONS.length - 1))) % AFFIRMATIONS.length);
      setVisible(true);
    }, 400);
  };

  useEffect(() => {
    const timer = window.setInterval(refresh, 18000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="animate-float-up text-center">
      <span className="inline-flex items-center gap-2.5 rounded-full border border-border bg-secondary/60 px-5 py-2 text-primary">
        <Leaf className="size-3.5 text-accent-foreground" aria-hidden />
        <span className="font-display text-lg font-light uppercase tracking-[0.42em]">Velora</span>
      </span>
      <h1 className="mx-auto mt-7 max-w-3xl text-balance font-display text-4xl font-light leading-tight text-foreground sm:text-5xl md:text-6xl">
        Welcome to your digital sanctuary.
        <span className="mt-1 block italic text-[color:var(--gold)]">Take a deep breath.</span>
      </h1>

      <div className="glass-card mx-auto mt-8 flex max-w-2xl flex-col items-center gap-4 px-6 py-7 sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Today&apos;s affirmation
        </p>
        <p
          className={cn(
            "min-h-16 text-pretty text-lg leading-relaxed text-foreground transition-all duration-700 sm:text-xl",
            visible ? "translate-y-0 opacity-100 blur-0" : "translate-y-2 opacity-0 blur-[2px]",
          )}
        >
          “{AFFIRMATIONS[index]}”
        </p>
        <button
          type="button"
          onClick={refresh}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-secondary px-5 text-sm font-medium text-primary transition-colors hover:bg-accent"
        >
          <RefreshCw className="size-4" aria-hidden />
          Another gentle thought
        </button>
      </div>
    </header>
  );
}
