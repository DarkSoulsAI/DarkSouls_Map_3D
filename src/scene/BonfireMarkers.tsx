import { useAppStore } from '../store/useAppStore'
import { BonfireMarker } from './BonfireMarker'

export function BonfireMarkers() {
  const bonfires = useAppStore(s => s.bonfires)
  return (
    <>
      {bonfires.map(b => (
        <BonfireMarker key={b.id} bonfire={b} />
      ))}
    </>
  )
}
