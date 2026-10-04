import { useEffect, useRef, useState } from "react";
import { Leaf, Pause, Play, RefreshCw, Volume2, Waves } from "lucide-react";

import calmWater from "@/assets/calm-water.jpg";
import calmWaterVideo from "@/assets/calm-water.mp4.asset.json";
import calmWaterWebm from "@/assets/calm-water.webm.asset.json";
import waterAudio from "@/assets/calm-water-ambience.mp3.asset.json";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { AFFIRMATIONS } from "@/lib/sanctuary";
import { cn } from "@/lib/utils";

export function WelcomeBanner({ relaxing = false, waterPlaying = false, onWaterChange }: {
  relaxing?: boolean;
  waterPlaying?: boolean;
  onWaterChange?: (playing: boolean) => void;
}) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [motionPaused, setMotionPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [volume, setVolume] = useState(35);
  const [audioError, setAudioError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [soundPreferred, setSoundPreferred] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeRef = useRef<number | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    updateMotion();
    media.addEventListener("change", updateMotion);
    setSoundPreferred(window.localStorage.getItem("velora-water-sound") === "on");
    const savedVolume = Number(window.localStorage.getItem("velora-water-volume"));
    if (Number.isFinite(savedVolume) && savedVolume >= 0 && savedVolume <= 100 && window.localStorage.getItem("velora-water-volume") !== null) setVolume(savedVolume);
    return () => media.removeEventListener("change", updateMotion);
  }, []);

  useEffect(() => {
    if (!relaxing || !headerRef.current) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? false));
    observer.observe(headerRef.current);
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [relaxing]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (relaxing && !reducedMotion && !motionPaused && inView && pageVisible && !videoError) {
      void video.play().catch(() => {
        // A tab visibility change or a pause can interrupt play() without a media failure.
      });
    } else video.pause();
  }, [relaxing, reducedMotion, motionPaused, inView, pageVisible, videoError]);

  useEffect(() => {
    if (!relaxing) return;
    const audio = new Audio(waterAudio.url);
    audio.loop = true;
    audio.preload = "none";
    audio.volume = 0;
    audioRef.current = audio;
    const onError = () => { setAudioError(true); onWaterChange?.(false); };
    audio.addEventListener("error", onError);
    return () => {
      if (fadeRef.current !== null) window.clearInterval(fadeRef.current);
      audio.pause();
      audio.removeEventListener("error", onError);
      audio.src = "";
      audioRef.current = null;
    };
  }, [relaxing]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeRef.current !== null) window.clearInterval(fadeRef.current);
    const target = waterPlaying && pageVisible ? volume / 100 : 0;
    if (waterPlaying && pageVisible) {
      setAudioError(false);
      void audio.play().catch(() => { setAudioError(true); onWaterChange?.(false); });
    }
    const start = audio.volume;
    let tick = 0;
    fadeRef.current = window.setInterval(() => {
      tick += 1;
      audio.volume = Math.max(0, Math.min(1, start + (target - start) * (tick / 12)));
      if (tick >= 12) {
        if (fadeRef.current !== null) window.clearInterval(fadeRef.current);
        fadeRef.current = null;
        if (!waterPlaying || !pageVisible) audio.pause();
      }
    }, 40);
    return () => { if (fadeRef.current !== null) window.clearInterval(fadeRef.current); };
  }, [waterPlaying, volume, pageVisible, relaxing]);

  const toggleWater = () => {
    const next = !waterPlaying;
    setSoundPreferred(next);
    window.localStorage.setItem("velora-water-sound", next ? "on" : "off");
    onWaterChange?.(next);
  };

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
    <header
      ref={headerRef}
      className={cn(
        "animate-float-up text-center",
        relaxing && "water-welcome relative isolate flex min-h-[490px] flex-col justify-center overflow-hidden px-5 py-12 sm:min-h-[540px] sm:px-8 sm:py-16",
      )}
    >
      {relaxing ? (
        <div className="water-welcome__surface" aria-hidden>
          <img src={calmWater} alt="" width={1536} height={1024} className="water-welcome__image" />
          {!reducedMotion && !videoError ? (
            <video ref={videoRef} className="water-welcome__video" muted loop playsInline autoPlay preload="metadata" poster={calmWater} aria-hidden="true" onError={() => setVideoError(true)}>
              <source src={calmWaterWebm.url} type="video/webm" />
              <source src={calmWaterVideo.url} type="video/mp4" />
            </video>
          ) : null}
          <span className="water-welcome__veil" />
          <span className="water-welcome__ripple water-welcome__ripple--one" />
          <span className="water-welcome__ripple water-welcome__ripple--two" />
          <span className="water-welcome__ripple water-welcome__ripple--three" />
          <span className="water-welcome__reflection" />
        </div>
      ) : null}

      <div className={cn(relaxing && "relative z-10")}>
        <span className="inline-flex items-center gap-2.5 rounded-full border border-border bg-secondary/60 px-5 py-2 text-primary">
          <Leaf className="size-3.5 text-accent-foreground" aria-hidden />
          <span className="font-display text-lg font-light uppercase tracking-[0.42em]">Velora</span>
        </span>
        <h1 className="mx-auto mt-7 max-w-3xl text-balance font-display text-4xl font-light leading-tight text-foreground sm:text-5xl md:text-6xl">
          Welcome to your digital sanctuary.
          <span className="mt-1 block italic text-[color:var(--gold)]">Take a deep breath.</span>
        </h1>

        <div className={cn("mx-auto mt-8 flex max-w-2xl flex-col items-center gap-4 px-6 py-7 sm:px-10", relaxing ? "water-welcome__affirmation" : "glass-card")}>
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.32em] text-muted-foreground">
            Today&apos;s affirmation
          </p>
          <p
            className={cn(
              "min-h-16 text-pretty font-display text-xl font-light italic leading-relaxed text-foreground transition-all duration-700 sm:text-2xl",
              visible ? "translate-y-0 opacity-100 blur-0" : "translate-y-2 opacity-0 blur-[2px]",
            )}
          >
            “{AFFIRMATIONS[index]}”
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={refresh}
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-medium"
          >
            <RefreshCw className="size-4" aria-hidden />
            Another gentle thought
          </Button>
        </div>
        {relaxing ? (
          <div className="water-welcome__controls" aria-label="Water ambience controls">
            <Button type="button" variant="secondary" className="min-h-11 gap-2 rounded-full" onClick={toggleWater} disabled={audioError && waterPlaying} aria-label={waterPlaying ? "Pause water sound" : "Play water sound"}>
              {waterPlaying ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
              {waterPlaying ? "Pause water" : soundPreferred ? "Resume water" : "Play water sound"}
            </Button>
            <div className="flex min-w-28 items-center gap-2">
              <Volume2 className="size-4 shrink-0" aria-hidden />
              <Slider value={[volume]} max={100} step={1} onValueChange={(value) => {
                const next = value[0] ?? 0;
                setVolume(next);
                window.localStorage.setItem("velora-water-volume", String(next));
              }} aria-label="Water volume" className="w-24" />
            </div>
            {!reducedMotion && !videoError ? (
              <Button type="button" variant="ghost" size="icon" className="size-11 rounded-full" onClick={() => setMotionPaused((value) => !value)} aria-label={motionPaused ? "Play water motion" : "Pause water motion"} title={motionPaused ? "Play water motion" : "Pause water motion"}>
                {motionPaused ? <Waves className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
              </Button>
            ) : null}
          </div>
        ) : null}
        {relaxing && audioError ? <p className="mt-2 text-sm text-primary">Water sound is unavailable right now. Please try again.</p> : null}
      </div>
    </header>
  );
}
