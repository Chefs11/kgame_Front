/**
 * Pipeline reproducible de arte del Modo Aventura.
 *
 *   npm run assets:adventure
 *
 * Entrada (copias de los originales generados con Gemini):
 *   src/game/adventure/assets/source/sprout-sheet.jpeg  — hoja de sprites de Sprout (fondo azul liso)
 *   src/game/adventure/assets/source/forest-scene.jpeg  — escena del bosque
 *
 * Salida:
 *   public/adventure/sprout.png      atlas del personaje (celdas uniformes)
 *   public/adventure/tiles.png       tiles de 16×16 y la salida (tronco) dibujada por código
 *   public/adventure/forest-bg.png   fondo lejano, espejado para repetirse sin costuras
 *   src/game/adventure/assets/generated/manifest.json  manifiesto (rectángulos, animaciones, pivote)
 *   design-refs/adventure/pipeline-preview.png          vista previa ampliada para revisar
 *
 * Si se reemplazan las imágenes por otra versión con la misma composición, basta con volver a
 * correr el script. Las coordenadas de recorte de la escena están en SCENE_CROPS.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src/game/adventure/assets/source");
const OUT_PUBLIC = path.join(ROOT, "public/adventure");
const OUT_GEN = path.join(ROOT, "src/game/adventure/assets/generated");
const OUT_PREVIEW = path.join(ROOT, "design-refs/adventure");

type RGB = [number, number, number];
interface Raster {
  w: number;
  h: number;
  /** RGBA */
  data: Uint8ClampedArray;
}
interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  n: number;
  meanR: number;
  meanB: number;
}

/* ---------------------------------------------------------------- utilidades */

async function load(file: string): Promise<Raster> {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { w: info.width, h: info.height, data: new Uint8ClampedArray(data) };
}

function newRaster(w: number, h: number): Raster {
  return { w, h, data: new Uint8ClampedArray(w * h * 4) };
}

function get(r: Raster, x: number, y: number): RGB {
  const i = (y * r.w + x) * 4;
  return [r.data[i], r.data[i + 1], r.data[i + 2]];
}

function set(r: Raster, x: number, y: number, c: RGB, a = 255): void {
  if (x < 0 || y < 0 || x >= r.w || y >= r.h) return;
  const i = (y * r.w + x) * 4;
  r.data[i] = c[0];
  r.data[i + 1] = c[1];
  r.data[i + 2] = c[2];
  r.data[i + 3] = a;
}

const dist = (a: RGB, b: RGB) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

function crop(r: Raster, x: number, y: number, w: number, h: number): Raster {
  const o = newRaster(w, h);
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      const si = ((y + j) * r.w + (x + i)) * 4;
      const di = (j * w + i) * 4;
      o.data.set(r.data.subarray(si, si + 4), di);
    }
  return o;
}

function blit(dst: Raster, src: Raster, dx: number, dy: number): void {
  for (let j = 0; j < src.h; j++)
    for (let i = 0; i < src.w; i++) {
      const si = (j * src.w + i) * 4;
      if (src.data[si + 3] === 0) continue;
      const x = dx + i;
      const y = dy + j;
      if (x < 0 || y < 0 || x >= dst.w || y >= dst.h) continue;
      dst.data.set(src.data.subarray(si, si + 4), (y * dst.w + x) * 4);
    }
}

async function save(r: Raster, file: string, scale = 1): Promise<void> {
  let img = sharp(Buffer.from(r.data), { raw: { width: r.w, height: r.h, channels: 4 } });
  if (scale !== 1) img = img.resize(r.w * scale, r.h * scale, { kernel: "nearest" });
  await img.png({ compressionLevel: 9 }).toFile(file);
}

/* ------------------------------------------------- componentes conectados */

function components(mask: Uint8Array, img: Raster): Box[] {
  const { w, h } = img;
  const label = new Int32Array(w * h).fill(-1);
  const boxes: Box[] = [];
  const stack: number[] = [];
  for (let start = 0; start < w * h; start++) {
    if (!mask[start] || label[start] >= 0) continue;
    const id = boxes.length;
    const b: Box = { x0: w, y0: h, x1: -1, y1: -1, n: 0, meanR: 0, meanB: 0 };
    boxes.push(b);
    label[start] = id;
    stack.push(start);
    while (stack.length) {
      const k = stack.pop() as number;
      const x = k % w;
      const y = (k / w) | 0;
      const c = get(img, x, y);
      b.n++;
      b.meanR += c[0];
      b.meanB += c[2];
      if (x < b.x0) b.x0 = x;
      if (x > b.x1) b.x1 = x;
      if (y < b.y0) b.y0 = y;
      if (y > b.y1) b.y1 = y;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          const kk = yy * w + xx;
          if (mask[kk] && label[kk] < 0) {
            label[kk] = id;
            stack.push(kk);
          }
        }
    }
    b.meanR /= b.n;
    b.meanB /= b.n;
  }
  return boxes;
}

/* ------------------------------------- detección del tamaño del píxel falso */

/**
 * Busca el periodo (tamaño del "píxel" del arte generado) y su fase a partir de
 * la señal de bordes de color, con una transformada discreta sobre candidatos.
 */
function detectGrid(img: Raster, alpha: Uint8Array | null, axis: "x" | "y"): { period: number; phase: number } {
  const len = axis === "x" ? img.w : img.h;
  const other = axis === "x" ? img.h : img.w;
  const edges = new Float64Array(len);
  for (let o = 0; o < other; o++)
    for (let t = 1; t < len; t++) {
      const [x0, y0, x1, y1] = axis === "x" ? [t - 1, o, t, o] : [o, t - 1, o, t];
      if (alpha && (!alpha[y0 * img.w + x0] || !alpha[y1 * img.w + x1])) continue;
      if (dist(get(img, x0, y0), get(img, x1, y1)) > 40) edges[t] += 1;
    }
  let best = { period: 8, phase: 0, score: -1 };
  for (let p = 3; p <= 20; p += 0.02) {
    let re = 0;
    let im = 0;
    let total = 0;
    for (let t = 0; t < len; t++) {
      const a = (2 * Math.PI * t) / p;
      re += edges[t] * Math.cos(a);
      im += edges[t] * Math.sin(a);
      total += edges[t];
    }
    const score = Math.hypot(re, im) / Math.max(total, 1);
    // penaliza armónicos pequeños: preferimos el periodo más grande con puntaje similar
    if (score > best.score * 1.0005) {
      let phase = (Math.atan2(im, re) / (2 * Math.PI)) * p;
      phase = ((phase % p) + p) % p;
      best = { period: p, phase, score };
    }
  }
  return { period: best.period, phase: best.phase };
}

/**
 * Reduce una imagen de pixel art "falso" a su cuadrícula real: toma la mediana de
 * color de la zona central de cada celda (robusto ante el ruido JPEG).
 */
function pixelize(img: Raster, alpha: Uint8Array | null, gx: { period: number; phase: number }, gy: { period: number; phase: number }): Raster {
  const cols = Math.floor((img.w - gx.phase) / gx.period);
  const rows = Math.floor((img.h - gy.phase) / gy.period);
  const out = newRaster(cols, rows);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const cx0 = gx.phase + c * gx.period;
      const cy0 = gy.phase + r * gy.period;
      const xs: number[] = [];
      const ys: number[] = [];
      const zs: number[] = [];
      let opaque = 0;
      let count = 0;
      for (let j = 0.3; j <= 0.7; j += 0.1)
        for (let i = 0.3; i <= 0.7; i += 0.1) {
          const x = Math.min(img.w - 1, Math.round(cx0 + i * gx.period));
          const y = Math.min(img.h - 1, Math.round(cy0 + j * gy.period));
          count++;
          if (alpha && !alpha[y * img.w + x]) continue;
          opaque++;
          const p = get(img, x, y);
          xs.push(p[0]);
          ys.push(p[1]);
          zs.push(p[2]);
        }
      if (opaque * 2 < count) continue;
      const med = (a: number[]) => a.sort((m, n) => m - n)[a.length >> 1];
      set(out, c, r, [med(xs), med(ys), med(zs)]);
    }
  return out;
}

/** K-means simple para limpiar la paleta (ruido JPEG) de los sprites. */
function snapPalette(frames: Raster[], k: number): RGB[] {
  const pts: RGB[] = [];
  for (const f of frames)
    for (let i = 0; i < f.w * f.h; i++) if (f.data[i * 4 + 3]) pts.push([f.data[i * 4], f.data[i * 4 + 1], f.data[i * 4 + 2]]);
  const centers: RGB[] = [];
  // inicialización determinista: k-means++ con semilla fija
  let seed = 7;
  const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  centers.push(pts[Math.floor(rand() * pts.length)]);
  while (centers.length < k) {
    const d = pts.map((p) => Math.min(...centers.map((c) => dist(p, c))) ** 2);
    const sum = d.reduce((a, b) => a + b, 0);
    let r = rand() * sum;
    let idx = 0;
    while ((r -= d[idx]) > 0 && idx < d.length - 1) idx++;
    centers.push(pts[idx]);
  }
  for (let it = 0; it < 20; it++) {
    const acc = centers.map(() => [0, 0, 0, 0]);
    for (const p of pts) {
      let bi = 0;
      let bd = Infinity;
      centers.forEach((c, i) => {
        const dd = dist(p, c);
        if (dd < bd) {
          bd = dd;
          bi = i;
        }
      });
      acc[bi][0] += p[0];
      acc[bi][1] += p[1];
      acc[bi][2] += p[2];
      acc[bi][3]++;
    }
    acc.forEach((a, i) => {
      if (a[3]) centers[i] = [Math.round(a[0] / a[3]), Math.round(a[1] / a[3]), Math.round(a[2] / a[3])];
    });
  }
  for (const f of frames)
    for (let i = 0; i < f.w * f.h; i++) {
      if (!f.data[i * 4 + 3]) continue;
      const p: RGB = [f.data[i * 4], f.data[i * 4 + 1], f.data[i * 4 + 2]];
      let best = centers[0];
      for (const c of centers) if (dist(p, c) < dist(p, best)) best = c;
      f.data.set(best, i * 4);
    }
  return centers;
}

/** Recorta al rectángulo opaco mínimo. */
function trim(r: Raster): { img: Raster; x: number; y: number } {
  let x0 = r.w;
  let y0 = r.h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < r.h; y++)
    for (let x = 0; x < r.w; x++)
      if (r.data[(y * r.w + x) * 4 + 3]) {
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      }
  return { img: crop(r, x0, y0, x1 - x0 + 1, y1 - y0 + 1), x: x0, y: y0 };
}

/** Quita píxeles opacos aislados (ruido de bordes). */
function despeckle(r: Raster): void {
  const keep = new Uint8Array(r.w * r.h);
  for (let y = 0; y < r.h; y++)
    for (let x = 0; x < r.w; x++) {
      if (!r.data[(y * r.w + x) * 4 + 3]) continue;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const xx = x + dx;
          const yy = y + dy;
          if (xx >= 0 && yy >= 0 && xx < r.w && yy < r.h && r.data[(yy * r.w + xx) * 4 + 3]) n++;
        }
      keep[y * r.w + x] = n >= 2 ? 1 : 0;
    }
  for (let i = 0; i < r.w * r.h; i++) if (!keep[i]) r.data[i * 4 + 3] = 0;
}

/** Altura objetivo del personaje a la resolución interna (320×224). */
const TARGET_HEIGHT = 24;

function nearestResize(r: Raster, w: number, h: number): Raster {
  const o = newRaster(w, h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const sx = Math.min(r.w - 1, Math.floor(((x + 0.5) * r.w) / w));
      const sy = Math.min(r.h - 1, Math.floor(((y + 0.5) * r.h) / h));
      const si = (sy * r.w + sx) * 4;
      o.data.set(r.data.subarray(si, si + 4), (y * w + x) * 4);
    }
  return o;
}

/* ============================================================ SPRITES */

interface FrameOut {
  name: string;
  img: Raster;
}

async function buildSprites() {
  const sheet = await load(path.join(SRC, "sprout-sheet.jpeg"));
  const bg = get(sheet, 5, 5);
  const TOL = 55;
  const mask = new Uint8Array(sheet.w * sheet.h);
  for (let y = 0; y < sheet.h; y++) for (let x = 0; x < sheet.w; x++) mask[y * sheet.w + x] = dist(get(sheet, x, y), bg) > TOL ? 1 : 0;

  // Personajes: componentes grandes. Se descartan la sombra (pequeña y azulada) y las letras del rótulo.
  const chars = components(mask, sheet)
    .filter((b) => b.n > 10000 && b.meanR > b.meanB)
    .sort((a, b) => (Math.abs(a.y0 - b.y0) > 120 ? a.y0 - b.y0 : a.x0 - b.x0));
  if (chars.length !== 9) throw new Error(`Se esperaban 9 personajes en la hoja, se encontraron ${chars.length}`);

  // Orden de la hoja: fila 1 = idle grande, 3 de correr, salto; fila 2 = 2 idles, agachado, ups.
  const names = ["idleBig", "runA", "runB", "runC", "jump", "idle", "blink", "crouch", "oops"];
  const report: string[] = [];
  const frames: FrameOut[] = [];
  chars.forEach((b, i) => {
    const pad = 4;
    const x = Math.max(0, b.x0 - pad);
    const y = Math.max(0, b.y0 - pad);
    const w = Math.min(sheet.w - x, b.x1 - b.x0 + 1 + pad * 2);
    const h = Math.min(sheet.h - y, b.y1 - b.y0 + 1 + pad * 2);
    const img = crop(sheet, x, y, w, h);
    const a = new Uint8Array(w * h);
    for (let j = 0; j < h; j++) for (let k = 0; k < w; k++) a[j * w + k] = mask[(y + j) * sheet.w + (x + k)];
    const gx = detectGrid(img, a, "x");
    const gy = detectGrid(img, a, "y");
    const small = pixelize(img, a, gx, gy);
    despeckle(small);
    const t = trim(small).img;
    report.push(`${names[i]}: ${b.x1 - b.x0 + 1}×${b.y1 - b.y0 + 1} px origen → píxel ${gx.period.toFixed(2)}×${gy.period.toFixed(2)} → ${t.w}×${t.h}`);
    frames.push({ name: names[i], img: t });
  });

  snapPalette(
    frames.map((f) => f.img),
    14,
  );

  // Escala común a la resolución interna del juego: el frame de pie más alto mide TARGET_HEIGHT px.
  // Se reduce con vecino más cercano desde los frames ya limpios (se comparó con la versión nativa
  // en design-refs/adventure: a 24 px se conservan ojos, pañuelo y botas).
  const tallest = Math.max(...frames.filter((f) => f.name !== "idleBig").map((f) => f.img.h));
  const factor = TARGET_HEIGHT / tallest;
  for (const f of frames) {
    if (f.name === "idleBig") continue;
    f.img = nearestResize(f.img, Math.max(1, Math.round(f.img.w * factor)), Math.max(1, Math.round(f.img.h * factor)));
  }
  report.push(`escala común ×${factor.toFixed(3)} → personaje de ${TARGET_HEIGHT} px de alto`);

  // Ciclo de correr ordenado por la apertura de las piernas (ancho opaco del 25 % inferior).
  const legSpread = (r: Raster) => {
    let x0 = r.w;
    let x1 = -1;
    for (let y = Math.floor(r.h * 0.75); y < r.h; y++)
      for (let x = 0; x < r.w; x++)
        if (r.data[(y * r.w + x) * 4 + 3]) {
          x0 = Math.min(x0, x);
          x1 = Math.max(x1, x);
        }
    return x1 - x0;
  };
  const runs = frames.filter((f) => f.name.startsWith("run")).sort((a, b) => legSpread(b.img) - legSpread(a.img));
  report.push(`correr (apertura de piernas): ${runs.map((r) => `${r.name}=${legSpread(r.img)}`).join(", ")}`);

  // Celda uniforme: pies alineados abajo y centro horizontal común.
  const used = frames.filter((f) => f.name !== "idleBig");
  const cellW = Math.max(...used.map((f) => f.img.w)) + 2;
  const cellH = Math.max(...used.map((f) => f.img.h)) + 2;
  const order = ["idle", "blink", runs[0].name, runs[1].name, runs[2].name, "jump", "crouch", "oops"];
  const atlas = newRaster(cellW * order.length, cellH);
  const rects: Record<string, { x: number; y: number; w: number; h: number }> = {};
  order.forEach((n, i) => {
    const f = frames.find((fr) => fr.name === n);
    if (!f) throw new Error(`Falta el frame ${n}`);
    const dx = i * cellW + Math.floor((cellW - f.img.w) / 2);
    const dy = cellH - 1 - f.img.h;
    blit(atlas, f.img, dx, dy);
    rects[n] = { x: i * cellW, y: 0, w: cellW, h: cellH };
  });
  await save(atlas, path.join(OUT_PUBLIC, "sprout.png"));

  return {
    report,
    atlas,
    meta: {
      image: "/adventure/sprout.png",
      cell: { w: cellW, h: cellH },
      /** Punto de apoyo (pies) dentro de la celda. */
      pivot: { x: Math.floor(cellW / 2), y: cellH - 1 },
      frames: rects,
      animations: {
        idle: ["idle"],
        blink: ["blink"],
        // ciclo 1-2-3-2: abierta, media, cerrada, media
        run: [runs[0].name, runs[1].name, runs[2].name, runs[1].name],
        jump: ["jump"],
        fall: ["jump"],
        crouch: ["crouch"],
        oops: ["oops"],
      },
    },
  };
}

/* ============================================================ ESCENA */

/** Recortes de la escena (coordenadas del original de 1408×768). Ajusta aquí si cambia la imagen. */
const SCENE_CROPS = {
  qOrange: { x: 266, y: 142, w: 66, h: 66 },
  qBlue: { x: 486, y: 387, w: 66, h: 66 },
  brick: { x: 906, y: 276, w: 66, h: 66 },
  groundTop: { x: 300, y: 616, w: 66, h: 66 },
  dirt: { x: 300, y: 684, w: 66, h: 66 },
  /** Franja de bosque sin objetos para el fondo lejano. */
  background: { x: 590, y: 0, w: 300, h: 480 },
};

async function buildScene() {
  const scene = await load(path.join(SRC, "forest-scene.jpeg"));
  const report: string[] = [];
  const tile = (key: keyof typeof SCENE_CROPS) => {
    const c = SCENE_CROPS[key];
    const img = crop(scene, c.x, c.y, c.w, c.h);
    const gx = detectGrid(img, null, "x");
    const gy = detectGrid(img, null, "y");
    // Ajusta el periodo para obtener exactamente 16 celdas
    const px = { period: (c.w - 1) / 16.25, phase: gx.phase % ((c.w - 1) / 16.25) };
    const py = { period: (c.h - 1) / 16.25, phase: gy.phase % ((c.h - 1) / 16.25) };
    const t = pixelize(img, null, px, py);
    const out = crop(t, 0, 0, Math.min(16, t.w), Math.min(16, t.h));
    report.push(`${key}: píxel detectado ${gx.period.toFixed(2)} → tile ${out.w}×${out.h}`);
    return out;
  };
  const qOrange = tile("qOrange");
  const qBlue = tile("qBlue");
  const brick = tile("brick");
  const groundTop = tile("groundTop");
  const dirt = tile("dirt");

  // Bloque usado: el bloque naranja sin el símbolo (se rellena el interior con su color base).
  const used = crop(qOrange, 0, 0, 16, 16);
  const base = get(qOrange, 3, 12);
  const shade: RGB = [Math.round(base[0] * 0.82), Math.round(base[1] * 0.78), Math.round(base[2] * 0.74)];
  for (let y = 3; y < 13; y++) for (let x = 3; x < 13; x++) set(used, x, y, shade);

  // Plataforma flotante: pasto del suelo arriba, ladrillo-tierra abajo (por código con la paleta de la escena).
  const platform = newRaster(16, 16);
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      if (y < 7) set(platform, x, y, get(groundTop, x, Math.min(15, y)));
      else set(platform, x, y, get(dirt, x, y));
    }
  for (let x = 0; x < 16; x++) set(platform, x, 15, [52, 30, 18]);

  // Salida: tronco hueco tumbado (48×32), dibujado por código con colores de la corteza de la escena.
  const bark1: RGB = [110, 70, 38];
  const bark2: RGB = [84, 52, 28];
  const bark3: RGB = [140, 94, 52];
  const moss: RGB = [92, 140, 52];
  const hole: RGB = [26, 18, 12];
  const glowC: RGB = [255, 190, 90];
  const drawLog = (open: boolean) => {
    const r = newRaster(48, 32);
    for (let y = 6; y < 32; y++)
      for (let x = 2; x < 46; x++) {
        const edge = x < 4 || x > 43 || y < 8 || y > 29;
        const ring = (x + Math.floor(y / 3)) % 7 === 0;
        set(r, x, y, edge ? bark2 : ring ? bark1 : y % 5 === 0 ? bark3 : bark1);
      }
    for (let x = 4; x < 44; x++) for (let y = 4; y < 9; y++) if ((x * 7 + y * 3) % 5 !== 0) set(r, x, y, moss);
    // boca del tronco (elipse oscura); al abrirse se ilumina por dentro
    for (let y = 12; y < 30; y++)
      for (let x = 14; x < 34; x++) {
        const dx = (x - 23.5) / 9.5;
        const dy = (y - 21) / 8.5;
        const d = dx * dx + dy * dy;
        if (d <= 1) set(r, x, y, open ? (d < 0.35 ? [255, 236, 180] : d < 0.7 ? glowC : [196, 120, 50]) : hole);
        else if (d <= 1.25) set(r, x, y, bark3);
      }
    return r;
  };
  const exitClosed = drawLog(false);
  const exitOpen = drawLog(true);

  // Atlas de tiles: fila 0 = tiles de 16; fila 1 = salida cerrada/abierta.
  const order = ["groundTop", "dirt", "brick", "qOrange", "qBlue", "used", "platform"] as const;
  const tiles: Record<string, Raster> = { groundTop, dirt, brick, qOrange, qBlue, used, platform };
  const atlas = newRaster(Math.max(16 * order.length, 96), 16 + 32);
  const rects: Record<string, { x: number; y: number; w: number; h: number }> = {};
  order.forEach((n, i) => {
    blit(atlas, tiles[n], i * 16, 0);
    rects[n] = { x: i * 16, y: 0, w: 16, h: 16 };
  });
  blit(atlas, exitClosed, 0, 16);
  blit(atlas, exitOpen, 48, 16);
  rects.exitClosed = { x: 0, y: 16, w: 48, h: 32 };
  rects.exitOpen = { x: 48, y: 16, w: 48, h: 32 };
  await save(atlas, path.join(OUT_PUBLIC, "tiles.png"));

  // Fondo lejano: franja sin objetos, reducida, con bruma, y espejada para repetirse sin costuras.
  const b = SCENE_CROPS.background;
  const bgH = 240;
  const bgW = Math.round((b.w * bgH) / b.h);
  const half = await sharp(path.join(SRC, "forest-scene.jpeg"))
    .extract({ left: b.x, top: b.y, width: b.w, height: b.h })
    .resize(bgW, bgH, { kernel: "nearest" })
    .modulate({ saturation: 0.85, brightness: 1.03 })
    .ensureAlpha()
    .raw()
    .toBuffer();
  const bg = newRaster(bgW * 2, bgH);
  for (let y = 0; y < bgH; y++)
    for (let x = 0; x < bgW; x++) {
      const i = (y * bgW + x) * 4;
      const c: RGB = [half[i], half[i + 1], half[i + 2]];
      set(bg, x, y, c);
      set(bg, bgW * 2 - 1 - x, y, c);
    }
  await save(bg, path.join(OUT_PUBLIC, "forest-bg.png"));
  report.push(`fondo: ${bg.w}×${bg.h} (franja espejada)`);

  return {
    report,
    atlas,
    meta: { image: "/adventure/tiles.png", tile: 16, rects, background: { image: "/adventure/forest-bg.png", w: bg.w, h: bg.h } },
  };
}

/* ============================================================ MAIN */

async function main() {
  mkdirSync(OUT_PUBLIC, { recursive: true });
  mkdirSync(OUT_GEN, { recursive: true });
  mkdirSync(OUT_PREVIEW, { recursive: true });
  const sprites = await buildSprites();
  const scene = await buildScene();
  const manifest = {
    generatedBy: "scripts/build-adventure-assets.ts",
    sprites: sprites.meta,
    tiles: scene.meta,
  };
  writeFileSync(path.join(OUT_GEN, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

  // Vista previa ×4 para revisar a ojo
  const prev = newRaster(Math.max(sprites.atlas.w, scene.atlas.w), sprites.atlas.h + scene.atlas.h + 4);
  for (let i = 0; i < prev.w * prev.h; i++) prev.data.set([70, 188, 210, 255], i * 4);
  blit(prev, sprites.atlas, 0, 0);
  blit(prev, scene.atlas, 0, sprites.atlas.h + 4);
  await save(prev, path.join(OUT_PREVIEW, "pipeline-preview.png"), 4);

  console.log([...sprites.report, ...scene.report].join("\n"));
  console.log("Listo: public/adventure/*.png y src/game/adventure/assets/generated/manifest.json");
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
