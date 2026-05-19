# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**罗德兰篝火图谱 · Bonfires of Lordran** — a fan-made, non-commercial interactive 3D visualization of Dark Souls 1 lore. The Lordran 3D model (glTF) by Sketchfab user 9S sits at the center; 27 bonfire locations serve as narrative nodes the user flies through in Cinema Mode or explores freely.

**Status:** Phases 1–4 complete. Core infrastructure, all bonfire data, cinema/free camera modes, sidebar, timeline, and branch map are all live. Phase 5 (visual polish) is next.

**Deployment target:** Static site (`vite build` → `dist/`), GitHub Pages or Cloudflare Pages.

## Tech Stack

- **Vite** ^5 + **TypeScript** ^5
- **React** ^18 + **React Three Fiber** ^8 + **Drei** ^9
- **Zustand** ^4 (global app state)
- **Three.js** ^0.170+
- Optional later: `@react-three/postprocessing` (bloom), `leva` (camera debug, dev only)

## Commands

```bash
npm run dev        # Dev server (Vite HMR)
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
npx tsx scripts/validate_data.ts   # Validate bonfires.json schema & cross-references
```

## Architecture

### `src/` layout

```
src/
├── data/
│   ├── bonfires.json   # 27 bonfire records — primary content file
│   ├── npcs.json       # 21 NPC records
│   └── (events.json / regions.json — not yet created)
├── scene/              # R3F 3D components
│   ├── Scene.tsx           # Root Canvas + lighting + camera switching
│   ├── LordranModel.tsx    # glTF loader; resets anomalous scale≈1302 node
│   ├── BonfireMarker.tsx   # Single fire marker: ring + pulsing ember + sparkles + hover tooltip
│   ├── BonfireMarkers.tsx  # Renders all markers from bonfires.json
│   ├── CinematicCamera.tsx # Dwell/fly state machine; lerp between cinematic_pose waypoints
│   ├── PositionEditor.tsx  # Dev-only leva panel for calibrating world_position
│   └── ProceduralMap.tsx   # Fallback procedural map (unused if glTF loads)
├── ui/
│   ├── Sidebar.tsx             # Right-side lore panel (slides in on bonfire click)
│   ├── Sidebar.module.css
│   ├── Timeline.tsx            # Bottom bar: 27 clickable dots, auto-scrolls to current
│   ├── Timeline.module.css
│   ├── BranchMap.tsx           # Lower-left collapsible SVG network graph (depth_tier × order)
│   ├── BranchMap.module.css
│   ├── CinematicCaption.tsx    # Top-center fade title card in cinema mode
│   ├── ModeToggle.tsx          # Cinema / Free mode toggle (top center)
│   ├── AudioManager.tsx        # Ambient + bonfire SFX
│   └── PositionPickerUI.tsx    # Dev-only: click-to-place bonfire position tool
├── store/
│   └── useAppStore.ts      # Zustand: currentBonfireId, mode, visitedIds, sidebarOpen, positionOverrides
├── styles/
│   └── global.css          # Fonts (Cinzel + Noto Serif SC), loading screen, base reset
├── types.ts                # Bonfire, LoreAnchor, CinematicPose, SourceRef interfaces
└── main.tsx
```

The 3D model lives at `dark_souls_map/scene.gltf` + `scene.bin` (~69 MB binary). **Never move or rename these**; the path is hardcoded in `LordranModel.tsx`.

### Key data shape — `bonfires.json`

```typescript
interface Bonfire {
  id: string;
  name_zh: string;
  name_en: string;
  order: number;                    // narrative sequence 1–27 (unique, sorted)
  region: string;
  difficulty_tier?: number;
  world_position: [number, number, number];  // hand-calibrated with PositionEditor (leva)
  depth_tier: number;               // vertical level: 0=Firelink, +3=Anor Londo, -5=Ash Lake
  cinematic_pose: {
    camera_position: [number, number, number];
    look_at: [number, number, number];
    duration_seconds: number;
  };
  cinematic_caption: string;        // one-line quote shown in cinema mode
  first_visit_state: string;        // 2-3 sentence scene-setting (Chinese)
  lore_text: string;                // 200-300 char lore body (Chinese)
  npcs_present: string[];           // references npcs.json ids
  items_unlocked: string[];
  events_triggered: string[];
  lore_anchors: LoreAnchor[];
  prerequisite_bonfires: string[];
  next_bonfires: string[];          // used by BranchMap edges
  sources: SourceRef[];
}
```

### Camera / mode system

- **Cinema Mode:** auto-flies through bonfires in `order` sequence via `CinematicCamera.tsx`. State machine: `dwell` (hold at bonfire for `duration_seconds`) → `fly` (lerp to next pose over 3.5 s). Space-bar pause **not yet implemented**.
- **Free Mode:** Drei `OrbitControls`, target=MODEL_CENTER `[14,-90,-147]`.
- **Section View (Phase 6):** not yet built.

### State management

Single Zustand store (`useAppStore.ts`) owns: `currentBonfireId`, `mode` (`'cinema' | 'free'`), `visitedIds: Set<string>`, `sidebarOpen: boolean`, `positionOverrides` (dev), `pickingBonfireId` (dev). No prop-drilling.

## Implementation Phases

| Phase | Scope | Status |
|---|---|---|
| 1 | MVP: glTF model, free camera, bonfire markers, sidebar | ✅ Complete |
| 2 | All ~30 bonfires, lore content, NPC data, validation script | ✅ Complete (27 bonfires, 21 NPCs; 5 new bonfire `world_position` values are placeholder) |
| 3 | Cinema camera + flythrough + caption titles + mode toggle | ✅ Complete (lerp interpolation; space-bar pause not yet added) |
| 4 | Timeline bottom bar + BranchMap SVG | ✅ Complete |
| 5 | Visual polish: fire animation, sidebar polish, fonts, responsive | 🔲 Next |
| 6 | Section view, Bloom, Draco compression, mobile | 🔲 Optional |

## Phase 5 TODO

- Fire sprite animation (sprite sheet or procedural shader on BonfireMarker)
- NPC portrait placeholders in Sidebar (§7.8 of DESIGN.md) — placeholder images go in `public/image/npc/`; filename = `<npc_id>.png`
- Sidebar: display `difficulty_tier` badge, region label (Chinese name from regions.json)
- Sidebar slide-in/out CSS transition (already has open/close state)
- Space-bar pause/resume in Cinema Mode
- Responsive layout for 768px tablet

## Content & Legal

See `LEGAL.md` for full details. Short version:
- **9S model** (`dark_souls_map/`): CC BY-NC 4.0 — attribution required, non-commercial only.
- **Wiki lore** (Fextralife / Fandom / Wikidot): CC BY-SA — paraphrase; do not copy verbatim.
- **Game dialogue/item text**: small quotes under fair use for `lore_anchors`; do not reproduce large blocks.
- **Wiki scraping**: max 1 req/s, respect `robots.txt`; scraped output is a draft, not for direct publication.

Lore text is Chinese-primary. English proper nouns (character names, item names, place names) are kept inline in English.

The `confidence` field on every `lore_anchor` conveys epistemic status: `canon` → `consensus` → `theory` → `personal`.
