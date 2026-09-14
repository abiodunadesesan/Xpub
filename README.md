# Puzzle Inn Clone (study)

Next.js recreation of [puzzle-inn.fr](https://www.puzzle-inn.fr) built from a **brandkit-cli** extraction.

## What was done

1. Installed `brandkit-cli` + Playwright Chromium
2. Extracted the live site with crawl + responsive widths into `_reference/puzzle-inn`
3. Scaffolded a Next.js App Router + Tailwind project
4. Rebuilt sections, tokens, fonts, assets, loader, cursor, and motion

## Run

```bash
cd puzzle-inn-clone
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Reference kit

```bash
# re-extract if needed (brandkit lives in package.brandkit.json / node_modules.brandkit)
npx --prefix . extract https://www.puzzle-inn.fr ./_reference/puzzle-inn \
  --crawl --widths 375,768,1024,1440,1920 --settle 4000
```

Kit highlights used:

- `guidelines.json` / type scale → Neoneon, Invasion2000, Ubuntu + navy/cyan/yellow
- `site-assets/` → fonts, logos, photos, gifs, Lottie logo
- `animations.json` + loader notes → GSAP/Locomotive/Lottie cues → Motion + Lottie loader
- `sections/` → nav/header/footer structure
- responsive screenshots → mobile → desktop layout pass

## Note

This is a design study recreation, not an official Puzzle Inn product.
