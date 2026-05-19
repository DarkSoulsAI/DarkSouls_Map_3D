# 罗德兰篝火图谱 · Bonfires of Lordran

> 一个 fire-by-fire 推进的 Dark Souls 1 交互式 3D 世界图谱。粉丝向作品集项目。

---

## 1. Context

**目标**:做一个面向 Dark Souls 粉丝的交互式 3D 可视化,以**篝火**为最小叙事单元,沿 DS1 经典推进路径,在 9S 制作的 Lordran 3D 模型上逐处展开 lore、NPC 关系、事件链。

**受众**: Soulsborne 圈、博客作品集访客。**默认观众已知设定**(Gwyn 是谁、初火是什么、薪火循环等),无需基础科普 。

**参考项目** — `Sia12345678/philosophy_vis`(github.com/Sia12345678/philosophy_vis):
一个用 Vite + TS + D3 做的"哲学家星图"开源项目,把 118 位东西方哲学家沿时间轴投影到历史地图上。本项目从中借鉴的设计思路:

- 静态可嵌入博客的纯前端可视化(`vite build` 出 `dist/`)
- 电影模式 + 自由模式双轨(参考其 `cinematicCaption` 与镜头航点设计)
- 时间轴驱动 + 侧边栏深度信息(参考其 `timeline.ts` 和 `sidebar.ts`)
- 中英对照(粉丝项目则改为"中文为主,英文 lore 术语保留")
- 用 `PLAN.md` 把 phase / 数据模型 / 验证清单写清楚(本文档即同类作用)

**与参考项目的核心区别**:

| | philosophy_vis(参考) | 本项目 |
|---|---|---|
| 底图 | 2D 历史地理地图(7 张时代切片) | 9S 制作的 Lordran 3D 模型(glTF) |
| 时间 | 真实历史时间(BC 600 – AD 2000) | DS1 内部叙事时间(无年份,按推进顺序)|
| 节点 | 哲学家(118 人) | 篝火(约 30 处)|
| 节点含义 | 人在某时某地 | 地点+状态+时刻三合一 |
| 框架 | 原生 DOM + D3 | React + R3F + Drei + Zustand |
| 框架升级理由 | UI 状态多(sidebar/timeline/branch-map/cinema)交互复杂度高一档,React 比手写 DOM 省工 |

**交付**:`vite build` 产出纯静态站点,部署至 GitHub Pages 或 Cloudflare Pages。

**法律/署名/版权事项**:见独立文档 `LEGAL.md`,本文档不涉及。

---

## 2. 已确认的设计决策

| 维度 | 选择 |
|---|---|
| 范围 | DS1 base game,不含 DLC(Artorias of the Abyss),不含 9S 模型未包含的 Oolacile/Ariamis/Undead Asylum |
| 3D 模型 | Sketchfab `9S/Dark Souls Map`,glTF 格式 |
| 模型呈现 | 单色/低饱和度,不追求贴图还原,突出结构 |
| 节点 | 篝火(约 30 处)|
| 标记 | 3D 火焰 sprite + 状态化(未访问/当前/已点燃)|
| 相机 | 电影模式(默认,镜头沿篝火序列飞行) + 自由模式(OrbitControls)双轨 |
| 镜头过渡 | spline 曲线插值,避免穿模 |
| 推进 | 时间轴/进度条(底部) + 分支图(左下小窗)双导航 |
| 深度信息 | 右侧滑出 sidebar |
| 语言 | 中文为主,英文专有名词保留 |
| 技术栈 | Vite + TypeScript + React + React Three Fiber + Drei + Zustand |

---

## 3. 整体原型

```
┌─────────────────────────────────────────────────────────────┐
│  罗德兰篝火图谱 · Bonfires of Lordran                       │
│  [▶ 电影模式]  [✋ 自由模式]  [📐 剖面视图]  [⚙ 设置]       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│              ┌─────────────────────┐                         │
│              │                     │                         │
│              │   9S Lordran 3D     │  ┌────────────────────┐│
│              │    Model + 火焰      │  │ 当前篝火           ││
│              │      sprites        │  │                    ││
│              │                     │  │ 传火祭祀场          ││
│              │     🔥 ← 当前篝火    │  │ Firelink Shrine    ││
│              │     ⚫ ← 已点燃      │  │ ─────────────────  ││
│              │     ○ ← 未访问      │  │ 第 3 处 · 中心枢纽  ││
│              │                     │  │                    ││
│              └─────────────────────┘  │ 一段 200 字 lore... ││
│  ┌──────────┐                         │ NPC: Petrus, Lautrec│
│  │分支图     │                         │      Reah, ...     ││
│  │ (mini)   │                         │ Lore Anchors:      ││
│  │  ○─○─◉   │                         │ • 残废战士对白      ││
│  │   │  \   │                         │ • 火焰瓶描述        ││
│  │   ○   ○  │                         │ [← 上一处] [下一处→]│
│  └──────────┘                         └────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  ◀ ━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ▶          │
│  Asylum  Firelink  Burg  Parish  ...  Anor Londo  ...  Kiln │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. 功能分解

### 4.1 相机系统

**电影模式(默认)**
- 进入页面后自动启动
- 按推进顺序依次飞过每个篝火,每处停留 ~8 秒
- 镜头位置/朝向由每个篝火的 `cinematic_pose` 字段定义(三维坐标 + LookAt)
- 飞行路径使用 Three.js `CatmullRomCurve3` 在相邻 pose 之间生成 spline,避开穿模
- 用户随时可以按空格暂停、点击任意篝火跳转
- 顶部出现"标题卡"(类似参考项目的 `cinematicCaption`):显示当前篝火名 + 一句话引言

**自由模式**
- 切换后启用 `OrbitControls`(R3F 用 `@react-three/drei` 的 `OrbitControls`)
- 鼠标拖动旋转、滚轮缩放、右键平移
- 限制 zoom 范围,避免相机进入模型内部或飞太远
- 此模式下篝火仍可点击触发 sidebar,但相机不自动移动

**剖面视图(toggle,Phase 6)**
- 切换到正交相机 + 侧视角,垂直分层可视化
- 突出 DS1 的垂直互联(Firelink → New Londo → Valley of Drakes → Blighttown → Quelaag → Demon Ruins → Lost Izalith → Ash Lake 这条贯穿线)
- 水平细节淡化,只显示篝火的 y 坐标层级

### 4.2 篝火标记

每个篝火渲染为 3D 火焰 sprite(billboard,始终朝向相机)。

**视觉状态**:
- `unvisited`:暗灰色小火苗,低亮度
- `current`:全尺寸燃烧火焰,可加粒子效果(Phase 5)
- `visited`:已点燃,亮度中等,标记为"已记录"
- `hovered`:轻微放大 + 发光环

**交互**:
- hover:浮出 tooltip(篝火名 + 区域 + 第几处)
- click:推进到该篝火(电影模式下镜头飞过去,自由模式下只更新 sidebar)

**实现建议**:
- 使用 `@react-three/drei` 的 `Billboard` + `Html` 组件,或自定义 `Sprite` 材质
- 火焰素材见 §7

### 4.3 推进与导航

**时间轴(底部)**
- 一条横向滑块,横轴为推进序号(1 ~ 30+)
- 滑块上每个篝火是一个可点击节点,hover 显示名字
- 拖动滑块时镜头实时跟随(参考项目的 `timeline.ts` 实现思路)
- 节点视觉状态与 3D 标记同步(未访问/当前/已访问)

**分支图(左下角小窗)**
- 一个简化的篝火网络图(force-directed 或预定义 layout)
- 节点 = 篝火,边 = 篝火之间的关卡连接(不是物理距离,是游戏内可达性)
- 当前位置高亮,可点击跳转
- 帮助用户理解 DS1 的网状结构(Firelink 中枢、多分支)
- 实现:React + SVG 或 D3

**推进按钮**
- sidebar 底部 `[← 上一处]` `[下一处 →]`
- 顺序由 `bonfires.json` 中的 `order` 字段定义
- 分支处理:某些篝火有"推荐前序"和"可选前序"两种推进路径(详见 §5.2)

### 4.4 侧边栏(Sidebar)

点击篝火或时间轴节点时,右侧滑出。结构:

1. **头部**:篝火中文名 / 英文名 / 第几处 / 所属区域 / 难度档(可选)
2. **状态描述**:第一次抵达时世界是什么样的(2-3 句)
3. **lore 段落**:200-300 字中文叙述
4. **关联 NPC**:此处出现/驻留的 NPC 列表,点击可展开
5. **解锁内容**:重要物品、捷径、剧情触发
6. **Lore Anchors**:1-3 条关键证据(对白引用/道具描述/环境叙事),每条标注:
   - 来源类型(对白/物品/环境)
   - 原文(英文)+ 翻译
   - 解读说明
   - 置信度标签(`canon` / `consensus` / `theory` / `personal`)
7. **导航按钮**:上一处 / 下一处 / 关闭

### 4.5 电影模式标题卡

顶部居中浮层,电影模式自动出现。

- 大字号:篝火中文名
- 副标题:英文名 + 第几处
- 一句话引言(从 `cinematic_caption` 字段读)
- 镜头飞行过渡时淡出,抵达后淡入
- 自由模式下隐藏

---

## 5. 数据模型

### 5.1 篝火 schema (`data/bonfires.json`)

```ts
type Bonfire = {
  id: string;                    // e.g. "firelink_shrine"
  name_zh: string;               // "传火祭祀场"
  name_en: string;               // "Firelink Shrine"
  order: number;                 // 1~30+,主推进序号
  region: Region;                // see §5.3
  difficulty_tier?: 1 | 2 | 3;  // 玩家首次抵达时的难度档(可选)

  // 3D 定位
  world_position: [number, number, number];  // 模型坐标系下的 xyz
  depth_tier: number;            // 垂直层级(用于剖面视图):0=Firelink, +1=Burg, -1=New Londo, ...

  // 电影模式镜头
  cinematic_pose: {
    camera_position: [number, number, number];
    look_at: [number, number, number];
    duration_seconds?: number;   // 停留时间,默认 8
  };
  cinematic_caption: string;     // 一句话引言

  // 叙事内容
  first_visit_state: string;     // 首次抵达时的世界状态(2-3 句中文)
  lore_text: string;             // 200-300 字中文叙述
  
  // 关联
  npcs_present: string[];        // NPC id 列表
  items_unlocked: string[];      // 重要物品/捷径
  events_triggered: string[];    // 事件 id

  // Lore anchors
  lore_anchors: LoreAnchor[];

  // 推进关系
  prerequisite_bonfires: string[];        // 推荐前序篝火 id
  alternative_prerequisites?: string[];   // 可选前序(分支)
  next_bonfires: string[];                // 推荐后续

  // 数据来源(便于校对)
  sources: SourceRef[];

  // 状态(运行时,不在 JSON 里)
  // state: 'unvisited' | 'current' | 'visited'
};

type LoreAnchor = {
  type: 'dialogue' | 'item_description' | 'environmental';
  source_zh: string;             // "残废战士" / "火焰瓶描述" / "Anor Londo 大教堂"
  source_en: string;
  text_en: string;
  text_zh: string;
  interpretation: string;        // 解读说明
  confidence: 'canon' | 'consensus' | 'theory' | 'personal';
  source_ref: SourceRef;
};

type SourceRef = {
  site: 'fextralife' | 'fandom' | 'soulslore_wikidot' | 'vaatividya' | 'abyssal_archive' | 'in_game' | 'other';
  url?: string;
  page_title?: string;
  accessed_date?: string;        // ISO date
};

type Region = 
  | 'undead_burg'
  | 'undead_parish'
  | 'firelink'
  | 'depths'
  | 'blighttown'
  | 'sens_fortress'
  | 'anor_londo'
  | 'new_londo'
  | 'valley_of_drakes'
  | 'darkroot'
  | 'catacombs'
  | 'tomb_of_giants'
  | 'demon_ruins'
  | 'lost_izalith'
  | 'duke_archives'
  | 'crystal_cave'
  | 'kiln';
```

### 5.2 推进顺序与分支

DS1 没有强制线性顺序,但有主流推进路径。推荐顺序(完整 30 处篝火,实施时再细化):

**前期(必经)**:
1. ~~Northern Undead Asylum~~
2. Firelink Shrine 传火祭祀场
3. Undead Burg 不死镇
4. Undead Parish 不死教区(熔铁恶魔后)
5. Sunlight Altar 太阳光祭坛
6. Depths 下水道
7. Blighttown(Quelaag's Domain entrance)病村入口

**中期(分支)**:
8. Daughter of Chaos(Quelaag's sister)混沌之女
9. Great Hollow / Ash Lake 大空洞 / 灰湖 *(可选)*
10. Sen's Fortress 不死院
11. Anor Londo 神之城(进入)
12. Anor Londo 神之城(boss 前)

**后期(自由顺序,4 王灵)**:
- New Londo Ruins 新隆德废都
- Catacombs 地下墓地
- Tomb of Giants 巨人墓地
- Demon Ruins 恶魔废墟
- Lost Izalith 失落的伊扎里斯
- Duke's Archives 公爵书库
- Crystal Cave 水晶洞窟
- Darkroot Garden / Basin 黑森林

**终局**:
- Kiln of the First Flame 初火之炉


### 5.3 NPC schema (`data/npcs.json`)

```ts
type NPC = {
  id: string;                    // "petrus_of_thorolund"
  name_zh: string;
  name_en: string;
  faction?: string;              // "Way of White", "Darkmoon", ...
  bonfires_present: string[];    // 出现在哪些篝火附近
  arc_summary: string;           // NPC 完整剧情线(中文,300-500 字)
  voice_lines: VoiceLine[];      // 关键对白
  fate: string;                  // 最终结局
  sources: SourceRef[];
};

type VoiceLine = {
  text_en: string;
  text_zh: string;
  context: string;
};
```

### 5.4 事件 schema (`data/events.json`)

```ts
type Event = {
  id: string;
  trigger: string;
  bonfire: string;
  narrative_zh: string;
  lore_significance: string;
};
```

### 5.5 区域 schema (`data/regions.json`)

```ts
type RegionMeta = {
  id: Region;
  name_zh: string;
  name_en: string;
  color: string;
  depth_tier_range: [number, number];
};
```

---

## 6. 技术栈与项目结构

### 6.1 依赖

**核心**:
- `vite` ^5
- `typescript` ^5
- `react` ^18
- `react-dom` ^18

**3D**:
- `three` ^0.160+
- `@react-three/fiber` ^8
- `@react-three/drei` ^9(`OrbitControls`, `Billboard`, `Html`, `useGLTF`, `Sprite`, `CameraControls`)

**状态管理**:
- `zustand` ^4(轻量,管理当前篝火 / 模式 / sidebar 状态)

**UI**:
- 不引 UI 库,CSS modules 或 Tailwind
- 分支图考虑 `d3` 或纯 SVG + React

**辅助**:
- `@react-three/postprocessing`(可选,Phase 5+ 加 bloom)
- `leva`(开发期调试相机参数,生产环境移除)

### 6.2 项目结构

```
bonfires_of_lordran/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── DESIGN.md                        # 本文档
├── LEGAL.md                         # 法律/署名/版权
├── public/
│   ├── models/
│   │   └── lordran.gltf            # 9S 模型 + 配套 .bin 和贴图
│   └── textures/
│       ├── fire_sprite.png
│       └── ember_sprite.png
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── styles/
│   │   ├── global.css
│   │   └── *.module.css
│   ├── data/
│   │   ├── bonfires.json
│   │   ├── npcs.json
│   │   ├── events.json
│   │   └── regions.json
│   ├── scene/
│   │   ├── Scene.tsx
│   │   ├── LordranModel.tsx
│   │   ├── BonfireMarker.tsx
│   │   ├── BonfireMarkers.tsx
│   │   ├── CinematicCamera.tsx
│   │   ├── FreeCamera.tsx
│   │   └── CameraRig.tsx
│   ├── ui/
│   │   ├── Sidebar.tsx
│   │   ├── Timeline.tsx
│   │   ├── BranchMap.tsx
│   │   ├── CinematicCaption.tsx
│   │   ├── ModeToggle.tsx
│   │   └── Tooltip.tsx
│   ├── store/
│   │   └── useAppStore.ts
│   ├── hooks/
│   │   ├── useBonfireData.ts
│   │   └── useCameraTransition.ts
│   └── utils/
│       ├── spline.ts
│       └── i18n.ts
└── scripts/
    ├── validate_data.ts            # 校验 bonfires.json 完整性
    └── scrape_wiki.ts              # (可选) 从 wiki 抓取结构化数据骨架
```

---

## 7. 素材清单

### 7.1 3D 模型 — **必需**

| 项 | 说明 |
|---|---|
| 用途 | 主场景底图 |
| 来源 | Sketchfab `9S/Dark Souls Map` (https://sketchfab.com/3d-models/dark-souls-map-b75a883eb9c94104beb170c98dc5216c) |
| 下载格式 | **glTF**(27MB,文件最小且 Three.js 原生) |
| 备注 | 1.6M 三角形 / 1M 顶点,Phase 1 不优化,后续可用 `gltf-transform` 做 decimation 或 Draco 压缩 |
| 已知缺失 | Oolacile / Ariamis / Undead Asylum 未包含 |

### 7.2 火焰素材 — **必需**

| 项 | 说明 |
|---|---|
| 用途 | 篝火 sprite |
| 选项 A | sprite sheet 火焰动画(2D 多帧贴图,billboard 上播放) |
| 选项 B | 静态 PNG + Three.js 粒子 |
| 选项 C | 纯 shader 火焰(Phase 5 视觉打磨阶段) |
| Phase 1 推荐 | 选项 A,从 OpenGameArt / itch.io 找火焰精灵图,4-8 帧足够 |
| 推荐来源 | https://opengameart.org(搜索 "fire sprite") |

### 7.3 余烬/熄灭篝火素材 — **推荐**

| 项 | 说明 |
|---|---|
| 用途 | `visited` 状态的篝火标记 |
| 选项 | 单张余烬贴图,低亮度暖色;或 shader 直接调暗 fire sprite |

### 7.4 字体 — **必需**

| 项 | 说明 |
|---|---|
| 西文 | **Cinzel**(DS UI 风格的开源近似)|
| 中文 | **思源宋体** / **Noto Serif SC** |
| 来源 | Google Fonts |
|      |                                  |

### 7.5 UI 装饰素材 — **可选**

| 项 | 说明 |
|---|---|
| 篝火 icon / 灵魂符号 / 边框花纹 | 自己 SVG 画,或 itch.io 找 DS 风格 UI kit |
| 建议 | Phase 1 极简纯 CSS,Phase 5+ 再加 |

### 7.6 Lore 数据源(在线资料库) — **必需**

> **不要全手抄。这些站点结构化程度较高,可手动整理 + 部分脚本化抓取**(见 §7.7)。

**主要资料库(按优先级)**:

| 站点 | URL | 用途 | 特点 |
|---|---|---|---|
| **Fextralife DS1 Wiki** | https://darksouls.wiki.fextralife.com/ | 篝火位置 / 物品描述 / NPC / 场景说明 | 结构化最好,每个篝火都有独立页面,信息密度高 |
| **Fandom DS1 Wiki** | https://darksouls.fandom.com/ | 综合参考、交叉验证 | 较老,信息冗余,但覆盖广 |
| **Soulslore Wikidot** | http://soulslore.wikidot.com/ | 专题 lore 解读(Firekeepers / Lothric / Crossbreed Priscilla 等) | 偏深度解读,适合做 `interpretation` 字段 |
| **Wikipedia(英文)** | en.wikipedia.org | 关键概念(Bonfire / Blighttown / Lordran)的中立简介 | 适合做 `lore_text` 的素材起点 |

**关键单页 reference**:

- **DS1 全部篝火清单**:https://darksouls.fandom.com/wiki/Bonfire_(Dark_Souls)
  - 列出全部 43 个篝火(本项目用 base game 约 30 处),含每处位置文字描述
- **Lore 总览**:https://darksouls.wiki.fextralife.com/Lore
- **物品描述索引**:https://darksouls.wiki.fextralife.com/Items

**视频/书籍参考(辅助,不可直接复制)**:

| 资源 | 说明 |
|---|---|
| **Vaatividya YouTube** | DS lore 解读黄金标准,适合做"主流共识"判断 |
| **Abyssal Archive: The Mythology of Dark Souls** (Tune & Fairweather, 2022) | 目前最权威的 DS lore 整理实体书 |
| **Bonfireside Chat 播客** | 关卡逐一深度讨论 |

**中文资源(辅助)**:

| 资源 | 说明 |
|---|---|
| **NGA 黑魂区精华贴** | 中文 lore 翻译和讨论 |
| **B 站 lore 视频**(老猫拌饭、Tarnished 等) | 中文配音的 lore 总结 |

### 7.7 抓取与整理工作流 — **推荐**

为了不让 6000-9000 字的 lore 全手抄,建议两步走:

**Step 1:批量抓取骨架数据**

写一个 `scripts/scrape_wiki.ts`(Node.js + `cheerio` 或 `playwright`):

- 输入:30 个篝火的 Fextralife URL 列表
- 输出:`data/bonfires.draft.json`,每条记录包含从 wiki 抓到的:
  - 篝火英文名
  - 位置描述(英文)
  - 此处可触发的事件/NPC 列表(从 wiki 的 "Notes" / "Strategy" 段落抽取)
- **抓取后必须人工校对**,wiki 内容可能有错或冗余

**Step 2:手工精修**

- 翻译 + 改写为中文叙述(200-300 字 / 处)
- 配 `lore_anchors`(从 Soulslore Wikidot / Vaatividya 视频补)
- 标 `confidence` 标签

**注**:wiki 抓取须遵守 robots.txt 与速率限制(建议 1 req/s),scrape 结果用作"草稿"不直接发布。具体许可证细节见 `LEGAL.md`。

### 7.8 NPC 头像

**存放路径**:`public/image/npc/<npc_id>.png`

每个 NPC 头像文件名与 `npcs.json` 中的 `id` 字段**完全一致**（小写 + 下划线）。例：

| NPC | 文件名 |
|---|---|
| 阿斯托拉的索雷尔 | `public/image/npc/solaire_of_astora.png` |
| 传火祭祀场守火女 | `public/image/npc/anastacia_of_astora.png` |
| 奎拉格 | `public/image/npc/quelaan.png` |
| … | … |

**规格建议**:正方形，128×128 px 或 256×256 px，PNG（带透明度更佳）。

若文件不存在，Sidebar 显示占位符（空白方块或默认头像）——Phase 5 实现前不会报错。

目前 `npcs.json` 共 21 个 NPC，完整 id 列表：
`anastacia_of_astora`, `solaire_of_astora`, `petrus_of_thorolund`, `lautrec_of_carim`,
`andre_of_astora`, `griggs_of_vinheim`, `alvina`, `quelaan`, `fair_lady`, `eingyi`,
`siegmeyer_of_catarina`, `gwynevere`, `gwyndolin`, `crossbreed_priscilla`,
`seath_the_scaleless`, `patches`, `ingward`, `nito`, `four_kings`,
`everlasting_dragon`, `gwyn_lord_of_cinder`

### 7.9 环境音 / BGM

`public/audio/` 目录下已放置以下音频文件（由 `AudioManager.tsx` 管理）：

| 文件 | 用途 |
|---|---|
| `firekeeper.mp3` | 传火祭祀场背景音 |
| `darksoul_bonfire_jump.mp3` | 篝火点燃音效 |
| `dark-souls-the-ancient-dragon-choir.mp3` | 电影模式背景音乐 |
| 其余文件 | 备用音效/互动 SFX |

如需添加更多区域 BGM，直接将 `.mp3` 放入 `public/audio/` 并在 `AudioManager.tsx` 中注册即可。



---

## 8. 分 Phase 实施

### Phase 1 · MVP 骨架

**范围**:3 个篝火 — Firelink Shrine / Undead Parish / New Londo Ruins。理由:能体现 hub-and-spoke + 垂直性(上行/下行/中枢)。

**完成标准**:
- [x] React + R3F + Vite 项目跑起来
- [x] 加载 9S 的 glTF 模型,基础灯光,可看清结构
- [x] 自由模式相机(OrbitControls)可旋转/缩放
- [x] 3 个篝火 sprite 正确显示在 3D 模型对应位置(手动校准 `world_position`)
- [x] 点击篝火弹出 sidebar,显示基础 lore(占位文本即可)
- [x] sidebar "上一处/下一处"可跳转
- [x] `bonfires.json` schema 完成,3 条完整记录

**不做**:电影模式、时间轴、分支图、火焰动画、状态化标记、剖面视图、NPC 数据。

**预计工时**:3-5 天

### Phase 2 · 数据扩充至全部篝火

**完成标准**:
- [ ] (可选)`scripts/scrape_wiki.ts` 跑出 `bonfires.draft.json`
- [x] 列出 DS1 全部约 30 处篝火,逐一录入 `bonfires.json`(27 处,order 1–27)
- [ ] 每处篝火的 `world_position` 在 3D 模型上手动校准(原 22 处已校准;新增 5 处坐标待校准)
- [x] 每处篝火写完 200-300 字 lore 文本
- [x] NPC 数据 `npcs.json` 录入主要 NPC(21 个已录入)
- [x] 校验脚本 `scripts/validate_data.ts` 跑通(`npm run validate_data` 全 pass)
- [x] 所有引用都填了 `sources` 字段

**预计工时**:5-8 天

**关键待办**(作者投入):
- 每个篝火中文 lore:200-300 字 × 30 ≈ 6000-9000 字 — 用 scrape 出的草稿改写,而不是从零写
- Lore anchors:60-90 条,从 wiki 道具描述 + Soulslore wikidot 解读整理

### Phase 3 · 电影模式 + 镜头系统

- [x] 每个篝火配置 `cinematic_pose`
- [x] 镜头过渡路径生成(lerp 插值 + easeInOut;非 CatmullRomCurve3 样条,功能等效)
- [x] `CinematicCaption` 标题卡同步(淡入淡出)
- [x] 自由/电影模式切换按钮(`ModeToggle.tsx`)
- [ ] 空格暂停/恢复(未实现)
- [ ] 飞行路径不穿模(新增 5 处坐标为占位值,需手动校准)

**预计工时**:3-5 天

### Phase 4 · 时间轴 + 分支图

- [x] 底部时间轴组件,27 节点按 order 排列(`Timeline.tsx`)
- [x] 点击节点跳转,自动滚动到当前位置(拖动滑块未实现)
- [x] 左下角分支图(`BranchMap.tsx`,SVG,depth_tier × order 布局,可折叠)
- [x] 状态化标记(未访问/当前/已访问视觉区分,时间轴与分支图同步)

**预计工时**:3-4 天

### Phase 5 · 视觉打磨

- [ ] 火焰 sprite 动画(sprite sheet 或 shader)
- [x] hover 效果(3D tooltip 已在 `BonfireMarker.tsx` 实现)
- [x] 字体应用(Cinzel + Noto Serif SC 已加载于 `global.css`)
- [ ] 整体配色调优,模型材质优化(可考虑 toon shading 或淡淡的雾)
- [ ] sidebar 滑入/滑出动画
- [ ] sidebar 难度档(`difficulty_tier`)标签与区域中文名展示
- [ ] NPC 头像占位图(`public/image/npc/<npc_id>.png`,见 §7.8)
- [ ] 响应式(1280 桌面 + 768 平板)
- [ ] 空格暂停/恢复电影模式(Phase 3 遗留)

**预计工时**:3-5 天

### Phase 6(可选) · 剖面视图 + 高级特性

- [ ] 切换正交相机,侧视垂直分层
- [ ] Bloom 后处理
- [ ] 模型 Draco 压缩,首屏加载优化
- [ ] 移动端体验改进

**预计工时**:2-4 天

---

## 9. 关键待办(需要作者配合的点)

| 阶段 | 待办 | 估算 |
|---|---|---|
| Phase 1 前 | 下载 9S 模型(glTF),放到 `public/models/` | 10 分钟 |
| Phase 1 前 | 找火焰 sprite 贴图 | 30 分钟 |
| Phase 1 前 | 决定 Undead Asylum 占位方案 | 5 分钟 |
| Phase 2 初 | (可选)写 `scrape_wiki.ts` 拉骨架 | 半天 |
| Phase 2 全程 | 撰写 30 处篝火 lore 文本(基于 scrape 改写) | 累计 8-15 小时 |
| Phase 2 全程 | 整理 60-90 条 lore anchor 引用 + 翻译 | 累计 6-10 小时 |
| Phase 2 末 | 在 3D 模型上校准 30+ 篝火坐标 | 累计 3-5 小时 |
| Phase 3 中 | 为每个篝火设计 `cinematic_pose` | 累计 3-5 小时 |
| 全程 | lore 解读的 confidence 分级 | 写作时同步 |

---

## 10. 验证清单

`npm run dev` 启动后,检查:

### Phase 1 交付验收
1. 3D 模型加载完成,无明显穿模/缺失
2. 鼠标拖动可旋转视角,缩放/平移正常
3. 3 个火焰标记可见,位置合理
4. 点击火焰,sidebar 滑出,内容正确
5. "上一处/下一处"导航按 order 正确推进
6. 1280 桌面 / 768 平板下都可用

### Phase 2 交付验收
- 全部 30+ 篝火可见、可点击
- `validate_data.ts` 通过
- 每个篝火 sidebar 内容完整,均有 `sources` 字段

### Phase 3 交付验收
- 电影模式自动播放,30 篝火走完无穿模
- 标题卡同步切换
- 自由/电影模式切换流畅

### Phase 4 交付验收
- [x] 时间轴可点击,与镜头同步(拖动未实现)
- [x] 分支图清晰可读,网状结构一目了然(depth_tier × order 布局,可折叠)

### 最终验收
- `npm run build` 产出 `dist/` 总大小合理(模型压缩后 < 20MB 理想)
- 首屏加载在普通网络下 < 5s
- 全部 sidebar 文案中文流畅,无翻译腔
- lore anchor 都有正确的 confidence 标签

---

## 11. 已知风险与未决问题

| 风险/问题 | 处理 |
|---|---|
| 模型 1.6M 面在移动端可能卡 | Phase 1 先看 baseline,Phase 6 再优化 |
| 模型坐标系未知,需手动测 | Phase 1 初期用 `leva` 调试面板可视化定位 |
| Undead Asylum 缺失 | Phase 1 跳过,Phase 2 重评估 |
| lore 解读的争议处理 | 通过 `confidence` 字段标注,不强加观点 |
| 数据来源、抓取合规、署名、商用 | 全部见 `LEGAL.md`,本文档不涉及 |
