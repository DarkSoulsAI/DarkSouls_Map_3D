import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '../store/useAppStore'

const FLY_DURATION = 3.5   // seconds between bonfires

function easeInOut(t: number) {
  // smooth-step
  return t * t * (3 - 2 * t)
}

export function CinematicCamera() {
  const bonfires = useAppStore(s => s.bonfires)
  const setCurrentBonfire = useAppStore(s => s.setCurrentBonfire)
  const { camera } = useThree()

  const state = useRef({
    idx: 0,           // current bonfire index (already at)
    phase: 'dwell' as 'dwell' | 'fly',
    elapsed: 0,
    // flying: these get populated when we enter 'fly'
    flyFrom: new THREE.Vector3(),
    flyFromLook: new THREE.Vector3(),
  })

  // On mount — jump camera to first bonfire immediately, no smooth-in
  const booted = useRef(false)
  useEffect(() => {
    if (!bonfires.length || booted.current) return
    booted.current = true
    const b = bonfires[0]
    camera.position.set(...b.cinematic_pose.camera_position)
    camera.lookAt(...b.cinematic_pose.look_at)
    setCurrentBonfire(b.id)
  }, [bonfires, camera, setCurrentBonfire])

  useFrame((_, dt) => {
    if (!bonfires.length) return
    const s = state.current
    const curr = bonfires[s.idx]
    const nextIdx = (s.idx + 1) % bonfires.length
    const next = bonfires[nextIdx]

    s.elapsed += dt

    if (s.phase === 'dwell') {
      // Gently look at bonfire while dwelling
      const lookAt = new THREE.Vector3(...curr.cinematic_pose.look_at)
      const targetQ = new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().lookAt(camera.position, lookAt, camera.up)
      )
      camera.quaternion.slerp(targetQ, 0.04)

      if (s.elapsed >= curr.cinematic_pose.duration_seconds) {
        s.phase = 'fly'
        s.elapsed = 0
        s.flyFrom.copy(camera.position)
        s.flyFromLook.set(...curr.cinematic_pose.look_at)
      }
    } else {
      const t = Math.min(s.elapsed / FLY_DURATION, 1)
      const e = easeInOut(t)

      const targetPos = new THREE.Vector3(...next.cinematic_pose.camera_position)
      const targetLook = new THREE.Vector3(...next.cinematic_pose.look_at)

      camera.position.lerpVectors(s.flyFrom, targetPos, e)

      // Interpolate look-at point and apply
      const lerpedLook = s.flyFromLook.clone().lerp(targetLook, e)
      camera.lookAt(lerpedLook)

      if (t >= 1) {
        s.idx = nextIdx
        s.phase = 'dwell'
        s.elapsed = 0
        setCurrentBonfire(next.id)
      }
    }
  })

  return null
}
