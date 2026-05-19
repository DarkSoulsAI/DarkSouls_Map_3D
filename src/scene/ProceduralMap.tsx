import { useMemo } from 'react'
import { Edges } from '@react-three/drei'

// Renders as white-fill + black-edge architectural drawing.
// Platform positions match DS1's vertical topology.

interface BoxSpec {
  pos: [number, number, number]
  size: [number, number, number]
  label?: string
}

interface PillarSpec {
  pos: [number, number, number]
  r: number
  h: number
}

function ArchBox({ pos, size }: BoxSpec) {
  return (
    <mesh position={pos} receiveShadow>
      <boxGeometry args={size} />
      <meshBasicMaterial color="#f8f6f2" />
      <Edges color="#1a1820" threshold={10} />
    </mesh>
  )
}

function ArchCylinder({ pos, r, h }: PillarSpec) {
  return (
    <mesh position={pos}>
      <cylinderGeometry args={[r, r * 1.12, h, 8]} />
      <meshBasicMaterial color="#f0ede8" />
      <Edges color="#1a1820" threshold={12} />
    </mesh>
  )
}

export function ProceduralMap() {
  const platforms = useMemo<BoxSpec[]>(() => [
    // ── Surface / Firelink level ─────────────────────────────────
    { pos: [10,  -84, -148], size: [82,  4, 82]  },   // main ground slab
    { pos: [14,  -88, -147], size: [62,  2, 62]  },   // recessed detail

    // ── Northern ascent: Undead Burg → Parish → Sen's ─────────
    { pos: [19,  -73, -132], size: [30,  3, 22]  },
    { pos: [21,  -65, -122], size: [24,  2, 18]  },
    { pos: [23,  -62, -114], size: [20,  2, 15]  },   // Sen's Fortress ledge

    // ── Anor Londo peak ─────────────────────────────────────────
    { pos: [28,  -58, -108], size: [32,  3, 26]  },

    // ── Western wing: Darkroot ──────────────────────────────────
    { pos: [-15, -75, -148], size: [30,  3, 30]  },
    { pos: [-22, -87, -158], size: [22,  2, 23]  },

    // ── Duke's Archives / Painted World (east) ──────────────────
    { pos: [47,  -64, -116], size: [26,  2, 24]  },

    // ── Underground floor: New Londo / Depths ──────────────────
    { pos: [8,  -100, -150], size: [58,  2, 52]  },
    { pos: [2,  -107, -152], size: [34,  1.5, 32] },  // flooded surface

    // ── Blighttown ─────────────────────────────────────────────
    { pos: [-2, -112, -160], size: [30,  2, 30]  },

    // ── Izalith / Demon Ruins ──────────────────────────────────
    { pos: [10, -118, -174], size: [38,  2, 34]  },

    // ── Ash Lake — deepest floor ───────────────────────────────
    { pos: [-12, -124, -174], size: [42, 1.5, 42] },
  ], [])

  const pillars = useMemo<PillarSpec[]>(() => {
    const out: PillarSpec[] = []
    // Ruins around Firelink
    const ring = 8
    for (let i = 0; i < ring; i++) {
      const a = (i / ring) * Math.PI * 2
      out.push({
        pos: [8 + Math.cos(a) * 18, -80, -148 + Math.sin(a) * 18],
        r: 0.5 + (i % 3) * 0.22,
        h: 4 + (i % 4) * 3,
      })
    }
    // Anor Londo support columns
    for (const [cx, cz] of [[20, -112], [36, -112], [20, -104], [36, -104]]) {
      out.push({ pos: [cx, -70, cz], r: 1.3, h: 30 })
    }
    // Blighttown scaffolding
    for (const [bx, bz] of [[-4, -158], [2, -154], [-8, -164]]) {
      out.push({ pos: [bx, -96, bz], r: 0.38, h: 32 })
    }
    return out
  }, [])

  return (
    <group>
      {platforms.map((p, i) => <ArchBox key={`p${i}`} {...p} />)}
      {pillars.map((p, i)  => <ArchCylinder key={`r${i}`} {...p} />)}

      {/* Lava plane — subtle warm tint, still within the drawing aesthetic */}
      <mesh position={[10, -117.4, -172]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[32, 28]} />
        <meshBasicMaterial color="#ffe4d0" />
      </mesh>
    </group>
  )
}
