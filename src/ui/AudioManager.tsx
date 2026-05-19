import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore'

// Plays ambient music after first user interaction (browser policy).
// Plays a bonfire SFX whenever the selected bonfire changes.
export function AudioManager() {
  const currentBonfireId = useAppStore(s => s.currentBonfireId)
  const [muted, setMuted] = useState(false)
  const [started, setStarted] = useState(false)

  const ambientRef = useRef<HTMLAudioElement | null>(null)
  const prevIdRef  = useRef<string | null>(null)

  // Create ambient audio once
  useEffect(() => {
    const a = new Audio('/audio/dark-souls-the-ancient-dragon-choir.mp3')
    a.loop = true
    a.volume = 0.28
    ambientRef.current = a

    const kickoff = () => {
      a.play().then(() => setStarted(true)).catch(() => {})
      document.removeEventListener('pointerdown', kickoff)
    }
    document.addEventListener('pointerdown', kickoff)
    return () => {
      a.pause()
      document.removeEventListener('pointerdown', kickoff)
    }
  }, [])

  // Toggle mute
  useEffect(() => {
    if (ambientRef.current) ambientRef.current.muted = muted
  }, [muted])

  // Bonfire SFX
  useEffect(() => {
    if (!currentBonfireId || currentBonfireId === prevIdRef.current) return
    prevIdRef.current = currentBonfireId
    const sfx = new Audio('/audio/darksoul_bonfire_jump.mp3')
    sfx.volume = 0.65
    sfx.play().catch(() => {})
  }, [currentBonfireId])

  return (
    <button
      onClick={() => setMuted(m => !m)}
      title={muted ? '开启音乐' : '静音'}
      style={{
        position: 'fixed',
        bottom: 22,
        right: 22,
        zIndex: 250,
        background: 'rgba(8,7,10,0.82)',
        border: '1px solid #3a2e18',
        borderRadius: '3px',
        color: muted ? '#3a2e18' : '#c8a050',
        fontFamily: 'Cinzel, serif',
        fontSize: '11px',
        letterSpacing: '0.08em',
        padding: '7px 14px',
        cursor: 'pointer',
        transition: 'color 0.2s, border-color 0.2s',
      }}
    >
      {muted ? '🔇 静音' : started ? '🎵 音乐' : '🎵 音乐'}
    </button>
  )
}
