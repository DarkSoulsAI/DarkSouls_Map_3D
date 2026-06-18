# 篝火重定位 + Matcap 着色

## 背景

最初的 `world_position` 是手工标定的，全挤在原点附近的一小团，与模型的真实几何
对不上——远区（Anor Londo、Duke's Archives、Ash Lake）的标记根本没落在对应几何上。

## 篝火重定位

9S 的 glTF 把每个区域烤成命名 mesh 组，顶点已在世界空间（与 `world_position`
同一坐标系）。新增 `scripts/place_bonfires_from_model.py`：

- 复刻 three.js 的变换链（含 `scale≈1301` 重置），读出每个区域的真实包围盒。
- 把每处篝火放到其区域几何上；`depth_tier` 决定垂直高度，同区域多个篝火按椭圆散开。
- 输出 `src/data/region_anchors.json`，缓存各区域 AABB 供未来标记复用。

模型真实跨度约 ±1000 单位（x:-110..655、y:-378..229、z:-515..402），
而旧坐标全在 x:-22..55 的小范围内——这正是"点都错了"的原因。

## 重算电影位姿

`--poses` 为每处篝火生成位姿：相机沿 `(bonfire - MODEL_CENTER)` 从地图外侧
看向篝火（永不卡进几何），后退距离随区域大小缩放，使大区域带上下文而非糊一面墙。
`duration_seconds` 节奏保留人工设定。

## 标记缩放

篝火标记原本约 0.5 单位，是按旧的聚集坐标做的；放到 ~1000 单位的真实模型上后
小到看不见。`BonfireMarker` 增加 `MARKER_SCALE = 10`，使环 / 余烬 / 火花在
电影距离下清晰可辨。

## Matcap 着色

模型**没有纹理也没有 UV**（mesh 仅有 `POSITION` + `NORMAL`），无法常规贴图。
改用一张**程序化生成的黏土/石质 matcap**（球面法线查表，带主光/补光/高光/边缘光，
纯代码生成、无 UV、无外部素材、零版权问题），并按海拔色带染色以区分区域。
原本的平涂色块现在有了受光的立体感。

| Anor Londo | Firelink Shrine |
|---|---|
| ![Anor Londo](/devlog/matcap-anor-londo.png) | ![Firelink Shrine](/devlog/matcap-firelink.png) |
| **Blighttown** | **Duke's Archives** |
| ![Blighttown](/devlog/matcap-blighttown.png) | ![Duke's Archives](/devlog/matcap-dukes-archives.png) |

对比最明显的是 Anor Londo：原来是一片纯黄平地，matcap 之后大教堂的台阶、
立柱、扶壁都有了立体光影。

## 相关文件

- `scripts/place_bonfires_from_model.py`
- `src/data/region_anchors.json`、`src/data/bonfires.json`
- `src/scene/BonfireMarker.tsx`、`src/scene/LordranModel.tsx`
