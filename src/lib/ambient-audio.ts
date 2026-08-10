import type { TrackId } from "./sanctuary";

type Voice = {
  nodes: AudioNode[];
  timers: number[];
};

/**
 * Procedurally generated ambience via the Web Audio API — no external files,
 * no network, endless loops that never click or repeat.
 */
export class AmbientEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private voice: Voice | null = null;
  private volume = 0.6;
  private analyser: AnalyserNode | null = null;

  private ensureContext() {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.master.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  getAnalyser() {
    return this.analyser;
  }

  private noiseBuffer(ctx: AudioContext, seconds = 4) {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  private buildRain(ctx: AudioContext, out: GainNode): Voice {
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(ctx);
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1400;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 340;
    const g = ctx.createGain();
    g.gain.value = 0.55;
    src.connect(hp).connect(lp).connect(g).connect(out);
    src.start();

    // slow swells in the downpour
    const swell = ctx.createOscillator();
    const swellGain = ctx.createGain();
    swell.frequency.value = 0.06;
    swellGain.gain.value = 260;
    swell.connect(swellGain).connect(lp.frequency);
    swell.start();

    return { nodes: [src, lp, hp, g, swell, swellGain], timers: [] };
  }

  private buildHealing(ctx: AudioContext, out: GainNode): Voice {
    const g = ctx.createGain();
    g.gain.value = 0.18;
    g.connect(out);
    const nodes: AudioNode[] = [g];
    [438, 438 * 2, 438 * 1.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq + i * 0.6;
      const og = ctx.createGain();
      og.gain.value = i === 0 ? 0.9 : 0.16;
      osc.connect(og).connect(g);
      osc.start();
      nodes.push(osc, og);
    });
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.09;
    lfoGain.gain.value = 0.08;
    lfo.connect(lfoGain).connect(g.gain);
    lfo.start();
    nodes.push(lfo, lfoGain);
    return { nodes, timers: [] };
  }

  private buildForest(ctx: AudioContext, out: GainNode): Voice {
    // stream = filtered noise
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(ctx);
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 900;
    bp.Q.value = 0.6;
    const g = ctx.createGain();
    g.gain.value = 0.4;
    src.connect(bp).connect(g).connect(out);
    src.start();

    const birdBus = ctx.createGain();
    birdBus.gain.value = 0.12;
    birdBus.connect(out);

    const chirp = () => {
      if (!this.ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const og = ctx.createGain();
      const base = 1700 + Math.random() * 1400;
      osc.type = "sine";
      osc.frequency.setValueAtTime(base, now);
      osc.frequency.exponentialRampToValueAtTime(base * 1.5, now + 0.09);
      osc.frequency.exponentialRampToValueAtTime(base * 0.85, now + 0.2);
      og.gain.setValueAtTime(0.0001, now);
      og.gain.exponentialRampToValueAtTime(0.5, now + 0.03);
      og.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      osc.connect(og).connect(birdBus);
      osc.start(now);
      osc.stop(now + 0.32);
    };

    const timer = window.setInterval(
      () => {
        const bursts = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < bursts; i++) window.setTimeout(chirp, i * 220 + Math.random() * 200);
      },
      2600 + Math.random() * 1500,
    );

    return { nodes: [src, bp, g, birdBus], timers: [timer] };
  }

  private buildLofi(ctx: AudioContext, out: GainNode): Voice {
    const bus = ctx.createGain();
    bus.gain.value = 0.5;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1900;
    bus.connect(lp).connect(out);

    // vinyl hiss
    const hiss = ctx.createBufferSource();
    hiss.buffer = this.noiseBuffer(ctx);
    hiss.loop = true;
    const hissGain = ctx.createGain();
    hissGain.gain.value = 0.03;
    hiss.connect(hissGain).connect(out);
    hiss.start();

    const chords = [
      [220, 261.63, 329.63],
      [196, 246.94, 293.66],
      [174.61, 220, 261.63],
      [196, 233.08, 293.66],
    ];
    let step = 0;

    const playChord = () => {
      if (!this.ctx) return;
      const now = ctx.currentTime;
      const chord = chords[step % chords.length] ?? chords[0]!;
      step += 1;
      chord.forEach((freq, i) => {

        const osc = ctx.createOscillator();
        const og = ctx.createGain();
        osc.type = i === 0 ? "triangle" : "sine";
        osc.frequency.value = freq;
        og.gain.setValueAtTime(0.0001, now);
        og.gain.exponentialRampToValueAtTime(0.22, now + 0.6);
        og.gain.exponentialRampToValueAtTime(0.0001, now + 3.6);
        osc.connect(og).connect(bus);
        osc.start(now);
        osc.stop(now + 3.8);
      });
      // soft kick
      const kick = ctx.createOscillator();
      const kg = ctx.createGain();
      kick.frequency.setValueAtTime(120, now);
      kick.frequency.exponentialRampToValueAtTime(48, now + 0.16);
      kg.gain.setValueAtTime(0.35, now);
      kg.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      kick.connect(kg).connect(bus);
      kick.start(now);
      kick.stop(now + 0.32);
    };

    playChord();
    const timer = window.setInterval(playChord, 3400);
    return { nodes: [bus, lp, hiss, hissGain], timers: [timer] };
  }

  private build(track: TrackId, ctx: AudioContext, out: GainNode): Voice {
    switch (track) {
      case "rain":
        return this.buildRain(ctx, out);
      case "lofi":
        return this.buildLofi(ctx, out);
      case "forest":
        return this.buildForest(ctx, out);
      case "healing":
      default:
        return this.buildHealing(ctx, out);
    }
  }

  private teardownVoice() {
    if (!this.voice) return;
    this.voice.timers.forEach((t) => window.clearInterval(t));
    this.voice.nodes.forEach((node) => {
      try {
        if ("stop" in node && typeof (node as OscillatorNode).stop === "function") {
          (node as OscillatorNode).stop();
        }
      } catch {
        /* already stopped */
      }
      try {
        node.disconnect();
      } catch {
        /* noop */
      }
    });
    this.voice = null;
  }

  async play(track: TrackId) {
    const ctx = this.ensureContext();
    if (ctx.state === "suspended") await ctx.resume();
    const master = this.master!;
    // fade out any existing voice, then swap
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0.0001, now + 0.25);
    window.setTimeout(() => {
      if (!this.ctx || !this.master) return;
      this.teardownVoice();
      this.voice = this.build(track, this.ctx, this.master);
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setValueAtTime(0.0001, t);
      this.master.gain.linearRampToValueAtTime(Math.max(this.volume, 0.0001), t + 1.2);
    }, 260);
  }

  stop() {
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0.0001, now + 0.6);
    window.setTimeout(() => this.teardownVoice(), 700);
  }

  setVolume(value: number) {
    this.volume = value;
    if (this.ctx && this.master && this.voice) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.linearRampToValueAtTime(Math.max(value, 0.0001), now + 0.2);
    }
  }

  dispose() {
    this.teardownVoice();
    this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.analyser = null;
  }
}
