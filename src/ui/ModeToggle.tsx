import { useAppStore } from '../store/useAppStore'

export function ModeToggle() {
  const mode = useAppStore(s => s.mode)
  const setMode = useAppStore(s => s.setMode)

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '1px',
      background: 'rgba(8,7,10,0.85)',
      border: '1px solid #3a2e18',
      borderRadius: '3px',
      padding: '1px',
      zIndex: 200,
    }}>
      {(['free', 'cinema'] as const).map(m => (
        <button
          key={m}
          onClick={() => setMode(m)}
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '10px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '7px 18px',
            background: mode === m ? 'rgba(200,160,80,0.15)' : 'transparent',
            color: mode === m ? '#c8a050' : '#5a4e35',
            border: 'none',
            borderRadius: '2px',
            cursor: 'pointer',
            transition: 'color 0.2s, background 0.2s',
          }}
        >
          {m === 'free' ? '✋ 自由模式' : '▶ 电影模式'}
        </button>
      ))}
    </div>
  )
}
