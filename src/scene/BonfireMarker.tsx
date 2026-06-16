import { useRef, useState } from 'react'
import { Billboard, Html, Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Bonfire } from '../types'
import { useAppStore } from '../store/useAppStore'

interface Props { bonfire: Bonfire }

// Bonfires now sit on the model's true geometry (~1000-unit span), so markers
// are scaled up from their original ~0.5-unit size to stay readable.
const MARKER_SCALE = 10

export function BonfireMarker({ bonfire }: Props) {
  const currentBonfireId   = useAppStore(s => s.currentBonfireId)
  const visitedIds         = useAppStore(s => s.visitedIds)
  const setCurrentBonfire  = useAppStore(s => s.setCurrentBonfire)
  const positionOverride   = useAppStore(s => s.positionOverrides[bonfire.id])
  const [hovered, setHovered] = useState(false)

  const isCurrent = currentBonfireId === bonfire.id
  const isVisited = visitedIds.has(bonfire.id)

  const emberRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (emberRef.current) {
      const pulse = 1 + 0.12 * Math.sin(t * 7.2 + bonfire.order)
      emberRef.current.scale.setScalar(pulse)
    }
  })

  // On white background: use saturated dark colors so markers pop
  const emberColor  = isCurrent ? '#d44000' : isVisited ? '#b84800' : '#5a2e10'
  const sparkColor  = isCurrent ? '#ff6600' : isVisited ? '#ee5500' : '#993300'
  const ringColor   = isCurrent ? '#ff8800' : isVisited ? '#cc5500' : '#441a00'
  const sparkCount  = isCurrent ? 20 : isVisited ? 10 : 3
  const sparkScale  = isCurrent ? 2.0 : isVisited ? 1.3 : 0.7
  const emissive    = isCurrent ? 2.5 : isVisited ? 1.5 : 0.6

  return (
    <group position={positionOverride ?? bonfire.world_position} scale={MARKER_SCALE}>
      {/* Outer ring / base — visible from far away */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 0.62, 20]} />
        <meshBasicMaterial color={ringColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Ember core — clickable */}
      <mesh
        ref={emberRef}
        onClick={(e) => { e.stopPropagation(); setCurrentBonfire(bonfire.id) }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
      >
        <sphereGeometry args={[0.32, 12, 12]} />
        <meshStandardMaterial
          color={emberColor}
          emissive={emberColor}
          emissiveIntensity={emissive}
          roughness={0.35}
        />
      </mesh>

      {/* Fire particles */}
      <Billboard>
        <Sparkles
          count={sparkCount}
          scale={sparkScale}
          size={isCurrent ? 3 : 1.8}
          speed={isCurrent ? 0.55 : 0.25}
          color={sparkColor}
          opacity={isCurrent ? 0.95 : 0.7}
        />
      </Billboard>

      {/* Hover tooltip */}
      {hovered && (
        <Html center distanceFactor={30} style={{ pointerEvents: 'none', transform: 'translateY(-44px)' }}>
          <div style={{
            background: 'rgba(255,255,255,0.96)',
            border: '1px solid #8a6a2a',
            borderRadius: '3px',
            padding: '5px 11px',
            color: '#2a1e08',
            fontFamily: 'Cinzel, serif',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            letterSpacing: '0.05em',
            boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
          }}>
            <div style={{ color: '#8a6a2a', fontSize: '9px', marginBottom: '2px' }}>
              第 {bonfire.order} 处 · {bonfire.region.replace(/_/g, ' ').toUpperCase()}
            </div>
            <div style={{ color: '#1a1208' }}>{bonfire.name_zh}</div>
            <div style={{ color: '#888', fontSize: '9px' }}>{bonfire.name_en}</div>
          </div>
        </Html>
      )}
    </group>
  )
}
