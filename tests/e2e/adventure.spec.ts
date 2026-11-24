import { expect, test, type Page } from "@playwright/test";

type Dbg = {
  world: { answered: number; total: number; x: number; exitOpen: boolean };
  engine: { fps: number };
  level: { blocks: unknown[] };
  teleportToBlock: (i: number) => void;
  teleportToExit: () => void;
};

const SIZES = [
  { w: 1440, h: 900 },
  { w: 2000, h: 1034 },
  { w: 820, h: 1180 },
  { w: 390, h: 844 },
];

async function openAdventure(page: Page, unit = "u1") {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto(`/aventura?unidad=${unit}`);
  await page.waitForFunction(() => document.querySelector(".adventure")?.getAttribute("data-status") === "playing", null, {
    timeout: 20_000,
  });
  return errors;
}

const status = (page: Page) => page.locator(".adventure").getAttribute("data-status");
const dbg = <T,>(page: Page, fn: (d: Dbg) => T) =>
  page.evaluate((src) => {
    const d = (window as unknown as { __ADVENTURE__: Dbg }).__ADVENTURE__;
    return new Function("d", `return (${src})(d)`)(d) as T;
  }, fn.toString());

async function answer(page: Page, correct: boolean) {
  await expect.poll(() => status(page)).toBe("question");
  // Busca la opción correcta (marcada en el DOM tras confirmar no sirve): prueba con la tecla 1 y revisa el resultado
  await page.keyboard.press(correct ? "1" : "2");
  await page.keyboard.press("Enter");
  await expect(page.locator(".feedback")).toBeVisible();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await expect.poll(() => status(page)).toBe("playing");
}

for (const s of SIZES) {
  test(`canvas alineado dentro del vidrio a ${s.w}×${s.h}`, async ({ page }) => {
    await page.setViewportSize({ width: s.w, height: s.h });
    const errors = await openAdventure(page);
    const box = await page.evaluate(() => {
      const c = document.querySelector(".adventure__canvas")!.getBoundingClientRect();
      const g = document.querySelector(".screen")!.getBoundingClientRect();
      return { c: [c.x, c.y, c.width, c.height], g: [g.x, g.y, g.width, g.height] };
    });
    // El canvas está contenido en la pantalla del monitor
    expect(box.c[0]).toBeGreaterThanOrEqual(box.g[0] - 1);
    expect(box.c[1]).toBeGreaterThanOrEqual(box.g[1] - 1);
    expect(box.c[0] + box.c[2]).toBeLessThanOrEqual(box.g[0] + box.g[2] + 1);
    expect(box.c[1] + box.c[3]).toBeLessThanOrEqual(box.g[1] + box.g[3] + 1);
    await page.screenshot({ path: `design-refs/adventure/e2e-${s.w}.png` });
    expect(errors).toEqual([]);
  });
}

test("mover, tocar un ?, responder bien y mal, volver al juego", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors = await openAdventure(page);
  const x0 = await dbg(page, (d) => d.world.x);
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(500);
  await page.keyboard.up("ArrowRight");
  expect(await dbg(page, (d) => d.world.x)).toBeGreaterThan(x0 + 20);

  await dbg(page, (d) => d.teleportToBlock(0));
  await answer(page, true);
  await page.screenshot({ path: "design-refs/adventure/e2e-tras-responder.png" });
  await dbg(page, (d) => d.teleportToBlock(1));
  await answer(page, false);
  expect(await dbg(page, (d) => d.world.answered)).toBe(2);
  await expect(page.locator(".adventure__counter")).toContainText("2/");
  expect(errors).toEqual([]);
});

test("la salida avisa cuántos faltan y el nivel se completa al responder todos", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("kgame.adventure.v1"));
  const errors = await openAdventure(page, "u2");
  await dbg(page, (d) => d.teleportToExit());
  await expect(page.locator(".adventure__toast")).toContainText("Faltan 8");
  const total = await dbg(page, (d) => d.level.blocks.length);
  for (let i = 0; i < total; i++) {
    await page.evaluate((idx) => (window as unknown as { __ADVENTURE__: Dbg }).__ADVENTURE__.teleportToBlock(idx), i);
    await answer(page, i % 2 === 0);
  }
  expect(await dbg(page, (d) => d.world.exitOpen)).toBe(true);
  await dbg(page, (d) => d.teleportToExit());
  await expect.poll(() => status(page)).toBe("summary");
  await expect(page.getByRole("heading", { name: /Unidad II completada/ })).toBeVisible();
  await page.screenshot({ path: "design-refs/adventure/e2e-resumen.png" });
  // El resultado llega a Progreso
  await page.goto("/progreso");
  await expect(page.locator("body")).toContainText("Unidad II");
  expect(errors).toEqual([]);
});

test("pausa, silencio, modo clásico y salir al escritorio", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openAdventure(page);
  await page.keyboard.press("p");
  await expect.poll(() => status(page)).toBe("paused");
  await page.screenshot({ path: "design-refs/adventure/e2e-pausa.png" });
  const menu = page.getByRole("dialog", { name: "Pausa" });
  const sound = menu.getByRole("button").nth(3);
  const before = await sound.getAttribute("aria-pressed");
  await sound.click();
  await expect(sound).not.toHaveAttribute("aria-pressed", before ?? "");
  // Mismo estado que la bocina del HUD (y la de la barra de tareas): se guarda en los ajustes
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("kgame.settings.v1") ?? "{}").sound);
  expect(String(stored)).toBe(await sound.getAttribute("aria-pressed"));
  // Esc continúa
  await page.keyboard.press("Escape");
  await expect.poll(() => status(page)).toBe("playing");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /Modo clásico/ }).click();
  await expect(page).toHaveURL(/\/jugar\?unidad=u1/);
  await page.goto("/aventura?unidad=u1");
  await page.waitForFunction(() => document.querySelector(".adventure")?.getAttribute("data-status") === "playing");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /Salir al escritorio/ }).click();
  await expect(page).toHaveURL(/\/$/);
  // No se repite el arranque del monitor
  expect(await page.locator(".room").getAttribute("data-phase")).toBe("on");
  await expect(page.locator(".taskbar")).toBeVisible();
});

test("controles táctiles dentro del cristal en teléfono", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await openAdventure(page);
  const jump = page.locator(".adventure__pad--jump");
  await expect(jump).toBeVisible();
  const box = await jump.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  const x0 = await dbg(page, (d) => d.world.x);
  const right = page.locator(".adventure__pad").nth(2);
  const rb = (await right.boundingBox())!;
  await page.mouse.move(rb.x + rb.width / 2, rb.y + rb.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(500);
  await page.mouse.up();
  expect(await dbg(page, (d) => d.world.x)).toBeGreaterThan(x0 + 10);
  await page.screenshot({ path: "design-refs/adventure/e2e-telefono-tactil.png" });
  await ctx.close();
});

test("rendimiento: ~60 fps mientras corre", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openAdventure(page);
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(2200);
  await page.keyboard.up("ArrowRight");
  const fps = await dbg(page, (d) => d.engine.fps);
  console.log("FPS medidos:", fps);
  expect(fps).toBeGreaterThanOrEqual(55);
});
