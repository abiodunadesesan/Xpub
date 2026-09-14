# Loader — findings

## Detected animation library
- **GSAP** — window.TweenLite
- **Locomotive Scroll** — dom:[data-scroll], dom:[data-scroll-container]

## Total duration
Loader visibly gone at **~4108ms** after navigation.
(9 frames in `screenshots/`.)

## Observed sequence (Web Animations API counts during the loader window)
- t=1028ms: 1 active Web Animations
- t=1728ms: 1 active Web Animations
- t=1797ms: 1 active Web Animations
- t=1873ms: 1 active Web Animations
- t=1947ms: 1 active Web Animations
- t=2876ms: 1 active Web Animations

## Distinctive assets (logo / mask / sprite / preloader, from the loader network window)
- https://www.puzzle-inn.fr/wp-content/themes/puzzle/assets/img/consoles/logo-nes.svg (image/svg+xml, 1461b)
- https://www.puzzle-inn.fr/wp-content/themes/puzzle/assets/img/consoles/logo-super-nes.png (image/png, 7955b)
- https://www.puzzle-inn.fr/wp-content/themes/puzzle/assets/img/consoles/logo-master-system.png (image/png, 21415b)
- https://www.puzzle-inn.fr/wp-content/themes/puzzle/assets/img/consoles/logo-playstation.svg (image/svg+xml, 1156b)
- https://www.puzzle-inn.fr/wp-content/themes/puzzle/assets/img/consoles/logo-nintendo64.svg (image/svg+xml, 1290b)
- https://www.puzzle-inn.fr/wp-content/themes/puzzle/assets/img/consoles/logo-gamecube.png (image/png, 19188b)
- https://www.puzzle-inn.fr/wp-content/themes/puzzle/assets/img/consoles/logo-playstation2.svg (image/svg+xml, 688b)
- https://www.puzzle-inn.fr/wp-content/themes/puzzle/assets/img/consoles/logo-wii.svg (image/svg+xml, 594b)
- https://www.puzzle-inn.fr/wp-content/themes/puzzle/assets/img/consoles/logo-xbox-360.svg (image/svg+xml, 2468b)
- https://www.puzzle-inn.fr/wp-content/themes/puzzle/assets/img/consoles/logo-ps4.svg (image/svg+xml, 1313b)
- https://www.puzzle-inn.fr/wp-content/themes/puzzle/assets/img/consoles/logo-steam.svg (image/svg+xml, 1048b)
- https://www.puzzle-inn.fr/wp-content/themes/puzzle/assets/js/bodymovin/anim-logo.json (application/json, 7602b)

## Lottie JSON in loader window
- https://www.puzzle-inn.fr/wp-content/themes/puzzle/assets/js/bodymovin/anim-logo.json

## Loader-window network total
54 requests (full dump in `network.json`).

> Driven via Playwright/CDP headless Chromium. Loader element identified heuristically
> (full-viewport fixed/absolute overlay, highest stacking / load-ish class) and polled until hidden.
