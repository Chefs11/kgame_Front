/**
 * Render del Modo aventura en un canvas fuera de pantalla de 320×224, sin
 * suavizado. Solo lee el estado del mundo; no asigna memoria por frame.
 */
import { MANIFEST, type LoadedArt, type Rect, type SpriteFrame, type TileName } from "./assets/manifest";
import { CAMERA, GAMEPLAY, PHYSICS, RENDER } from "./config";
import { Tile } from "./level";
import type { World } from "./world";

const T = RENDER.tile;
const TILE_RECT: Record<number, TileName | null> = {
  [Tile.Air]: null,
  [Tile.Ground]: "groundTop",
  [Tile.Brick]: "brick",
  [Tile.Platform]: "platform",
  [Tile.QOrange]: "qOrange",
  [Tile.QBlue]: "qBlue",
  [Tile.Used]: "used",
};

export class Renderer {
  readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  /** Sin parallax con prefers-reduced-motion. */
  reducedMotion = false;

  constructor(private readonly art: LoadedArt) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = RENDER.width;
    this.canvas.height = RENDER.height;
    const ctx = this.canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas 2D no disponible");
    ctx.imageSmoothingEnabled = false;
    this.ctx = ctx;
  }

  private drawRect(img: HTMLImageElement, r: Rect, dx: number, dy: number, flip = false): void {
    const ctx = this.ctx;
    if (!flip) {
      ctx.drawImage(img, r.x, r.y, r.w, r.h, dx, dy, r.w, r.h);
      return;
    }
    ctx.save();
    ctx.translate(dx + r.w, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(img, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
    ctx.restore();
  }

  render(world: World, alpha: number): void {
    const ctx = this.ctx;
    const cam = Math.round(world.prevCamX + (world.camX - world.prevCamX) * alpha);

    // Fondo lejano con parallax lento (espejado, sin costuras)
    const bg = MANIFEST.tiles.background;
    const offset = this.reducedMotion ? 0 : Math.floor(cam * CAMERA.parallax) % bg.w;
    const by = RENDER.height - bg.h;
    for (let x = -offset; x < RENDER.width; x += bg.w) ctx.drawImage(this.art.background, x, by);

    // Tiles visibles
    const rects = MANIFEST.tiles.rects;
    const level = world.level;
    const c0 = Math.max(0, Math.floor(cam / T));
    const c1 = Math.min(level.cols - 1, Math.floor((cam + RENDER.width) / T));
    for (let ty = 0; ty < level.rows; ty++)
      for (let tx = c0; tx <= c1; tx++) {
        const t = world.tile(tx, ty);
        if (t === Tile.Air) continue;
        let name = TILE_RECT[t];
        if (t === Tile.Ground && world.tile(tx, ty - 1) === Tile.Ground) name = "dirt";
        if (!name) continue;
        let dy = ty * T;
        const idx = world.blockIndex.get(ty * level.cols + tx);
        if (idx !== undefined && world.blockBounce[idx] > 0) {
          const k = world.blockBounce[idx] / GAMEPLAY.blockBounce;
          dy -= Math.round(Math.sin(k * Math.PI) * 4);
        }
        this.drawRect(this.art.tiles, rects[name], tx * T - cam, dy);
      }

    // Salida: tronco hueco (se ilumina al abrirse)
    const e = level.exit;
    const exitRect = world.exitOpen ? rects.exitOpen : rects.exitClosed;
    this.drawRect(this.art.tiles, exitRect, e.tx * T - cam, (e.ty + e.h) * T - exitRect.h);

    // Sprout
    const s = MANIFEST.sprites;
    const pose = world.pose();
    let frame: SpriteFrame;
    if (pose === "run") {
      const cycle = s.animations.run;
      frame = cycle[Math.floor(world.runDistance / 9) % cycle.length];
    } else frame = s.animations[pose][0];
    const px = world.prevX + (world.x - world.prevX) * alpha;
    const py = world.prevY + (world.y - world.prevY) * alpha;
    const footX = Math.round(px + PHYSICS.hitbox.w / 2 - cam);
    const footY = Math.round(py + PHYSICS.hitbox.h);
    // Temblor de 2 px en "ups" (en lugar de deformar el sprite)
    const shake = pose === "oops" && !this.reducedMotion ? (Math.floor(world.time * 30) % 2 ? 1 : -1) : 0;
    this.drawRect(this.art.sprites, s.frames[frame], footX - s.pivot.x + shake, footY - s.pivot.y, world.facing < 0);

    // Destellos
    ctx.fillStyle = "#ffe9a8";
    for (let i = 0; i < world.plife.length; i++) {
      if (world.plife[i] <= 0) continue;
      const size = world.plife[i] > 0.2 ? 2 : 1;
      ctx.fillRect(Math.round(world.px[i] - cam), Math.round(world.py[i]), size, size);
    }

    // Fundido corto al caer en un foso
    if (world.fade > 0) {
      const half = GAMEPLAY.respawnFade / 2;
      const a = world.fade > half ? 1 - (world.fade - half) / half : world.fade / half;
      ctx.fillStyle = `rgba(2, 11, 20, ${Math.min(1, a).toFixed(2)})`;
      ctx.fillRect(0, 0, RENDER.width, RENDER.height);
    }
  }
}
