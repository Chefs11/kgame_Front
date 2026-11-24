/**
 * Entrada del Modo aventura: teclado y controles táctiles virtuales.
 * ← → / A D mover · ESPACIO / ↑ / W saltar · ↓ / S agachar · Esc / P pausa · M silencio.
 */
import type { InputState } from "./world";

export type VirtualKey = "left" | "right" | "down" | "jump";

export interface InputCallbacks {
  onPause: () => void;
  onMute: () => void;
}

const LEFT = new Set(["ArrowLeft", "KeyA"]);
const RIGHT = new Set(["ArrowRight", "KeyD"]);
const DOWN = new Set(["ArrowDown", "KeyS"]);
const JUMP = new Set(["Space", "ArrowUp", "KeyW"]);
const BLOCK_SCROLL = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"]);

export class InputController {
  readonly state: InputState = { left: false, right: false, down: false, jumpHeld: false, jumpPressed: false };
  private keys = { left: false, right: false, down: false, jump: false };
  private virtual = { left: false, right: false, down: false, jump: false };
  /** Si está desactivado (p. ej. hay una pregunta abierta) no se procesan teclas de juego. */
  enabled = true;

  constructor(private readonly callbacks: InputCallbacks) {}

  attach(): void {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  detach(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.clear();
  }

  /** Suelta todas las teclas (al perder el foco o al cerrar una pregunta). */
  clear(): void {
    this.keys = { left: false, right: false, down: false, jump: false };
    this.virtual = { left: false, right: false, down: false, jump: false };
    this.sync();
    this.state.jumpPressed = false;
  }

  setVirtual(key: VirtualKey, down: boolean): void {
    if (!this.enabled) return;
    if (key === "jump" && down && !this.virtual.jump) this.state.jumpPressed = true;
    this.virtual[key] = down;
    this.sync();
  }

  private sync(): void {
    this.state.left = this.keys.left || this.virtual.left;
    this.state.right = this.keys.right || this.virtual.right;
    this.state.down = this.keys.down || this.virtual.down;
    this.state.jumpHeld = this.keys.jump || this.virtual.jump;
  }

  private isTyping(e: KeyboardEvent): boolean {
    const t = e.target as HTMLElement | null;
    return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (!this.enabled || this.isTyping(e) || e.altKey || e.ctrlKey || e.metaKey) return;
    const code = e.code;
    if (code === "Escape" || code === "KeyP") {
      e.preventDefault();
      this.callbacks.onPause();
      return;
    }
    if (code === "KeyM") {
      this.callbacks.onMute();
      return;
    }
    // Enter o Espacio sobre un botón enfocado deben seguir funcionando
    const onButton = (e.target as HTMLElement | null)?.closest("button, a, summary");
    if (onButton && (code === "Space" || code === "Enter")) return;
    if (BLOCK_SCROLL.has(code)) e.preventDefault();
    if (LEFT.has(code)) this.keys.left = true;
    else if (RIGHT.has(code)) this.keys.right = true;
    else if (DOWN.has(code)) this.keys.down = true;
    else if (JUMP.has(code)) {
      if (!this.keys.jump && !e.repeat) this.state.jumpPressed = true;
      this.keys.jump = true;
    } else return;
    this.sync();
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    const code = e.code;
    if (LEFT.has(code)) this.keys.left = false;
    else if (RIGHT.has(code)) this.keys.right = false;
    else if (DOWN.has(code)) this.keys.down = false;
    else if (JUMP.has(code)) this.keys.jump = false;
    else return;
    this.sync();
  };
}
