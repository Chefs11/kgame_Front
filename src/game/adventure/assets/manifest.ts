/**
 * Manifiesto tipado del arte del Modo aventura. Los datos los genera
 * `npm run assets:adventure` (scripts/build-adventure-assets.ts).
 */
import generated from "./generated/manifest.json";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type SpriteFrame = "idle" | "blink" | "runA" | "runB" | "runC" | "jump" | "crouch" | "oops";
export type SpriteAnimation = "idle" | "blink" | "run" | "jump" | "fall" | "crouch" | "oops";
export type TileName = "groundTop" | "dirt" | "brick" | "qOrange" | "qBlue" | "used" | "platform" | "exitClosed" | "exitOpen";

export interface AdventureManifest {
  sprites: {
    image: string;
    cell: { w: number; h: number };
    pivot: { x: number; y: number };
    frames: Record<SpriteFrame, Rect>;
    animations: Record<SpriteAnimation, SpriteFrame[]>;
  };
  tiles: {
    image: string;
    tile: number;
    rects: Record<TileName, Rect>;
    background: { image: string; w: number; h: number };
  };
}

export const MANIFEST = generated as AdventureManifest;

export interface LoadedArt {
  sprites: HTMLImageElement;
  tiles: HTMLImageElement;
  background: HTMLImageElement;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    img.src = src;
  });
}

export async function loadArt(): Promise<LoadedArt> {
  const [sprites, tiles, background] = await Promise.all([
    loadImage(MANIFEST.sprites.image),
    loadImage(MANIFEST.tiles.image),
    loadImage(MANIFEST.tiles.background.image),
  ]);
  return { sprites, tiles, background };
}
