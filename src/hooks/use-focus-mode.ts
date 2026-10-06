import { useCallback, useEffect, useRef, useState } from "react";

type WakeLockLike = { release: () => Promise<void> };
const PREF_KEY = "velora-focus-pref";

export type FocusPref = "ask" | "always" | "never";

export function useFocusMode() {
  const [active, setActive] = useState(false);
  const [pref, setPrefState] = useState<FocusPref>("ask");
  const lock = useRef<WakeLockLike | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(PREF_KEY);
    if (saved === "always" || saved === "never") setPrefState(saved);
  }, []);

  const setPref = useCallback((next: FocusPref) => {
    setPrefState(next);
    window.localStorage.setItem(PREF_KEY, next);
  }, []);

  const acquire = useCallback(async () => {
    try {
      const wl = (navigator as Navigator & {
        wakeLock?: { request: (t: "screen") => Promise<WakeLockLike> };
      }).wakeLock;
      if (wl) lock.current = await wl.request("screen");
    } catch {
      /* not allowed — ignore */
    }
  }, []);

  const start = useCallback(async () => {
    setActive(true);
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      /* ignore */
    }
    await acquire();
  }, [acquire]);

  const stop = useCallback(async () => {
    setActive(false);
    try {
      await lock.current?.release();
    } catch {
      /* ignore */
    }
    lock.current = null;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    const onVis = () => {
      if (document.visibilityState === "visible") void acquire();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [active, acquire]);

  return { active, pref, setPref, start, stop };
}
