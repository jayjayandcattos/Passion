# FerrariSite — Performance Analysis & Optimization Plan

You're seeing **10–30 FPS** because this scene stacks several **GPU-heavy techniques at once**, on top of **very large 3D assets**. None of them are “free”; together they can cost more than a mid-range GPU can sustain at 60fps.

This document explains **what is hurting you today**, **why**, and a **prioritized plan** to get back toward 60fps without throwing away the cinematic look entirely.

---

## Quick diagnosis checklist

Before changing code, confirm where time is spent:

1. Open the site → **F12** → **Performance** (Chrome) or **about:debugging** (Firefox).
2. Record **5 seconds** while scrolling slowly through all three sections.
3. Note:
   - **GPU bound** (high GPU %, low CPU): shadows, reflections, post-processing, triangle count.
   - **CPU bound** (high main-thread time): `useFrame` traversals, React re-renders, `setState` in scroll handlers.

Also try this **30-second isolation test** (toggle one at a time in a branch):

| Toggle off | If FPS jumps a lot, culprit confirmed |
|------------|--------------------------------------|
| `<CinematicEffects />` | Post-processing (Bloom + composer) |
| `<ShowroomGround />` | `MeshReflectorMaterial` (mirror floor) |
| `shadows` on `<Canvas>` | Shadow map passes |
| Mount only **one** car in `CarFleet` | GLTF size / draw calls |
| `dpr={1}` (fixed) | Pixel fill rate |

---

## Root causes (ranked by likely impact)

### 1. Reflective floor — `MeshReflectorMaterial` (critical)

**File:** `src/components/ShowroomGround.jsx`

`MeshReflectorMaterial` (drei) re-renders the scene into an offscreen buffer to build reflections. At `resolution={512}` on desktop, that is effectively **an extra full-scene render every frame**, often more expensive than the main pass.

**Why you feel it:** 10–30 FPS with reflectors on weak GPUs is common even when everything else is reasonable.

**Recommendations:**

| Priority | Change | Expected gain |
|----------|--------|----------------|
| P0 | Replace with a **simple dark `MeshStandardMaterial`** plane (roughness ~0.85, metalness ~0.2). Fake gloss with a subtle radial gradient texture, not real-time reflection. | **Large** (often 2–3× FPS) |
| P1 | If you keep reflector: `resolution={256}` (or 128 on laptop), `mirror={0.15}`, lower `mixStrength`. | Medium |
| P2 | Only enable reflector when `prefers-reduced-motion: no-preference` **and** `navigator.hardwareConcurrency >= 8` (or WebGL tier check). | Medium |

---

### 2. GLTF assets are huge (~40 MB total on disk)

**Paths:** `public/models/*.glb` (canonical copies in repo `Ferrari/`)

| Model | Size (approx.) |
|-------|----------------|
| `2016_ferrari_488_gtb.glb` | ~9.9 MB |
| `2020_ferrari_f8_tributo.glb` | ~12.6 MB |
| `ferrari_2021.glb` | ~17.6 MB |

Large file size usually means **high polygon counts**, **large textures**, or **uncompressed geometry**. The runtime cost is **vertices × materials × lights × shadows**, not megabytes alone—but these files are a strong signal the meshes are not web-optimized.

**Recommendations:**

| Priority | Change | Expected gain |
|----------|--------|----------------|
| P0 | **One car in memory at a time** — unmount previous section’s model when leaving (today `CarFleet` can keep up to 3 mounted). | Large (VRAM + draw calls) |
| P0 | Re-export / compress in Blender: **Draco** mesh compression, **KTX2/Basis** textures, target **&lt; 100k triangles** per car for web hero shots. | Large |
| P1 | Run [gltf-transform](https://gltf-transform.dev/): `optimize`, `resize` textures to 1024–2048 max, `draco` compression. | Large |
| P2 | Use **LOD** (high mesh near camera, low mesh far) or a single “hero” LOD for scroll experience. | Medium–large |
| P3 | Host **separate `.ktx2` / texture atlases** instead of embedded 4K PNGs in GLB. | Medium |

**Rule of thumb for web:** hero vehicle **50k–150k tris**, textures **≤ 2K**, total GPU memory per car **&lt; 50–80 MB** including mipmaps.

---

### 3. Post-processing — `EffectComposer` + Bloom

**File:** `src/components/CinematicEffects.jsx`

Every frame:

- Full-screen **Bloom** (with `mipmapBlur`)
- **Vignette**
- Extra multisampling (`multisampling={2}` on desktop)

That is **2–3 GPU passes** after the 3D scene, on top of everything else.

**Recommendations:**

| Priority | Change | Expected gain |
|----------|--------|----------------|
| P0 | **CSS vignette** (you already have letterbox/grain in CSS) + remove `EffectComposer` entirely for default quality tier. | Medium–large |
| P1 | Bloom only on desktop tier; `multisampling={0}` always. | Medium |
| P2 | `frameloop="demand"` + `invalidate()` only when scrolling (see §7). | Medium when idle |

---

### 4. Shadows — 2048² shadow map

**File:** `src/components/CinematicLighting.jsx`

```jsx
shadow-mapSize={[2048, 2048]}
```

A single directional shadow at 2048² is a common **20–40% GPU** hit on laptop iGPUs.

**Recommendations:**

| Priority | Change | Expected gain |
|----------|--------|----------------|
| P0 | `shadow-mapSize={[1024, 1024]}` or **disable shadows** and rely on `ContactShadows` + baked AO in textures. | Medium |
| P1 | `castShadow` only on the **active car**, not ground + everything. | Small–medium |
| P2 | Use **PCFSoftShadowMap** only if needed; consider **no shadows** for mobile tier. | Medium on weak devices |

---

### 5. `ContactShadows` — extra render pass

**File:** `src/components/CarFleet.jsx`

```jsx
resolution={512}
```

Cheap compared to reflector, but still a **screen-space pass** every frame.

**Recommendations:**

- `resolution={256}` or replace with a **static circular shadow texture** under the car (decal plane).
- Set `frames={1}` (already done) — good; do not set `frames={Infinity}` unless the car moves.

---

### 6. Per-frame material mutation on every mesh

**File:** `src/components/FerrariModel.jsx`

Inside `useFrame`, for **each visible car**:

```js
groupRef.current.traverse((child) => {
  // sets transparent + opacity on every material, every frame
})
```

Problems:

- Forces materials into **transparent rendering** (slower sort order, overdraw).
- Traverses **entire subtree every frame** (CPU cost scales with mesh count).
- With **2–3 cars mounted**, cost multiplies.

**Recommendations:**

| Priority | Change | Expected gain |
|----------|--------|----------------|
| P0 | Fade with **one `groupRef` opacity** via a custom shader or drei's `<mesh>` wrapper — not per-material. | Medium (CPU + GPU) |
| P1 | Toggle visibility at thresholds; skip traverse when `opacity` is 0 or 1 (stable). | Small–medium |
| P2 | Pre-mark materials transparent once in `enhanceMaterials`, animate a single `uniform` if you need fade. | Medium |

---

### 7. `scene.clone(true)` per car

**File:** `src/components/FerrariModel.jsx`

Each mounted model **clones the full scene graph** (geometry + materials duplicated in memory).

With three cars mounted: **~3× VRAM** for geometry.

**Recommendations:**

- Mount **only the active car** (index from scroll); dispose previous with `useGLTF` cache clear if needed.
- Or share one geometry instance and only swap materials/visibility (harder with GLTF).

---

### 8. Pixel fill rate — DPR + antialiasing

**File:** `src/components/Scene.jsx`

```jsx
dpr={[1, 1.5]}
gl={{ antialias: true }}
```

On a 1440p display, `dpr=1.5` → internal buffer **~2.25× pixels**. MSAA adds more.

**Recommendations:**

| Priority | Change | Expected gain |
|----------|--------|----------------|
| P0 | `dpr={1}` globally, or `dpr={Math.min(1.25, window.devicePixelRatio)}`. | Medium–large on Retina |
| P1 | `antialias: false` + post FXAA only if needed (or none). | Small–medium |
| P2 | Cap: `const dpr = Math.min(window.devicePixelRatio, 1.25)`. | Medium |

---

### 9. Camera `updateProjectionMatrix()` every frame

**File:** `src/components/CinematicCamera.jsx`

FOV changes every frame → matrix recalc every frame. Cheap alone, but unnecessary if FOV steps are discrete per section.

**Recommendation:** Lerp FOV only across section boundaries, or use **fixed FOV** per section and only lerp position/rotation.

---

### 10. Multiple `useFrame` hooks

These all run **every frame** while the canvas is active:

| Component | Work per frame |
|-----------|----------------|
| `CinematicCamera` | Camera + projection update |
| `FerrariModel` × N | Traverse + material writes |
| `HtmlOverlay` | DOM style updates |
| `CarFleet` | Section index (mostly cheap; `setState` on section change is fine) |
| ScrollControls (drei) | Scroll physics |

**Recommendations:**

- Merge camera + car logic where possible.
- Move HTML opacity to **GSAP ScrollTrigger** or CSS driven by a single scroll progress CSS variable (one writer per frame).
- Use `frameloop="demand"` and `invalidate()` on scroll delta &gt; epsilon.

---

### 11. Environment + lightformers

**File:** `src/components/CinematicLighting.jsx`

Custom `Environment` with three `Lightformer`s is cheaper than HDRI but still builds a cubemap. `frames={1}` helps (static env).

**Recommendations:**

- Swap to a **single small HDR** (512) or preset `Environment preset="night"` with `environmentIntensity={0.4}`.
- Remove redundant `spotLight` if lightformers already define the look.

---

## Suggested quality tiers (implementation pattern)

Introduce a `useQualityTier()` hook:

```txt
'low'    → no reflector, no bloom, no shadows, dpr=1, one car, 1024 textures
'medium' → simple floor, bloom off, shadows 1024, dpr=1, one car
'high'   → current look (desktop only)
```

Detect:

- `navigator.deviceMemory` (Chrome)
- `renderer.capabilities` / max texture size
- User override in `localStorage` or `?quality=low`

Default to **medium** on first visit; let users opt into **high**.

---

## Prioritized roadmap

### Phase 0 — Same day (largest FPS wins, minimal art rework)

1. **Remove or downgrade `MeshReflectorMaterial`** → matte floor.
2. **Remove `EffectComposer`** → CSS vignette only.
3. **`dpr={1}`**, `antialias: false`.
4. **Mount only one `FerrariModel`** at a time; unmount others.
5. **Shadow map 1024** or shadows off.
6. **Stop per-mesh opacity traverse** in `useFrame`.

**Realistic target after Phase 0:** 40–60 FPS on mid GPU, 30–45 on iGPU (still depends on GLB triangle count).

### Phase 1 — Asset pipeline (1–2 days)

1. Compress all three GLBs (Draco + texture resize).
2. Measure triangle/texture counts with `gltf-transform inspect`.
3. Re-test FPS.

**Target:** stable 60 FPS on discrete GPU with medium tier.

### Phase 2 — Polish without killing perf

1. Baked ambient occlusion in textures instead of dynamic shadows.
2. `frameloop="demand"` when scroll idle.
3. Optional: lightweight bloom via CSS `filter` on a screenshot fallback (not ideal but free).

### Phase 3 — “GTA” fidelity (only if Phase 0–1 hit budget)

- One hero car with **LOD0 / LOD1**
- Reflection probe **baked** into floor material
- Short pre-rendered lightmaps

Real GTA V runs on native code with aggressive culling, streaming, and platform-specific LOD. The web equivalent is **fewer dynamic effects**, not more post-processing.

---

## Architecture sketch (healthier runtime)

```txt
Scroll offset
    │
    ├─► ActiveCar (single useGLTF, no clone if possible)
    │
    ├─► CinematicCamera (position only; fixed FOV per section)
    │
    ├─► SimpleGround (MeshStandardMaterial)
    │
    └─► Lighting (1 directional, optional ContactShadows 256)

CSS: vignette, grain, letterbox
No: MeshReflector, EffectComposer, 3× mounted cars, per-frame material traverse
```

---

## How to measure success

| Metric | Tool | Goal |
|--------|------|------|
| FPS | Chrome Performance → Frames | ≥ 55 sustained while scrolling |
| GPU memory | Chrome → More tools → Performance monitor | Stable, no climb when switching cars |
| Draw calls | Spector.js or `renderer.info.render` in dev | &lt; 150 typical for one car + floor |
| Triangle count | `renderer.info.render.triangles` | &lt; 500k on screen for one car |
| Load time | Network tab | Each GLB &lt; 3 MB transferred (compressed) |

Log in dev:

```js
// temporary in useFrame
console.log(renderer.info.render.triangles, renderer.info.render.calls)
```

---

## Files to touch first (code map)

| File | What to change |
|------|----------------|
| `ShowroomGround.jsx` | Replace reflector or gate by tier |
| `CinematicEffects.jsx` | Remove or tier-gate composer |
| `Scene.jsx` | `dpr`, `shadows`, `frameloop` |
| `CarFleet.jsx` | Single active car; lower shadow res |
| `FerrariModel.jsx` | Remove traverse fade; single-car mount |
| `CinematicLighting.jsx` | Shadow map size, fewer lights |
| `public/models/*.glb` | Compress / decimate (biggest long-term win) |

---

## Honest expectation

With **~10–18 MB GLBs** and **real-time reflections + bloom + shadows + up to 3 cars**, 10–30 FPS is an expected outcome on a laptop or older GPU—not a “bug” in React Three Fiber.

The fastest path to smooth scroll is:

1. **Simpler floor** (no mirror).
2. **Simpler effects** (CSS, not composer).
3. **Smaller, fewer meshes on screen** (one car + compressed GLB).

Visual quality can stay “cinematic” through **lighting, composition, and color grading in CSS**—not through stacking every expensive Three.js feature at once.

---

## Optional: implement a `PERFORMANCE_MODE` env flag

For quick A/B while developing:

```env
VITE_PERF_MODE=1
```

When set, `Scene.jsx` reads it and disables reflector, composer, and multi-car mount. Lets you verify FPS deltas without deleting code.

---

*Last reviewed against codebase: Scene, CarFleet, FerrariModel, ShowroomGround, CinematicEffects, CinematicLighting, CinematicCamera.*
