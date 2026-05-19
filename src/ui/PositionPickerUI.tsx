import { useAppStore } from '../store/useAppStore'
import { useState } from 'react'

export function PositionPickerUI() {
  const bonfires = useAppStore(s => s.bonfires)
  const positionOverrides = useAppStore(s => s.positionOverrides)
  const pickingBonfireId = useAppStore(s => s.pickingBonfireId)
  const setPickingBonfireId = useAppStore(s => s.setPickingBonfireId)
  const [collapsed, setCollapsed] = useState(false)

  const pickedCount = Object.keys(positionOverrides).length
  const currentBonfire = bonfires.find(b => b.id === pickingBonfireId)

  return (
    <div style={{
      position: 'fixed',
      bottom: 12,
      left: 12,
      width: 256,
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
        <span>📍 篝火校准 <span style={{ color: '#888' }}>({pickedCount}/{bonfires.length})</span></span>
        <span style={{ color: '#888' }}>{collapsed ? '▲' : '▼'}</span>
      </div>

      {!collapsed && (
        <>
          {/* Active picking banner */}
          {pickingBonfireId && (
            <div style={{
              padding: '7px 12px',
              background: 'rgba(255,220,50,0.1)',
              borderBottom: '1px solid rgba(255,220,50,0.2)',
              color: '#ffdd44',
              lineHeight: 1.5,
            }}>
              ⊕ 点击地图放置：<br />
              <strong style={{ fontSize: 13 }}>{currentBonfire?.name_zh}</strong>
              <span style={{ color: '#888', marginLeft: 6, fontSize: 11 }}>{currentBonfire?.name_en}</span>
              <br />
              <button
                onClick={() => setPickingBonfireId(null)}
                style={{
                  marginTop: 4,
                  padding: '2px 8px',
                  background: 'rgba(255,255,255,0.08)',
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
          )}

          {/* Bonfire list */}
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {bonfires.map((b) => {
              const saved = !!positionOverrides[b.id]
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
                    gap: 6,
                  }}
                >
                  <span style={{ color: saved ? '#4caf50' : '#444', flexShrink: 0, width: 12 }}>
                    {saved ? '✓' : '○'}
                  </span>
                  <span style={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: saved ? '#ccc' : '#666',
                    fontSize: 11,
                  }}>
                    {b.name_zh}
                  </span>
                  <button
                    onClick={() => setPickingBonfireId(isActive ? null : b.id)}
                    style={{
                      padding: '2px 7px',
                      background: isActive ? '#ffdd44' : 'rgba(255,255,255,0.07)',
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

          <div style={{
            padding: '6px 12px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            color: '#555',
            fontSize: 11,
          }}>
            点击即保存到 bonfires.json
          </div>
        </>
      )}
    </div>
  )
}
