#!/usr/bin/env python3
"""
Place bonfire world_position values directly onto the glTF model's real geometry.

Why this exists
---------------
The 9S Lordran glTF bakes each region's geometry into named mesh groups
("Firelink Shrine", "Anor Londo", ...). Those vertices already live in the SAME
coordinate space as `world_position` (the app renders the model with no extra
scale/offset; the anomalous per-region scale~=1301 node is reset to 1 in
LordranModel.tsx, and the two parent rotations cancel to identity). So instead of
fetching game-space cheat coords and fitting a game->model transform, we read each
region's true bounding box straight from the model and drop every bonfire onto it.

Outputs
-------
- src/data/region_anchors.json : per-region world-space AABB + centroid (reusable
  for future NPC / item / event markers).
- rewrites world_position in src/data/bonfires.json (run with --write).

Usage
-----
    python3 scripts/place_bonfires_from_model.py          # dry run, prints diff
    python3 scripts/place_bonfires_from_model.py --write   # apply to bonfires.json
"""
import json, math, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GLTF = os.path.join(ROOT, "dark_souls_map", "scene.gltf")
BONFIRES = os.path.join(ROOT, "src", "data", "bonfires.json")
ANCHORS = os.path.join(ROOT, "src", "data", "region_anchors.json")

# ---------------------------------------------------------------- gltf math ---
def mat_from_node(n):
    if "matrix" in n:
        m = n["matrix"]  # column-major
        return [[m[c * 4 + r] for c in range(4)] for r in range(4)]
    t = n.get("translation", [0, 0, 0])
    x, y, z, w = n.get("rotation", [0, 0, 0, 1])
    s = n.get("scale", [1, 1, 1])
    R = [[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
         [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
         [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]]
    M = [[R[i][j] * s[j] for j in range(3)] + [t[i]] for i in range(3)]
    M.append([0, 0, 0, 1])
    return M

def reset_scale(M):
    """Mirror LordranModel.tsx: if a node's scale is anomalous (>10 or <0.01),
    three.js sets scale to (1,1,1) -> normalize the rotation columns."""
    sx = math.sqrt(sum(M[r][0] ** 2 for r in range(3)))
    if sx > 10 or (0 < sx < 0.01):
        out = [row[:] for row in M]
        for c in range(3):
            nrm = math.sqrt(sum(M[r][c] ** 2 for r in range(3))) or 1.0
            for r in range(3):
                out[r][c] = M[r][c] / nrm
        return out
    return M

def matmul(A, B):
    return [[sum(A[i][k] * B[k][j] for k in range(4)) for j in range(4)] for i in range(4)]

def apply(M, v):
    h = [v[0], v[1], v[2], 1]
    return [sum(M[i][k] * h[k] for k in range(4)) for i in range(3)]

def extract_regions():
    g = json.load(open(GLTF))
    nodes, meshes, acc = g["nodes"], g["meshes"], g["accessors"]
    parent = {}
    for i, n in enumerate(nodes):
        for c in n.get("children", []):
            parent[c] = i
    root_children = set(nodes[2]["children"])

    def world_mat(idx):
        chain = []
        cur = idx
        while True:
            chain.append(cur)
            if cur in parent:
                cur = parent[cur]
            else:
                break
        chain.reverse()
        M = [[1 if i == j else 0 for j in range(4)] for i in range(4)]
        for c in chain:
            M = matmul(M, reset_scale(mat_from_node(nodes[c])))
        return M

    def region_group(idx):
        cur = idx
        while cur in parent:
            if cur in root_children:
                return cur
            cur = parent[cur]
        return idx

    regions = {}
    for i, n in enumerate(nodes):
        if "mesh" not in n:
            continue
        name = nodes[region_group(i)].get("name")
        M = world_mat(i)
        for prim in meshes[n["mesh"]]["primitives"]:
            a = acc[prim["attributes"]["POSITION"]]
            mn, mx = a["min"], a["max"]
            for k in range(8):
                cor = [mn[0] if k & 1 else mx[0],
                       mn[1] if k & 2 else mx[1],
                       mn[2] if k & 4 else mx[2]]
                w = apply(M, cor)
                b = regions.setdefault(name, [list(w), list(w)])
                for d in range(3):
                    b[0][d] = min(b[0][d], w[d])
                    b[1][d] = max(b[1][d], w[d])
    out = {}
    for reg, (mn, mx) in regions.items():
        out[reg] = {
            "center": [round((mn[d] + mx[d]) / 2, 2) for d in range(3)],
            "min": [round(v, 2) for v in mn],
            "max": [round(v, 2) for v in mx],
        }
    return out

# ------------------------------------------------------- bonfire -> region ---
# Each bonfire is assigned the glTF region whose geometry contains it.
REGION = {
    "firelink_shrine": "Firelink Shrine",
    "undead_burg": "Undead Burg",
    "undead_parish": "Undead Burg",
    "sunlight_altar": "Undead Burg",
    "lower_undead_burg": "Undead Burg",
    "darkroot_garden": "Darkroot Garden and Basin",
    "darkroot_basin": "Darkroot Garden and Basin",
    "depths": "Depths",
    "blighttown": "Blighttown",
    "quelaags_domain": "Blighttown",
    "sens_fortress": "Sen's Fortress",
    "anor_londo": "Anor Londo",
    "anor_londo_cathedral": "Anor Londo",
    "painted_world": "Anor Londo",
    "dukes_archives": "Duke's Archive and Crystal Caves",
    "crystal_cave": "Duke's Archive and Crystal Caves",
    "catacombs": "Catacombs",
    "tomb_of_giants": "Tomb of the Giants",
    "new_londo_ruins": "New Londo Ruins and Valley of Drakes",
    "valley_of_drakes": "New Londo Ruins and Valley of Drakes",
    "the_abyss": "New Londo Ruins and Valley of Drakes",
    "demon_ruins": "Demon Ruins and Lost Izalith",
    "lost_izalith": "Demon Ruins and Lost Izalith",
    "daughter_of_chaos": "Demon Ruins and Lost Izalith",
    "ash_lake": "Ash Lake",
    "kiln_of_the_first_flame": "Kiln of the first Flame",
    # great_hollow has no dedicated mesh (it is the tunnel between Blighttown and
    # Ash Lake) -> handled by INTERPOLATE below.
}

# Bonfires with no dedicated geometry: place at a weighted point between regions.
# weight = fraction toward region B.
INTERPOLATE = {
    "great_hollow": ("Blighttown", "Ash Lake", 0.6),
}

def place(regions, bonfires):
    # group bonfires by region (preserving order)
    groups = {}
    for b in bonfires:
        reg = REGION.get(b["id"])
        if reg:
            groups.setdefault(reg, []).append(b)

    pos = {}
    for reg, members in groups.items():
        box = regions[reg]
        cx, cy, cz = box["center"]
        hx = (box["max"][0] - box["min"][0]) / 2
        hy = (box["max"][1] - box["min"][1]) / 2
        hz = (box["max"][2] - box["min"][2]) / 2
        n = len(members)
        members = sorted(members, key=lambda b: b["order"])
        depths = [b["depth_tier"] for b in members]
        dmin, dmax = min(depths), max(depths)
        for i, b in enumerate(members):
            if n == 1:
                x, z = cx, cz
            else:
                # spread on an ellipse inside the region footprint, avoids overlap
                ang = 2 * math.pi * i / n
                x = cx + math.cos(ang) * 0.45 * hx
                z = cz + math.sin(ang) * 0.45 * hz
            if dmax > dmin:
                # higher depth_tier -> higher in the region's vertical extent
                fy = (b["depth_tier"] - dmin) / (dmax - dmin) - 0.5
                y = cy + fy * 0.7 * hy
            else:
                y = cy
            pos[b["id"]] = [round(x, 1), round(y, 1), round(z, 1)]

    for bid, (ra, rb, w) in INTERPOLATE.items():
        ca, cb = regions[ra]["center"], regions[rb]["center"]
        pos[bid] = [round(ca[d] * (1 - w) + cb[d] * w, 1) for d in range(3)]

    return pos

# ---------------------------------------------------------- cinematic pose ---
# Depths centroid == OrbitControls target in the app; use it as the map's core.
MODEL_CENTER = [13.81, -90.32, -155.34]

def region_span(box):
    return max(box["max"][d] - box["min"][d] for d in range(3))

def view_distance(regions, bid):
    """Pull-back distance scales with region size so big regions (Anor Londo,
    Duke's) get framed with context instead of a flat wall filling the view."""
    if bid in INTERPOLATE:
        ra, rb, _ = INTERPOLATE[bid]
        span = (region_span(regions[ra]) + region_span(regions[rb])) / 2
    else:
        span = region_span(regions[REGION[bid]])
    return max(110.0, min(0.55 * span, 260.0))

def make_pose(p, dist):
    """Frame a bonfire from outside the map looking inward: pull the camera back
    along (bonfire - MODEL_CENTER) so it never sits inside geometry, then lift."""
    dx = [p[i] - MODEL_CENTER[i] for i in range(3)]
    d = math.sqrt(sum(v * v for v in dx))
    direction = [v / d for v in dx] if d > 1e-3 else [0.0, 0.3, -1.0]
    cam = [p[i] + direction[i] * dist for i in range(3)]
    cam[1] += 0.3 * dist
    return [round(v, 1) for v in cam], [round(v, 1) for v in p]

# ----------------------------------------------------------------- main ------
def main():
    write = "--write" in sys.argv
    poses = "--poses" in sys.argv
    regions = extract_regions()
    json.dump(regions, open(ANCHORS, "w"), ensure_ascii=False, indent=2)
    print(f"wrote {ANCHORS} ({len(regions)} regions)\n")

    bonfires = json.load(open(BONFIRES))
    new_pos = place(regions, bonfires)

    missing = [b["id"] for b in bonfires if b["id"] not in new_pos]
    if missing:
        print("!! no placement for:", missing)

    print(f"{'bonfire':26s} {'old':>22s}  ->  {'new (model space)':>22s}")
    print("-" * 78)
    for b in sorted(bonfires, key=lambda b: b["order"]):
        old = b["world_position"]
        new = new_pos.get(b["id"], old)
        fo = "[" + ",".join(f"{v:6.1f}" for v in old) + "]"
        fn = "[" + ",".join(f"{v:6.1f}" for v in new) + "]"
        print(f"{b['id']:26s} {fo:>22s}  ->  {fn:>22s}")
        if write:
            b["world_position"] = new
        if poses:
            cam, look = make_pose(new, view_distance(regions, b["id"]))
            b["cinematic_pose"]["camera_position"] = cam
            b["cinematic_pose"]["look_at"] = look
            # duration_seconds (pacing) is preserved as-authored

    if poses:
        print("\n-- regenerated cinematic_pose (camera looks inward at each fire) --")
        for b in sorted(bonfires, key=lambda b: b["order"]):
            cam = b["cinematic_pose"]["camera_position"]
            print(f"{b['id']:26s} cam={cam}  look={b['cinematic_pose']['look_at']}")

    if write:
        with open(BONFIRES, "w") as f:
            json.dump(bonfires, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"\n✅ wrote {BONFIRES}")
    else:
        print("\n(dry run — pass --write to apply)")

if __name__ == "__main__":
    main()
