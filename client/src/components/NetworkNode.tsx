import { Handle, Position, NodeProps } from '@xyflow/react';
import { memo } from 'react';
import { TooltipWrapper, DataList } from './TooltipWrapper';
import { useNetworkStore } from '@/lib/store';
import damIcon from '@assets/dam_1779522984604.png';
import yIntersectionIcon from '@assets/y-intersection_(1)_1779523210044.png';
import waterTankIcon from '@assets/water-tank_(2)_1779523360829.png';
import waterPumpIcon from '@assets/water-pump_1779523451215.png';
import pipeIcon from '@assets/pipe_1779523475650.png';
import turbineImgIcon from '@assets/turbine_1779523517554.png';
import windIcon from '@assets/wind_1779523398812.png';

const HandleStyle = "w-2 h-2 bg-black border border-white opacity-0 group-hover:opacity-100 transition-opacity";
const CIRCLE_SIZE = 56;
const ICON_SIZE = 32;

function useNodeOrderError(id: string) {
  return useNetworkStore(state => state.nodeOrderErrorIds.includes(id));
}

type LabelPos = 'bottom' | 'top' | 'right' | 'left' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

// Angle-based label placement: computes actual angles to neighbor nodes,
// tries 8 candidate directions, picks the one with the most open angular space.
function useLabelPosition(nodeId: string): LabelPos {
  const edges = useNetworkStore(state => state.edges);
  const nodes = useNetworkStore(state => state.nodes);

  const currentNode = nodes.find(n => n.id === nodeId);
  if (!currentNode) return 'bottom';

  const cx = currentNode.position.x + CIRCLE_SIZE / 2;
  const cy = currentNode.position.y + CIRCLE_SIZE / 2;

  // Compute angles (degrees, 0=right, 90=down, 180/-180=left, -90=up)
  const angles: number[] = [];
  edges.forEach(edge => {
    const otherId = edge.source === nodeId ? edge.target
                  : edge.target === nodeId ? edge.source
                  : null;
    if (!otherId) return;
    const other = nodes.find(n => n.id === otherId);
    if (!other) return;
    const ox = other.position.x + CIRCLE_SIZE / 2;
    const oy = other.position.y + CIRCLE_SIZE / 2;
    angles.push(Math.atan2(oy - cy, ox - cx) * 180 / Math.PI);
  });

  // 8 candidates in priority order: cardinal first, then diagonals
  const candidates: Array<[number, LabelPos]> = [
    [ 90,  'bottom'],
    [  0,  'right'],
    [-90,  'top'],
    [180,  'left'],
    [ 45,  'bottom-right'],
    [135,  'bottom-left'],
    [-45,  'top-right'],
    [-135, 'top-left'],
  ];

  // Angular gap threshold to consider a direction "free"
  const FREE_THRESH = 40;

  // First pass: find a direction with no connection within FREE_THRESH degrees
  for (const [candAngle, pos] of candidates) {
    const conflict = angles.some(a => {
      let d = Math.abs(a - candAngle);
      if (d > 180) d = 360 - d;
      return d < FREE_THRESH;
    });
    if (!conflict) return pos;
  }

  // All crowded — pick the candidate that maximises the minimum angular distance
  let bestPos: LabelPos = 'bottom';
  let bestScore = -1;
  for (const [candAngle, pos] of candidates) {
    const minDist = angles.length === 0
      ? 180
      : Math.min(...angles.map(a => {
          let d = Math.abs(a - candAngle);
          if (d > 180) d = 360 - d;
          return d;
        }));
    if (minDist > bestScore) { bestScore = minDist; bestPos = pos; }
  }
  return bestPos;
}

function circleStyle(selected: boolean, hasOrderError: boolean): React.CSSProperties {
  return {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: '50%',
    border: `3px solid ${hasOrderError ? '#ef4444' : '#000'}`,
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    inset: 0,
    transition: 'all 0.15s',
    boxShadow: selected ? '0 0 0 3px rgba(0,0,0,0.15)' : undefined,
  };
}

function getLabelStyle(pos: LabelPos): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    fontSize: 13,
    fontWeight: 700,
    color: '#000',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    userSelect: 'none',
    lineHeight: 1,
    background: 'rgba(255,255,255,0.9)',
    borderRadius: 2,
    padding: '1px 2px',
  };
  const G = 5;
  switch (pos) {
    case 'bottom':       return { ...base, top:    `calc(100% + ${G}px)`, left:  '50%', transform: 'translateX(-50%)' };
    case 'top':          return { ...base, bottom: `calc(100% + ${G}px)`, left:  '50%', transform: 'translateX(-50%)' };
    case 'right':        return { ...base, left:   `calc(100% + ${G}px)`, top:   '50%', transform: 'translateY(-50%)' };
    case 'left':         return { ...base, right:  `calc(100% + ${G}px)`, top:   '50%', transform: 'translateY(-50%)' };
    case 'bottom-right': return { ...base, top:    `calc(100% + ${G}px)`, left:  `calc(100% + ${G}px)` };
    case 'bottom-left':  return { ...base, top:    `calc(100% + ${G}px)`, right: `calc(100% + ${G}px)` };
    case 'top-right':    return { ...base, bottom: `calc(100% + ${G}px)`, left:  `calc(100% + ${G}px)` };
    case 'top-left':     return { ...base, bottom: `calc(100% + ${G}px)`, right: `calc(100% + ${G}px)` };
  }
}

const AllHandles = () => (
  <>
    <Handle type="target" id="t-top"    position={Position.Top}    className={HandleStyle} />
    <Handle type="source" id="s-top"    position={Position.Top}    className={HandleStyle} />
    <Handle type="target" id="t-bottom" position={Position.Bottom} className={HandleStyle} />
    <Handle type="source" id="s-bottom" position={Position.Bottom} className={HandleStyle} />
    <Handle type="target" id="t-left"   position={Position.Left}   className={HandleStyle} />
    <Handle type="source" id="s-left"   position={Position.Left}   className={HandleStyle} />
    <Handle type="target" id="t-right"  position={Position.Right}  className={HandleStyle} />
    <Handle type="source" id="s-right"  position={Position.Right}  className={HandleStyle} />
  </>
);

function SmartIconNode({
  nodeId, selected, hasOrderError, icon, label, alt,
}: {
  nodeId: string; selected: boolean; hasOrderError: boolean;
  icon: string; label: React.ReactNode; alt: string;
}) {
  const pos = useLabelPosition(nodeId);
  return (
    <div style={{ position: 'relative', width: CIRCLE_SIZE, height: CIRCLE_SIZE }} className="group">
      <div style={circleStyle(selected, hasOrderError)}>
        <img src={icon} style={{ width: ICON_SIZE, height: ICON_SIZE, objectFit: 'contain', pointerEvents: 'none' }} alt={alt} />
      </div>
      <AllHandles />
      <span style={getLabelStyle(pos)}>{label}</span>
    </div>
  );
}

export const ReservoirNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  return (
    <TooltipWrapper content={<DataList data={displayData} title="Reservoir Properties" />}>
      <SmartIconNode nodeId={id} selected={!!selected} hasOrderError={hasOrderError}
        icon={damIcon} label={data.label as React.ReactNode} alt="Reservoir" />
    </TooltipWrapper>
  );
});

export const SimpleNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  return (
    <TooltipWrapper content={<DataList data={displayData} title="Node Properties" />}>
      <div style={{ position: 'relative', width: CIRCLE_SIZE, height: CIRCLE_SIZE }} className="group">
        <div style={circleStyle(!!selected, hasOrderError)}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#000' }}>
            N{data.nodeNumber as React.ReactNode}
          </span>
        </div>
        <AllHandles />
      </div>
    </TooltipWrapper>
  );
});

export const JunctionNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  return (
    <TooltipWrapper content={<DataList data={displayData} title="Junction Properties" />}>
      <SmartIconNode nodeId={id} selected={!!selected} hasOrderError={hasOrderError}
        icon={yIntersectionIcon} label={`J${data.nodeNumber}`} alt="Junction" />
    </TooltipWrapper>
  );
});

export const SurgeTankNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  return (
    <TooltipWrapper content={<DataList data={displayData} title="Surge Tank Properties" />}>
      <SmartIconNode nodeId={id} selected={!!selected} hasOrderError={hasOrderError}
        icon={waterTankIcon} label={data.label as React.ReactNode} alt="Surge Tank" />
    </TooltipWrapper>
  );
});

export const PumpNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  return (
    <TooltipWrapper content={<DataList data={displayData} title="Pump Properties" />}>
      <SmartIconNode nodeId={id} selected={!!selected} hasOrderError={hasOrderError}
        icon={waterPumpIcon} label={data.label as React.ReactNode} alt="Pump" />
    </TooltipWrapper>
  );
});

export const CheckValveNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  return (
    <TooltipWrapper content={<DataList data={displayData} title="Check Valve Properties" />}>
      <SmartIconNode nodeId={id} selected={!!selected} hasOrderError={hasOrderError}
        icon={pipeIcon} label={data.label as React.ReactNode} alt="Check Valve" />
    </TooltipWrapper>
  );
});

export const TurbineNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  return (
    <TooltipWrapper content={<DataList data={displayData} title="Turbine Properties" />}>
      <SmartIconNode nodeId={id} selected={!!selected} hasOrderError={hasOrderError}
        icon={turbineImgIcon} label={data.label as React.ReactNode} alt="Turbine" />
    </TooltipWrapper>
  );
});

export const FlowBoundaryNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  return (
    <TooltipWrapper content={<DataList data={displayData} title="Flow Boundary Properties" />}>
      <div
        className="group relative"
        style={{
          padding: '8px 14px',
          border: `2px solid ${hasOrderError ? '#ef4444' : '#000'}`,
          borderRadius: 6,
          background: 'white',
          boxShadow: selected ? '0 0 0 2px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.08)',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          minWidth: 60,
        }}
      >
        <Handle type="target" id="t-top"    position={Position.Top}    className={HandleStyle} />
        <Handle type="source" id="s-top"    position={Position.Top}    className={HandleStyle} />
        <Handle type="target" id="t-bottom" position={Position.Bottom} className={HandleStyle} />
        <Handle type="source" id="s-bottom" position={Position.Bottom} className={HandleStyle} />
        <Handle type="target" id="t-left"   position={Position.Left}   className={HandleStyle} />
        <Handle type="source" id="s-left"   position={Position.Left}   className={HandleStyle} />
        <Handle type="target" id="t-right"  position={Position.Right}  className={HandleStyle} />
        <Handle type="source" id="s-right"  position={Position.Right}  className={HandleStyle} />
        <img src={windIcon} style={{ width: 28, height: 28, objectFit: 'contain', pointerEvents: 'none' }} alt="Flow BC" />
        <div style={{ fontSize: 12, fontWeight: 700, color: '#000', lineHeight: 1 }}>
          {data.label as React.ReactNode}
        </div>
        <div style={{ fontSize: 10, color: '#333', lineHeight: 1 }}>
          Q-Sched: {data.scheduleNumber as React.ReactNode}
        </div>
      </div>
    </TooltipWrapper>
  );
});
