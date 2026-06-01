# FerrariSite

Scroll-driven Ferrari showcase built with React, React Three Fiber, drei, and GSAP.

## Setup

```bash
cd FerrariSite
npm install
npm run dev
```

## 3D models

Runtime loads GLBs from `public/models/`:

- `2016_ferrari_488_gtb.glb`
- `2020_ferrari_f8_tributo.glb`
- `ferrari_2021.glb`

Canonical copies live in the repo root [`Ferrari/`](../Ferrari/) folder. Keep `public/models/` in sync when updating assets.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Typecheck and production build |
| `npm run lint` | ESLint on `src/` |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check (CI) |
| `npm run typecheck` | TypeScript without emit |

## Animation & visuals

- **Hero entrance:** GSAP stagger on HUD typography (`HeroEntrance.jsx`).
- **Cinematic camera:** Low orbit / tracking shots per scroll section (`CinematicCamera.jsx`).
- **Showroom:** Reflective floor, warm rim lights, fog, material pass on GLTFs, light bloom + vignette.
- **Performance:** Removed second WebGL cursor layer; lazy-mount car GLBs; code-split Three/R3F bundles.
