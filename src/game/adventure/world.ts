/**
 * Simulación del Modo aventura (TypeScript puro, sin DOM ni React).
 * Paso fijo: update(dt) con dt = 1/60. No asigna memoria por frame.
 */
import { CAMERA, GAMEPLAY, PHYSICS, RENDER } from "./config";
import { isQuestion, isSolid, Tile, tileAt, type Level } from "./level";

const T = RENDER.tile;
const EPS = 0.001;

export interface InputState {
  left: boolean;
  right: boolean;
  down: boolean;
  jumpHeld: boolean;
  /** Flanco de pulsación; el mundo lo consume. */
  jumpPressed: boolean;
}

export type WorldEventType =
  | "question"
  | "jump"
  | "land"
  | "step"
  | "exitBlocked"
  | "exitOpened"
  | "complete"
  | "respawn";

/** Callback sin objetos: tipo + índice de bloque (o faltantes) para no asignar memoria. */
export type WorldEventHandler = (type: WorldEventType, value: number) => void;

export type PlayerPose = "idle" | "blink" | "run" | "jump" | "fall" | "crouch" | "oops";

const MAX_PARTICLES = 48;

export class World {
  readonly level: Level;
  readonly tiles: Uint8Array;
  /** Estado por bloque "?": 0 libre, 1 esperando respuesta, 2 usado. */
  readonly blockState: Uint8Array;
  readonly blockBounce: Float32Array;
  readonly blockIndex = new Map<number, number>();

  // Jugador (x, y = esquina superior izquierda del hitbox)
  x = 0;
  y = 0;
  prevX = 0;
  prevY = 0;
  vx = 0;
  vy = 0;
  facing: 1 | -1 = 1;
  onGround = false;
  private coyote = 0;
  private buffer = 0;
  private jumping = false;
  private stepDistance = 0;
  runDistance = 0;
  oopsTime = 0;
  private blinkTimer = 3;
  blinkTime = 0;
  private lastSafeX = 0;
  private lastSafeY = 0;
  /** >0 durante el fundido de un foso. */
  fade = 0;
  private respawned = false;

  camX = 0;
  prevCamX = 0;
  time = 0;
  private lockedUntil = 0;
  answered = 0;
  exitOpen = false;
  private completed = false;
  private exitHintCooldown = 0;

  /** Sin suavizado largo ni partículas (prefers-reduced-motion). */
  reducedMotion = false;

  // Partículas (pool fijo)
  readonly px = new Float32Array(MAX_PARTICLES);
  readonly py = new Float32Array(MAX_PARTICLES);
  readonly pvx = new Float32Array(MAX_PARTICLES);
  readonly pvy = new Float32Array(MAX_PARTICLES);
  readonly plife = new Float32Array(MAX_PARTICLES);

  constructor(
    level: Level,
    private readonly emit: WorldEventHandler = () => {},
  ) {
    this.level = level;
    this.tiles = level.tiles.slice();
    this.blockState = new Uint8Array(level.blocks.length);
    this.blockBounce = new Float32Array(level.blocks.length);
    level.blocks.forEach((b, i) => this.blockIndex.set(b.ty * level.cols + b.tx, i));
    this.reset();
  }

  /** Coloca a Sprout en el inicio. */
  reset(): void {
    const s = this.level.start;
    this.x = s.tx * T + (T - PHYSICS.hitbox.w) / 2;
    this.y = (s.ty + 1) * T - PHYSICS.hitbox.h;
    this.prevX = this.x;
    this.prevY = this.y;
    this.vx = 0;
    this.vy = 0;
    this.lastSafeX = this.x;
    this.lastSafeY = this.y;
    this.camX = this.clampCam(this.x + PHYSICS.hitbox.w / 2 - RENDER.width / 2);
    this.prevCamX = this.camX;
  }

  get total(): number {
    return this.level.blocks.length;
  }

  get widthPx(): number {
    return this.level.cols * T;
  }

  tile(tx: number, ty: number): number {
    if (tx < 0 || tx >= this.level.cols || ty < 0 || ty >= this.level.rows) return tileAt(this.level, tx, ty);
    return this.tiles[ty * this.level.cols + tx];
  }

  /** Marca bloques ya respondidos (partida guardada). */
  restoreUsed(ids: readonly string[]): void {
    const set = new Set(ids);
    this.level.blocks.forEach((b, i) => {
      if (!set.has(b.id)) return;
      this.blockState[i] = 2;
      this.tiles[b.ty * this.level.cols + b.tx] = Tile.Used;
    });
    this.answered = this.blockState.reduce((n, s) => n + (s === 2 ? 1 : 0), 0);
    this.exitOpen = this.answered >= this.total;
  }

  /** Bloquea el movimiento durante `ms` (tras cerrar una pregunta). */
  lockInput(ms: number): void {
    this.lockedUntil = this.time + ms / 1000;
    this.vx = 0;
  }

  /** Resuelve el reto del bloque `index`. */
  markAnswered(index: number, correct: boolean): void {
    if (this.blockState[index] === 2) return;
    const b = this.level.blocks[index];
    this.blockState[index] = 2;
    this.tiles[b.ty * this.level.cols + b.tx] = Tile.Used;
    this.answered++;
    if (!correct) this.oopsTime = GAMEPLAY.oopsTime;
    if (this.answered >= this.total && !this.exitOpen) {
      this.exitOpen = true;
      this.emit("exitOpened", 0);
    }
  }

  /** Pose actual para el render. */
  pose(): PlayerPose {
    if (this.oopsTime > 0) return "oops";
    if (!this.onGround) return this.vy < 0 ? "jump" : "fall";
    if (Math.abs(this.vx) > 8) return "run";
    if (this.lastInputDown) return "crouch";
    return this.blinkTime > 0 ? "blink" : "idle";
  }
  private lastInputDown = false;

  update(dt: number, input: InputState): void {
    this.time += dt;
    this.prevX = this.x;
    this.prevY = this.y;
    this.prevCamX = this.camX;

    this.updateParticles(dt);
    for (let i = 0; i < this.blockBounce.length; i++) if (this.blockBounce[i] > 0) this.blockBounce[i] = Math.max(0, this.blockBounce[i] - dt);
    if (this.oopsTime > 0) this.oopsTime = Math.max(0, this.oopsTime - dt);
    if (this.exitHintCooldown > 0) this.exitHintCooldown -= dt;

    // Fundido de foso: se congela, reaparece a la mitad y vuelve.
    if (this.fade > 0) {
      this.fade = Math.max(0, this.fade - dt);
      if (!this.respawned && this.fade <= GAMEPLAY.respawnFade / 2) {
        this.respawned = true;
        this.x = this.lastSafeX;
        this.y = this.lastSafeY;
        this.prevX = this.x;
        this.prevY = this.y;
        this.vx = 0;
        this.vy = 0;
        this.emit("respawn", 0);
      }
      this.updateCamera(true);
      return;
    }

    const locked = this.time < this.lockedUntil;
    const left = !locked && input.left;
    const right = !locked && input.right;
    this.lastInputDown = !locked && input.down;
    if (input.jumpPressed) {
      input.jumpPressed = false;
      if (!locked) this.buffer = PHYSICS.jumpBuffer;
    }

    // Parpadeo ocasional en reposo
    this.blinkTimer -= dt;
    if (this.blinkTime > 0) this.blinkTime -= dt;
    if (this.blinkTimer <= 0) {
      const [a, b] = GAMEPLAY.blinkEvery;
      this.blinkTimer = a + ((this.time * 7.31) % 1) * (b - a);
      this.blinkTime = GAMEPLAY.blinkDuration;
    }

    // Horizontal: aceleración y fricción
    const dir = (right ? 1 : 0) - (left ? 1 : 0);
    const control = this.onGround ? 1 : PHYSICS.airControl;
    if (dir !== 0) {
      this.facing = dir > 0 ? 1 : -1;
      this.vx += dir * PHYSICS.acceleration * control * dt;
      if (Math.sign(this.vx) !== dir) this.vx += dir * PHYSICS.friction * dt; // girar rápido
      if (Math.abs(this.vx) > PHYSICS.maxRunSpeed) this.vx = PHYSICS.maxRunSpeed * Math.sign(this.vx);
    } else {
      const f = PHYSICS.friction * control * dt;
      this.vx = Math.abs(this.vx) <= f ? 0 : this.vx - f * Math.sign(this.vx);
    }

    // Salto: coyote time + buffer + salto de altura variable
    if (this.onGround) this.coyote = PHYSICS.coyoteTime;
    else this.coyote = Math.max(0, this.coyote - dt);
    if (this.buffer > 0) this.buffer = Math.max(0, this.buffer - dt);
    if (this.buffer > 0 && this.coyote > 0) {
      this.vy = -PHYSICS.jumpSpeed;
      this.buffer = 0;
      this.coyote = 0;
      this.onGround = false;
      this.jumping = true;
      this.emit("jump", 0);
    }
    if (this.jumping && !input.jumpHeld && this.vy < 0) {
      this.vy *= PHYSICS.jumpCutFactor;
      this.jumping = false;
    }
    if (this.vy >= 0) this.jumping = false;

    this.vy = Math.min(this.vy + PHYSICS.gravity * dt, PHYSICS.maxFallSpeed);

    const wasGround = this.onGround;
    this.moveX(this.vx * dt);
    this.moveY(this.vy * dt);
    if (this.onGround && !wasGround) this.emit("land", 0);

    // Pasos suaves al correr
    if (this.onGround && this.vx !== 0) {
      this.runDistance += Math.abs(this.vx * dt);
      this.stepDistance += Math.abs(this.vx * dt);
      if (this.stepDistance > 22) {
        this.stepDistance = 0;
        this.emit("step", 0);
      }
    }

    // Último suelo seguro (ambos pies sobre suelo firme)
    if (this.onGround) {
      const ty = Math.floor((this.y + PHYSICS.hitbox.h + 1) / T);
      const l = Math.floor((this.x - 2) / T);
      const r = Math.floor((this.x + PHYSICS.hitbox.w + 2) / T);
      if (isSolid(this.tile(l, ty)) && isSolid(this.tile(r, ty))) {
        this.lastSafeX = this.x;
        this.lastSafeY = this.y;
      }
    }

    this.checkQuestionTouch();
    this.checkExit();

    // Foso
    if (this.y > this.level.rows * T + 24) {
      this.fade = GAMEPLAY.respawnFade;
      this.respawned = false;
    }

    this.updateCamera(false);
  }

  private moveX(dx: number): void {
    if (dx === 0) return;
    this.x += dx;
    const { w, h } = PHYSICS.hitbox;
    const top = Math.floor(this.y / T);
    const bottom = Math.floor((this.y + h - EPS) / T);
    if (dx > 0) {
      const tx = Math.floor((this.x + w - EPS) / T);
      for (let ty = top; ty <= bottom; ty++)
        if (isSolid(this.tile(tx, ty))) {
          this.x = tx * T - w;
          this.vx = 0;
          break;
        }
    } else {
      const tx = Math.floor(this.x / T);
      for (let ty = top; ty <= bottom; ty++)
        if (isSolid(this.tile(tx, ty))) {
          this.x = (tx + 1) * T;
          this.vx = 0;
          break;
        }
    }
  }

  private moveY(dy: number): void {
    this.y += dy;
    const { w, h } = PHYSICS.hitbox;
    const left = Math.floor(this.x / T);
    const right = Math.floor((this.x + w - EPS) / T);
    this.onGround = false;
    if (dy > 0) {
      const ty = Math.floor((this.y + h - EPS) / T);
      for (let tx = left; tx <= right; tx++)
        if (isSolid(this.tile(tx, ty))) {
          this.y = ty * T - h;
          this.vy = 0;
          this.onGround = true;
          break;
        }
    } else if (dy < 0) {
      const ty = Math.floor(this.y / T);
      for (let tx = left; tx <= right; tx++)
        if (isSolid(this.tile(tx, ty))) {
          this.y = (ty + 1) * T;
          this.vy = 0;
          this.jumping = false;
          break;
        }
    }
  }

  /** Un "?" se activa al tocarlo desde cualquier lado (también con la cabeza). Una sola vez. */
  private checkQuestionTouch(): void {
    const { w, h } = PHYSICS.hitbox;
    const x0 = Math.floor((this.x - 1) / T);
    const x1 = Math.floor((this.x + w + 1) / T);
    const y0 = Math.floor((this.y - 1) / T);
    const y1 = Math.floor((this.y + h + 1) / T);
    for (let ty = y0; ty <= y1; ty++)
      for (let tx = x0; tx <= x1; tx++) {
        if (!isQuestion(this.tile(tx, ty))) continue;
        const idx = this.blockIndex.get(ty * this.level.cols + tx);
        if (idx === undefined || this.blockState[idx] !== 0) continue;
        // Contacto real: el hitbox expandido 1 px se solapa con el bloque
        const bx = tx * T;
        const by = ty * T;
        if (this.x + w + 1 <= bx || this.x - 1 >= bx + T || this.y + h + 1 <= by || this.y - 1 >= by + T) continue;
        this.blockState[idx] = 1;
        this.blockBounce[idx] = 0.12;
        this.spawnSparkles(bx + T / 2, by + T / 2);
        this.emit("question", idx);
        return;
      }
  }

  private checkExit(): void {
    const e = this.level.exit;
    const cx = this.x + PHYSICS.hitbox.w / 2;
    const cy = this.y + PHYSICS.hitbox.h / 2;
    const inside = cx > (e.tx + 0.6) * T && cx < (e.tx + e.w - 0.6) * T && cy > e.ty * T && cy < (e.ty + e.h) * T;
    if (!inside) return;
    if (this.exitOpen) {
      if (!this.completed) {
        this.completed = true;
        this.emit("complete", 0);
      }
    } else if (this.exitHintCooldown <= 0) {
      this.exitHintCooldown = 1.6;
      this.emit("exitBlocked", this.total - this.answered);
    }
  }

  private clampCam(x: number): number {
    return Math.max(0, Math.min(x, this.widthPx - RENDER.width));
  }

  private updateCamera(snap: boolean): void {
    const center = this.camX + RENDER.width / 2;
    const target = this.x + PHYSICS.hitbox.w / 2 + this.facing * CAMERA.lookAhead;
    let desired = this.camX;
    if (target > center + CAMERA.deadZone / 2) desired = target - CAMERA.deadZone / 2 - RENDER.width / 2;
    else if (target < center - CAMERA.deadZone / 2) desired = target + CAMERA.deadZone / 2 - RENDER.width / 2;
    desired = this.clampCam(desired);
    if (snap || this.reducedMotion) this.camX = desired;
    else this.camX += (desired - this.camX) * CAMERA.smoothing;
    if (snap) this.prevCamX = this.camX;
  }

  private spawnSparkles(x: number, y: number): void {
    if (this.reducedMotion) return;
    let made = 0;
    for (let i = 0; i < MAX_PARTICLES && made < 8; i++) {
      if (this.plife[i] > 0) continue;
      const a = (made / 8) * Math.PI * 2;
      this.px[i] = x;
      this.py[i] = y;
      this.pvx[i] = Math.cos(a) * 46;
      this.pvy[i] = Math.sin(a) * 46 - 30;
      this.plife[i] = 0.45;
      made++;
    }
  }

  private updateParticles(dt: number): void {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (this.plife[i] <= 0) continue;
      this.plife[i] -= dt;
      this.pvy[i] += 140 * dt;
      this.px[i] += this.pvx[i] * dt;
      this.py[i] += this.pvy[i] * dt;
    }
  }
}
