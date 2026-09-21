# X Pub Girne

Nightlife site for X Pub, Girne (Northern Cyprus). Next.js App Router, Tailwind
v4, Motion, English + 14 other locales.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm test:e2e     # Playwright
```

## Media

Venue photos and clips live in a **Cloudflare R2 bucket** (`xpub-media`) and are
served from its public domain with zero egress cost. The bucket is the source of
truth: `/api/media` hands the sections a list of it, and
`lib/media-allocate.ts` decides which item goes where.

Nothing renders blank if the bucket is unreachable. In order, the site falls
back to a cached listing, then `lib/media-manifest.json` (a committed snapshot),
then the bundled `public/images` assets.

### Add or change media

```bash
npm run media:upload   # public/media + public/videos → the bucket
npm run media:sync     # build web-sized copies, refresh lib/media-manifest.json
npm run media:rename   # rename bucket objects to the section names below
git add lib/media-manifest.json public && git commit
```

`media:upload` never uploads `public/images` — that folder holds the arcade art,
the map and the offline fallback photos, which would otherwise land in the
gallery. Put new photos in `public/media/`. It also skips `dj-set.mp4`, the
original template's stock clip, which has been retired from the bucket.

A file's name is its section tag, so name it on the way in (`drink-*.jpg`,
`hero-*.mp4`) and there is nothing else to configure.

`media:sync` is what makes the bucket web-ready. The originals are 2–11 MB and
Next's image optimizer aborts any upstream fetch over 7 seconds, so a cold
gallery used to render broken tiles. Sync writes a downscaled copy of every
photo to `_web/<name>.jpg` (longest side 1600px, ~150 kB average) and
transcodes heavy or non-MP4 videos, then records those copies in the manifest so
the site links to them. Full-resolution originals stay in the bucket.

`media:rename` is how an object gets its section tag (see the table below). R2
has no rename, so it copies each object — and its `_web/` copy — to the new key
and deletes the old one, verifying the byte count on the way through. Run it
with `--dry-run` first. It is safe to re-run: anything already at its target
name is skipped, and superseded keys are retired from an exact-match list with
byte-size guards rather than deleted by pattern.

`media:sync` takes `--only=<substring>` to narrow a run, which is how the hero
clip gets re-encoded on its own:

```bash
npm run media:sync -- --only=hero --force
```

### Credentials

Media changes are read from the bucket so a new upload shows up without a
redeploy. `/api/media` resolves a credential in this order:

| Source | Scope | Where it applies |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | Workers R2 Storage: Read | anywhere — **set this in production** |
| `wrangler login` session | your account | local dev only (`R2_USE_WRANGLER_SESSION=off` disables) |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` + `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | S3 API | anywhere |

The wrangler session is a convenience for local work — the token expires hourly
and only wrangler refreshes it, so it is never used when `NODE_ENV=production`.
Refresh it by running any wrangler command (`npx wrangler whoami`). The two
scripts use the same order, and additionally need write scope.

Without a credential the site still renders correctly: `/api/media` serves the
committed snapshot and reports `X-Media-Source: snapshot`. With one it reports
`live`, re-listing at most once a minute, and stops trying for 30 seconds after
a failure so an outage can't turn into a request stampede.

`npm run media:prune` deletes bucket objects that have no file in
`public/media` or `public/videos` — which includes everything uploaded straight
through the R2 dashboard, i.e. the venue's own photos. It therefore lists what
it would delete and refuses to act without `--yes`:

```bash
npm run media:prune -- --dry-run
npm run media:prune -- --yes          # only when that list is really disposable
```

### Deploying

`.env.local` is gitignored, so the host needs these set explicitly:

| Variable | Needed for |
| --- | --- |
| `R2_PUBLIC_DOMAIN` | every media URL — **without it the site falls back to the bundled demo photos** |
| `R2_BUCKET_NAME` | the live listing, and the scripts |
| `CLOUDFLARE_ACCOUNT_ID` | the live listing, and the scripts |
| `CLOUDFLARE_API_TOKEN` | live listing (Workers R2 Storage · **Read** is enough) |

The first three are enough to serve the committed snapshot, so the gallery is
correct on a fresh deploy. The token is what makes a new upload appear without a
redeploy — create it at **My Profile → API Tokens → Create Custom Token** with
*Account · Workers R2 Storage · Read*, scoped to the account.

Two folders are untracked until you add them, and production needs both:

```bash
git add public/audio public/videos lib/media-manifest.json
git commit
```

`public/audio` is the music (the site plays it locally, so it must ship), and
`public/videos` holds the `venue-loop-*.mp4` room clips.

### Gallery loop videos

`npm run media:videos` rebuilds the short `venue-loop-*.mp4` clips in
`public/videos/` from photos in the bucket: three stills per clip with a slow
push-in and a crossfade. They are derived assets standing in for footage —
replace them with real clips whenever you have them. No drink photo is used, so
nothing from the menu can surface in the gallery or the room clips (they read
from the `_web/` copies, which keeps the build to a few seconds).

### How a file gets picked for a section

Section allocation matches on the last path segment, so filenames are the
control surface:

| Filename contains | Section |
| --- | --- |
| `hero-*.mp4` | hero background clip, autoplaying and looping |
| `hero-*`, `cover` (image) | hero still — also the clip's poster frame |
| `about-*` | the about panel's portrait |
| `drink-*` | the menu strip, which shows **drinks and nothing else** |
| `drink-cocktail-*` | the Cocktails tab |
| `drink-beer-*` | the Beer & Cold tab |
| `drink-bar-*` | the Nights tab — pours and bar service |
| `guests-*`, `team-*`, `venue-*`, `exterior-*` | descriptive tags, filled in rotation across experience, blog and gallery |
| `venue-loop-*` | the room and gallery clips |
| everything else | rotation, same as the descriptive tags |

Three rules are worth knowing:

- **The menu is drinks-only by construction.** Its pool is the `drink-*`
  objects: upload `drink-espresso-martini.jpg` and it joins the strip, with no
  code change. Drinks are excluded from the live-music section for the same
  reason they define the menu.
- **Each menu tab draws from its own category first.** Cocktails opens on
  `drink-cocktail-*`, Nights on `drink-bar-*`, and each tab's clip follows its
  tab. A tab that is short on its own photos borrows from the *other drinks* —
  never from a guest or a room shot. There is no beer photo in the bucket yet,
  so Beer & Cold borrows the cocktails' set until `drink-beer-*.jpg` files
exist.
- **Media is shared between sections when the pool is small.** Rotation
  guarantees no tile is ever left empty, and each tab takes its own slice so
  switching tabs visibly replaces every tile.

`hero-*` videos are encoded leaner than tiles — the hero background lands on
the critical path, so `media:sync` gives it crf 41, a slower preset and 24fps.
Measured on the real 60s 720x1280 source: 3.18 MB at the tile settings, 2.03 MB
at the hero settings. The hero
clip plays regardless of `prefers-reduced-motion` (a flag in
`components/hero-section.tsx` reverses that), matching how the gallery, menu and
music clips already behave.

## Music

The live-music section is a player corner — genre chips, a now-playing card
with a waveform and transport, and the track list — and the floating button at
the bottom of the page is a second view of the **same** player.
`lib/audio-player.tsx` owns one `<audio>` element for the whole site, so the two
can never disagree about what is playing, and selecting a track in either place
moves the other.

`lib/tracks.ts` is the track list. To add a track, drop the MP3 in
`public/audio/` and add an entry with its `src`; it joins the playlist and the
list on its own. Two things follow from the data rather than from code:

- **Genre chips come from the tracks' `genres`**, so a genre nobody plays gets
  no chip, and adding a track adds its genre.
- **A track with a `spotify` link but no bundled `src` is Spotify-only.** The
  corner embeds its player and says so, instead of offering a play button with
  nothing behind it. Spotify does not allow a site to stream a track's audio, so
  this is the only honest way to include one.

The player probes each `src` once — HEAD, then metadata for the duration —
rather than assuming the file is there. That's why the two Spotify tracks
currently show as "On Spotify" and the corner falls back to the bundled
ambience.

To put them on rotation, save them as:

| File in `public/audio/` | Track |
| --- | --- |
| `beni-al-afro-house-remix.mp3` | Beni Al (Ta Ki Seni Görene Kadar) — Afro House Remix · Ankara Echoes, Kürşad Kahraman |
| `fire-fire.mp3` | Fire Fire · Shimza, AR/CO, Kasango |

The filenames are the wiring — the entries in `lib/tracks.ts` already point at
them, so dropping the files in is the whole job. Music never comes from R2: it
is bundled with the site, so it plays offline and costs nothing to serve.

One thing no code can change: browsers block audio until the visitor has
interacted with the page. The first tap, key press, scroll or touch starts
playback wherever they are, and an explicit pause is never overridden by the
resume watchdog.

## Checks

```bash
npx tsc --noEmit
npm run lint
npm test:e2e

# If Playwright's downloaded browsers are missing or stale on this machine:
npx playwright test --config=playwright.local.config.ts
```
