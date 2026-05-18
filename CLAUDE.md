# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**罗德兰篝火图谱 · Bonfires of Lordran** — a fan-made, non-commercial interactive 3D visualization of Dark Souls 1 lore. The Lordran 3D model (glTF) by Sketchfab user 9S sits at the center; ~30 bonfire locations serve as narrative nodes the user flies through in Cinema Mode or explores freely.

**Status:** Design/spec phase. `DESIGN.md` and `LEGAL.md` are complete; no source code exists yet.

**Deployment target:** Static site (`vite build` → `dist/`), GitHub Pages or Cloudflare Pages.

## Tech Stack

- **Vite** ^5 + **TypeScript** ^5
- **React** ^18 + **React Three Fiber** ^8 + **Drei** ^9
- **Zustand** ^4 (global app state)
- **Three.js** ^0.160+
- Optional later: `@react-three/postprocessing`, `d3` (branch map), `leva` (camera debug in Phase 1)

## Commands

```bash
npm run dev        # Dev server (Vite HMR)
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
```

Scripts (to be created under `scripts/`):
```bash
npx tsx scripts/validate_data.ts   # Validate bonfires.json schema & cross-references
npx tsx scripts/scrape_wiki.ts     # Draft-fetch bonfire data from Fextralife wiki
```

## Architecture

### Planned `src/` layout

```
src/
├── data/               # Static JSON content
│   ├── bonfires.json   # ~30 bonfire records (primary content file)
│   ├── npcs.json
│   ├── events.json
│   └── regions.json
├── scene/              # R3F 3D components
│   ├── Scene.tsx           # Root canvas + lighting
│   ├── LordranModel.tsx    # glTF loader for dark_souls_map/scene.gltf
│   ├── BonfireMarker.tsx   # Single fire sprite billboard
│   ├── BonfireMarkers.tsx  # All markers from bonfires.json
│   ├── CameraRig.tsx       # Switches between cinema/free mode
│   ├── CinematicCamera.tsx # CatmullRomCurve3 spline flythrough
│   └── FreeCamera.tsx      # OrbitControls
├── ui/                 # React DOM overlay components
│   ├── Sidebar.tsx         # Right-side lore panel
│   ├── Timeline.tsx        # Bottom bonfire progress bar
│   ├── BranchMap.tsx       # Lower-left SVG/D3 network graph
│   ├── CinematicCaption.tsx
│   ├── ModeToggle.tsx
│   └── Tooltip.tsx
├── store/
│   └── useAppStore.ts      # Zustand store: currentBonfire, mode, visited set
├── hooks/
│   ├── useBonfireData.ts
│   └── useCameraTransition.ts
└── utils/
    ├── spline.ts
    └── i18n.ts
```

The 3D model lives at `dark_souls_map/scene.gltf` + `scene.bin` (~69 MB binary). Never move or rename these; the path is referenced directly by `LordranModel.tsx`.

### Key data shape — `bonfires.json`

```typescript
interface Bonfire {
  id: string;
  name_zh: string;
  name_en: string;
  order: number;                    // narrative sequence (unique)
  region: string;
  world_position: [number, number, number];  // hand-calibrated in Phase 1 with leva
  cinematic_pose: {
    camera_position: [number, number, number];
    look_at: [number, number, number];
    duration: number;               // seconds at this stop
  };
  first_visit_state: string;        // 2-3 sentence scene-setting (Chinese)
  lore_text: string;                // 200-300 word lore body (Chinese)
  npcs_present: string[];           // references npcs.json ids
  prerequisite_bonfires: string[];
  next_bonfires: string[];
  lore_anchors: Array<{
    type: 'dialogue' | 'item_description' | 'environmental';
    text_en: string;
    text_zh: string;
    interpretation: string;
    confidence: 'canon' | 'consensus' | 'theory' | 'personal';
    source_ref: { site: string; url: string; page_title: string };
  }>;
}
```

### Camera / mode system

Two camera modes share `CameraRig.tsx`:
- **Cinema Mode (default):** auto-flies through bonfires in `order` sequence using `CatmullRomCurve3` between `cinematic_pose` waypoints; ~8 s per stop. Space bar pauses; clicking a bonfire jumps.
- **Free Mode:** Drei `OrbitControls`.
- **Section View (Phase 6):** orthographic side-view for vertical level topology.

Bonfire markers have three visual states: `unvisited` (dark), `current` (bright animated), `visited` (dim).

### State management

Single Zustand store (`useAppStore.ts`) owns: `currentBonfireId`, `mode` (`cinema | free | section`), `visitedIds: Set<string>`, `sidebarOpen: boolean`. All components read/write through this store — no prop-drilling.

## Implementation Phases

| Phase | Scope | Key output |
|---|---|---|
| 1 | MVP: 3 bonfires, free camera, sidebar | Repo scaffold + glTF loading + 3 fire markers + sidebar |
| 2 | All ~30 bonfires, lore content, NPC data | Complete `bonfires.json` + validation script |
| 3 | Cinema camera + spline flythrough | `CinematicCamera.tsx`, caption titles, mode toggle |
| 4 | Timeline + branch map | Bottom slider, D3/SVG graph |
| 5 | Visual polish | Fire animations, fonts (Cinzel + Noto Serif SC), responsive |
| 6 | Advanced (optional) | Section view, Draco compression, mobile perf |

Use `leva` in Phase 1 to dial in `world_position` coordinates for bonfire markers — model coordinate space is untested.

## Content & Legal

See `LEGAL.md` for full details. Short version:
- **9S model** (`dark_souls_map/`): CC BY-NC 4.0 — attribution required, non-commercial only.
- **Wiki lore** (Fextralife / Fandom / Wikidot): CC BY-SA — paraphrase; do not copy verbatim.
- **Game dialogue/item text**: small quotes under fair use for `lore_anchors`; do not reproduce large blocks.
- **Wiki scraping**: max 1 req/s, respect `robots.txt`; scraped output is a draft, not for direct publication.

Lore text is Chinese-primary. English proper nouns (character names, item names, place names) are kept in English inline.

The `confidence` field on every `lore_anchor` conveys epistemic status: `canon` (explicitly stated in-game) → `consensus` (widely accepted reading) → `theory` (plausible) → `personal` (author interpretation).
