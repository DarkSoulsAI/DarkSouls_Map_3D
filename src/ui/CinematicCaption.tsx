import { useAppStore } from '../store/useAppStore'
import { useEffect, useRef, useState } from 'react'

// Full-bleed cinematic title card shown during Cinema Mode.
// Fades in on bonfire change, fades out after 3 s.
export function CinematicCaption() {
  const mode           = useAppStore(s => s.mode)
  const currentId      = useAppStore(s => s.currentBonfireId)
  const bonfires       = useAppStore(s => s.bonfires)
  const [visible, setVisible] = useState(false)
  const [bonfire, setBonfire] = useState(bonfires[0] ?? null)
  const timerRef       = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (mode !== 'cinema' || !currentId) { setVisible(false); return }
    const b = bonfires.find(x => x.id === currentId)
    if (!b) return
    setBonfire(b)
    setVisible(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(false), 3200)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [currentId, mode, bonfires])

  if (mode !== 'cinema' || !bonfire) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingBottom: '10vh',
      pointerEvents: 'none',
      zIndex: 150,
    }}>
      <div style={{
        textAlign: 'center',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease',
        padding: '18px 32px',
        background: 'linear-gradient(to top, rgba(6,5,13,0.92) 0%, rgba(6,5,13,0) 100%)',
        maxWidth: 600,
      }}>
        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '11px',
          color: '#7a6a4a',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}>
          第 {bonfire.order} 处 · {bonfire.region.replace(/_/g, ' ').toUpperCase()}
        </div>
        <div style={{
          fontFamily: 'Noto Serif SC, serif',
          fontSize: '28px',
          fontWeight: 300,
          color: '#e8d5a0',
          letterSpacing: '0.06em',
          marginBottom: 8,
          textShadow: '0 0 30px rgba(200,160,80,0.4)',
        }}>
          {bonfire.name_zh}
        </div>
        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '12px',
          color: '#c8a050',
          letterSpacing: '0.12em',
        }}>
          {bonfire.name_en.toUpperCase()}
        </div>
        <div style={{
          fontFamily: 'Noto Serif SC, serif',
          fontSize: '13px',
          color: '#7a6a4a',
          marginTop: 12,
          fontStyle: 'italic',
          lineHeight: 1.6,
        }}>
          {bonfire.cinematic_caption}
        </div>
      </div>
    </div>
  )
}
