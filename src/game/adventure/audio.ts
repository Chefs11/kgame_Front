/**
 * Audio del Modo aventura: 100 % sintetizado con Web Audio (sin archivos).
 * Buses: maestro → (música con filtro paso-bajo) + efectos.
 *
 * Música original en bucle: 112 BPM, pentatónica mayor de Do (Do Re Mi Sol La),
 * lead de onda cuadrada, bajo triangular y percusión de ruido, con un
 * planificador con anticipación basado en el reloj del AudioContext (sin deriva).
 */
import { AUDIO, MUSIC_SOURCE } from "./config";

export type Sfx = "step" | "jump" | "land" | "question" | "correct" | "wrong" | "complete" | "exitOpen";

/* Frecuencias de la pentatónica mayor de Do en varias octavas */
const NOTE: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, G3: 196.0, A3: 220.0,
  C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.0, A4: 440.0,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0, C6: 1046.5,
};

/**
 * Melodía propia (32 corcheas = 4 compases), pensada como un paseo tranquilo:
 * frases que suben y descansan en Sol y en Do. "-" = silencio.
 */
const LEAD = [
  "E4", "-", "G4", "A4", "G4", "-", "E4", "D4",
  "C4", "-", "D4", "E4", "G4", "-", "-", "-",
  "A4", "-", "C5", "A4", "G4", "-", "E4", "G4",
  "D4", "-", "E4", "D4", "C4", "-", "-", "-",
  "E4", "G4", "A4", "-", "C5", "-", "D5", "C5",
  "A4", "-", "G4", "-", "E4", "G4", "A4", "-",
  "G4", "-", "E4", "D4", "E4", "-", "G4", "-",
  "C4", "-", "-", "-", "D4", "-", "C4", "-",
];
const BASS = ["C3", "G3", "A3", "E3", "C3", "G3", "D3", "G3"];

export class AdventureAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private musicFilter: BiquadFilterNode | null = null;
  private sfxBus: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private timer: number | null = null;
  private step = 0;
  private nextTime = 0;
  private musicOn = false;
  private fileAudio: HTMLAudioElement | null = null;
  private volume: number = AUDIO.defaultVolume;
  private muted = true;

  /** Debe llamarse dentro de un gesto del usuario (clic en «Jugar»). */
  async unlock(): Promise<void> {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const Ctor = window.AudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.musicFilter = this.ctx.createBiquadFilter();
      this.musicFilter.type = "lowpass";
      this.musicFilter.frequency.value = 18000;
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = AUDIO.musicGain;
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = AUDIO.sfxGain;
      this.musicBus.connect(this.musicFilter).connect(this.master);
      this.sfxBus.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.noise = this.makeNoise();
      this.applyVolume();
    }
    if (this.ctx.state === "suspended") await this.ctx.resume();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.applyVolume();
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    this.applyVolume();
  }

  private applyVolume(): void {
    if (!this.ctx || !this.master) return;
    const target = this.muted ? 0 : this.volume;
    this.master.gain.setTargetAtTime(target, this.ctx.currentTime, 0.03);
    if (this.fileAudio) this.fileAudio.volume = target * AUDIO.musicGain * 2;
  }

  /* ---------------------------------------------------------- música */

  startMusic(): void {
    if (!this.ctx || this.musicOn) return;
    this.musicOn = true;
    if (MUSIC_SOURCE.kind === "file") {
      // Punto de extensión: pista en public/audio en lugar de la síntesis
      this.fileAudio ??= Object.assign(new Audio(MUSIC_SOURCE.url), { loop: true });
      this.applyVolume();
      void this.fileAudio.play().catch(() => {});
      return;
    }
    this.nextTime = this.ctx.currentTime + 0.05;
    this.timer = window.setInterval(this.schedule, AUDIO.lookaheadMs);
  }

  stopMusic(): void {
    this.musicOn = false;
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.fileAudio?.pause();
  }

  /** Atenúa la música (≈ −8 dB y paso-bajo) mientras hay una pregunta abierta. */
  duck(on: boolean): void {
    if (!this.ctx || !this.musicBus || !this.musicFilter) return;
    const t = this.ctx.currentTime;
    const gain = AUDIO.musicGain * (on ? Math.pow(10, AUDIO.duckDb / 20) : 1);
    this.musicBus.gain.setTargetAtTime(gain, t, 0.08);
    this.musicFilter.frequency.setTargetAtTime(on ? AUDIO.duckLowpassHz : 18000, t, 0.08);
  }

  private schedule = (): void => {
    if (!this.ctx) return;
    const eighth = 60 / AUDIO.bpm / 2;
    while (this.nextTime < this.ctx.currentTime + AUDIO.scheduleAheadS) {
      const i = this.step % LEAD.length;
      const t = this.nextTime;
      const n = LEAD[i];
      if (n !== "-") this.tone("square", NOTE[n], t, eighth * 0.9, 0.09, this.musicBus);
      if (i % 4 === 0) this.tone("triangle", NOTE[BASS[(i / 4) % BASS.length]], t, eighth * 3.6, 0.28, this.musicBus);
      // Percusión suave: hi-hat en contratiempos, caja ligera en 2 y 4
      if (i % 2 === 1) this.hit(t, 0.025, 0.05, 7000, this.musicBus);
      if (i % 8 === 4) this.hit(t, 0.09, 0.12, 1800, this.musicBus);
      this.nextTime += eighth;
      this.step++;
    }
  };

  /* ---------------------------------------------------------- efectos */

  play(sfx: Sfx): void {
    const ctx = this.ctx;
    if (!ctx || this.muted) return;
    const t = ctx.currentTime + 0.005;
    const bus = this.sfxBus;
    switch (sfx) {
      case "step":
        this.hit(t, 0.03, 0.05, 900, bus);
        break;
      case "jump":
        this.sweep("square", 330, 620, t, 0.12, 0.08);
        break;
      case "land":
        this.hit(t, 0.06, 0.1, 500, bus);
        break;
      case "question":
        this.tone("triangle", NOTE.G5, t, 0.07, 0.2, bus);
        this.tone("triangle", NOTE.C6, t + 0.07, 0.1, 0.2, bus);
        break;
      case "correct":
        ["C5", "E5", "G5", "C6"].forEach((n, k) => this.tone("square", NOTE[n], t + k * 0.07, 0.08, 0.09, bus));
        break;
      case "wrong":
        this.tone("triangle", NOTE.E4, t, 0.14, 0.22, bus);
        this.tone("triangle", NOTE.C4, t + 0.15, 0.2, 0.2, bus);
        break;
      case "exitOpen":
        ["G4", "C5", "E5"].forEach((n, k) => this.tone("triangle", NOTE[n], t + k * 0.09, 0.12, 0.2, bus));
        break;
      case "complete":
        ["C5", "D5", "E5", "G5", "E5", "G5", "C6"].forEach((n, k) =>
          this.tone("square", NOTE[n], t + k * 0.1, k === 6 ? 0.35 : 0.09, 0.09, bus),
        );
        break;
    }
  }

  /* ---------------------------------------------------------- síntesis */

  private tone(type: OscillatorType, freq: number, t: number, dur: number, gain: number, bus: AudioNode | null): void {
    if (!this.ctx || !bus) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  private sweep(type: OscillatorType, f0: number, f1: number, t: number, dur: number, gain: number): void {
    if (!this.ctx || !this.sfxBus) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.sfxBus);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  private hit(t: number, dur: number, gain: number, cutoff: number, bus: AudioNode | null): void {
    if (!this.ctx || !this.noise || !bus) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    f.type = cutoff > 3000 ? "highpass" : "lowpass";
    f.frequency.value = cutoff;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(bus);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  private makeNoise(): AudioBuffer | null {
    if (!this.ctx) return null;
    const len = Math.floor(this.ctx.sampleRate * 0.5);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    let seed = 12345;
    for (let i = 0; i < len; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      data[i] = (seed / 0x7fffffff) * 2 - 1;
    }
    return buf;
  }

  dispose(): void {
    this.stopMusic();
    void this.ctx?.close().catch(() => {});
    this.ctx = null;
  }
}

/** Una sola instancia: la música sigue entre niveles y el estado de silencio es global. */
let shared: AdventureAudio | null = null;
export function getAdventureAudio(): AdventureAudio {
  shared ??= new AdventureAudio();
  return shared;
}
