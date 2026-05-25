import { WhamoNode, WhamoEdge } from './store';

// ─── Layout constants ─────────────────────────────────────────────────────────
const R   = 9;                       // circle node radius
const RRW = 42; const RRH = 26;      // reservoir / flowBoundary (w × h)
const STW = 20; const STH = 32;      // surgeTank (w × h)
const SX  = 190;                     // column pitch (px)
const SY  = 155;                     // row pitch base per leaf-unit (px)
const MG  = 85;                      // canvas margin

// ─── Bright colours per type ──────────────────────────────────────────────────
const COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  reservoir:    { fill: '#2196F3', stroke: '#1565C0', text: '#fff' },
  surgeTank:    { fill: '#FF6D00', stroke: '#BF360C', text: '#fff' },
  flowBoundary: { fill: '#9C27B0', stroke: '#6A1B9A', text: '#fff' },
  node:         { fill: '#90A4AE', stroke: '#546E7A', text: '#fff' },
  junction:     { fill: '#F44336', stroke: '#B71C1C', text: '#fff' },
  pump:         { fill: '#00BCD4', stroke: '#006064', text: '#fff' },
  checkValve:   { fill: '#37474F', stroke: '#102027', text: '#fff' },
  turbine:      { fill: '#FF5722', stroke: '#BF360C', text: '#fff' },
};
function col(t: string) { return COLORS[t] ?? COLORS.node; }

// Connection-point half-extents
function nHW(t: string) {
  if (t === 'reservoir' || t === 'flowBoundary') return RRW / 2;
  if (t === 'surgeTank') return STW / 2;
  return R;
}
function nHH(t: string) {
  if (t === 'surgeTank') return STH / 2;
  if (t === 'reservoir' || t === 'flowBoundary') return RRH / 2;
  return R;
}

function esc(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Node shape ────────────────────────────────────────────────────────────────
function renderNode(type: string, x: number, y: number, label: string, srcId: string, srcType: string): string {
  const hh = nHH(type);
  const hw = nHW(type);
  const c  = col(type);

  let shape = '';
  let lbl   = '';

  if (type === 'reservoir' || type === 'flowBoundary') {
    shape = `<rect x="${x - hw}" y="${y - hh}" width="${hw * 2}" height="${hh * 2}" rx="5"
      fill="${c.fill}" stroke="${c.stroke}" stroke-width="2"/>`;
    lbl = `<text class="lbl" x="${x}" y="${y + 4}" text-anchor="middle" font-size="11"
      font-weight="700" fill="${c.text}" font-family="Arial,sans-serif">${esc(label)}</text>`;
  } else if (type === 'surgeTank') {
    shape = `<rect x="${x - hw}" y="${y - hh}" width="${hw * 2}" height="${hh * 2}" rx="4"
      fill="${c.fill}" stroke="${c.stroke}" stroke-width="2"/>
      <line x1="${x - hw + 2}" y1="${y - hh + 10}" x2="${x + hw - 2}" y2="${y - hh + 10}"
        stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/>`;
    lbl = `<text class="lbl" x="${x}" y="${y - hh - 8}" text-anchor="middle" font-size="11"
      font-weight="600" fill="#111" font-family="Arial,sans-serif">${esc(label)}</text>`;
  } else {
    shape = `<circle cx="${x}" cy="${y}" r="${R}"
      fill="${c.fill}" stroke="${c.stroke}" stroke-width="2"/>`;
    lbl = `<text class="lbl" x="${x}" y="${y - R - 7}" text-anchor="middle" font-size="11"
      font-weight="600" fill="#111" font-family="Arial,sans-serif">${esc(label)}</text>`;
  }

  return `<g class="ng" data-srcid="${esc(srcId)}" data-srctype="${esc(srcType)}" style="cursor:pointer">
  ${shape}
  ${lbl}
</g>`;
}

// ─── Get the canvas y-position for any node (real or virtual inline element) ──
function getCanvasY(
  id: string,
  srcType: string,
  srcId: string,
  nodes: WhamoNode[],
  edges: WhamoEdge[],
): number {
  if (srcType === 'node') {
    const n = nodes.find(n => n.id === srcId);
    return n?.position.y ?? 0;
  }
  // Virtual node (inline pump / checkValve / turbine) — midpoint of its edge endpoints
  const e = edges.find(e => e.id === srcId);
  if (!e) return 0;
  const src = nodes.find(n => n.id === e.source);
  const tgt = nodes.find(n => n.id === e.target);
  return ((src?.position.y ?? 0) + (tgt?.position.y ?? 0)) / 2;
}

// ─── Get the canvas x-position for any node (real or virtual inline element) ──
function getCanvasX(
  id: string,
  srcType: string,
  srcId: string,
  nodes: WhamoNode[],
  edges: WhamoEdge[],
): number {
  if (srcType === 'node') {
    const n = nodes.find(n => n.id === srcId);
    return n?.position.x ?? 0;
  }
  const e = edges.find(e => e.id === srcId);
  if (!e) return 0;
  const src = nodes.find(n => n.id === e.source);
  const tgt = nodes.find(n => n.id === e.target);
  return ((src?.position.x ?? 0) + (tgt?.position.x ?? 0)) / 2;
}

// ─── Main export ─────────────────────────────────────────────────────────────
export function generateSystemDiagramSVG(
  nodes: WhamoNode[],
  edges: WhamoEdge[],
  options: { showLabels: boolean } = { showLabels: true }
): string {
  const { showLabels } = options;

  type VN = { id: string; type: string; label: string; srcId: string; srcType: string };
  type VE = { from: string; to: string; label: string; isDummy: boolean; srcEdgeId: string };

  // ── Build virtual graph ────────────────────────────────────────────────────
  // Edge-based elements (pump/checkValve/turbine) become inline virtual nodes.
  const vns: VN[] = nodes.map(n => ({
    id:      n.id,
    type:    n.type || 'node',
    label:   String(n.data?.label ?? ''),
    srcId:   n.id,
    srcType: 'node',
  }));

  const ves: VE[] = [];

  edges.forEach(e => {
    const etype   = String(e.data?.type ?? '');
    const isElem  = etype === 'pump' || etype === 'checkValve' || etype === 'turbine';
    const isDummy = etype === 'dummy';
    const elabel  = String(e.data?.label ?? '');

    if (isElem) {
      const vid = `__v_${e.id}`;
      vns.push({ id: vid, type: etype, label: elabel, srcId: e.id, srcType: 'edge' });
      ves.push({ from: e.source, to: vid,      label: '',     isDummy: false, srcEdgeId: e.id });
      ves.push({ from: vid,      to: e.target, label: '',     isDummy: false, srcEdgeId: e.id });
    } else {
      ves.push({ from: e.source, to: e.target, label: elabel, isDummy, srcEdgeId: e.id });
    }
  });

  if (vns.length === 0) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120">'
      + '<text x="200" y="65" text-anchor="middle" font-family="Arial,sans-serif"'
      + ' font-size="14" fill="#aaa">No elements to display</text></svg>';
  }

  const nm: Record<string, VN> = {};
  vns.forEach(n => { nm[n.id] = n; });

  // ── Adjacency + in-degree ──────────────────────────────────────────────────
  const adj:   Record<string, string[]> = {};
  const inDeg: Record<string, number>   = {};
  vns.forEach(n => { adj[n.id] = []; inDeg[n.id] = 0; });
  ves.forEach(e => {
    if (adj[e.from])   adj[e.from].push(e.to);
    if (e.to in inDeg) inDeg[e.to] = (inDeg[e.to] || 0) + 1;
  });

  // ── Topological sort (Kahn) ────────────────────────────────────────────────
  const inDegCopy = { ...inDeg };
  const topoQ: string[] = vns.filter(n => !inDegCopy[n.id]).map(n => n.id);
  const topoOrder: string[] = [];
  const visited = new Set<string>();
  while (topoQ.length > 0) {
    const u = topoQ.shift()!;
    if (visited.has(u)) continue;
    visited.add(u);
    topoOrder.push(u);
    for (const v of (adj[u] || [])) {
      inDegCopy[v] = (inDegCopy[v] || 1) - 1;
      if (inDegCopy[v] <= 0) topoQ.push(v);
    }
  }
  vns.forEach(n => { if (!visited.has(n.id)) topoOrder.push(n.id); });

  // ── Longest-path DP → column index ────────────────────────────────────────
  const lvl: Record<string, number> = {};
  vns.forEach(n => { lvl[n.id] = 0; });
  for (const u of topoOrder) {
    for (const v of (adj[u] || [])) {
      const proposed = (lvl[u] ?? 0) + 1;
      if ((lvl[v] ?? 0) < proposed) lvl[v] = proposed;
    }
  }

  // ── Detect LATERAL nodes ───────────────────────────────────────────────────
  // A "lateral" node is a surge tank (and ONLY a surge tank) that:
  //   • has in-degree 0 (nothing flows into it from the network)
  //   • connects into a mid-network node (its single neighbor has level > 0)
  // Reservoirs and flow boundaries are ALWAYS primary sources — never lateral.
  // Lateral nodes are pulled out of the main horizontal column layout and
  // placed vertically (above/below) their anchor node instead.
  const lateralSet    = new Set<string>();
  const lateralAnchor: Record<string, string> = {};

  vns.forEach(n => {
    if (n.type !== 'surgeTank') return;           // ONLY surge tanks can be lateral
    if ((inDeg[n.id] ?? 0) !== 0) return;         // must have no incoming flow
    const neighbors = adj[n.id] || [];
    if (neighbors.length !== 1) return;            // must connect to exactly one node
    const anchorId = neighbors[0];
    if ((lvl[anchorId] ?? 0) > 0) {               // anchor is mid-network
      lateralSet.add(n.id);
      lateralAnchor[n.id] = anchorId;
    }
  });

  // ── Group non-lateral nodes by column level ────────────────────────────────
  const byLv: Record<number, string[]> = {};
  vns.forEach(n => {
    if (lateralSet.has(n.id)) return;
    const l = lvl[n.id] ?? 0;
    if (!byLv[l]) byLv[l] = [];
    byLv[l].push(n.id);
  });

  // ── Sort each column by CANVAS y-position ─────────────────────────────────
  Object.values(byLv).forEach(ids => {
    ids.sort((a, b) => {
      const vna = nm[a];
      const vnb = nm[b];
      const ay  = getCanvasY(a, vna.srcType, vna.srcId, nodes, edges);
      const by2 = getCanvasY(b, vnb.srcType, vnb.srcId, nodes, edges);
      return ay - by2;
    });
  });

  // ── Group laterals by anchor, separate above/below using canvas Y ──────────
  // Must be done BEFORE leafSpan so we can boost anchor spans accordingly.
  const lateralsByAnchor: Record<string, { above: string[]; below: string[] }> = {};
  lateralSet.forEach(id => {
    const ancId = lateralAnchor[id];
    if (!lateralsByAnchor[ancId]) lateralsByAnchor[ancId] = { above: [], below: [] };
    const vn  = nm[id];
    const an  = nm[ancId];
    const idy = getCanvasY(id,    vn.srcType, vn.srcId, nodes, edges);
    const acy = getCanvasY(ancId, an.srcType, an.srcId, nodes, edges);
    if (idy < acy) lateralsByAnchor[ancId].above.push(id);
    else            lateralsByAnchor[ancId].below.push(id);
  });

  // ── Subtree-aware leaf-span for proportional vertical spacing ─────────────
  // Nodes with stacked laterals claim extra span so their slot is tall enough
  // to fit all laterals without overlapping neighbour branches.
  const lateralBoost: Record<string, number> = {};
  Object.entries(lateralsByAnchor).forEach(([ancId, { above, below }]) => {
    const extra = Math.max(above.length, below.length);
    if (extra > 1) lateralBoost[ancId] = extra - 1; // extra leaf-units needed
  });

  const leafSpan: Record<string, number> = {};
  const computeLeafSpan = (id: string, visiting = new Set<string>()): number => {
    if (id in leafSpan) return leafSpan[id];
    if (visiting.has(id)) { leafSpan[id] = 1; return 1; }
    visiting.add(id);
    const children = (adj[id] || []).filter(c => !lateralSet.has(c));
    let span = children.length === 0
      ? 1
      : children.reduce((s, c) => s + computeLeafSpan(c, visiting), 0);
    // Boost span if this node hosts multiple stacked laterals
    span = Math.max(span, span + (lateralBoost[id] ?? 0));
    leafSpan[id] = span;
    return span;
  };
  vns.forEach(n => computeLeafSpan(n.id));

  // ── Compute SVG dimensions ─────────────────────────────────────────────────
  const nLevels = Math.max(...Object.keys(byLv).map(Number)) + 1;

  // Total span from all level-0 roots determines the full diagram height
  const rootIds   = byLv[0] || [];
  const totalSpan = rootIds.reduce((s, id) => s + Math.max(1, leafSpan[id] ?? 1), 0);
  const totalH    = Math.max(totalSpan - 1, 0) * SY;

  // Find tallest above/below lateral stack per anchor for padding
  let maxAboveStack = 0;
  let maxBelowStack = 0;
  Object.values(lateralsByAnchor).forEach(({ above, below }) => {
    maxAboveStack = Math.max(maxAboveStack, above.length);
    maxBelowStack = Math.max(maxBelowStack, below.length);
  });
  const topPad    = maxAboveStack > 0 ? maxAboveStack * SY + 40 : 0;
  const bottomPad = maxBelowStack > 0 ? maxBelowStack * SY + 40 : 0;

  const svgW = MG * 2 + (nLevels - 1) * SX + RRW + 80;
  const svgH = Math.max(260, topPad + bottomPad + MG * 2 + totalH + STH + 60);

  // ── Assign 2-D positions (subtree-aware) ──────────────────────────────────
  const pos: Record<string, { x: number; y: number }> = {};
  const mainCentreY = topPad + MG + (svgH - topPad - bottomPad - MG * 2) / 2;

  // Each node is centred within its proportional leaf-span slot
  const placeColumn = (ids: string[], cx: number, startY: number) => {
    let curY = startY;
    ids.forEach(id => {
      const sp    = Math.max(1, leafSpan[id] ?? 1);
      const slotH = (sp - 1) * SY;
      pos[id] = { x: cx, y: curY + slotH / 2 };
      curY += sp * SY;
    });
  };

  Object.entries(byLv).forEach(([lStr, ids]) => {
    const l       = parseInt(lStr);
    const cx      = MG + l * SX;
    const colSpan = ids.reduce((s, id) => s + Math.max(1, leafSpan[id] ?? 1), 0);
    const colH    = Math.max(colSpan - 1, 0) * SY;
    const startY  = mainCentreY - colH / 2;
    placeColumn(ids, cx, startY);
  });

  // ── Place lateral nodes — stack multiples so none overlap ─────────────────
  // For each anchor, above-laterals stack upward 1×SY, 2×SY, …
  // and below-laterals stack downward 1×SY, 2×SY, …
  lateralSet.forEach(id => {
    const ancId = lateralAnchor[id];
    const ap    = pos[ancId];
    if (!ap) return;

    const { above, below } = lateralsByAnchor[ancId] ?? { above: [], below: [] };
    const aboveIdx = above.indexOf(id);
    const belowIdx = below.indexOf(id);

    if (aboveIdx >= 0) {
      // Stack upward: first lateral 1×SY above anchor, second 2×SY, etc.
      pos[id] = { x: ap.x, y: ap.y - (aboveIdx + 1) * SY };
    } else {
      pos[id] = { x: ap.x, y: ap.y + (belowIdx + 1) * SY };
    }
  });

  // ── Detect parallel edges ──────────────────────────────────────────────────
  const pairCount: Record<string, number> = {};
  const pairIndex: Record<string, number> = {};
  ves.forEach(ve => {
    const k = `${ve.from}→${ve.to}`;
    pairIndex[k] = (pairIndex[k] ?? -1) + 1;
    (ve as any)['_idx'] = pairIndex[k];
    pairCount[k] = (pairCount[k] ?? 0) + 1;
  });

  // ── SVG header ────────────────────────────────────────────────────────────
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}"
  viewBox="0 0 ${svgW} ${svgH}" style="background:white;font-family:Arial,sans-serif">
<defs>
  <marker id="arr" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
    <polygon points="0 0, 9 3.5, 0 7" fill="#555"/>
  </marker>
</defs>
<style>
  .ng { cursor: pointer; }
  .cg { cursor: pointer; }
</style>
`;

  // ── Draw edges (under nodes) ───────────────────────────────────────────────
  ves.forEach(ve => {
    const p1 = pos[ve.from];
    const p2 = pos[ve.to];
    if (!p1 || !p2) return;

    const t1 = nm[ve.from]?.type || 'node';
    const t2 = nm[ve.to]?.type   || 'node';

    const isFromLateral = lateralSet.has(ve.from);
    const isToLateral   = lateralSet.has(ve.to);

    // ── Vertical edge for lateral connections (e.g. surge tank → junction) ──
    if (isFromLateral || isToLateral) {
      // Determine which end is the lateral and which is the anchor
      const lateralId  = isFromLateral ? ve.from : ve.to;
      const anchorId   = isFromLateral ? ve.to   : ve.from;
      const lp = pos[lateralId];
      const ap = pos[anchorId];
      if (!lp || !ap) return;
      const lt = nm[lateralId]?.type || 'node';
      const at = nm[anchorId]?.type  || 'node';

      // Connect bottom of upper node to top of lower node
      const [upper, lower, ut, at2] = lp.y < ap.y
        ? [lp, ap, lt, at]
        : [ap, lp, at, lt];

      const x1 = upper.x;
      const y1 = upper.y + nHH(ut);
      const x2 = lower.x;
      const y2 = lower.y - nHH(at2);
      const d  = `M${x1} ${y1} L${x2} ${y2}`;

      svg += `<path d="${d}" stroke="#555" stroke-width="1.5" fill="none" marker-end="url(#arr)"/>\n`;

      if (ve.label) {
        const lx = x1;
        const ly = (y1 + y2) / 2;
        const lw = ve.label.length * 7 + 16;
        const lh = 14;
        svg += `<g class="cg" data-srcid="${esc(ve.srcEdgeId)}" data-srctype="edge" style="pointer-events:all;cursor:pointer">
  <rect class="lbl" x="${lx - lw/2}" y="${ly - lh/2}" width="${lw}" height="${lh}"
    rx="7" fill="white" stroke="#888" stroke-width="1"/>
  <text class="lbl" x="${lx}" y="${ly + 4.5}" text-anchor="middle" font-size="9"
    font-weight="700" fill="#333" font-family="Arial,sans-serif">${esc(ve.label)}</text>
</g>\n`;
      }
      return;
    }

    // ── Standard horizontal / elbow edge ─────────────────────────────────────
    const k     = `${ve.from}→${ve.to}`;
    const total = pairCount[k] || 1;
    const idx   = (ve as any)['_idx'] as number ?? 0;
    const vOff  = total > 1 ? (idx - (total - 1) / 2) * 12 : 0;

    const x1 = p1.x + nHW(t1);
    const y1 = p1.y + vOff;
    const x2 = p2.x - nHW(t2);
    const y2 = p2.y + vOff;

    const sty = ve.isDummy
      ? 'stroke="#ccc" stroke-width="1.5" stroke-dasharray="5,4"'
      : 'stroke="#555" stroke-width="1.5"';
    const mk = ve.isDummy ? '' : 'marker-end="url(#arr)"';

    let d: string;
    if (Math.abs(y1 - y2) < 3) {
      // Perfectly horizontal — straight line
      d = `M${x1} ${y1} L${x2} ${y2}`;
    } else {
      // Smooth cubic bezier S-curve: control points pull horizontally
      // so the line exits left-to-right and curves gracefully into the target row
      const cx1 = x1 + (x2 - x1) * 0.45;
      const cx2 = x2 - (x2 - x1) * 0.45;
      d = `M${x1} ${y1} C${cx1} ${y1} ${cx2} ${y2} ${x2} ${y2}`;
    }

    svg += `<path d="${d}" ${sty} fill="none" ${mk}/>\n`;

    if (ve.label) {
      const lx = Math.abs(y1 - y2) < 3
        ? (x1 + x2) / 2
        : x1 + (x2 - x1) * 0.25;
      const ly = y1;
      const lw = ve.label.length * 7 + 16;
      const lh = 14;
      svg += `<g class="cg" data-srcid="${esc(ve.srcEdgeId)}" data-srctype="edge" style="pointer-events:all;cursor:pointer">
  <rect class="lbl" x="${lx - lw/2}" y="${ly - lh/2}" width="${lw}" height="${lh}"
    rx="7" fill="white" stroke="#888" stroke-width="1"/>
  <text class="lbl" x="${lx}" y="${ly + 4.5}" text-anchor="middle" font-size="9"
    font-weight="700" fill="#333" font-family="Arial,sans-serif">${esc(ve.label)}</text>
</g>\n`;
    }
  });

  // ── Draw nodes (on top) ────────────────────────────────────────────────────
  vns.forEach(vn => {
    const p = pos[vn.id];
    if (!p) return;
    svg += renderNode(vn.type, p.x, p.y, vn.label, vn.srcId, vn.srcType);
  });

  const labelDisplay = showLabels ? '' : ' .lbl{display:none}';
  svg = svg.replace('<style>', `<style>${labelDisplay}`);
  svg += '</svg>';
  return svg;
}

export const generateSystemDiagram = generateSystemDiagramSVG;
