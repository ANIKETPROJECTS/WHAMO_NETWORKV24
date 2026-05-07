import { WhamoNode, WhamoEdge, PcharType, TcharType } from './store';

interface ParsedTopology {
  elemLinks: Map<string, { from: string; to: string; type: 'link' }>;
  elemAt: Map<string, string>;
  junctions: Set<string>;
  nodeElevations: Map<string, number>;
}

interface ParsedElements {
  reservoirs: Map<string, { elevation: number; mode: string; hScheduleNumber?: number }>;
  conduits: Map<string, {
    length: number; diameter: number; celerity: number; friction: number;
    numseg?: number; hasAddedLoss?: boolean; cplus?: number; cminus?: number;
    variable?: boolean; distance?: number; area?: number; d?: number; a?: number;
  }>;
  pumps: Map<string, { pumpType: number; rq: number; rhead: number; rspeed: number; rtorque: number; wr2: number }>;
  turbines: Map<string, { turbineType: number; syncSpeed: number; wr2: number; turbFriction: number; windage: number }>;
  oneway: Map<string, { diam: number }>;
  oppumps: Set<string>;
  opturbs: Map<string, { mode: string; vScheduleNumber?: number }>;
  pchar: Map<number, PcharType>;
  tchar: Map<number, TcharType>;
  vSchedules: Map<number, { t: number; g: number }[]>;
}

function joinContinuationLines(lines: string[]): string[] {
  const joined: string[] = [];
  let buf = '';
  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('C ') || trimmed.startsWith('c ') || trimmed === 'C' || trimmed === 'c') {
      if (buf) { joined.push(buf); buf = ''; }
      continue;
    }
    if (buf) {
      buf += ' ' + trimmed;
    } else {
      buf = trimmed;
    }
    if (/\bFINISH\b/i.test(trimmed)) {
      joined.push(buf);
      buf = '';
    }
  }
  if (buf) joined.push(buf);
  return joined;
}

function parseSystemSection(lines: string[]): ParsedTopology {
  const elemLinks = new Map<string, { from: string; to: string; type: 'link' }>();
  const elemAt = new Map<string, string>();
  const junctions = new Set<string>();
  const nodeElevations = new Map<string, number>();

  for (const line of lines) {
    const upper = line.trim().toUpperCase();
    if (!upper) continue;

    const elemLinkMatch = line.match(/^ELEM\s+(\S+)\s+LINK\s+(\S+)\s+(\S+)/i);
    if (elemLinkMatch) {
      const [, id, from, to] = elemLinkMatch;
      if (!elemLinks.has(id)) {
        elemLinks.set(id, { from, to, type: 'link' });
      }
      continue;
    }

    const elemAtMatch = line.match(/^ELEM\s+(\S+)\s+AT\s+(\S+)/i);
    if (elemAtMatch) {
      const [, id, nodeId] = elemAtMatch;
      elemAt.set(id, nodeId);
      continue;
    }

    const junctionMatch = line.match(/^JUNCTION\s+AT\s+(\S+)/i);
    if (junctionMatch) {
      junctions.add(junctionMatch[1]);
      continue;
    }

    const nodeMatch = line.match(/^NODE\s+(\S+)\s+ELEV\s+([\-\d.]+)/i);
    if (nodeMatch) {
      nodeElevations.set(nodeMatch[1], parseFloat(nodeMatch[2]));
      continue;
    }
  }

  return { elemLinks, elemAt, junctions, nodeElevations };
}

function parseFloat2(s: string | undefined): number {
  if (!s) return 0;
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function parseElementProperties(lines: string[]): ParsedElements {
  const reservoirs = new Map<string, { elevation: number; mode: string; hScheduleNumber?: number }>();
  const conduits = new Map<string, any>();
  const pumps = new Map<string, any>();
  const turbines = new Map<string, any>();
  const oneway = new Map<string, { diam: number }>();
  const oppumps = new Set<string>();
  const opturbs = new Map<string, { mode: string; vScheduleNumber?: number }>();
  const pchar = new Map<number, PcharType>();
  const tchar = new Map<number, TcharType>();
  const vSchedules = new Map<number, { t: number; g: number }[]>();

  const joined = joinContinuationLines(lines);

  let inPchar = false;
  let pcharType = 0;
  let pcharSection: 'none' | 'sratio' | 'qratio' | 'hratio' | 'tratio' = 'none';
  let pcharBuf: { sratio: number[]; qratio: number[]; hratio: number[][]; tratio: number[] } = {
    sratio: [], qratio: [], hratio: [], tratio: []
  };
  let hratioRow: number[] = [];

  let inTchar = false;
  let tcharType = 0;
  let tcharSection: 'none' | 'gate' | 'head' | 'qmatrix' | 'efficiency' = 'none';
  let tcharBuf: { gate: number[]; head: number[]; qMatrix: number[][]; effMatrix: number[][] } = {
    gate: [], head: [], qMatrix: [], effMatrix: []
  };

  const flushTchar = () => {
    if (tcharType > 0 && tcharBuf.gate.length > 0) {
      tchar.set(tcharType, {
        gate: [...tcharBuf.gate],
        head: [...tcharBuf.head],
        qMatrix: tcharBuf.qMatrix.map(r => [...r]),
        effMatrix: tcharBuf.effMatrix.map(r => [...r]),
      });
    }
    tcharBuf = { gate: [], head: [], qMatrix: [], effMatrix: [] };
    tcharSection = 'none';
    inTchar = false;
    tcharType = 0;
  };

  const flushPchar = () => {
    if (hratioRow.length > 0) {
      pcharBuf.hratio.push([...hratioRow]);
      hratioRow = [];
    }
    if (pcharType > 0 && pcharBuf.sratio.length > 0) {
      pchar.set(pcharType, {
        sratio: [...pcharBuf.sratio],
        qratio: [...pcharBuf.qratio],
        hratio: pcharBuf.hratio.map(r => [...r]),
        tratio: [...pcharBuf.tratio]
      });
    }
    pcharBuf = { sratio: [], qratio: [], hratio: [], tratio: [] };
    hratioRow = [];
    pcharSection = 'none';
    inPchar = false;
    pcharType = 0;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const upper = trimmed.toUpperCase();

    if (inTchar) {
      if (/^FINISH\b/i.test(upper)) {
        flushTchar();
        continue;
      }
      if (/^TCHAR\s+TYPE\s+(\d+)/i.test(upper)) {
        flushTchar();
        inTchar = true;
        const m2 = trimmed.match(/^TCHAR\s+TYPE\s+(\d+)/i);
        tcharType = parseInt(m2![1]);
        tcharSection = 'none';
        continue;
      }
      if (/^GATE\b/i.test(upper)) { tcharSection = 'gate'; continue; }
      if (/^HEAD\b/i.test(upper)) { tcharSection = 'head'; continue; }
      if (/^QMATRIX\b/i.test(upper)) { tcharSection = 'qmatrix'; continue; }
      if (/^EFFICIENCY\b/i.test(upper)) { tcharSection = 'efficiency'; continue; }
      const numsT = trimmed.split(/\s+/).map(parseFloat).filter(n => !isNaN(n));
      if (numsT.length > 0) {
        if (tcharSection === 'gate') tcharBuf.gate.push(...numsT);
        else if (tcharSection === 'head') tcharBuf.head.push(...numsT);
        else if (tcharSection === 'qmatrix') tcharBuf.qMatrix.push(numsT);
        else if (tcharSection === 'efficiency') tcharBuf.effMatrix.push(numsT);
      }
      continue;
    }

    if (inPchar) {
      if (/^FINISH\b/i.test(upper)) {
        flushPchar();
        continue;
      }

      if (/^PCHAR\s+TYPE\s+(\d+)/i.test(upper)) {
        flushPchar();
        inPchar = true;
        const m2 = trimmed.match(/^PCHAR\s+TYPE\s+(\d+)/i);
        pcharType = parseInt(m2![1]);
        pcharSection = 'none';
        continue;
      }

      if (/^SRATIO\b/i.test(upper)) { pcharSection = 'sratio'; continue; }
      if (/^QRATIO\b/i.test(upper)) { pcharSection = 'qratio'; continue; }
      if (/^HRATIO\b/i.test(upper)) {
        pcharSection = 'hratio';
        if (hratioRow.length > 0) {
          pcharBuf.hratio.push([...hratioRow]);
          hratioRow = [];
        }
        continue;
      }
      if (/^TRATIO\b/i.test(upper)) {
        if (hratioRow.length > 0) {
          pcharBuf.hratio.push([...hratioRow]);
          hratioRow = [];
        }
        pcharSection = 'tratio';
        continue;
      }

      const nums = trimmed.split(/\s+/).map(parseFloat).filter(n => !isNaN(n));
      if (nums.length > 0) {
        if (pcharSection === 'sratio') pcharBuf.sratio.push(...nums);
        else if (pcharSection === 'qratio') pcharBuf.qratio.push(...nums);
        else if (pcharSection === 'hratio') {
          if (nums.length >= 10) {
            if (hratioRow.length > 0) pcharBuf.hratio.push([...hratioRow]);
            hratioRow = [...nums];
          } else {
            hratioRow.push(...nums);
          }
        }
        else if (pcharSection === 'tratio') pcharBuf.tratio.push(...nums);
      }
      continue;
    }

    if (/^PCHAR\s+TYPE\s+(\d+)/i.test(trimmed)) {
      const m = trimmed.match(/^PCHAR\s+TYPE\s+(\d+)/i);
      pcharType = parseInt(m![1]);
      inPchar = true;
      pcharSection = 'none';
      pcharBuf = { sratio: [], qratio: [], hratio: [], tratio: [] };
      continue;
    }

    if (/^TCHAR\s+TYPE\s+(\d+)/i.test(trimmed)) {
      const m = trimmed.match(/^TCHAR\s+TYPE\s+(\d+)/i);
      tcharType = parseInt(m![1]);
      inTchar = true;
      tcharSection = 'none';
      tcharBuf = { gate: [], head: [], qMatrix: [], effMatrix: [] };
      continue;
    }

    if (/^TURBINE\b/i.test(upper)) {
      const fullLine = [trimmed];
      for (let j = i + 1; j < lines.length; j++) {
        const ln = lines[j].trim();
        if (!ln) continue;
        if (/^FINISH\b/i.test(ln)) { fullLine.push(ln); i = j; break; }
        if (/^RESERVOIR\b|^CONDUIT\b|^PUMP\b|^TURBINE\b|^ONEWAY\b|^PCHAR\b|^TCHAR\b|^OPPUMP\b|^OPTURB\b/i.test(ln)) { i = j - 1; break; }
        fullLine.push(ln);
      }
      const combined = fullLine.join(' ');
      const idM = combined.match(/\bID\s+(\S+)/i);
      const typeM = combined.match(/\bTYPE\s+(\d+)/i);
      const rspeedM = combined.match(/\bRSPEED\s+([\-\d.]+)/i);
      const wr2M = combined.match(/\bWR2\s+([\-\d.]+)/i);
      const fricM = combined.match(/\bFRICTION\s+([\-\d.]+)/i);
      const windM = combined.match(/\bWINDAGE\s+([\-\d.]+)/i);
      if (idM) {
        turbines.set(idM[1], {
          turbineType: typeM ? parseInt(typeM[1]) : 1,
          syncSpeed: rspeedM ? parseFloat(rspeedM[1]) : 0,
          wr2: wr2M ? parseFloat(wr2M[1]) : 0,
          turbFriction: fricM ? parseFloat(fricM[1]) : 0,
          windage: windM ? parseFloat(windM[1]) : 0,
        });
      }
      continue;
    }

    if (/^OPTURB\b/i.test(upper)) {
      const idM = trimmed.match(/\bID\s+(\S+)/i);
      if (idM) {
        const rest = trimmed.replace(/.*\bID\s+\S+\s*/i, '').replace(/\s*FINISH\b.*/i, '').trim();
        const parts = rest.split(/\s+/);
        const mode = parts[0] || 'TURBINE';
        const vSchedNum = parts[1] ? parseInt(parts[1]) : undefined;
        opturbs.set(idM[1], { mode, vScheduleNumber: vSchedNum });
      }
      continue;
    }

    if (/^SCHEDULE\b.*\bVSCHEDULE\b/i.test(upper)) {
      const numM = trimmed.match(/\bVSCHEDULE\s+(\d+)/i);
      if (numM) {
        const schedNum = parseInt(numM[1]);
        const pts: { t: number; g: number }[] = [];
        const tgMatches = trimmed.matchAll(/\bT\s+([\d.]+)\s+G\s+([\d.]+)/gi);
        for (const m of tgMatches) {
          pts.push({ t: parseFloat(m[1]), g: parseFloat(m[2]) });
        }
        if (pts.length === 0) {
          for (let j = i + 1; j < lines.length; j++) {
            const ln = lines[j].trim();
            if (!ln || /^FINISH\b/i.test(ln)) { i = j; break; }
            const tgInline = ln.matchAll(/\bT\s+([\d.]+)\s+G\s+([\d.]+)/gi);
            for (const m of tgInline) pts.push({ t: parseFloat(m[1]), g: parseFloat(m[2]) });
          }
        }
        vSchedules.set(schedNum, pts);
      }
      continue;
    }

    if (/^RESERVOIR\b/i.test(upper)) {
      let id = '';
      let elevation = 0;
      let mode: 'fixed' | 'schedule' = 'fixed';
      let hScheduleNumber: number | undefined;

      for (let j = i + 1; j < lines.length; j++) {
        const ln = lines[j].trim();
        if (!ln) continue;
        if (/^FINISH\b/i.test(ln)) { i = j; break; }
        if (/^RESERVOIR\b|^CONDUIT\b|^PUMP\b|^ONEWAY\b|^PCHAR\b|^OPPUMP\b/i.test(ln)) { i = j - 1; break; }
        const idM = ln.match(/\bID\s+(\S+)/i);
        if (idM) id = idM[1];
        const elevM = ln.match(/\bELEV\s+([\-\d.]+)/i);
        if (elevM) elevation = parseFloat(elevM[1]);
        const hschedM = ln.match(/\bHSCHEDULE\s+(\d+)/i);
        if (hschedM) { hScheduleNumber = parseInt(hschedM[1]); mode = 'schedule'; }
      }
      if (id) {
        reservoirs.set(id, { elevation, mode, hScheduleNumber });
      }
      continue;
    }

    if (/^CONDUIT\b/i.test(upper)) {
      let id = '';
      let length = 0, diameter = 0, celerity = 0, friction = 0, numseg: number | undefined;
      let hasAddedLoss = false, cplus = 0, cminus = 0;
      let variable = false;
      let distance: number | undefined, area: number | undefined, d: number | undefined, a: number | undefined;

      const fullLine = [trimmed];
      for (let j = i + 1; j < lines.length; j++) {
        const ln = lines[j].trim();
        if (!ln) continue;
        if (/^FINISH\b/i.test(ln)) {
          fullLine.push(ln);
          i = j;
          break;
        }
        if (/^RESERVOIR\b|^CONDUIT\b|^PUMP\b|^ONEWAY\b|^PCHAR\b|^OPPUMP\b/i.test(ln)) {
          i = j - 1;
          break;
        }
        fullLine.push(ln);
      }
      const combined = fullLine.join(' ');

      const idM = combined.match(/\bID\s+(\S+)/i);
      if (idM) id = idM[1];
      if (/\bDUMMY\b/i.test(combined)) {
        const diamM = combined.match(/\bDIAM(?:ETER)?\s+([\-\d.]+)/i);
        const cplM = combined.match(/\bCPLUS\s+([\-\d.]+)/i);
        const cmM = combined.match(/\bCMINUS\s+([\-\d.]+)/i);
        conduits.set(id, {
          dummy: true,
          diameter: diamM ? parseFloat(diamM[1]) : 0,
          cplus: cplM ? parseFloat(cplM[1]) : 0,
          cminus: cmM ? parseFloat(cmM[1]) : 0,
        });
        continue;
      }
      const lenM = combined.match(/\bLEN(?:GTH)?\s+([\-\d.]+)/i);
      if (lenM) length = parseFloat(lenM[1]);
      const diamM = combined.match(/\bDIAM(?:ETER)?\s+([\-\d.]+)/i);
      if (diamM) diameter = parseFloat(diamM[1]);
      const celM = combined.match(/\bCEL(?:ERITY)?\s+([\-\d.]+)/i);
      if (celM) celerity = parseFloat(celM[1]);
      const fricM = combined.match(/\bFRIC(?:TION)?\s+([\-\d.]+)/i);
      if (fricM) friction = parseFloat(fricM[1]);
      const segM = combined.match(/\bNUMSEG\s+(\d+)/i);
      if (segM) numseg = parseInt(segM[1]);
      if (/\bADDEDLOSS\b/i.test(combined)) {
        hasAddedLoss = true;
        const cplM2 = combined.match(/\bCPLUS\s+([\-\d.e+]+)/i);
        const cmM2 = combined.match(/\bCMINUS\s+([\-\d.e+]+)/i);
        if (cplM2) cplus = parseFloat(cplM2[1]);
        if (cmM2) cminus = parseFloat(cmM2[1]);
      }
      if (/\bVARIABLE\b/i.test(combined)) {
        variable = true;
        const dM = combined.match(/\bDISTANCE\s+([\-\d.]+)/i);
        if (dM) distance = parseFloat(dM[1]);
        const aM = combined.match(/\bAREA\s+([\-\d.]+)/i);
        if (aM) area = parseFloat(aM[1]);
        const dfield = combined.match(/\b D\s+([\-\d.]+)/i);
        if (dfield) d = parseFloat(dfield[1]);
        const afield = combined.match(/\b A\s+([\-\d.]+)/i);
        if (afield) a = parseFloat(afield[1]);
      }
      if (id) {
        conduits.set(id, {
          length, diameter, celerity, friction,
          numseg, hasAddedLoss, cplus, cminus,
          variable, distance, area, d, a
        });
      }
      continue;
    }

    if (/^PUMP\b/i.test(upper) && !/^PCHAR\b/i.test(upper)) {
      const fullLine = [trimmed];
      for (let j = i + 1; j < lines.length; j++) {
        const ln = lines[j].trim();
        if (!ln) continue;
        if (/^FINISH\b/i.test(ln)) {
          fullLine.push(ln);
          i = j;
          break;
        }
        if (/^RESERVOIR\b|^CONDUIT\b|^PUMP\b|^ONEWAY\b|^PCHAR\b|^OPPUMP\b/i.test(ln)) {
          i = j - 1;
          break;
        }
        fullLine.push(ln);
      }
      const combined = fullLine.join(' ');
      const idM = combined.match(/\bID\s+(\S+)/i);
      const typeM = combined.match(/\bTYPE\s+(\d+)/i);
      const rqM = combined.match(/\bRQ\s+([\-\d.]+)/i);
      const rheadM = combined.match(/\bRHEAD\s+([\-\d.]+)/i);
      const rspeedM = combined.match(/\bRSPEED\s+([\-\d.]+)/i);
      const rtorqueM = combined.match(/\bRTOROUE\s+([\-\d.]+)/i) || combined.match(/\bRTORQUE\s+([\-\d.]+)/i);
      const wr2M = combined.match(/\bWR2\s+([\-\d.]+)/i);
      if (idM) {
        pumps.set(idM[1], {
          pumpType: typeM ? parseInt(typeM[1]) : 1,
          rq: rqM ? parseFloat(rqM[1]) : 0,
          rhead: rheadM ? parseFloat(rheadM[1]) : 0,
          rspeed: rspeedM ? parseFloat(rspeedM[1]) : 0,
          rtorque: rtorqueM ? parseFloat(rtorqueM[1]) : 0,
          wr2: wr2M ? parseFloat(wr2M[1]) : 0,
        });
      }
      continue;
    }

    if (/^ONEWAY\b/i.test(upper)) {
      const idM = trimmed.match(/\bID\s+(\S+)/i);
      const diamM = trimmed.match(/\bDIAM\s+([\-\d.]+)/i);
      if (idM) {
        oneway.set(idM[1], { diam: diamM ? parseFloat(diamM[1]) : 0 });
      }
      continue;
    }

    if (/^OPPUMP\b/i.test(upper)) {
      const idM = trimmed.match(/\bID\s+(\S+)/i);
      if (idM) oppumps.add(idM[1]);
      continue;
    }
  }

  if (inPchar) {
    flushPchar();
  }
  if (inTchar) {
    flushTchar();
  }

  return { reservoirs, conduits, pumps, turbines, oneway, oppumps, opturbs, pchar, tchar, vSchedules };
}

function buildReactFlowGraph(
  topo: ParsedTopology,
  elems: ParsedElements,
  projectName: string
): { nodes: WhamoNode[]; edges: WhamoEdge[]; pcharData: Record<number, PcharType>; tcharData: Record<number, TcharType>; vSchedules: Record<number, { t: number; g: number }[]> } {
  const { elemLinks, elemAt, junctions, nodeElevations } = topo;
  const { reservoirs, conduits, pumps, turbines, oneway, oppumps, opturbs } = elems;

  let rfIdCounter = 1;
  const nextId = () => String(rfIdCounter++);

  const nodeIdMap = new Map<string, string>();
  const nodeObjects: WhamoNode[] = [];
  const edgeObjects: WhamoEdge[] = [];

  const posMap = new Map<string, { x: number; y: number }>();

  const allWhamoNodeIds = new Set<string>();
  elemLinks.forEach(({ from, to }) => { allWhamoNodeIds.add(from); allWhamoNodeIds.add(to); });
  elemAt.forEach((nodeId) => allWhamoNodeIds.add(nodeId));
  nodeElevations.forEach((_, nodeId) => allWhamoNodeIds.add(nodeId));

  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  allWhamoNodeIds.forEach(id => { adjacency.set(id, []); inDegree.set(id, 0); });

  elemLinks.forEach(({ from, to }) => {
    adjacency.get(from)?.push(to);
    inDegree.set(to, (inDegree.get(to) ?? 0) + 1);
  });

  const sources = [...allWhamoNodeIds].filter(id => (inDegree.get(id) ?? 0) === 0);
  if (sources.length === 0 && allWhamoNodeIds.size > 0) sources.push([...allWhamoNodeIds][0]);

  const posX = new Map<string, number>();
  const posY = new Map<string, number>();
  const visited = new Set<string>();
  let maxCol = 0;
  const colCount = new Map<number, number>();

  const bfs = (start: string, startX: number, startY: number) => {
    const queue: Array<{ id: string; x: number; y: number }> = [{ id: start, x: startX, y: startY }];
    while (queue.length > 0) {
      const { id, x, y } = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      posX.set(id, x);
      posY.set(id, y);
      maxCol = Math.max(maxCol, x);
      const neighbors = adjacency.get(id) || [];
      let ny = y;
      for (const nb of neighbors) {
        if (!visited.has(nb)) {
          const col = x + 1;
          const cnt = colCount.get(col) ?? 0;
          colCount.set(col, cnt + 1);
          queue.push({ id: nb, x: col, y: ny });
          ny += 1;
        }
      }
    }
  };

  let startY = 0;
  for (const src of sources) {
    if (!visited.has(src)) {
      bfs(src, 0, startY);
      startY += 3;
    }
  }

  for (const id of allWhamoNodeIds) {
    if (!visited.has(id)) {
      posX.set(id, maxCol + 1);
      posY.set(id, startY++);
    }
  }

  const SPACING_X = 220;
  const SPACING_Y = 160;

  const getPos = (whamoId: string) => ({
    x: (posX.get(whamoId) ?? 0) * SPACING_X + 80,
    y: (posY.get(whamoId) ?? 0) * SPACING_Y + 80,
  });

  const getPumpPos = (from: string, to: string) => {
    const pf = getPos(from);
    const pt = getPos(to);
    return {
      x: (pf.x + pt.x) / 2,
      y: (pf.y + pt.y) / 2,
    };
  };

  const getOrCreateWhamoNode = (whamoId: string): string => {
    if (nodeIdMap.has(whamoId)) return nodeIdMap.get(whamoId)!;
    const rfId = nextId();
    nodeIdMap.set(whamoId, rfId);
    const elev = nodeElevations.get(whamoId) ?? 0;
    const pos = getPos(whamoId);
    const nodeNum = parseInt(whamoId) || nodeObjects.length + 1;
    const isJunction = junctions.has(whamoId);

    const resId = [...elemAt.entries()].find(([, nid]) => nid === whamoId)?.[0];
    if (resId && reservoirs.has(resId)) {
      const r = reservoirs.get(resId)!;
      nodeObjects.push({
        id: rfId,
        type: 'reservoir',
        position: pos,
        data: {
          label: resId,
          type: 'reservoir',
          nodeNumber: nodeNum,
          elevation: elev,
          reservoirElevation: r.elevation,
          mode: r.mode as any,
          hScheduleNumber: r.hScheduleNumber,
        }
      });
    } else {
      nodeObjects.push({
        id: rfId,
        type: isJunction ? 'junction' : 'node',
        position: pos,
        data: {
          label: `Node ${whamoId}`,
          type: isJunction ? 'junction' : 'node',
          nodeNumber: nodeNum,
          elevation: elev,
        }
      });
    }
    return rfId;
  };

  const usedNodePositions = new Set<string>();

  elemLinks.forEach((link, elemId) => {
    const { from, to } = link;

    if (pumps.has(elemId)) {
      const p = pumps.get(elemId)!;
      const rfId = nextId();
      const pPos = getPumpPos(from, to);
      const posKey = `${Math.round(pPos.x)},${Math.round(pPos.y)}`;
      const finalPos = usedNodePositions.has(posKey)
        ? { x: pPos.x, y: pPos.y + 30 }
        : pPos;
      usedNodePositions.add(posKey);

      const fromRfId = getOrCreateWhamoNode(from);
      const toRfId = getOrCreateWhamoNode(to);
      const status = oppumps.has(elemId) ? 'ACTIVE' : 'INACTIVE';
      nodeObjects.push({
        id: rfId,
        type: 'pump',
        position: finalPos,
        data: {
          label: elemId,
          type: 'pump',
          nodeNumber: parseInt(from) || nodeObjects.length,
          elevation: nodeElevations.get(from) ?? 0,
          pumpStatus: status,
          pumpType: p.pumpType,
          rq: p.rq,
          rhead: p.rhead,
          rspeed: p.rspeed,
          rtorque: p.rtorque,
          wr2: p.wr2,
        }
      });
      edgeObjects.push({
        id: nextId(),
        source: fromRfId,
        target: rfId,
        type: 'connection',
        data: { label: `${elemId}_in`, type: 'conduit', length: 0, diameter: 0, celerity: 0, friction: 0 }
      });
      edgeObjects.push({
        id: nextId(),
        source: rfId,
        target: toRfId,
        type: 'connection',
        data: { label: `${elemId}_out`, type: 'conduit', length: 0, diameter: 0, celerity: 0, friction: 0 }
      });
      return;
    }

    if (turbines.has(elemId)) {
      const t = turbines.get(elemId)!;
      const rfId = nextId();
      const tPos = getPumpPos(from, to);
      const posKey = `${Math.round(tPos.x)},${Math.round(tPos.y)}`;
      const finalPos = usedNodePositions.has(posKey)
        ? { x: tPos.x, y: tPos.y + 30 }
        : tPos;
      usedNodePositions.add(posKey);

      const fromRfId = getOrCreateWhamoNode(from);
      const toRfId = getOrCreateWhamoNode(to);
      const opInfo = opturbs.get(elemId);
      nodeObjects.push({
        id: rfId,
        type: 'turbine',
        position: finalPos,
        data: {
          label: elemId,
          type: 'turbine',
          nodeNumber: parseInt(from) || nodeObjects.length,
          elevation: nodeElevations.get(from) ?? 0,
          turbineType: t.turbineType,
          syncSpeed: t.syncSpeed,
          wr2: t.wr2,
          turbFriction: t.turbFriction,
          windage: t.windage,
          operationMode: opInfo?.mode || 'TURBINE',
          vScheduleNumber: opInfo?.vScheduleNumber ?? 1,
        }
      });
      edgeObjects.push({
        id: nextId(),
        source: fromRfId,
        target: rfId,
        type: 'connection',
        data: { label: `${elemId}_in`, type: 'conduit', length: 0, diameter: 0, celerity: 0, friction: 0 }
      });
      edgeObjects.push({
        id: nextId(),
        source: rfId,
        target: toRfId,
        type: 'connection',
        data: { label: `${elemId}_out`, type: 'conduit', length: 0, diameter: 0, celerity: 0, friction: 0 }
      });
      return;
    }

    if (oneway.has(elemId)) {
      const vc = oneway.get(elemId)!;
      const rfId = nextId();
      const vcPos = getPumpPos(from, to);
      const fromRfId = getOrCreateWhamoNode(from);
      const toRfId = getOrCreateWhamoNode(to);
      nodeObjects.push({
        id: rfId,
        type: 'checkValve',
        position: vcPos,
        data: {
          label: elemId,
          type: 'checkValve',
          nodeNumber: parseInt(from) || nodeObjects.length,
          elevation: nodeElevations.get(from) ?? 0,
          valveStatus: 'OPEN',
          valveDiam: vc.diam,
        }
      });
      edgeObjects.push({
        id: nextId(),
        source: fromRfId,
        target: rfId,
        type: 'connection',
        data: { label: `${elemId}_in`, type: 'conduit', length: 0, diameter: 0, celerity: 0, friction: 0 }
      });
      edgeObjects.push({
        id: nextId(),
        source: rfId,
        target: toRfId,
        type: 'connection',
        data: { label: `${elemId}_out`, type: 'conduit', length: 0, diameter: 0, celerity: 0, friction: 0 }
      });
      return;
    }

    if (conduits.has(elemId)) {
      const c = conduits.get(elemId)!;
      const fromRfId = getOrCreateWhamoNode(from);
      const toRfId = getOrCreateWhamoNode(to);
      const edgeId = nextId();
      if (c.dummy) {
        edgeObjects.push({
          id: edgeId,
          source: fromRfId,
          target: toRfId,
          type: 'connection',
          data: {
            label: elemId,
            type: 'dummy',
            diameter: c.diameter,
            hasAddedLoss: c.hasAddedLoss,
            cplus: c.cplus,
            cminus: c.cminus,
          }
        });
      } else {
        edgeObjects.push({
          id: edgeId,
          source: fromRfId,
          target: toRfId,
          type: 'connection',
          data: {
            label: elemId,
            type: 'conduit',
            length: c.length,
            diameter: c.diameter,
            celerity: c.celerity,
            friction: c.friction,
            numSegments: c.numseg,
            hasAddedLoss: c.hasAddedLoss,
            cplus: c.cplus,
            cminus: c.cminus,
            variable: c.variable,
            distance: c.distance,
            area: c.area,
            d: c.d,
            a: c.a,
          }
        });
      }
      return;
    }

    const fromRfId = getOrCreateWhamoNode(from);
    const toRfId = getOrCreateWhamoNode(to);
    edgeObjects.push({
      id: nextId(),
      source: fromRfId,
      target: toRfId,
      type: 'connection',
      data: { label: elemId, type: 'conduit', length: 0, diameter: 0, celerity: 0, friction: 0 }
    });
  });

  elemAt.forEach((nodeId, elemId) => {
    getOrCreateWhamoNode(nodeId);
  });

  const pcharData: Record<number, PcharType> = {};
  elems.pchar.forEach((pc, pType) => { pcharData[pType] = pc; });

  const tcharData: Record<number, TcharType> = {};
  elems.tchar.forEach((tc, tType) => { tcharData[tType] = tc; });

  const vSchedulesObj: Record<number, { t: number; g: number }[]> = {};
  elems.vSchedules.forEach((pts, num) => { vSchedulesObj[num] = pts; });

  return { nodes: nodeObjects, edges: edgeObjects, pcharData, tcharData, vSchedules: vSchedulesObj };
}

export function parseInpFile(content: string): {
  nodes: WhamoNode[];
  edges: WhamoEdge[];
  projectName: string;
  computationalParams?: any;
  pcharData: Record<number, PcharType>;
  tcharData: Record<number, TcharType>;
  vSchedules: Record<number, { t: number; g: number }[]>;
} {
  const lines = content.split('\n');

  let projectName = 'Imported Network';
  if (lines.length > 0 && lines[0].trim() && !lines[0].trim().toUpperCase().startsWith('C ') && !/^SYSTEM\b/i.test(lines[0].trim())) {
    projectName = lines[0].trim();
  }

  let systemStart = -1, systemEnd = -1;
  let elemPropsStart = -1;

  for (let i = 0; i < lines.length; i++) {
    const upper = lines[i].trim().toUpperCase();
    if (/^SYSTEM\b/.test(upper) && systemStart === -1) { systemStart = i + 1; continue; }
    if (systemStart !== -1 && systemEnd === -1 && /^FINISH\b/.test(upper)) { systemEnd = i; continue; }
    if (/^C.*ELEMENT\s+PROP/i.test(lines[i].trim()) || (systemEnd !== -1 && /^RESERVOIR\b|^CONDUIT\b|^PUMP\b|^ONEWAY\b/.test(upper))) {
      if (elemPropsStart === -1) elemPropsStart = i;
    }
  }

  const systemLines = systemStart !== -1 ? lines.slice(systemStart, systemEnd !== -1 ? systemEnd : lines.length) : lines;
  const propLines = elemPropsStart !== -1 ? lines.slice(elemPropsStart) : lines;

  const topo = parseSystemSection(systemLines);
  const elems = parseElementProperties(propLines);

  let dtcomp = 0.01, dtout = 0.1, tmax = 500;
  for (const line of lines) {
    const m = line.match(/DTCOMP\s+([\d.]+)\s+DTOUT\s+([\d.]+)\s+TMAX\s+([\d.]+)/i);
    if (m) { dtcomp = parseFloat(m[1]); dtout = parseFloat(m[2]); tmax = parseFloat(m[3]); break; }
  }
  const computationalParams = { stages: [{ dtcomp, dtout, tmax }], accutest: 'NONE' as const, includeAccutest: true };

  const { nodes, edges, pcharData, tcharData, vSchedules } = buildReactFlowGraph(topo, elems, projectName);

  return { nodes, edges, projectName, computationalParams, pcharData, tcharData, vSchedules };
}
