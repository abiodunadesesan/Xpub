import { expect, test } from "@playwright/test";

async function waitForSiteReady(page: import("@playwright/test").Page) {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !document.body.classList.contains("is-loading"), {
    timeout: 12_000,
  });
  // Wait for media hydration (hero still or clip, or gallery tiles)
  await page.waitForFunction(
    () =>
      document.querySelectorAll("#gallery img, #gallery video, #music video").length > 0 ||
      document.querySelector("#top img, #top video") !== null,
    { timeout: 25_000 },
  );
  await page.waitForTimeout(400);
}

test.describe("X Pub Girne — premium site", () => {
  test.beforeEach(async ({ page }) => {
    await waitForSiteReady(page);
  });

  test("loads hero and key sections", async ({ page }) => {
    await expect(page.locator("#top")).toBeVisible();
    await expect(page.locator("#about")).toBeAttached();
    await expect(page.locator("#experience")).toBeAttached();
    await expect(page.locator("#menu")).toBeAttached();
    await expect(page.locator("#gallery")).toBeAttached();
    await expect(page.locator("#music")).toBeAttached();
    await expect(page.locator("#blog")).toBeAttached();
    await expect(page.locator("#reviews")).toBeAttached();
    await expect(page.locator("#visit")).toBeAttached();
  });

  test("custom cursor mounts on desktop fine pointer", async ({ page }) => {
    await page.mouse.move(240, 180);
    await page.waitForTimeout(300);
    await expect(page.getByTestId("custom-cursor")).toHaveCount(1);
    await expect(page.getByTestId("custom-cursor")).toHaveClass(/isVisible/);
    await expect(page.locator("body")).toHaveClass(/cursor-ready/);
  });

  test("gallery shows multiple unique media tiles including video", async ({ page }) => {
    await page.locator("#gallery").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("gallery-grid")).toBeAttached({ timeout: 30_000 });
    await page.waitForTimeout(800);
    const tiles = page.locator("#gallery .glass-card");
    await expect
      .poll(async () => tiles.count(), { timeout: 20_000 })
      .toBeGreaterThanOrEqual(6);
    await expect
      .poll(async () => page.locator("#gallery video").count(), { timeout: 25_000 })
      .toBeGreaterThanOrEqual(1);
    // Lightbox opens on click
    await tiles.first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("experience and menu use glass cards", async ({ page }) => {
    await page.locator("#experience").scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await expect
      .poll(async () => page.locator("#experience .glass-card").count())
      .toBeGreaterThanOrEqual(1);
    await page.locator("#menu").scrollIntoViewIfNeeded();
    await expect(page.locator("#menu .glass-panel").first()).toBeAttached();
  });

  test("live music section has glass schedule cards and video", async ({ page }) => {
    await page.locator("#music").scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    await expect
      .poll(async () => page.locator("#music article.glass-card").count())
      .toBeGreaterThanOrEqual(3);
    await expect
      .poll(async () => page.locator("#music video").count(), { timeout: 25_000 })
      .toBeGreaterThanOrEqual(1);
  });

  test("blog and reviews glass cards render", async ({ page }) => {
    await page.locator("#blog").scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await expect
      .poll(async () => page.locator("#blog .glass-card").count())
      .toBeGreaterThanOrEqual(3);

    await page.locator("#reviews").scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await expect
      .poll(async () => page.locator("#reviews .glass-card").count())
      .toBeGreaterThanOrEqual(2);
  });

  test("visit CTAs are high-contrast and readable", async ({ page }) => {
    await page.locator("#visit").scrollIntoViewIfNeeded();
    const primary = page.locator("#visit a.glass-btn").first();
    const outline = page.locator("#visit a.glass-btn-outline").first();
    await expect(primary).toBeAttached();
    await expect(outline).toBeAttached();

    // The CTA sits inside a <Reveal>, which is why this can't read the style
    // once and be done. Reveal renders an unanimated div until an effect swaps
    // it for the motion element, and that element *starts* at opacity 0 — so a
    // single read legitimately catches either end of the sequence: 1 before
    // hydration, 0 as the animation begins. Only a sample that has stopped
    // moving means anything, so wait for the value to hold still.
    const opacityOf = () => primary.evaluate((el) => Number(getComputedStyle(el).opacity));
    await expect
      .poll(
        async () => {
          const first = await opacityOf();
          await new Promise((resolve) => setTimeout(resolve, 300));
          return first === (await opacityOf()) ? first : -1;
        },
        { timeout: 20_000 },
      )
      .toBeGreaterThan(0.9);

    const primaryStyles = await primary.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        color: s.color,
        bg: s.backgroundImage || s.backgroundColor,
        opacity: s.opacity,
        fontSize: parseFloat(s.fontSize),
      };
    });
    expect(Number(primaryStyles.opacity)).toBeGreaterThan(0.9);
    expect(primaryStyles.fontSize).toBeGreaterThanOrEqual(12);
    expect(primaryStyles.bg.length).toBeGreaterThan(0);
  });

  test("scroll reveal / motion animates sections into view", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.locator("#experience").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    const opacity = await page.locator("#experience").evaluate((section) => {
      const kids = Array.from(section.querySelectorAll("*"));
      let best = 0;
      for (const el of kids) {
        const op = parseFloat(getComputedStyle(el).opacity);
        if (!Number.isNaN(op)) best = Math.max(best, op);
      }
      return best;
    });
    expect(opacity).toBeGreaterThan(0.5);
  });

  test("background music control is present and clickable", async ({ page }) => {
    // Two legitimate states. With audio bundled it is a play/pause button; with
    // none — the rotation is Spotify tracks, which cannot be downloaded — it is
    // a link to the playlist, because a play button that does nothing reads as
    // a broken site. Both are "the music control is there and works".
    const control = page.locator("[data-music-toggle], a[href*='open.spotify.com/playlist']").first();
    await expect(control).toBeAttached({ timeout: 25_000 });
    // Spotify iframe boot can be slow / blocked; force click avoids Next overlay intercepts
    await control.click({ force: true });
    await expect(control).toBeAttached();
  });

  test("Che Bar font stack CSS variables are applied", async ({ page }) => {
    const fonts = await page.evaluate(() => {
      const body = getComputedStyle(document.body).fontFamily;
      const root = getComputedStyle(document.documentElement);
      const h = document.querySelector(".font-display, h1, h2");
      const displayResolved = h ? getComputedStyle(h).fontFamily : root.getPropertyValue("--font-display");
      const serifEl = document.querySelector(".font-serif");
      const serifResolved = serifEl
        ? getComputedStyle(serifEl).fontFamily
        : root.getPropertyValue("--font-serif");
      return { body, displayResolved, serifResolved };
    });
    expect(fonts.body.toLowerCase()).toMatch(/dm sans|helvetica|sans-serif/);
    expect(fonts.displayResolved.toLowerCase()).toMatch(/cinzel/);
    expect(fonts.serifResolved.toLowerCase()).toMatch(/cormorant|serif/);
  });

  test("no fatal page errors on load", async ({ page }) => {
    const fatals: string[] = [];
    page.on("pageerror", (err) => fatals.push(err.message));
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);
    expect(fatals.filter((m) => !/ResizeObserver|spotify|hydration/i.test(m))).toEqual([]);
  });
});
