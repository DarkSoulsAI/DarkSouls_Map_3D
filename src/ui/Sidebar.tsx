import { useAppStore } from '../store/useAppStore'
import styles from './Sidebar.module.css'

const CONFIDENCE_LABELS: Record<string, { zh: string; color: string }> = {
  canon:     { zh: '正典', color: '#c8a050' },
  consensus: { zh: '共识', color: '#7aaa7a' },
  theory:    { zh: '推论', color: '#7a9aaa' },
  personal:  { zh: '解读', color: '#9a7aaa' },
}

export function Sidebar() {
  const bonfires = useAppStore(s => s.bonfires)
  const currentBonfireId = useAppStore(s => s.currentBonfireId)
  const sidebarOpen = useAppStore(s => s.sidebarOpen)
  const closeSidebar = useAppStore(s => s.closeSidebar)
  const nextBonfire = useAppStore(s => s.nextBonfire)
  const prevBonfire = useAppStore(s => s.prevBonfire)

  const bonfire = bonfires.find(b => b.id === currentBonfireId)
  const currentIdx = bonfires.findIndex(b => b.id === currentBonfireId)

  return (
    <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
      {bonfire ? (
        <>
          {/* Header */}
          <div className={styles.header}>
            <button className={styles.closeBtn} onClick={closeSidebar} aria-label="关闭">✕</button>
            <div className={styles.orderBadge}>第 {bonfire.order} 处</div>
            <h1 className={styles.nameZh}>{bonfire.name_zh}</h1>
            <h2 className={styles.nameEn}>{bonfire.name_en}</h2>
            <div className={styles.region}>{bonfire.region.replace(/_/g, ' ')}</div>
          </div>

          <div className={styles.divider} />

          {/* First visit state */}
          <div className={styles.section}>
            <p className={styles.firstVisit}>{bonfire.first_visit_state}</p>
          </div>

          <div className={styles.divider} />

          {/* Lore text */}
          <div className={styles.section}>
            {bonfire.lore_text.split('\n\n').map((para, i) => (
              <p key={i} className={styles.lorePara}>{para}</p>
            ))}
          </div>

          {/* NPCs */}
          {bonfire.npcs_present.length > 0 && (
            <>
              <div className={styles.divider} />
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>相关 NPC</h3>
                <div className={styles.npcList}>
                  {bonfire.npcs_present.map(id => (
                    <span key={id} className={styles.npcChip}>
                      {id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Lore Anchors */}
          {bonfire.lore_anchors.length > 0 && (
            <>
              <div className={styles.divider} />
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Lore Anchors</h3>
                {bonfire.lore_anchors.map((anchor, i) => {
                  const conf = CONFIDENCE_LABELS[anchor.confidence]
                  return (
                    <div key={i} className={styles.anchor}>
                      <div className={styles.anchorHeader}>
                        <span className={styles.anchorSource}>{anchor.source_zh}</span>
                        <span
                          className={styles.confidenceBadge}
                          style={{ color: conf.color, borderColor: conf.color }}
                        >
                          {conf.zh}
                        </span>
                      </div>
                      <blockquote className={styles.anchorQuote}>{anchor.text_zh}</blockquote>
                      <p className={styles.anchorInterp}>{anchor.interpretation}</p>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          <div className={styles.divider} />

          {/* Navigation */}
          <div className={styles.navRow}>
            <button
              className={styles.navBtn}
              onClick={prevBonfire}
              disabled={currentIdx <= 0}
            >
              ← 上一处
            </button>
            <span className={styles.navCount}>{currentIdx + 1} / {bonfires.length}</span>
            <button
              className={styles.navBtn}
              onClick={nextBonfire}
              disabled={currentIdx >= bonfires.length - 1}
            >
              下一处 →
            </button>
          </div>
        </>
      ) : null}
    </aside>
  )
}
