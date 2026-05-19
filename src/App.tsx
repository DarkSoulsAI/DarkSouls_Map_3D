import { Suspense } from 'react'
import { Scene } from './scene/Scene'
import { Sidebar } from './ui/Sidebar'
import { ModeToggle } from './ui/ModeToggle'
import { AudioManager } from './ui/AudioManager'
import { CinematicCaption } from './ui/CinematicCaption'
import { Timeline } from './ui/Timeline'
import { BranchMap } from './ui/BranchMap'
import { PositionEditor } from './scene/PositionEditor'
import { PositionPickerUI } from './ui/PositionPickerUI'

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-flame">🔥</div>
      <div className="loading-title">BONFIRES OF LORDRAN</div>
      <div className="loading-subtitle">罗德兰篝火图谱 — 载入中...</div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <Scene />
      </Suspense>
      <ModeToggle />
      <CinematicCaption />
      <Sidebar />
      <Timeline />
      <BranchMap />
      <AudioManager />
      {import.meta.env.DEV && <PositionEditor />}
      {import.meta.env.DEV && <PositionPickerUI />}
    </>
  )
}
