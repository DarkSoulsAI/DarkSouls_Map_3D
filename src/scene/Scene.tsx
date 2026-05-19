import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import { LordranModel } from './LordranModel'
import { BonfireMarkers } from './BonfireMarkers'
import { CinematicCamera } from './CinematicCamera'
import { useAppStore } from '../store/useAppStore'

const MODEL_CENTER: [number, number, number] = [14, -90, -147]
const FREE_CAM_POS: [number, number, number] = [
  MODEL_CENTER[0] + 55,
  MODEL_CENTER[1] + 38,
  MODEL_CENTER[2] + 72,
]

function LoadingFallback() {
  return (
    <mesh position={MODEL_CENTER}>
      <sphereGeometry args={[3, 16, 16]} />
      <meshBasicMaterial color="#c8a050" wireframe />
    </mesh>
  )
}

export function Scene() {
  const mode = useAppStore(s => s.mode)

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: FREE_CAM_POS, fov: 52, near: 0.5, far: 1200 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#000000' }}
      >
        <color attach="background" args={['#000000']} />

        <ambientLight intensity={0.8} color="#ffffff" />
        <directionalLight position={[60, 80, 40]} intensity={0.4} color="#ffffff" />

        <Suspense fallback={<LoadingFallback />}>
          <LordranModel />
          <BonfireMarkers />
        </Suspense>

        {mode === 'cinema' ? (
          <CinematicCamera />
        ) : (
          <OrbitControls
            target={MODEL_CENTER}
            minDistance={8}
            maxDistance={550}
            enablePan
            panSpeed={0.5}
            rotateSpeed={0.45}
            zoomSpeed={0.9}
            makeDefault
          />
        )}
      </Canvas>
    </div>
  )
}
