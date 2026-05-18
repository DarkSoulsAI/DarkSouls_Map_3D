# LEGAL · 版权、署名与合规

> 本文档汇总项目涉及的所有第三方素材的来源、许可证、必需的署名义务、抓取合规要求,以及商用与否的判断框架。`DESIGN.md` 不涉及这些,所有相关讨论统一收在这里。

**状态**:本项目当前定位为**个人作品集 / 博客展示**,默认按非商业使用规划。如果未来要商用(广告、付费内容、用作公司项目),需重新审视下面每一项,部分素材必须替换。

---

## 1. 第三方素材清单

### 1.1 3D 模型:9S 制作的 Dark Souls Map

| 项 | 内容 |
|---|---|
| 作者 | 9S(Sketchfab 用户) |
| 原页面 | https://sketchfab.com/3d-models/dark-souls-map-b75a883eb9c94104beb170c98dc5216c |
| 许可证 | **CC BY-NC 4.0**(Attribution + Non-Commercial) |
| 署名义务 | 必须注明作者(9S)+ 链接原页面 |
| 商用 | **禁止商用** |
| 衍生作品 | 允许修改(如减面、调材质),但衍生作品同样不可商用 |
| 备注 | 模型描述本身引用了 Dark Souls Wiki (Fandom) 的 CC BY-SA 文本 — 但本项目使用的是模型几何,不复用其描述,所以这条传染性条款不直接影响本项目 |

**本项目处理**:
- 部署版本页脚必须包含:`3D 模型:9S · Sketchfab · CC BY-NC 4.0` + 原页面链接
- README、About 页面、关于章节都需要同样的署名
- 不挂广告、不放在付费 wall 后、不当作商业产品/服务的一部分

### 1.2 Lore 文本来源

#### 1.2.1 Fextralife Dark Souls Wiki

| 项 | 内容 |
|---|---|
| URL | https://darksouls.wiki.fextralife.com/ |
| 许可证 | 站点未明确声明统一开源许可证(Fextralife 是商业 wiki 平台);页面内容受其条款约束 |
| 使用建议 | **不复制原文,只作为事实参考**(篝火位置、物品名、NPC 名等事实性信息) |
| 衍生作品要求 | 通过改写、归纳、自己撰写中文叙述,使用其事实但不复用其表达 |

#### 1.2.2 Fandom Dark Souls Wiki

| 项 | 内容 |
|---|---|
| URL | https://darksouls.fandom.com/ |
| 许可证 | **CC BY-SA 3.0**(默认 Fandom 站点许可证)|
| 署名义务 | 任何直接复制的内容必须署名 + 链接原页面 |
| 传染性 | **CC BY-SA 是 copyleft 的**——直接复用其文本意味着衍生作品也必须以 BY-SA 发布 |
| 使用建议 | 同上,**优先归纳改写**,避免触发 BY-SA 传染。如果某段 NPC 对话/物品描述必须原文引用,在 `lore_anchors` 字段标 `source_ref: { site: 'fandom', url: ... }`,并在页脚总署名处提及 |

#### 1.2.3 Soulslore Wikidot

| 项 | 内容 |
|---|---|
| URL | http://soulslore.wikidot.com/ |
| 许可证 | **CC BY-SA 3.0**(Wikidot 默认)|
| 使用建议 | 同 Fandom:归纳为主,引用即署名 |

#### 1.2.4 Wikipedia

| 项 | 内容 |
|---|---|
| 许可证 | **CC BY-SA 4.0** + GFDL |
| 使用建议 | 同上 |

#### 1.2.5 Vaatividya YouTube + Abyssal Archive 书

| 项 | 内容 |
|---|---|
| 性质 | 受版权保护的视频内容 / 出版物 |
| 使用建议 | 仅用作**思路参考与解读校对**,**不直接复制台词或书中段落**。如需引用解读观点,在 `interpretation` 字段中用自己的话总结,在 `source_ref` 中标 `site: 'vaatividya'` 或 `site: 'abyssal_archive'` |

### 1.3 游戏内文本(物品描述、NPC 对话)

| 项 | 内容 |
|---|---|
| 权利人 | FromSoftware / Bandai Namco |
| 处理 | 物品描述和对白在 lore 圈广泛流传且常被引用作"证据",属于事实陈述与评论用途。本项目在 `lore_anchors` 字段引用原文时**保持原文完整,清楚标注来源**,落入合理使用范畴(中国法下"适当引用",美国法下 fair use) |
| 风险 | 小范围引用风险低;不可大段连续引用、不可重组为可替代游戏的内容、不可商用 |
| 实施 | 每条引用都限制在 1-3 句,在 sidebar 中明确标"出自《Dark Souls》游戏内 [物品/对白]" |

### 1.4 游戏截图

| 项 | 内容 |
|---|---|
| 权利人 | FromSoftware / Bandai Namco |
| 风险 | 比文字引用更高 |
| 处理 | **Phase 1-5 都不用截图**。如果 Phase 6+ 需要(例如 Undead Asylum 占位、NPC 头像),仅用极小张数 + 标注来源,且仅用于非商业作品集 |

### 1.5 字体

| 项 | 内容 |
|---|---|
| Cinzel | SIL Open Font License 1.1,可商用 |
| Noto Serif SC | SIL Open Font License 1.1,可商用 |
| 备注 | 通过 Google Fonts 加载或自托管均可 |

### 1.6 火焰 Sprite / UI 装饰素材

| 项 | 内容 |
|---|---|
| 建议来源 | OpenGameArt.org / itch.io,**筛选 CC0 或 CC BY** |
| 避免 | CC BY-NC(与 9S 模型叠加后整个项目都被锁死非商用)、未明确许可证的素材 |
| 选 CC BY 的话 | 同样在页脚署名 |

---

## 2. 抓取合规

如果实施 `scripts/scrape_wiki.ts`(详见 `DESIGN.md` §7.7):

| 要求 | 做法 |
|---|---|
| 遵守 robots.txt | 抓取前 `curl https://<wiki-domain>/robots.txt` 检查;Fextralife 和 Fandom 通常允许公开内容抓取但有路径限制 |
| 速率限制 | **最多 1 req/s**,设 User-Agent 包含项目名和联系方式 |
| 不抓取登录后内容 | 只抓 anonymous 可见的公开页面 |
| 不重发布原文 | scrape 结果作"草稿",最终发布的是改写过的中文叙述 |
| 标注 | scrape 出的每条数据,`source_ref` 字段记录原 URL 和访问日期 |
| 备份 | scrape 输出保存为 `data/bonfires.draft.json`,不直接进入生产 build |

---

## 3. 部署前 checklist

在 `npm run build` + 部署到 GitHub Pages / Cloudflare Pages 之前,确认:

- [ ] 页脚有 9S Sketchfab 模型署名 + 链接 + `CC BY-NC 4.0` 标识
- [ ] 页脚有 Dark Souls Wiki (Fandom / Fextralife / Soulslore) 综合致谢段
- [ ] About 页面/README 有完整的"致谢与来源"章节
- [ ] 每个 `lore_anchor` 的 `source_ref` 字段都已填写
- [ ] 字体加载来源标注(若自托管)
- [ ] 火焰/UI 素材的署名(若用了 CC BY)
- [ ] 站点没有广告、没有付费内容、没有联盟链接
- [ ] 仓库 README 顶部有 `Non-commercial · For educational and portfolio use only`

---

## 4. 商用迁移路径(未来如果想商用)

如果未来想把本项目商用(放进公司产品、加广告、做付费内容),必须依次:

1. **替换 9S 模型** — CC BY-NC 不能商用,需要:
   - a) 自己重做 Lordran 几何(从游戏 collision data 解包,或从 3D 扫描重建,工作量巨大)
   - b) 联系 9S 谈商业授权
   - c) 改用程序化生成的"风格化"Lordran(放弃精确还原)
2. **审视 lore 文本** — 凡是直接引用 Fandom/Wikidot/Wikipedia 的内容,要么完全改写,要么以 CC BY-SA 发布(影响整个项目源码许可证)
3. **替换火焰/UI 素材** — 任何 NC 素材必须替换
4. **法律咨询** — 游戏内文本引用、From 的衍生作品政策,在商用语境下风险显著上升,需咨询律师

---

## 5. 不构成法律建议

本文档反映作者基于公开许可证条款的理解,不构成法律建议。涉及具体争议时以版权方意见、当地法律和(必要时)律师咨询为准。
