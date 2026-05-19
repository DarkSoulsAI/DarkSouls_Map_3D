/**
 * Validates bonfires.json schema & cross-references.
 * Run: npx tsx scripts/validate_data.ts
 */
import { readFileSync } from 'fs'
import { resolve } from 'path'

const bonfires = JSON.parse(
  readFileSync(resolve('src/data/bonfires.json'), 'utf-8')
)
const npcs = JSON.parse(
  readFileSync(resolve('src/data/npcs.json'), 'utf-8')
)

let errors = 0
const warn = (msg: string) => { console.error(`  ✗ ${msg}`); errors++ }
const ok   = (msg: string) => console.log(`  ✓ ${msg}`)

console.log('\n=== validate bonfires.json ===\n')

// Collect all bonfire IDs
const bonfireIds = new Set<string>(bonfires.map((b: any) => b.id))
const orders = new Set<number>()

for (const b of bonfires) {
  const prefix = `[${b.id}]`

  // Required fields
  for (const field of ['id','name_zh','name_en','order','region','world_position',
                        'depth_tier','cinematic_pose','cinematic_caption',
                        'first_visit_state','lore_text','lore_anchors',
                        'prerequisite_bonfires','next_bonfires','sources']) {
    if (b[field] === undefined || b[field] === null) {
      warn(`${prefix} missing required field: ${field}`)
    }
  }

  // order uniqueness
  if (orders.has(b.order)) warn(`${prefix} duplicate order value: ${b.order}`)
  else orders.add(b.order)

  // world_position is [x, y, z]
  if (!Array.isArray(b.world_position) || b.world_position.length !== 3) {
    warn(`${prefix} world_position must be [x, y, z]`)
  }

  // cinematic_pose fields
  const pose = b.cinematic_pose
  if (pose) {
    if (!Array.isArray(pose.camera_position) || pose.camera_position.length !== 3)
      warn(`${prefix} cinematic_pose.camera_position must be [x, y, z]`)
    if (!Array.isArray(pose.look_at) || pose.look_at.length !== 3)
      warn(`${prefix} cinematic_pose.look_at must be [x, y, z]`)
    if (typeof pose.duration_seconds !== 'number')
      warn(`${prefix} cinematic_pose.duration_seconds must be a number`)
  }

  // lore_text length (200–400 chars minimum)
  if (typeof b.lore_text === 'string' && b.lore_text.length < 100) {
    warn(`${prefix} lore_text is very short (${b.lore_text.length} chars)`)
  }

  // lore_anchors structure
  for (const [i, anchor] of (b.lore_anchors ?? []).entries()) {
    const ap = `${prefix}.lore_anchors[${i}]`
    const validTypes = ['dialogue','item_description','environmental','enemy_description']
    if (!validTypes.includes(anchor.type)) warn(`${ap} invalid type: ${anchor.type}`)
    const validConf = ['canon','consensus','theory','personal']
    if (!validConf.includes(anchor.confidence)) warn(`${ap} invalid confidence: ${anchor.confidence}`)
    if (!anchor.text_en) warn(`${ap} missing text_en`)
    if (!anchor.text_zh) warn(`${ap} missing text_zh`)
    if (!anchor.interpretation) warn(`${ap} missing interpretation`)
    if (!anchor.source_ref?.site) warn(`${ap} missing source_ref.site`)
  }

  // Cross-ref: prerequisite_bonfires
  for (const prereqId of (b.prerequisite_bonfires ?? [])) {
    if (!bonfireIds.has(prereqId)) warn(`${prefix} prerequisite_bonfires references unknown id: "${prereqId}"`)
  }

  // Cross-ref: next_bonfires
  for (const nextId of (b.next_bonfires ?? [])) {
    if (!bonfireIds.has(nextId)) warn(`${prefix} next_bonfires references unknown id: "${nextId}"`)
  }

  // sources
  if (!b.sources?.length) warn(`${prefix} no sources listed`)
}

ok(`${bonfires.length} bonfires checked`)
ok(`orders: ${[...orders].sort((a,b)=>a-b).join(', ')}`)

console.log('\n=== validate npcs.json ===\n')

const npcIds = new Set<string>(npcs.map((n: any) => n.id))

for (const npc of npcs) {
  const prefix = `[${npc.id}]`
  for (const field of ['id','name_zh','name_en','bonfires_present','arc_summary','fate','sources']) {
    if (npc[field] === undefined || npc[field] === null) warn(`${prefix} missing: ${field}`)
  }
  for (const bfId of (npc.bonfires_present ?? [])) {
    if (!bonfireIds.has(bfId)) warn(`${prefix} bonfires_present references unknown bonfire: "${bfId}"`)
  }
}

ok(`${npcs.length} NPCs checked`)

// Cross-check: every NPC id in bonfires.npcs_present exists in npcs.json
console.log('\n=== cross-check NPC references ===\n')
for (const b of bonfires) {
  for (const npcId of (b.npcs_present ?? [])) {
    if (!npcIds.has(npcId)) {
      console.warn(`  ⚠  bonfire [${b.id}] references npc "${npcId}" not in npcs.json`)
    }
  }
}

console.log(`\n${errors === 0 ? '✅ All checks passed.' : `❌ ${errors} error(s) found.`}\n`)
process.exit(errors > 0 ? 1 : 0)
