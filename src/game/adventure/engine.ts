/**
 * Motor del Modo aventura: bucle de paso fijo (60 Hz) con acumulador y render
 * interpolado, escalado pixelado al canvas visible y pausa automática.
 * React solo crea el canvas y escucha eventos; nada se re-renderiza por frame.
 */
import type { LoadedArt } from "./assets/manifest";
import { RENDER } from "./config";
import { InputController, type VirtualKey } from "./input";
import type { Level } from "./level";
import { Renderer } from "./render";
import { World, type WorldEventHandler } from "./world";

const STEP = 1 / 60;

export interface EngineOptions {
  canvas: HTMLCanvasElement;
  level: Level;
  art: LoadedArt;
  usedBlocks: readonly string[];
  reducedMotion: boolean;
  onEvent: WorldEventHandler;
  onPause: () => void;
  onMute: () => void;
}

export class AdventureEngine {
  readonly world: World;
  readonly input: InputController;
  private readonly renderer: Renderer;
  private readonly ctx: CanvasRenderingContext2D;
  private raf = 0;
  private last = 0;
  private acc = 0;
  private running = false;
  /** Pausa pedida por la UI (pregunta abierta, menú, banner). */
  private holds = new Set<string>();
  private resizeObs: ResizeObserver | null = null;
  private frames = 0;
  private fpsStart = 0;
  /** Cuadros por segundo medidos (diagnóstico). */
  fps = 0;

  constructor(private readonly opts: EngineOptions) {
    this.world = new World(opts.level, opts.onEvent);
    this.world.restoreUsed(opts.usedBlocks);
    this.world.reducedMotion = opts.reducedMotion;
    this.renderer = new Renderer(opts.art);
    this.renderer.reducedMotion = opts.reducedMotion;
    this.input = new InputController({ onPause: opts.onPause, onMute: opts.onMute });
    const ctx = opts.canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas 2D no disponible");
    this.ctx = ctx;
  }

  start(): void {
    this.input.attach();
    document.addEventListener("visibilitychange", this.onVisibility);
    window.addEventListener("blur", this.onBlur);
    this.resizeObs = new ResizeObserver(() => this.resize());
    const parent = this.opts.canvas.parentElement;
    if (parent) this.resizeObs.observe(parent);
    this.resize();
    this.running = true;
    this.last = performance.now();
    this.fpsStart = this.last;
    this.raf = requestAnimationFrame(this.frame);
  }

  destroy(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.input.detach();
    document.removeEventListener("visibilitychange", this.onVisibility);
    window.removeEventListener("blur", this.onBlur);
    this.resizeObs?.disconnect();
  }

  /** Pausa con un motivo; el juego corre solo si no queda ningún motivo. */
  hold(reason: string): void {
    this.holds.add(reason);
    this.input.enabled = false;
    this.input.clear();
  }

  release(reason: string, lockMs = 0): void {
    this.holds.delete(reason);
    if (this.holds.size === 0) {
      this.input.enabled = true;
      this.input.clear();
      if (lockMs > 0) this.world.lockInput(lockMs);
      this.last = performance.now();
      this.acc = 0;
    }
  }

  get paused(): boolean {
    return this.holds.size > 0 || document.hidden;
  }

  /** prefers-reduced-motion o «Efectos reducidos»: sin parallax, destellos ni cámara suavizada. */
  setReducedMotion(on: boolean): void {
    this.world.reducedMotion = on;
    this.renderer.reducedMotion = on;
    if (on) for (let i = 0; i < this.world.plife.length; i++) this.world.plife[i] = 0;
  }

  setVirtual(key: VirtualKey, down: boolean): void {
    this.input.setVirtual(key, down);
  }

  private onVisibility = (): void => {
    if (document.hidden) this.input.clear();
    this.last = performance.now();
    this.acc = 0;
  };

  private onBlur = (): void => {
    this.input.clear();
    this.opts.onPause();
  };

  /** Ajusta el canvas visible al contenedor (con devicePixelRatio). */
  private resize(): void {
    const canvas = this.opts.canvas;
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio || 1;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    this.ctx.imageSmoothingEnabled = false;
    this.draw(1);
  }

  private draw(alpha: number): void {
    this.renderer.render(this.world, alpha);
    const ctx = this.ctx;
    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;
    const fit = Math.min(cw / RENDER.width, ch / RENDER.height);
    const whole = Math.floor(fit);
    // Escala entera si cubre lo suficiente; si no, fraccional (siempre sin suavizado)
    const scale = whole >= 1 && whole / fit >= RENDER.integerScaleMinFill ? whole : fit;
    const dw = Math.round(RENDER.width * scale);
    const dh = Math.round(RENDER.height * scale);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#020b14";
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(this.renderer.canvas, Math.floor((cw - dw) / 2), Math.floor((ch - dh) / 2), dw, dh);
  }

  private frame = (now: number): void => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.frame);
    let dt = (now - this.last) / 1000;
    this.last = now;
    if (dt > 0.25) dt = 0.25;
    if (!this.paused) {
      this.acc += dt;
      while (this.acc >= STEP) {
        this.world.update(STEP, this.input.state);
        this.acc -= STEP;
      }
    }
    this.draw(this.paused ? 1 : this.acc / STEP);
    this.frames++;
    if (now - this.fpsStart >= 1000) {
      this.fps = Math.round((this.frames * 1000) / (now - this.fpsStart));
      this.frames = 0;
      this.fpsStart = now;
    }
  };
}
