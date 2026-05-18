import { useRef, useState } from 'react'
import { Billboard, Html, Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Bonfire } from '../types'
import { useAppStore } from '../store/useAppStore'

interface Props {
  bonfire: Bonfire
}

export function BonfireMarker({ bonfire }: Props) {
  const currentBonfireId = useAppStore(s => s.currentBonfireId)
  const visitedIds = useAppStore(s => s.visitedIds)
  const setCurrentBonfire = useAppStore(s => s.setCurrentBonfire)
  const [hovered, setHovered] = useState(false)

  const isCurrent = currentBonfireId === bonfire.id
  const isVisited = visitedIds.has(bonfire.id)

  const emberRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  // Flicker animation
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const flicker = 1 + 0.15 * Math.sin(t * 8.3 + bonfire.order) + 0.08 * Math.sin(t * 13.7)
    if (lightRef.current) {
      const baseIntensity = isCurrent ? 6 : isVisited ? 2.5 : 0.8
      lightRef.current.intensity = baseIntensity * flicker
    }
    if (emberRef.current) {
      emberRef.current.scale.setScalar(0.3 + 0.04 * Math.sin(t * 6 + bonfire.order))
    }
  })

  const emberColor = isCurrent ? '#ff8c00' : isVisited ? '#cc6600' : '#553300'
  const sparkColor = isCurrent ? '#ffaa33' : isVisited ? '#ff7722' : '#662200'
  const lightColor = isCurrent ? '#ff9933' : isVisited ? '#ff6600' : '#cc4400'
  const sparkCount = isCurrent ? 24 : isVisited ? 14 : 5
  const sparkScale = isCurrent ? 2.2 : isVisited ? 1.5 : 0.8

  return (
    <group position={bonfire.world_position}>
      {/* Point light */}
      <pointLight
        ref={lightRef}
        color={lightColor}
        distance={isCurrent ? 35 : 20}
        decay={2}
      />

      {/* Ember core — clickable */}
      <mesh
        ref={emberRef}
        onClick={(e) => { e.stopPropagation(); setCurrentBonfire(bonfire.id) }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
      >
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshStandardMaterial
          color={emberColor}
          emissive={emberColor}
          emissiveIntensity={isCurrent ? 4 : isVisited ? 2 : 0.8}
          roughness={0.4}
        />
      </mesh>

      {/* Fire particles */}
      <Billboard>
        <Sparkles
          count={sparkCount}
          scale={sparkScale}
          size={isCurrent ? 3.5 : 2}
          speed={isCurrent ? 0.6 : 0.3}
          color={sparkColor}
          opacity={isCurrent ? 0.9 : 0.6}
        />
      </Billboard>

      {/* Hover tooltip */}
      {hovered && (
        <Html
          center
          distanceFactor={30}
          style={{
            pointerEvents: 'none',
            transform: 'translateY(-40px)',
          }}
        >
          <div style={{
            background: 'rgba(0,0,0,0.85)',
            border: '1px solid #8a6a2a',
            borderRadius: '3px',
            padding: '5px 10px',
            color: '#e8d5a0',
            fontFamily: 'Cinzel, serif',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            letterSpacing: '0.05em',
          }}>
            <div style={{ color: '#c8a050', fontSize: '9px', marginBottom: '2px' }}>
              第 {bonfire.order} 处 · {bonfire.region.replace(/_/g, ' ').toUpperCase()}
            </div>
            <div>{bonfire.name_zh}</div>
            <div style={{ color: '#888', fontSize: '9px' }}>{bonfire.name_en}</div>
          </div>
        </Html>
      )}
    </group>
  )
}
