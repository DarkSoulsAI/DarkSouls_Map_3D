import { useRef, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import styles from './Timeline.module.css'

export function Timeline() {
  const bonfires = useAppStore(s => s.bonfires)
  const currentBonfireId = useAppStore(s => s.currentBonfireId)
  const visitedIds = useAppStore(s => s.visitedIds)
  const setCurrentBonfire = useAppStore(s => s.setCurrentBonfire)
  const trackRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to keep current bonfire visible
  useEffect(() => {
    if (!currentBonfireId || !trackRef.current) return
    const idx = bonfires.findIndex(b => b.id === currentBonfireId)
    if (idx < 0) return
    const nodeWidth = 72
    const scrollTarget = idx * nodeWidth - trackRef.current.clientWidth / 2 + nodeWidth / 2
    trackRef.current.scrollTo({ left: Math.max(0, scrollTarget), behavior: 'smooth' })
  }, [currentBonfireId, bonfires])

  return (
    <div className={styles.wrapper}>
      <div className={styles.track} ref={trackRef}>
        <div className={styles.rail} />
        {bonfires.map((bonfire, idx) => {
          const isCurrent = currentBonfireId === bonfire.id
          const isVisited = visitedIds.has(bonfire.id)
          const stateClass = isCurrent ? styles.current : isVisited ? styles.visited : styles.unvisited
          return (
            <div
              key={bonfire.id}
              className={`${styles.node} ${stateClass}`}
              onClick={() => setCurrentBonfire(bonfire.id)}
              title={`第 ${bonfire.order} 处 · ${bonfire.name_zh} · ${bonfire.name_en}`}
            >
              <div className={styles.dot} />
              <div className={styles.label}>{bonfire.name_zh}</div>
              {idx < bonfires.length - 1 && (
                <div className={`${styles.connector} ${isVisited || isCurrent ? styles.connectorLit : ''}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
