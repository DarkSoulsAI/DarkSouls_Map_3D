import { useGLTF } from '@react-three/drei'
import { useEffect, Component, type ReactNode } from 'react'
import * as THREE from 'three'
import { ProceduralMap } from './ProceduralMap'

// Error boundary — catches GLTF 404 / parse errors and falls back to procedural map
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

function GltfModel() {
  const { scene } = useGLTF('/models/dark_souls_map/scene.gltf')

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x4a4a52),
          roughness: 0.85,
          metalness: 0.05,
        })
        child.receiveShadow = true
        child.castShadow = false
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
