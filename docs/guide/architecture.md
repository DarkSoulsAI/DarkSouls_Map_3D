# 架构

## `src/` 布局

```
src/
├── data/
│   ├── bonfires.json        # 27 处篝火记录 — 主内容文件
│   ├── npcs.json            # 21 条 NPC 记录
│   └── region_anchors.json  # 各区域世界空间包围盒（从 glTF 提取）
├── scene/                   # R3F 3D 组件
│   ├── Scene.tsx            # 根 Canvas + 光照 + 相机切换
│   ├── LordranModel.tsx     # glTF 加载；重置异常 scale≈1302 节点；matcap 着色
│   ├── BonfireMarker.tsx    # 单个篝火标记：环 + 脉动余烬 + 火花 + 悬停提示
│   ├── BonfireMarkers.tsx   # 从 bonfires.json 渲染所有标记
│   ├── CinematicCamera.tsx  # 停留/飞行状态机；在 cinematic_pose 之间 lerp
│   └── PositionEditor.tsx   # 仅开发：leva 面板校准 world_position
├── ui/
│   ├── Sidebar.tsx          # 右侧 lore 面板
│   ├── Timeline.tsx         # 底部 27 个可点击圆点
│   ├── BranchMap.tsx        # 左下角 SVG 网络图（depth_tier × order）
│   ├── CinematicCaption.tsx # 顶部居中淡入标题卡
│   ├── ModeToggle.tsx       # 电影 / 自由模式切换
│   └── AudioManager.tsx     # 环境音 + 篝火音效
├── store/
│   └── useAppStore.ts       # Zustand 全局状态
└── types.ts                 # Bonfire / LoreAnchor / CinematicPose / SourceRef
```

## 相机 / 模式系统

- **电影模式**：按 `order` 顺序自动飞过篝火。状态机：`dwell`（停留
  `duration_seconds`）→ `fly`（3.5 秒 lerp 到下一位姿）。
- **自由模式**：Drei `OrbitControls`，target = `MODEL_CENTER [14,-90,-147]`。

## 坐标空间

应用以**原样**渲染 glTF（primitive 无额外 scale/offset）：

- 每个区域节点带有异常 `scale≈1301`，`LordranModel.tsx` 将其重置为 `1`。
- 两层父级旋转（`Sketchfab_model` × `Map.fbx`）互相抵消为单位矩阵。

因此 **glTF 顶点的世界空间 ≈ 原始 accessor 坐标**，`world_position` 即写在这个空间里。
`MODEL_CENTER [14,-90,-147]` 恰好等于 Depths 区域几何中心，可佐证这一点。

## 状态管理

单一 Zustand store（`useAppStore.ts`）持有：`currentBonfireId`、`mode`
（`'cinema' | 'free'`）、`visitedIds: Set<string>`、`sidebarOpen`、
`positionOverrides`（开发）、`pickingBonfireId`（开发）。无 prop-drilling。

## 材质 / Matcap

模型**没有纹理也没有 UV**（mesh 仅有 `POSITION` + `NORMAL`），无法常规贴图。
`LordranModel.tsx` 用一张**程序化生成的黏土/石质 matcap**（按视空间法线查表）
伪造受光材质，并按海拔色带对 matcap 染色以区分区域。详见
[Dev Log](/devlog/bonfire-matcap)。
