import { useGLTF } from '@react-three/drei'
import { useMemo, useRef, Component, type ReactNode } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ProceduralMap } from './ProceduralMap'
import { useAppStore } from '../store/useAppStore'

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

const REGION_BANDS: Array<{ minY: number; color: string }> = [
  { minY: -65,  color: '#c8a855' },
  { minY: -78,  color: '#a07858' },
  { minY: -90,  color: '#7a9e6a' },
  { minY: -103, color: '#5a7094' },
  { minY: -115, color: '#7a8a4a' },
  { minY: -123, color: '#a05830' },
  { minY: -999, color: '#3a7888' },
]

const REGION_MATS = REGION_BANDS.map(b =>
  new THREE.MeshBasicMaterial({ color: b.color, side: THREE.DoubleSide })
)

const EDGE_MAT = new THREE.LineBasicMaterial({ color: '#ffffff', linewidth: 1 })
const CURSOR_MAT = new THREE.MeshBasicMaterial({ color: '#ffdd44', transparent: true, opacity: 0.9 })
const CURSOR_RING_MAT = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.6, wireframe: true })

function getRegionMat(worldCenterY: number): THREE.MeshBasicMaterial {
  for (let i = 0; i < REGION_BANDS.length; i++) {
    if (worldCenterY >= REGION_BANDS[i].minY) return REGION_MATS[i]
  }
  return REGION_MATS[REGION_MATS.length - 1]
}

function GltfModel() {
  const { scene } = useGLTF('/models/dark_souls_map/scene.gltf')
  const { gl } = useThree()

  const pickingBonfireId = useAppStore(s => s.pickingBonfireId)
  const setPositionOverride = useAppStore(s => s.setPositionOverride)
  const setPickingBonfireId = useAppStore(s => s.setPickingBonfireId)
  const bonfires = useAppStore(s => s.bonfires)

  const cursorRef = useRef<THREE.Group>(null)
  const isPicking = pickingBonfireId !== null

  useMemo(() => {
    scene.visible = true

    scene.traverse((child) => {
      child.visible = true
      child.frustumCulled = false
      if (child.scale.x > 10 || (child.scale.x > 0 && child.scale.x < 0.01)) {
        child.scale.set(1, 1, 1)
      }
    })

    scene.updateMatrixWorld(true)

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.SkinnedMesh) {
        const bbox = new THREE.Box3().setFromObject(child)
        const centerY = bbox.isEmpty()
          ? child.getWorldPosition(new THREE.Vector3()).y
          : (bbox.min.y + bbox.max.y) / 2
        child.material = getRegionMat(centerY)

        const existing = child.children.filter(c => c.userData.__edges)
        existing.forEach(c => child.remove(c))

        const edges = new THREE.EdgesGeometry(child.geometry as THREE.BufferGeometry, 15)
        const lines = new THREE.LineSegments(edges, EDGE_MAT)
        lines.frustumCulled = false
        lines.userData.__edges = true
        child.add(lines)
      }
    })
  }, [scene])

  // Change cursor style when picking
  useMemo(() => {
    gl.domElement.style.cursor = isPicking ? 'crosshair' : 'default'
  }, [isPicking, gl])

  const handleClick = (e: { point: THREE.Vector3; stopPropagation: () => void }) => {
    if (!pickingBonfireId) return
    e.stopPropagation()
    const pt = e.point
    const pos: [number, number, number] = [
      Math.round(pt.x * 10) / 10,
      Math.round(pt.y * 10) / 10,
      Math.round(pt.z * 10) / 10,
    ]
    // Update in-memory store immediately
    setPositionOverride(pickingBonfireId, pos)
    // Persist to bonfires.json via Vite dev middleware
    fetch('/api/save-position', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: pickingBonfireId, position: pos }),
    }).catch(err => console.warn('[picker] save failed:', err))
    // Auto-advance to next bonfire
    const idx = bonfires.findIndex(b => b.id === pickingBonfireId)
    setPickingBonfireId(idx < bonfires.length - 1 ? bonfires[idx + 1].id : null)
  }

  const handlePointerMove = (e: { point: THREE.Vector3; stopPropagation: () => void }) => {
    if (!isPicking || !cursorRef.current) return
    e.stopPropagation()
    cursorRef.current.position.copy(e.point)
    cursorRef.current.visible = true
  }

  const handlePointerOut = () => {
    if (cursorRef.current) cursorRef.current.visible = false
  }

  return (
    <>
      <primitive
        object={scene}
        onClick={isPicking ? handleClick : undefined}
        onPointerMove={isPicking ? handlePointerMove : undefined}
        onPointerOut={isPicking ? handlePointerOut : undefined}
      />
      {/* Yellow dot cursor that follows mouse on model surface when picking */}
      <group ref={cursorRef} visible={false}>
        <mesh>
          <sphereGeometry args={[0.5, 12, 12]} />
          <primitive object={CURSOR_MAT} attach="material" />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.2, 8, 8]} />
          <primitive object={CURSOR_RING_MAT} attach="material" />
        </mesh>
      </group>
    </>
  )
}

export function LordranModel() {
  return (
    <ModelErrorBoundary fallback={<ProceduralMap />}>
      <GltfModel />
    </ModelErrorBoundary>
  )
}
