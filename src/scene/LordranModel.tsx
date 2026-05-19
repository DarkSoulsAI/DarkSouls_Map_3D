import { useGLTF } from '@react-three/drei'
import { useMemo, Component, type ReactNode } from 'react'
import * as THREE from 'three'
import { ProceduralMap } from './ProceduralMap'

class ModelErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

// DS1 vertical layers: Y ranges map to regions (local coords = world coords after scale fix)
// Anor Londo (top) → Ash Lake (deepest)
const REGION_BANDS: Array<{ minY: number; color: string }> = [
  { minY: -65,  color: '#c8a855' }, // Anor Londo             — warm gold
  { minY: -78,  color: '#a07858' }, // Sen's / Undead Parish  — stone brown
  { minY: -90,  color: '#7a9e6a' }, // Firelink / Darkroot    — forest green
  { minY: -103, color: '#5a7094' }, // New Londo / Depths     — steel blue
  { minY: -115, color: '#7a8a4a' }, // Blighttown             — toxic olive
  { minY: -123, color: '#a05830' }, // Izalith / Demon Ruins  — dark ember
  { minY: -999, color: '#3a7888' }, // Ash Lake               — deep teal
]

const REGION_MATS = REGION_BANDS.map(b =>
  new THREE.MeshBasicMaterial({ color: b.color, side: THREE.DoubleSide })
)

function getRegionMat(worldCenterY: number): THREE.MeshBasicMaterial {
  for (let i = 0; i < REGION_BANDS.length; i++) {
    if (worldCenterY >= REGION_BANDS[i].minY) return REGION_MATS[i]
  }
  return REGION_MATS[REGION_MATS.length - 1]
}

function GltfModel() {
  const { scene } = useGLTF('/models/dark_souls_map/scene.gltf')

  useMemo(() => {
    scene.visible = true

    // Pass 1: fix the ~1302× Sketchfab scale on intermediate nodes so that
    // the mesh local coords (already in DS1 world space) become world coords.
    scene.traverse((child) => {
      child.visible = true
      child.frustumCulled = false
      if (child.scale.x > 10 || (child.scale.x > 0 && child.scale.x < 0.01)) {
        child.scale.set(1, 1, 1)
      }
    })

    // Ensure world matrices reflect the corrected scales
    scene.updateMatrixWorld(true)

    // Pass 2: color each mesh by its world-space Y center
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.SkinnedMesh) {
        const bbox = new THREE.Box3().setFromObject(child)
        const centerY = bbox.isEmpty()
          ? child.getWorldPosition(new THREE.Vector3()).y
          : (bbox.min.y + bbox.max.y) / 2
        child.material = getRegionMat(centerY)
      }
    })
  }, [scene])

  return <primitive object={scene} />
}

export function LordranModel() {
  return (
    <ModelErrorBoundary fallback={<ProceduralMap />}>
      <GltfModel />
    </ModelErrorBoundary>
  )
}
