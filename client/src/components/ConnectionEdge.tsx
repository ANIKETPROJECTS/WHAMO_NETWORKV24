import { memo, type ReactNode } from 'react';
import {
  EdgeProps,
  getBezierPath,
  BaseEdge,
  EdgeLabelRenderer,
} from '@xyflow/react';
import { TooltipWrapper, DataList } from './TooltipWrapper';
import { useNetworkStore } from '@/lib/store';

function PumpIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="10" fill="white" stroke={color} strokeWidth="1.5" />
      <polygon points="8,7 17,11 8,15" fill={color} />
      <rect x="4" y="9" width="4" height="4" rx="1" fill={color} />
    </svg>
  );
}

function CheckValveIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="10" fill="white" stroke={color} strokeWidth="1.5" />
      <line x1="11" y1="5" x2="11" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <polygon points="11,6 17,11 11,16" fill={color} opacity="0.5" />
      <line x1="5" y1="8" x2="11" y2="11" stroke={color} strokeWidth="1.5" />
      <line x1="5" y1="14" x2="11" y2="11" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function TurbineIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="10" fill="white" stroke={color} strokeWidth="1.5" />
      <circle cx="11" cy="11" r="2.5" fill={color} />
      <path d="M11 4 Q14 7 11 8.5 Q8 7 11 4Z" fill={color} opacity="0.7" />
      <path d="M11 18 Q8 15 11 13.5 Q14 15 11 18Z" fill={color} opacity="0.7" />
      <path d="M4 11 Q7 8 8.5 11 Q7 14 4 11Z" fill={color} opacity="0.7" />
      <path d="M18 11 Q15 14 13.5 11 Q15 8 18 11Z" fill={color} opacity="0.7" />
    </svg>
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
  type,
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
  const strokeColor = isPump ? '#f97316'
    : isCheckValve ? '#8b5cf6'
    : isTurbine ? '#14b8a6'
    : isDummy ? '#94a3b8'
    : '#3b82f6';
  const strokeDasharray = isDummy ? '8 8' : undefined;

  const tooltipTitle = isPump ? 'Pump Properties'
    : isCheckValve ? 'Check Valve Properties'
    : isTurbine ? 'Turbine Properties'
    : isDummy ? 'Dummy Pipe Properties'
    : 'Conduit Properties';

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          strokeWidth: isElementEdge ? 2.5 : isDummy ? 2 : 2.5,
          stroke: strokeColor,
          strokeDasharray,
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
          <TooltipWrapper 
            content={<DataList data={displayData} title={tooltipTitle} />}
          >
            {isElementEdge ? (
              <div className="flex flex-col items-center gap-0.5 cursor-help">
                {isPump && <PumpIcon color={strokeColor} />}
                {isCheckValve && <CheckValveIcon color={strokeColor} />}
                {isTurbine && <TurbineIcon color={strokeColor} />}
                <div
                  className="px-1 py-0 rounded text-[8px] font-bold shadow-sm"
                  style={{ background: 'white', color: strokeColor, border: `1px solid ${strokeColor}` }}
                >
                  {(displayData?.label as ReactNode) || id}
                </div>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded border border-slate-200 shadow-sm text-[9px] font-bold cursor-help hover:bg-white transition-colors">
                {(displayData?.label as ReactNode) || id}
              </div>
            )}
          </TooltipWrapper>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
