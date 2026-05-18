export type BonfireState = 'unvisited' | 'current' | 'visited'

export type LoreAnchorType = 'dialogue' | 'item_description' | 'environmental'
export type Confidence = 'canon' | 'consensus' | 'theory' | 'personal'

export interface SourceRef {
  site: 'fextralife' | 'fandom' | 'soulslore_wikidot' | 'vaatividya' | 'abyssal_archive' | 'in_game' | 'other'
  url?: string
  page_title?: string
  accessed_date?: string
}

export interface LoreAnchor {
  type: LoreAnchorType
  source_zh: string
  source_en: string
  text_en: string
  text_zh: string
  interpretation: string
  confidence: Confidence
  source_ref: SourceRef
}

export interface CinematicPose {
  camera_position: [number, number, number]
  look_at: [number, number, number]
  duration_seconds: number
}

export interface Bonfire {
  id: string
  name_zh: string
  name_en: string
  order: number
  region: string
  difficulty_tier?: 1 | 2 | 3
  world_position: [number, number, number]
  depth_tier: number
  cinematic_pose: CinematicPose
  cinematic_caption: string
  first_visit_state: string
  lore_text: string
  npcs_present: string[]
  items_unlocked: string[]
  events_triggered: string[]
  lore_anchors: LoreAnchor[]
  prerequisite_bonfires: string[]
  alternative_prerequisites?: string[]
  next_bonfires: string[]
  sources: SourceRef[]
}
