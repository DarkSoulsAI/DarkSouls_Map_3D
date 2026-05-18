import { Suspense } from 'react'
import { Scene } from './scene/Scene'
import { Sidebar } from './ui/Sidebar'
import { ModeToggle } from './ui/ModeToggle'

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
      <Sidebar />
    </>
  )
}
