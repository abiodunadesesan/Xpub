# Loader — findings

## Detected animation library
- **GSAP** — window.TweenLite
- **Locomotive Scroll** — dom:[data-scroll], dom:[data-scroll-container]

## Total duration
Loader visibly gone at **~4192ms** after navigation.
(8 frames in `screenshots/`.)

## Observed sequence (Web Animations API counts during the loader window)
- t=973ms: 0 active Web Animations
- t=3162ms: 0 active Web Animations
- t=3293ms: 0 active Web Animations
- t=3461ms: 0 active Web Animations
- t=3638ms: 0 active Web Animations
- t=3793ms: 0 active Web Animations

## Distinctive assets (logo / mask / sprite / preloader, from the loader network window)
- None obviously named.

## Lottie JSON in loader window
- None.

## Loader-window network total
14 requests (full dump in `network.json`).

> Driven via Playwright/CDP headless Chromium. Loader element identified heuristically
> (full-viewport fixed/absolute overlay, highest stacking / load-ish class) and polled until hidden.
