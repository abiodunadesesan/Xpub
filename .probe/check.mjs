import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = 3314;
const BASE = `http://127.0.0.1:${PORT}`;
let passed = 0;
const failed = [];
const check = (name, ok, detail = "") => {
  if (ok) {
    passed += 1;
    console.log(`  ok   ${name}`);
  } else {
    failed.push(name);
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
};

const server = spawn("npx", ["next", "dev", "--port", String(PORT)], {
  stdio: "ignore",
  env: { ...process.env, NODE_ENV: "development" },
});

const deadline = Date.now() + 120_000;
for (;;) {
  try {
    if ((await fetch(BASE, { signal: AbortSignal.timeout(4000) })).ok) break;
  } catch {
    /* wait */
  }
  if (Date.now() > deadline) throw new Error("no server");
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

const browser = await chromium.launch({
  channel: "chrome",
  args: ["--autoplay-policy=no-user-gesture-required"],
});

try {
  const manifest = await (await fetch(`${BASE}/api/media?fresh=1`)).json();
  const names = [...manifest.images, ...manifest.videos].map((item) => item._id);
  check("montages are gone from the bucket listing", !names.some((n) => n.startsWith("venue-loop-")),
    names.filter((n) => n.startsWith("venue-loop-")).join(", "));
  check("five real room clips are listed",
    names.filter((n) => n.startsWith("venue-clip-")).length === 5);

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#top video, #gallery img", { timeout: 40_000 });
  await page.waitForTimeout(4500);

  const hero = await page.evaluate(() => {
    const video = document.querySelector("#top video");
    if (!(video instanceof HTMLVideoElement)) return null;
    return {
      src: video.currentSrc || video.src,
      paused: video.paused,
      time: video.currentTime,
      duration: video.duration,
      muted: video.muted,
      loop: video.loop,
    };
  });
  check("trimmed hero clip plays", Boolean(hero) && !hero.paused && hero.time > 0.2,
    hero ? `paused=${hero.paused} t=${hero.time.toFixed(2)}` : "none");
  check("hero clip is the trimmed 25s cut", Boolean(hero) && hero.duration > 20 && hero.duration < 27,
    hero ? `${hero.duration?.toFixed(1)}s` : "none");
  check("hero is still muted + looping", Boolean(hero) && hero.muted && hero.loop);

  await page.locator("#gallery").scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  const gallery = await page.evaluate(() => {
    const videos = [...document.querySelectorAll("#gallery video")];
    return {
      images: document.querySelectorAll("#gallery img").length,
      videos: videos.length,
      playing: videos.filter((v) => !v.paused).length,
      muted: videos.every((v) => v.muted),
    };
  });
  check("gallery keeps the full photo set", gallery.images >= 40, `${gallery.images}`);
  check("gallery plays the real clips", gallery.videos >= 6 && gallery.muted && gallery.playing >= 1,
    JSON.stringify(gallery));

  await page.locator("#music").scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  const music = await page.evaluate(() => {
    const video = document.querySelector("#music video");
    return {
      src: (video?.currentSrc || video?.src || "").split("/").pop() ?? "",
      paused: video?.paused ?? null,
      rows: document.querySelectorAll("[data-track-select]").length,
      audioSrc: document.querySelector("audio")?.getAttribute("src") ?? "",
      audioPaused: document.querySelector("audio")?.paused ?? null,
    };
  });
  check("the music card plays a real room clip",
    /venue-clip/.test(music.src) && music.paused === false, `${music.src} paused=${music.paused}`);
  check("the corner still lists every track", music.rows === 3);
  check("the site's own audio is playing", music.audioPaused === false, music.audioSrc);

  await page.locator("#menu").scrollIntoViewIfNeeded();
  const tabs = await page.locator("#menu button[aria-pressed]").all();
  const sets = {};
  for (const [index, name] of ["cocktails", "beer", "nights"].entries()) {
    await tabs[index].click();
    await page.waitForTimeout(700);
    sets[name] = await page.evaluate(() =>
      [...document.querySelectorAll("#menu img, #menu video")].map((tile) => {
        let raw = tile.currentSrc || tile.src || "";
        if (raw.includes("/_next/image")) {
          raw = new URL(raw, location.origin).searchParams.get("url") ?? raw;
        }
        return decodeURIComponent(raw.split("?")[0].split("/").pop() ?? "");
      }),
    );
  }
  for (const [name, tiles] of Object.entries(sets)) {
    const photos = tiles.filter((t) => t && !t.endsWith(".mp4"));
    check(`#${name} is still drinks-only`, photos.length >= 4 && photos.every((t) => t.startsWith("drink-")),
      photos.join(", "));
  }
  check("tabs still differ from each other",
    new Set(Object.values(sets).map((tiles) => tiles.join())).size === 3);

  check("no page errors", errors.length === 0, errors.slice(0, 2).join(" | "));
} finally {
  await browser.close();
  server.kill("SIGTERM");
}

console.log(`\n${passed} passed, ${failed.length} failed`);
if (failed.length) {
  console.log(failed.map((name) => `  - ${name}`).join("\n"));
  process.exit(1);
}
