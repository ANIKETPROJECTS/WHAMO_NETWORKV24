import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronRight, Zap, BarChart2, Info } from 'lucide-react';
import {
  TURBINE_CURVE_LIBRARY,
  getRecommendedNs,
  generateTcharFromCurves,
  type TurbineNsGroup,
} from '@/lib/turbine-curves';
import type { TcharType } from '@/lib/store';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const GATE_COLORS = ['#1a73e8','#34a853','#fbbc04','#ea4335','#9c27b0','#ff5722','#00bcd4','#607d8b','#795548'];

interface Props {
  tType: number;
  activeTc: TcharType;
  updateTcharData: (tType: number, data: TcharType) => void;
  designHead?: number;
}

export function TurbineCurvePanel({ tType, activeTc, updateTcharData, designHead: initialDesignHead }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedNsUS, setSelectedNsUS] = useState<number>(30);
  const [designHead, setDesignHead] = useState<string>(String(initialDesignHead ?? 50));
  const [designFlow, setDesignFlow] = useState<string>('100');
  const [designEff, setDesignEff] = useState<string>('0.90');
  const [numHeadSteps, setNumHeadSteps] = useState<string>('5');
  const [selectedGates, setSelectedGates] = useState<Set<number>>(new Set([20, 40, 60, 80, 100]));
  const [previewGate, setPreviewGate] = useState<number>(100);
  const [showChart, setShowChart] = useState(true);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [generated, setGenerated] = useState<TcharType | null>(null);

  const nsGroup: TurbineNsGroup = useMemo(
    () => TURBINE_CURVE_LIBRARY.find(g => g.nsUS === selectedNsUS) ?? TURBINE_CURVE_LIBRARY[0],
    [selectedNsUS]
  );

  const recommendation = useMemo(
    () => getRecommendedNs(parseFloat(designHead) || 50),
    [designHead]
  );

  const availableGates = nsGroup.gates.map(g => g.gatePercent);

  const toggleGate = (g: number) => {
    setSelectedGates(prev => {
      const next = new Set(prev);
      if (next.has(g)) { if (next.size > 1) next.delete(g); }
      else next.add(g);
      return next;
    });
  };

  const previewGateData = useMemo(() => {
    const gate = nsGroup.gates.find(g => g.gatePercent === previewGate);
    if (!gate) return [];
    return gate.points.map(p => ({
      head: Math.round(p.head),
      q: parseFloat(p.q.toFixed(2)),
      eff: parseFloat(Math.min(Math.max(
        (p.head > 1 && p.q > 1) ? (p.torque / (p.head * p.q)) * (parseFloat(designEff) * 100) : 0,
        0), 0.98).toFixed(4)),
    }));
  }, [nsGroup, previewGate, designEff]);

  const allGatesPreviewData = useMemo(() => {
    const headSet = new Set<number>();
    nsGroup.gates.forEach(g => g.points.forEach(p => headSet.add(Math.round(p.head))));
    const heads = Array.from(headSet).sort((a, b) => a - b);

    return heads.map(h => {
      const row: Record<string, number> = { head: h };
      nsGroup.gates.forEach(g => {
        const pt = g.points.reduce((best, p) => Math.abs(Math.round(p.head) - h) < Math.abs(Math.round(best.head) - h) ? p : best, g.points[0]);
        if (Math.abs(Math.round(pt.head) - h) <= 12) {
          row[`g${g.gatePercent}`] = parseFloat(pt.q.toFixed(2));
        }
      });
      return row;
    });
  }, [nsGroup]);

  const handleGenerate = () => {
    const hasTcharData = activeTc.gate.length > 0 || activeTc.head.length > 0;
    if (hasTcharData && !confirmOverwrite) {
      setConfirmOverwrite(true);
      return;
    }
    doGenerate();
  };

  const doGenerate = () => {
    const result = generateTcharFromCurves({
      nsGroup,
      selectedGatePercents: Array.from(selectedGates).sort((a, b) => a - b),
      designHead: parseFloat(designHead) || 50,
      designFlow: parseFloat(designFlow) || 100,
      designEfficiency: parseFloat(designEff) || 0.9,
      numHeadSteps: Math.max(2, Math.min(20, parseInt(numHeadSteps) || 5)),
    });
    setGenerated(result);
    updateTcharData(tType, result);
    setConfirmOverwrite(false);
  };

  const previewBlock = useMemo(() => {
    const tc = generated ?? activeTc;
    if (tc.gate.length === 0) return null;
    const lines: string[] = [];
    lines.push(`TCHAR TYPE ${tType}`);
    lines.push(` GATE ${tc.gate.join(' ')}`);
    lines.push(` HEAD ${tc.head.join(' ')}`);
    lines.push(' Q');
    tc.qMatrix.forEach(row => lines.push('  ' + row.join(' ')));
    lines.push(' EFFICIENCY');
    tc.effMatrix.forEach(row => lines.push('  ' + row.join(' ')));
    lines.push('FINISH');
    return lines.join('\n');
  }, [generated, activeTc, tType]);

  return (
    <div className="border rounded-md overflow-hidden border-teal-200">
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold bg-teal-50 hover:bg-teal-100 transition-colors text-teal-800"
        onClick={() => setOpen(v => !v)}
        type="button"
        data-testid="btn-toggle-curve-panel"
      >
        <span className="flex items-center gap-1.5">
          <BarChart2 className="h-3.5 w-3.5" />
          Performance Curves — TCHAR Generator
        </span>
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>

      {open && (
        <div className="p-3 space-y-4 bg-white">
          <p className="text-[10px] text-muted-foreground italic">
            Select a predefined turbine hill chart library curve to auto-populate TCHAR TYPE {tType}. Existing TCHAR data will be replaced only after confirmation.
          </p>

          {/* Ns group selection */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">Specific Speed (Ns)</Label>
            <Select value={String(selectedNsUS)} onValueChange={v => setSelectedNsUS(Number(v))}>
              <SelectTrigger className="h-7 text-xs" data-testid="select-ns-group">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TURBINE_CURVE_LIBRARY.map(g => (
                  <SelectItem key={g.nsUS} value={String(g.nsUS)}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-slate-400">Range: {nsGroup.headRange}</p>
          </div>

          {/* Ns recommendation */}
          <div className="flex items-start gap-1.5 bg-blue-50 border border-blue-100 rounded px-2 py-1.5">
            <Info className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-blue-700">
              <span className="font-semibold">Recommendation:</span>{' '}
              Suggested Ns {recommendation.nsUS} (US) — {recommendation.reason}.
            </p>
          </div>

          {/* Design parameters */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">Design Parameters</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px]">Design Head (H)</Label>
                <input
                  className="w-full h-7 border rounded px-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-400 mt-0.5"
                  value={designHead}
                  onChange={e => setDesignHead(e.target.value)}
                  data-testid="input-design-head"
                  type="number" step="any" placeholder="e.g. 50"
                />
              </div>
              <div>
                <Label className="text-[10px]">Design Flow (Q)</Label>
                <input
                  className="w-full h-7 border rounded px-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-400 mt-0.5"
                  value={designFlow}
                  onChange={e => setDesignFlow(e.target.value)}
                  data-testid="input-design-flow"
                  type="number" step="any" placeholder="e.g. 100"
                />
              </div>
              <div>
                <Label className="text-[10px]">Design Efficiency (η)</Label>
                <input
                  className="w-full h-7 border rounded px-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-400 mt-0.5"
                  value={designEff}
                  onChange={e => setDesignEff(e.target.value)}
                  data-testid="input-design-eff"
                  type="number" step="0.01" min="0" max="1" placeholder="0.90"
                />
              </div>
              <div>
                <Label className="text-[10px]">Head Steps</Label>
                <input
                  className="w-full h-7 border rounded px-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-400 mt-0.5"
                  value={numHeadSteps}
                  onChange={e => setNumHeadSteps(e.target.value)}
                  data-testid="input-head-steps"
                  type="number" step="1" min="2" max="20" placeholder="5"
                />
              </div>
            </div>
          </div>

          {/* Gate selection */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">Gate Openings (%)</Label>
            <div className="flex flex-wrap gap-2">
              {availableGates.map(g => (
                <label key={g} className="flex items-center gap-1 cursor-pointer select-none">
                  <Checkbox
                    data-testid={`cb-gate-${g}`}
                    checked={selectedGates.has(g)}
                    onCheckedChange={() => toggleGate(g)}
                    className="h-3.5 w-3.5"
                  />
                  <span className="text-[10px]">{g}%</span>
                </label>
              ))}
            </div>
          </div>

          {/* Chart preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">Curve Preview</Label>
              <button
                className="text-[10px] text-blue-600 hover:underline"
                onClick={() => setShowChart(v => !v)}
                type="button"
              >
                {showChart ? 'Hide' : 'Show'}
              </button>
            </div>

            {showChart && (
              <>
                <div className="flex items-center gap-2">
                  <Label className="text-[10px]">Gate:</Label>
                  <Select value={String(previewGate)} onValueChange={v => setPreviewGate(Number(v))}>
                    <SelectTrigger className="h-6 text-[10px] w-20" data-testid="select-preview-gate">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableGates.map(g => (
                        <SelectItem key={g} value={String(g)}>{g}%</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-[10px] text-slate-400">(single gate) · all gates Q below</span>
                </div>

                {/* Single gate — Head vs Q and Head vs Eff */}
                <div className="rounded border border-slate-100 overflow-hidden bg-slate-50 p-2">
                  <p className="text-[10px] font-medium text-slate-500 mb-1">Gate {previewGate}% — Head vs Q &amp; Efficiency (normalized)</p>
                  <ResponsiveContainer width="100%" height={140}>
                    <LineChart data={previewGateData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="head" tick={{ fontSize: 9 }} label={{ value: 'Head (norm.)', position: 'insideBottom', offset: 0, fontSize: 9 }} />
                      <YAxis yAxisId="q" tick={{ fontSize: 9 }} orientation="left" />
                      <YAxis yAxisId="eff" tick={{ fontSize: 9 }} orientation="right" domain={[0, 1]} />
                      <Tooltip
                        contentStyle={{ fontSize: 10 }}
                        formatter={(v: any, name: string) => [
                          typeof v === 'number' ? v.toFixed(3) : v,
                          name === 'q' ? 'Q (norm.)' : 'Efficiency'
                        ]}
                      />
                      <Legend wrapperStyle={{ fontSize: 9 }} />
                      <Line yAxisId="q" type="monotone" dataKey="q" stroke="#1a73e8" dot={false} name="Q (norm.)" strokeWidth={1.5} />
                      <Line yAxisId="eff" type="monotone" dataKey="eff" stroke="#34a853" dot={false} name="Efficiency" strokeWidth={1.5} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* All gates — Head vs Q */}
                <div className="rounded border border-slate-100 overflow-hidden bg-slate-50 p-2">
                  <p className="text-[10px] font-medium text-slate-500 mb-1">All gates — Head vs Q (normalized)</p>
                  <ResponsiveContainer width="100%" height={130}>
                    <LineChart data={allGatesPreviewData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="head" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip contentStyle={{ fontSize: 10 }} />
                      <Legend wrapperStyle={{ fontSize: 9 }} />
                      {nsGroup.gates.map((g, i) => (
                        <Line
                          key={g.gatePercent}
                          type="monotone"
                          dataKey={`g${g.gatePercent}`}
                          stroke={GATE_COLORS[i % GATE_COLORS.length]}
                          dot={false}
                          name={`${g.gatePercent}%`}
                          strokeWidth={1.5}
                          connectNulls
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>

          {/* Generate button */}
          <div className="space-y-2">
            {confirmOverwrite && (
              <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                <Info className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-amber-800">
                  TCHAR TYPE {tType} already has data. This will <strong>overwrite</strong> existing values. Click again to confirm.
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-7 text-[10px] flex-1 bg-teal-600 hover:bg-teal-700 text-white gap-1"
                onClick={handleGenerate}
                data-testid="btn-generate-tchar"
                type="button"
              >
                <Zap className="h-3 w-3" />
                {confirmOverwrite ? 'Confirm Overwrite' : 'Generate TCHAR From Curves'}
              </Button>
              {confirmOverwrite && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px]"
                  onClick={() => setConfirmOverwrite(false)}
                  type="button"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Preview block */}
          {previewBlock && (
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">Generated TCHAR Block Preview</Label>
              <pre className="text-[9px] font-mono bg-slate-900 text-green-300 p-2 rounded overflow-x-auto max-h-48 leading-relaxed">
                {previewBlock}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
