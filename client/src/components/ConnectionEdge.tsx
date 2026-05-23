import { memo, type ReactNode } from 'react';
import {
  EdgeProps,
  getBezierPath,
  BaseEdge,
  EdgeLabelRenderer,
  MarkerType,
} from '@xyflow/react';
import { TooltipWrapper, DataList } from './TooltipWrapper';
import { useNetworkStore } from '@/lib/store';
import waterPumpIcon from '@assets/water-pump_1779523451215.png';
import pipeIcon from '@assets/pipe_1779523475650.png';
import turbineImgIcon from '@assets/turbine_1779523517554.png';

const EDGE_COLOR = '#000000';
const CIRCLE_SIZE = 56;
const BLACK_MARKER = { type: MarkerType.ArrowClosed, color: EDGE_COLOR };

function ElementCircle({ icon, alt }: { icon: string; alt: string }) {
  return (
    <div style={{
      width: CIRCLE_SIZE,
      height: CIRCLE_SIZE,
      borderRadius: '50%',
      border: `3px solid ${EDGE_COLOR}`,
      background: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <img src={icon} style={{ width: 32, height: 32, objectFit: 'contain', pointerEvents: 'none' }} alt={alt} />
    </div>
  );
}

export const ConnectionEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  const edge = useNetworkStore(state => state.edges.find(e => e.id === id));
  const displayData = edge ? edge.data : data;

  const edgeType = displayData?.type as string;
  const isPump = edgeType === 'pump';
  const isCheckValve = edgeType === 'checkValve';
  const isTurbine = edgeType === 'turbine';
  const isElementEdge = isPump || isCheckValve || isTurbine;
  const isDummy = edgeType === 'dummy';

  // Detect orientation for label placement
  const isVertical = Math.abs(targetY - sourceY) > Math.abs(targetX - sourceX);

  const tooltipTitle = isPump ? 'Pump Properties'
    : isCheckValve ? 'Check Valve Properties'
    : isTurbine ? 'Turbine Properties'
    : isDummy ? 'Dummy Pipe Properties'
    : 'Conduit Properties';

  const edgeLabel = (displayData?.label as string) || id;

  // Label position: right of circle for vertical edges, below for horizontal
  const labelStyle: React.CSSProperties = isVertical ? {
    position: 'absolute',
    left: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
    marginLeft: 7,
  } : {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: 4,
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: EDGE_COLOR,
          strokeDasharray: isDummy ? '8 8' : undefined,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <TooltipWrapper content={<DataList data={displayData} title={tooltipTitle} />}>
            {isElementEdge ? (
              /* Container is exactly CIRCLE_SIZE so the circle stays centered at labelX,labelY.
                 The text label is absolutely positioned outside this box. */
              <div style={{ position: 'relative', width: CIRCLE_SIZE, height: CIRCLE_SIZE, cursor: 'help' }}>
                {isPump && <ElementCircle icon={waterPumpIcon} alt="Pump" />}
                {isCheckValve && <ElementCircle icon={pipeIcon} alt="Check Valve" />}
                {isTurbine && <ElementCircle icon={turbineImgIcon} alt="Turbine" />}
                <span style={{
                  ...labelStyle,
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#000',
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}>
                  {edgeLabel}
                </span>
              </div>
            ) : (
              <div className="bg-white px-2 py-0.5 rounded-full border border-black text-[11px] font-semibold text-black cursor-help hover:bg-slate-50 transition-colors">
                {(displayData?.label as ReactNode) || id}
              </div>
            )}
          </TooltipWrapper>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
