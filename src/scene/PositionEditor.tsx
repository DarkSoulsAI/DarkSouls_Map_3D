import { useControls, button } from 'leva'
import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

// Only rendered in dev mode (App.tsx guards with import.meta.env.DEV)
// Lets you dial in world_position for any bonfire you click on.
// Copy-paste the printed JSON back into bonfires.json when satisfied.

function EditorInner({ bonfireId }: { bonfireId: string }) {
  const bonfires = useAppStore(s => s.bonfires)
  const setPositionOverride = useAppStore(s => s.setPositionOverride)
  const bonfire = bonfires.find(b => b.id === bonfireId)

  const defaultPos: [number, number, number] = bonfire?.world_position ?? [0, -90, -147]

  const [pos] = useControls(
    `📍 ${bonfire?.name_en ?? bonfireId}`,
    () => ({
      x: { value: defaultPos[0], min: -80, max: 100, step: 0.5, label: 'X (E↔W)' },
      y: { value: defaultPos[1], min: -130, max: -40, step: 0.5, label: 'Y (depth)' },
      z: { value: defaultPos[2], min: -210, max: -80, step: 0.5, label: 'Z (N↔S)' },
      'Copy JSON': button(() => {
        const val = `"world_position": [${pos.x}, ${pos.y}, ${pos.z}]`
        navigator.clipboard.writeText(val).catch(() => {
          console.log('📋 Position:', val)
        })
        if (bonfire) console.log(`📋 ${bonfire.id}:`, val)
      }),
    }),
    [bonfireId]
  )

  useEffect(() => {
    setPositionOverride(bonfireId, [pos.x, pos.y, pos.z])
  }, [pos.x, pos.y, pos.z, bonfireId, setPositionOverride])

  return null
}

export function PositionEditor() {
  const currentBonfireId = useAppStore(s => s.currentBonfireId)
  if (!currentBonfireId) return null
  // key forces remount (and leva re-init) when the selected bonfire changes
  return <EditorInner key={currentBonfireId} bonfireId={currentBonfireId} />
}
