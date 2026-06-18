# 脚本与工具

## `place_bonfires_from_model.py`

把 27 处篝火直接放置到 glTF 模型的真实几何上，并（可选）重算电影位姿。

```bash
# 干跑，打印 old → new 对照
python3 scripts/place_bonfires_from_model.py

# 应用 world_position
python3 scripts/place_bonfires_from_model.py --write

# 同时重算 cinematic_pose
python3 scripts/place_bonfires_from_model.py --write --poses
```

**原理**：glTF 把每个区域烤成命名 mesh 组，顶点已在世界空间。脚本复刻
three.js 的变换链（含 `scale≈1301` 重置），读出每个区域的真实包围盒，
把篝火放上去；同区域多个篝火按椭圆散开，`depth_tier` 决定垂直高度。

**输出**：
- 改写 `src/data/bonfires.json` 的 `world_position`（与 `--poses` 时的位姿）。
- 写出 `src/data/region_anchors.json`（各区域 AABB + 中心）。

## `validate_data.ts`

```bash
npx tsx scripts/validate_data.ts
```

校验 `bonfires.json` 与 `npcs.json` 的结构与交叉引用。详见
[数据模型 · 校验项](./data-model#校验项)。

## `screenshot.ts`

```bash
npx tsx scripts/screenshot.ts [port=5175] [wait=6000]
```

用 puppeteer 对运行中的开发服务器截图，保存到 `log/`。

::: tip 无头渲染注意
无头 Chromium 的软件 GL **不跑连续 `requestAnimationFrame`**，电影模式的自动
飞行在截图里会冻结。需要确定性截图时，请直接驱动相机（设位姿后
`gl.render` 再截图），而不要依赖实时飞行。
:::

## 文档部署

文档站经 GitHub Actions 部署到 GitHub Pages。

- 工作流：`.github/workflows/deploy-docs.yml`，在 `docs/**` 变更推到 `main`
  时触发，构建 VitePress 并发布。
- **一次性设置**：仓库 **Settings → Pages → Build and deployment → Source**
  选择 **GitHub Actions**。
- 站点地址：`https://<owner>.github.io/DarkSouls_Map_3D/`
  （`base` 在 `docs/.vitepress/config.ts` 中设为 `/DarkSouls_Map_3D/`）。
