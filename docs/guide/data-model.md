# 数据模型

主内容位于 `src/data/bonfires.json`（27 条）与 `src/data/npcs.json`（21 条）。
编辑后务必运行校验脚本：

```bash
npx tsx scripts/validate_data.ts
```

## `Bonfire`

```typescript
interface Bonfire {
  id: string;
  name_zh: string;
  name_en: string;
  order: number;                    // 叙事序号 1–27（唯一、已排序）
  region: string;
  difficulty_tier?: number;
  world_position: [number, number, number];  // 模型空间，从 glTF 区域几何提取
  depth_tier: number;               // 垂直层级：0=Firelink，+3=Anor Londo，-5=Ash Lake
  cinematic_pose: {
    camera_position: [number, number, number];
    look_at: [number, number, number];
    duration_seconds: number;
  };
  cinematic_caption: string;        // 电影模式中显示的一行引言
  first_visit_state: string;        // 2–3 句场景铺垫（中文）
  lore_text: string;                // 200–300 字 lore 正文（中文）
  npcs_present: string[];           // 引用 npcs.json 的 id
  items_unlocked: string[];
  events_triggered: string[];
  lore_anchors: LoreAnchor[];
  prerequisite_bonfires: string[];
  next_bonfires: string[];          // BranchMap 边
  sources: SourceRef[];
}
```

## 字段说明

| 字段 | 说明 |
|---|---|
| `world_position` | **模型空间**坐标。由 `scripts/place_bonfires_from_model.py` 从 glTF 区域包围盒生成，不要手填游戏坐标。 |
| `cinematic_pose` | 由同一脚本的 `--poses` 自动生成（相机从地图外侧看向篝火，后退距离随区域大小缩放）。`duration_seconds` 为节奏，保留人工设定。 |
| `depth_tier` | 仅用于 BranchMap 的垂直分层，不直接等于 `world_position.y`。 |
| `lore_anchors[].confidence` | 传达认知状态：`canon` → `consensus` → `theory` → `personal`。 |

## `region_anchors.json`

`scripts/place_bonfires_from_model.py` 还会输出 `src/data/region_anchors.json`，
缓存 glTF 中 14 个区域的世界空间 AABB 与中心点：

```json
{
  "Anor Londo": {
    "center": [332.9, 125.0, 402.3],
    "min": [189.7, 32.5, 163.0],
    "max": [475.4, 217.6, 641.6]
  }
}
```

可供未来批量放置 NPC、物品、事件标记复用，无需再手工标定。

## 校验项

`scripts/validate_data.ts` 检查：必填字段、`order` 唯一性、`world_position`
与位姿数组长度、`lore_text` 最小长度、`lore_anchors` 结构与
`type` / `confidence` 取值、`prerequisite_bonfires` / `next_bonfires`
交叉引用、以及 `npcs_present` 与 `npcs.json` 的一致性。
