import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import { LordranModel } from './LordranModel'
import { BonfireMarkers } from './BonfireMarkers'

// Model bounding-box center from scene.gltf accessor data
const MODEL_CENTER: [number, number, number] = [14, -90, -147]

function LoadingFallback() {
  return (
    <mesh position={MODEL_CENTER}>
      <sphereGeometry args={[2, 16, 16]} />
      <meshStandardMaterial color="#333" wireframe />
    </mesh>
  )
}

export function Scene() {
  return (
    <Canvas
      shadows
      camera={{
        position: [MODEL_CENTER[0] + 40, MODEL_CENTER[1] + 30, MODEL_CENTER[2] + 60],
        fov: 55,
        near: 0.5,
        far: 800,
      }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#0a0a0f' }}
    >
      {/* Ambient — very dark to let bonfires dominate */}
      <ambientLight intensity={0.08} color="#1a1a2e" />

      {/* Distant cool fill from above */}
      <directionalLight
        position={[50, 80, 30]}
        intensity={0.25}
        color="#3a4060"
      />

      {/* Atmospheric fog */}
      <fog attach="fog" args={['#0a0a12', 80, 450]} />

      <Suspense fallback={<LoadingFallback />}>
        <LordranModel />
        <BonfireMarkers />
      </Suspense>

      <OrbitControls
        target={MODEL_CENTER}
        minDistance={5}
        maxDistance={350}
        enablePan
        panSpeed={0.6}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        makeDefault
      />
    </Canvas>
  )
}
