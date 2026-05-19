import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import styles from './BranchMap.module.css'

const W = 300
const H = 150
const PAD = 12

// depth_tier ranges across all bonfires: roughly -5 (ash_lake) to +3 (anor_londo)
const MIN_TIER = -5
const MAX_TIER = 3

function toPos(order: number, depthTier: number, total: number): [number, number] {
  const x = PAD + ((order - 1) / (total - 1)) * (W - PAD * 2)
  // depth_tier: positive = higher on screen (upper area), negative = lower
  const y = H - PAD - ((depthTier - MIN_TIER) / (MAX_TIER - MIN_TIER)) * (H - PAD * 2)
  return [x, y]
}

export function BranchMap() {
  const bonfires = useAppStore(s => s.bonfires)
  const currentBonfireId = useAppStore(s => s.currentBonfireId)
  const visitedIds = useAppStore(s => s.visitedIds)
  const setCurrentBonfire = useAppStore(s => s.setCurrentBonfire)
  const [collapsed, setCollapsed] = useState(false)

  const total = bonfires.length
  const posMap = new Map<string, [number, number]>()
  bonfires.forEach(b => posMap.set(b.id, toPos(b.order, b.depth_tier, total)))

  return (
    <div className={`${styles.widget} ${collapsed ? styles.collapsed : ''}`}>
      <button className={styles.toggleBtn} onClick={() => setCollapsed(c => !c)}>
        <span className={styles.toggleIcon}>{collapsed ? '◉' : '▼'}</span>
        分支图
      </button>

      {!collapsed && (
        <svg width={W} height={H} className={styles.svg}>
          {/* Edges */}
          {bonfires.map(b => {
            const from = posMap.get(b.id)
            if (!from) return null
            return b.next_bonfires.map(nextId => {
              const to = posMap.get(nextId)
              if (!to) return null
              const fromVisited = visitedIds.has(b.id)
              return (
                <line
                  key={`${b.id}→${nextId}`}
                  x1={from[0]} y1={from[1]}
                  x2={to[0]}   y2={to[1]}
                  stroke={fromVisited ? '#5a2e08' : '#1e1408'}
                  strokeWidth={0.8}
                  opacity={0.7}
                />
              )
            })
          })}

          {/* Nodes */}
          {bonfires.map(b => {
            const pos = posMap.get(b.id)
            if (!pos) return null
            const [x, y] = pos
            const isCurrent = currentBonfireId === b.id
            const isVisited = visitedIds.has(b.id)
            const r = isCurrent ? 5 : 3
            const fill = isCurrent ? '#ff6600' : isVisited ? '#7a3800' : '#1e1408'
            const stroke = isCurrent ? '#ffaa44' : isVisited ? '#b85200' : '#2e2010'

            return (
              <g
                key={b.id}
                onClick={() => setCurrentBonfire(b.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Larger invisible hit area */}
                <circle cx={x} cy={y} r={r + 5} fill="transparent" />
                {/* Glow ring for current */}
                {isCurrent && (
                  <circle cx={x} cy={y} r={r + 3} fill="none"
                    stroke="#ff6600" strokeWidth={1} opacity={0.4} />
                )}
                <circle cx={x} cy={y} r={r} fill={fill} stroke={stroke} strokeWidth={0.8} />
                {/* Label only for current */}
                {isCurrent && (
                  <text
                    x={x} y={y - 8}
                    textAnchor="middle"
                    fill="#ff6600"
                    fontSize={7}
                    fontFamily="'Noto Serif SC', serif"
                  >
                    {b.name_zh}
                  </text>
                )}
                {/* Tooltip-style title */}
                <title>{`第${b.order}处 · ${b.name_zh} · ${b.name_en}`}</title>
              </g>
            )
          })}

          {/* Depth tier labels */}
          <text x={3} y={PAD + 4} fontSize={6} fill="#2e2010" fontFamily="'Cinzel', serif">HIGH</text>
          <text x={3} y={H - PAD + 4} fontSize={6} fill="#2e2010" fontFamily="'Cinzel', serif">DEEP</text>
        </svg>
      )}
    </div>
  )
}
