/**
 * Tiny Web Audio helper for guided exercises: soft chimes between steps,
 * a warmer closing tone, and a low hum to breathe along with.
 */
export class CueAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private humNodes: { osc: OscillatorNode; gain: GainNode } | null = null;

  private ensure() {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  chime(kind: "step" | "end" = "step") {
    const ctx = this.ensure();
    const out = this.master!;
    const now = ctx.currentTime;
    const partials = kind === "end" ? [396, 528, 792] : [660, 990];
    partials.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const peak = (kind === "end" ? 0.2 : 0.14) / (index + 1);
      const length = kind === "end" ? 3.2 : 1.6;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + length);
      osc.connect(gain).connect(out);
      osc.start(now);
      osc.stop(now + length + 0.1);
    });
  }

  hum(on: boolean) {
    if (on) {
      if (this.humNodes) return;
      const ctx = this.ensure();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 146.83; // low D — easy to hum along with
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1);
      osc.connect(gain).connect(this.master!);
      osc.start();
      this.humNodes = { osc, gain };
      return;
    }
    if (!this.humNodes || !this.ctx) return;
    const { osc, gain } = this.humNodes;
    const now = this.ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.6);
    window.setTimeout(() => {
      try {
        osc.stop();
      } catch {
        /* already stopped */
      }
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {
        /* noop */
      }
    }, 700);
    this.humNodes = null;
  }

  dispose() {
    this.hum(false);
    const ctx = this.ctx;
    this.ctx = null;
    this.master = null;
    window.setTimeout(() => void ctx?.close(), 800);
  }
}
