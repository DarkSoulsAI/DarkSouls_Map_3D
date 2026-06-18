---
layout: home

hero:
  name: 罗德兰篝火图谱
  text: Bonfires of Lordran
  tagline: 以篝火为叙事单元的 Dark Souls 1 交互式 3D 世界图谱 · 粉丝向 · 非商业
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 架构
      link: /guide/architecture
    - theme: alt
      text: Dev Log
      link: /devlog/

features:
  - title: 27 处篝火节点
    details: 每处篝火携带 200–300 字中文 lore、NPC 名录、前置/后继关系图、电影化引言，以及按 canon → consensus → theory → personal 标注可信度的 lore_anchors。
  - title: 电影 / 自由双模式
    details: 电影模式按叙事顺序自动飞行；自由模式 OrbitControls 自由探索。相机位姿由模型几何自动生成。
  - title: 数据驱动
    details: bonfires.json 为主内容源，world_position 直接从 glTF 区域几何提取，region_anchors.json 缓存各区域包围盒供未来标记复用。
---
