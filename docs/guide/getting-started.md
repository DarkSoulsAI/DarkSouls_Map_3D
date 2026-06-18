# 快速开始

**罗德兰篝火图谱 · Bonfires of Lordran** 是一个以 9S 的 Lordran glTF 模型为中心的
Dark Souls 1 交互式 3D 可视化。粉丝向、非商业。

## 技术栈

- **Vite** ^5 + **TypeScript** ^5
- **React** ^18 + **React Three Fiber** ^8 + **Drei** ^9
- **Zustand** ^4（全局状态）
- **Three.js** ^0.170+
- **VitePress**（本文档站）

## 命令

```bash
# 应用
npm run dev        # 开发服务器（Vite HMR）
npm run build      # 生产构建 → dist/
npm run preview    # 本地预览生产构建

# 数据校验
npx tsx scripts/validate_data.ts        # 校验 bonfires.json 结构与交叉引用

# 文档站（VitePress）
npm run docs:dev      # 本地预览文档
npm run docs:build    # 构建文档 → docs/.vitepress/dist
npm run docs:preview  # 预览已构建的文档
```

## 模型文件

3D 模型位于 `dark_souls_map/scene.gltf` + `scene.bin`（约 69 MB）。
路径在 `LordranModel.tsx` 中硬编码，**请勿移动或重命名**。

## 部署

- **应用**：静态站点（`vite build` → `dist/`），GitHub Pages 或 Cloudflare Pages。
- **文档**：本 VitePress 站点经 GitHub Actions 部署到 GitHub Pages，
  地址为 `https://<owner>.github.io/DarkSouls_Map_3D/`。详见
  [脚本与工具](./scripts#文档部署)。
