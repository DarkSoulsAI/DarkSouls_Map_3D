import { useGLTF } from '@react-three/drei'
import { useEffect } from 'react'
import * as THREE from 'three'

useGLTF.preload('/models/dark_souls_map/scene.gltf')

export function LordranModel() {
  const { scene } = useGLTF('/models/dark_souls_map/scene.gltf')

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Desaturated stone/ash aesthetic matching the design spec
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
