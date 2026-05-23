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

// Always-black arrowhead marker
const BLACK_MARKER = { type: MarkerType.ArrowClosed, color: EDGE_COLOR };

function ElementCircle({ icon, alt }: { icon: string; alt: string }) {
  return (
    <div style={{
      width: 56, height: 56, borderRadius: '50%',
      border: `3px solid ${EDGE_COLOR}`, background: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
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
  data,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edge = useNetworkStore(state => state.edges.find(e => e.id === id));
  const displayData = edge ? edge.data : data;

  const edgeType = displayData?.type as string;
  const isPump = edgeType === 'pump';
  const isCheckValve = edgeType === 'checkValve';
  const isTurbine = edgeType === 'turbine';
  const isElementEdge = isPump || isCheckValve || isTurbine;
  const isDummy = edgeType === 'dummy';

  // Determine orientation: vertical if dy > dx
  const isVertical = Math.abs(targetY - sourceY) > Math.abs(targetX - sourceX);

  const tooltipTitle = isPump ? 'Pump Properties'
    : isCheckValve ? 'Check Valve Properties'
    : isTurbine ? 'Turbine Properties'
    : isDummy ? 'Dummy Pipe Properties'
    : 'Conduit Properties';

  const edgeLabel = (displayData?.label as string) || id;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={BLACK_MARKER as any}
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
              <div
                className="cursor-help"
                style={{
                  display: 'flex',
                  flexDirection: isVertical ? 'row' : 'column',
                  alignItems: 'center',
                  gap: isVertical ? 6 : 3,
                }}
              >
                {isPump && <ElementCircle icon={waterPumpIcon} alt="Pump" />}
                {isCheckValve && <ElementCircle icon={pipeIcon} alt="Check Valve" />}
                {isTurbine && <ElementCircle icon={turbineImgIcon} alt="Turbine" />}
                <span style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#000',
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
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
