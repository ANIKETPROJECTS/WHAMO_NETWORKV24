import { WhamoNode, WhamoEdge } from './store';

// ─── Layout constants ─────────────────────────────────────────────────────────
const R = 8;                        // small circle radius (node, junction, pump, etc.)
const RRW = 40; const RRH = 24;     // reservoir / flowBoundary rect (w × h)
const STW = 18; const STH = 30;     // surgeTank rect (w × h)
const SX = 145;                     // column pitch
const SY = 90;                      // row pitch
const MG = 80;                      // canvas margin

// ─── Per-type colours ─────────────────────────────────────────────────────────
const COLORS: Record<string, { fill: string; stroke: string; label: string }> = {
  reservoir:    { fill: '#3498db', stroke: '#2166aa', label: '#fff'    },
  surgeTank:    { fill: '#e67e22', stroke: '#b85c00', label: '#fff'    },
  flowBoundary: { fill: '#8e44ad', stroke: '#6c3483', label: '#fff'    },
  node:         { fill: '#cfd8dc', stroke: '#78909c', label: '#1a1a2e' },
  junction:     { fill: '#e74c3c', stroke: '#a93226', label: '#fff'    },
  pump:         { fill: '#1abc9c', stroke: '#148f77', label: '#fff'    },
  checkValve:   { fill: '#2c3e50', stroke: '#1a252f', label: '#fff'    },
  turbine:      { fill: '#d35400', stroke: '#9a3a00', label: '#fff'    },
};

function c(t: string) { return COLORS[t] ?? COLORS.node; }

// Connection half-widths for routing lines to/from shape edges
function nHW(t: string): number {
  if (t === 'reservoir' || t === 'flowBoundary') return RRW / 2;
  if (t === 'surgeTank') return STW / 2;
  return R;
}
function nHH(t: string): number {
  if (t === 'surgeTank') return STH / 2;
  if (t === 'reservoir' || t === 'flowBoundary') return RRH / 2;
  return R;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Tooltip helper ───────────────────────────────────────────────────────────
function tooltip(x: number, y: number, hh: number, label: string, typeName: string): string {
  const line1 = escapeXml(label);
  const line2 = typeName;
  const tw = Math.max(line1.length, line2.length) * 7 + 20;
  const th = 36;
  const tx = x + nHW(typeName.toLowerCase()) + 6;
  const ty = y - th / 2;
  return `<g class="tip" style="visibility:hidden;pointer-events:none">
    <rect x="${tx}" y="${ty}" width="${tw}" height="${th}" rx="5" fill="white" stroke="#aaa" stroke-width="1" filter="url(#sh)"/>
    <text x="${tx + 8}" y="${ty + 14}" font-size="10" font-weight="700" fill="#222" font-family="Arial,sans-serif">${line1}</text>
    <text x="${tx + 8}" y="${ty + 27}" font-size="9" fill="#666" font-family="Arial,sans-serif">${line2}</text>
  </g>`;
}

// ─── Node shape renderer ─────────────────────────────────────────────────────
function renderNode(type: string, x: number, y: number, label: string, showLabels: boolean): string {
  const hw = nHW(type);
  const hh = nHH(type);
  const col = c(type);

  // For rect types: label inside the rect; no label above
  // For circle types: label above the circle
  let shape = '';
  let labelEl = '';
  const typeName = type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1').trim();

  if (type === 'reservoir' || type === 'flowBoundary') {
    shape = `<rect x="${x - hw}" y="${y - hh}" width="${hw * 2}" height="${hh * 2}" rx="4"
      fill="${col.fill}" stroke="${col.stroke}" stroke-width="1.5"/>`;
    if (showLabels) {
      labelEl = `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="10" font-weight="700"
        fill="${col.label}" font-family="Arial,sans-serif">${escapeXml(label)}</text>`;
    }
  } else if (type === 'surgeTank') {
    shape = `<rect x="${x - hw}" y="${y - hh}" width="${hw * 2}" height="${hh * 2}" rx="3"
      fill="${col.fill}" stroke="${col.stroke}" stroke-width="1.5"/>
      <line x1="${x - hw + 2}" y1="${y - hh + 9}" x2="${x + hw - 2}" y2="${y - hh + 9}"
        stroke="white" stroke-width="1.5" opacity="0.8"/>`;
    if (showLabels) {
      labelEl = `<text x="${x}" y="${y - hh - 7}" text-anchor="middle" font-size="10" font-weight="600"
        fill="#444" font-family="Arial,sans-serif">${escapeXml(label)}</text>`;
    }
  } else {
    // All circle types: small filled dot
    shape = `<circle cx="${x}" cy="${y}" r="${R}" fill="${col.fill}" stroke="${col.stroke}" stroke-width="1.5"/>`;
    if (showLabels) {
      labelEl = `<text x="${x}" y="${y - R - 6}" text-anchor="middle" font-size="10" font-weight="600"
        fill="#444" font-family="Arial,sans-serif">${escapeXml(label)}</text>`;
    }
  }

  const tip = tooltip(x, y, hh, label, typeName);

  return `<g class="ng" style="cursor:pointer">
  ${shape}
  ${labelEl}
  ${tip}
</g>`;
}

// ─── Main export ─────────────────────────────────────────────────────────────
export function generateSystemDiagramSVG(
  nodes: WhamoNode[],
  edges: WhamoEdge[],
  options: { showLabels: boolean } = { showLabels: true }
): string {
  const { showLabels } = options;

  type VN = { id: string; type: string; label: string };
  type VE = { from: string; to: string; label: string; isDummy: boolean };

  // Build virtual graph: edge-based pump/checkValve/turbine → virtual inline nodes
  const vns: VN[] = nodes.map(n => ({
    id: n.id,
    type: n.type || 'node',
    label: String(n.data?.label || ''),
  }));

  const ves: VE[] = [];

  edges.forEach(e => {
    const etype = String(e.data?.type || '');
    const isElem = etype === 'pump' || etype === 'checkValve' || etype === 'turbine';
    const isDummy = etype === 'dummy';
    const elabel = String(e.data?.label || '');

    if (isElem) {
      const vid = `__v_${e.id}`;
      vns.push({ id: vid, type: etype, label: elabel });
      ves.push({ from: e.source, to: vid, label: '', isDummy: false });
      ves.push({ from: vid, to: e.target, label: '', isDummy: false });
    } else {
      ves.push({ from: e.source, to: e.target, label: elabel, isDummy });
    }
  });

  if (vns.length === 0) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120">'
      + '<text x="200" y="65" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#aaa">No elements to display</text>'
      + '</svg>';
  }

  // ── BFS level assignment (longest-path for DAGs) ──────────────────────────
  const adj: Record<string, string[]> = {};
  const inDeg: Record<string, number> = {};
  vns.forEach(n => { adj[n.id] = []; inDeg[n.id] = 0; });
  ves.forEach(e => {
    if (adj[e.from]) adj[e.from].push(e.to);
    if (e.to in inDeg) inDeg[e.to] = (inDeg[e.to] || 0) + 1;
  });

  // Detect sources (no incoming edges) – if none, use the first node
  const sources = vns.filter(n => !inDeg[n.id]).map(n => n.id);
  const lvl: Record<string, number> = {};
  (sources.length > 0 ? sources : [vns[0].id]).forEach(s => { lvl[s] = 0; });

  // Iterative longest-path BFS: ensure each node's level is beyond all predecessors
  const visited = new Set<string>();
  const queue = sources.length > 0 ? [...sources] : [vns[0].id];
  while (queue.length > 0) {
    const u = queue.shift()!;
    if (visited.has(u)) continue;
    visited.add(u);
    for (const v of (adj[u] || [])) {
      const newLvl = (lvl[u] ?? 0) + 1;
      if (lvl[v] === undefined || lvl[v] < newLvl) {
        lvl[v] = newLvl;
        queue.push(v);
      }
    }
  }
  // Assign level 0 to any orphan nodes
  vns.forEach(n => { if (lvl[n.id] === undefined) lvl[n.id] = 0; });

  // ── Group by level, assign positions ─────────────────────────────────────
  const byLv: Record<number, string[]> = {};
  vns.forEach(n => {
    const l = lvl[n.id];
    if (!byLv[l]) byLv[l] = [];
    byLv[l].push(n.id);
  });

  const nLevels = Math.max(...Object.keys(byLv).map(Number)) + 1;
  const maxPerLevel = Math.max(...Object.values(byLv).map(a => a.length));

  // Extra height for labels above circles (R + 14) and below rects (14)
  const labelPad = 28;
  const svgW = MG * 2 + (nLevels - 1) * SX + RRW + 80;
  const svgH = Math.max(240, MG * 2 + (maxPerLevel - 1) * SY + STH + labelPad + 40);

  const pos: Record<string, { x: number; y: number }> = {};
  Object.entries(byLv).forEach(([lStr, ids]) => {
    const l = parseInt(lStr);
    const cx = MG + l * SX;
    const totalH = (ids.length - 1) * SY;
    const startY = svgH / 2 - totalH / 2;
    ids.forEach((id, i) => {
      pos[id] = { x: cx, y: startY + i * SY };
    });
  });

  const nm: Record<string, VN> = {};
  vns.forEach(n => { nm[n.id] = n; });

  // ── Render ───────────────────────────────────────────────────────────────
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}"
  viewBox="0 0 ${svgW} ${svgH}" style="background:white;font-family:Arial,sans-serif">
<defs>
  <marker id="arr" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
    <polygon points="0 0, 9 3.5, 0 7" fill="#555"/>
  </marker>
  <filter id="sh" x="-10%" y="-10%" width="120%" height="120%">
    <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="#0003"/>
  </filter>
</defs>
<style>
  .ng:hover .tip { visibility: visible !important; }
</style>
`;

  // ── Edges ─────────────────────────────────────────────────────────────────
  ves.forEach(ve => {
    const p1 = pos[ve.from];
    const p2 = pos[ve.to];
    if (!p1 || !p2) return;

    const t1 = nm[ve.from]?.type || 'node';
    const t2 = nm[ve.to]?.type || 'node';
    const x1 = p1.x + nHW(t1);
    const y1 = p1.y;
    const x2 = p2.x - nHW(t2);
    const y2 = p2.y;

    const sty = ve.isDummy
      ? 'stroke="#ccc" stroke-width="1.5" stroke-dasharray="5,4"'
      : 'stroke="#555" stroke-width="1.5"';
    const mk = ve.isDummy ? '' : 'marker-end="url(#arr)"';

    // Path: straight or elbow
    let d: string;
    if (Math.abs(y1 - y2) < 3) {
      d = `M${x1} ${y1} L${x2} ${y2}`;
    } else {
      const mx = x1 + (x2 - x1) * 0.5;
      d = `M${x1} ${y1} L${mx} ${y1} L${mx} ${y2} L${x2} ${y2}`;
    }

    svg += `<path d="${d}" ${sty} fill="none" ${mk}/>\n`;

    // Conduit label pill — centered on first horizontal segment
    if (showLabels && ve.label) {
      const lx = Math.abs(y1 - y2) < 3
        ? (x1 + x2) / 2
        : (x1 + x1 + (x2 - x1) * 0.5) / 2;  // midpoint of first horiz segment
      const ly = y1;
      const lw = ve.label.length * 7 + 14;
      svg += `<rect x="${lx - lw / 2}" y="${ly - 16}" width="${lw}" height="14" rx="7"
  fill="white" stroke="#aaa" stroke-width="1"/>\n`;
      svg += `<text x="${lx}" y="${ly - 6}" text-anchor="middle" font-size="9" font-weight="600"
  fill="#555" font-family="Arial,sans-serif">${escapeXml(ve.label)}</text>\n`;
    }
  });

  // ── Nodes (drawn last, on top of edges) ───────────────────────────────────
  vns.forEach(vn => {
    const p = pos[vn.id];
    if (!p) return;
    svg += renderNode(vn.type, p.x, p.y, vn.label, showLabels);
  });

  svg += '</svg>';
  return svg;
}

export const generateSystemDiagram = generateSystemDiagramSVG;
