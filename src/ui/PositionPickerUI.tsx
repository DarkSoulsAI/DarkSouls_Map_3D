import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'

export function PositionPickerUI() {
  const bonfires = useAppStore(s => s.bonfires)
  const positionOverrides = useAppStore(s => s.positionOverrides)
  const pickingBonfireId = useAppStore(s => s.pickingBonfireId)
  const setPickingBonfireId = useAppStore(s => s.setPickingBonfireId)
  const [collapsed, setCollapsed] = useState(false)
  const [copied, setCopied] = useState(false)

  const pickedCount = Object.keys(positionOverrides).length
  const currentBonfire = bonfires.find(b => b.id === pickingBonfireId)

  function exportJSON() {
    const lines = bonfires.map(b => {
      const pos = positionOverrides[b.id] ?? b.world_position
      return `  // ${b.name_en}\n  "${b.id}": [${pos.map(v => v.toFixed(1)).join(', ')}]`
    })
    const json = `{\n${lines.join(',\n')}\n}`
    navigator.clipboard.writeText(json).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 12,
      left: 12,
      width: 260,
      background: 'rgba(10,10,10,0.92)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: 8,
      fontFamily: 'monospace',
      fontSize: 12,
      color: '#e0e0e0',
      zIndex: 1000,
      boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
    }}>
      {/* Header */}
      <div
        onClick={() => setCollapsed(c => !c)}
        style={{
          padding: '8px 12px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: collapsed ? 'none' : '1px solid rgba(255,255,255,0.1)',
          userSelect: 'none',
        }}
      >
        <span>📍 篝火位置校准 <span style={{ color: '#888' }}>({pickedCount}/{bonfires.length})</span></span>
        <span style={{ color: '#888' }}>{collapsed ? '▲' : '▼'}</span>
      </div>

      {!collapsed && (
        <>
          {/* Picking status */}
          {pickingBonfireId ? (
            <div style={{
              padding: '8px 12px',
              background: 'rgba(255,220,50,0.12)',
              borderBottom: '1px solid rgba(255,220,50,0.2)',
              color: '#ffdd44',
            }}>
              ⊕ 点击地图放置：<br />
              <strong>{currentBonfire?.name_zh ?? pickingBonfireId}</strong>
              <br />
              <span style={{ color: '#888', fontSize: 11 }}>{currentBonfire?.name_en}</span>
              <br />
              <button
                onClick={() => setPickingBonfireId(null)}
                style={{
                  marginTop: 4,
                  padding: '2px 8px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 4,
                  color: '#ccc',
                  cursor: 'pointer',
                  fontSize: 11,
                }}
              >
                取消
              </button>
            </div>
          ) : null}

          {/* Bonfire list */}
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {bonfires.map((b) => {
              const hasPick = !!positionOverrides[b.id]
              const isActive = b.id === pickingBonfireId
              return (
                <div
                  key={b.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px 10px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: isActive ? 'rgba(255,220,50,0.08)' : 'transparent',
                  }}
                >
                  <span style={{
                    width: 14,
                    color: hasPick ? '#4caf50' : '#555',
                    flexShrink: 0,
                  }}>
                    {hasPick ? '✓' : '○'}
                  </span>
                  <span style={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: hasPick ? '#ccc' : '#777',
                    fontSize: 11,
                  }}>
                    {b.name_zh}
                  </span>
                  <button
                    onClick={() => setPickingBonfireId(isActive ? null : b.id)}
                    style={{
                      padding: '1px 7px',
                      background: isActive ? '#ffdd44' : 'rgba(255,255,255,0.08)',
                      border: `1px solid ${isActive ? '#ffdd44' : 'rgba(255,255,255,0.15)'}`,
                      borderRadius: 3,
                      color: isActive ? '#000' : '#aaa',
                      cursor: 'pointer',
                      fontSize: 10,
                      flexShrink: 0,
                    }}
                  >
                    {isActive ? '选中' : '定位'}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Export */}
          <div style={{ padding: '8px 10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={exportJSON}
              style={{
                width: '100%',
                padding: '5px 0',
                background: copied ? '#2a6e2a' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${copied ? '#4caf50' : 'rgba(255,255,255,0.2)'}`,
                borderRadius: 4,
                color: copied ? '#4caf50' : '#ccc',
                cursor: 'pointer',
                fontSize: 11,
              }}
            >
              {copied ? '✓ 已复制到剪贴板' : `复制全部位置 JSON (${pickedCount} 已校准)`}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
