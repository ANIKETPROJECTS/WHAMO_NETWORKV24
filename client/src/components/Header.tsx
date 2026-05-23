import {
  AlertCircle,
  Maximize2,
  Layout,
  PlusCircle,
  Settings2,
  Download,
  FilePlus,
  FolderOpen,
  Save,
  Trash2,
  Undo2,
  Redo2,
  MousePointer2,
  Cylinder,
  Circle,
  GitCommitHorizontal,
  ArrowRightCircle,
  ListVideo,
  Info,
  Table2,
  PlayCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  BarChart2,
} from "lucide-react";
import { FlexTable } from "@/components/FlexTable";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNetworkStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { generateSystemDiagramSVG } from "@/lib/diagram-generator";
import folderIcon from "@assets/open-folder_1770356038145.png";
import addFileIcon from "@assets/add-file_1779522127531.png";
import openFolderIcon from "@assets/open-folder_(1)_1779522148864.png";
import floppyDiskIcon from "@assets/floppy-disk_1779522257214.png";
import disketteIcon from "@assets/diskette_1779522365366.png";
import damIcon from "@assets/dam_1779522984604.png";
import nodeCircleIcon from "@assets/button_1779523171362.png";
import yIntersectionIcon from "@assets/y-intersection_(1)_1779523210044.png";
import waterTankIcon from "@assets/water-tank_(2)_1779523360829.png";
import windIcon from "@assets/wind_1779523398812.png";
import waterPumpIcon from "@assets/water-pump_1779523451215.png";
import pipeIcon from "@assets/pipe_1779523475650.png";
import turbineImgIcon from "@assets/turbine_1779523517554.png";
import networkIcon from "@assets/network_1779525899254.png";
import clickIcon from "@assets/click_1779525969230.png";
import tabletIcon from "@assets/tablet_1779526000997.png";
import chartIcon from "@assets/chart_1779526062244.png";
import equalizerIcon from "@assets/equalizer_(1)_1779526283421.png";
import settingsWrenchIcon from "@assets/settings_1779526312036.png";
import inputIcon from "@assets/input_1779526391855.png";
import outputIcon from "@assets/output_1779526416694.png";
import gridIcon from "@assets/grid_1779526458342.png";
import fullscreenIcon from "@assets/fullscreen_1779526488758.png";

// ─── Title bar compact button ─────────────────────────────────────────────────
function TitleBarBtn({
  imgSrc, icon, label, onClick, disabled,
}: {
  imgSrc?: string;
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-row items-center gap-1 px-2 py-1 rounded transition-colors select-none",
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-slate-100 active:bg-slate-200",
      )}
    >
      {imgSrc
        ? <img src={imgSrc} className="w-[18px] h-[18px] object-contain flex-shrink-0" alt={label} />
        : <span className="flex-shrink-0 flex items-center">{icon}</span>
      }
      <span className="text-[10px] font-medium text-black whitespace-nowrap" style={{ fontFamily: 'Poppins, sans-serif' }}>{label}</span>
    </button>
  );
}

// ─── Inline ribbon button (icon above, text below — fixed height, aligned) ────
function InlineRibbonBtn({
  imgSrc, icon, label, onClick, disabled, active,
  ...rest
}: {
  imgSrc?: string;
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  [key: string]: any;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      {...rest}
      className={cn(
        "flex flex-col items-center h-[62px] px-2 py-1 rounded transition-colors select-none flex-1",
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-blue-50 active:bg-blue-100",
        active ? "bg-blue-100 ring-1 ring-blue-300" : "",
      )}
    >
      {/* Icon zone — always same height, icon centered inside */}
      <div className="flex flex-1 items-center justify-center">
        {imgSrc
          ? <img src={imgSrc} className="w-7 h-7 object-contain" alt={label} />
          : <span className="flex items-center justify-center w-7 h-7">{icon}</span>
        }
      </div>
      {/* Text zone — fixed height, always at bottom */}
      <div className="h-[22px] flex items-end justify-center w-full">
        <span className="text-[10px] font-semibold text-black text-center leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>{label}</span>
      </div>
    </button>
  );
}

// ─── Ribbon helper components ────────────────────────────────────────────────
function RibbonBtn({
  icon, label, onClick, disabled, active, highlight,
  ...rest
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  highlight?: boolean;
  [key: string]: any;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      {...rest}
      className={cn(
        "flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded min-w-[56px] transition-colors select-none",
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-blue-50 active:bg-blue-100",
        active ? "bg-blue-100 ring-1 ring-blue-300" : "",
        highlight && !disabled ? "hover:bg-blue-100" : "",
      )}
    >
      <span className="flex items-center justify-center">{icon}</span>
      <span className="text-[10px] font-medium text-black leading-tight text-center max-w-[64px]" style={{ fontFamily: 'Poppins, sans-serif' }}>{label}</span>
    </button>
  );
}

function SmallRibbonBtn({
  icon, label, onClick, disabled, active, highlight,
  ...rest
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  highlight?: boolean;
  [key: string]: any;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      {...rest}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded min-w-[48px] transition-colors select-none",
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-blue-50 active:bg-blue-100",
        active ? "bg-blue-100 ring-1 ring-blue-300" : "",
        highlight && !disabled ? "hover:bg-blue-100" : "",
      )}
    >
      <span className="flex items-center justify-center">{icon}</span>
      <span className="text-[9px] font-medium text-black leading-tight text-center max-w-[56px]" style={{ fontFamily: 'Poppins, sans-serif' }}>{label}</span>
    </button>
  );
}

function RibbonGroup({ label, children, flex = 1 }: { label: string; children: React.ReactNode; flex?: number }) {
  return (
    <div className="flex items-stretch" style={{ flex }}>
      <div className="flex flex-col w-full">
        <div className="text-center pt-1 pb-0.5">
          <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase" style={{ fontFamily: 'Poppins, sans-serif' }}>{label}</span>
        </div>
        <div className="flex items-stretch justify-evenly px-1 pb-1 pt-0 flex-1">
          {children}
        </div>
      </div>
      <div className="w-px bg-slate-200 my-1 self-stretch flex-shrink-0" />
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

interface HeaderProps {
  onExport: (fileName?: string) => void;
  onGenerateOut: () => void;
  isGeneratingOut: boolean;
  pendingGenerateMode: 'inp' | 'out' | null;
  onClearPendingMode: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onLoad: () => void;
  onShowDiagram?: () => void;
  onVisualization?: () => void;
  activeLinkTool?: 'pump' | 'checkValve' | 'turbine' | null;
  onSetLinkTool?: (tool: 'pump' | 'checkValve' | 'turbine' | null) => void;
}

export function Header({
  onExport,
  onGenerateOut,
  isGeneratingOut,
  pendingGenerateMode,
  onClearPendingMode,
  onSave,
  onSaveAs,
  onLoad,
  onShowDiagram,
  onVisualization,
  activeLinkTool,
  onSetLinkTool,
}: HeaderProps) {
  const { toast } = useToast();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showFlexTable, setShowFlexTable] = useState(false);
  const [showOutputDialog, setShowOutputDialog] = useState(false);
  const [showCompParams, setShowCompParams] = useState(false);
  const [generateDialogMode, setGenerateDialogMode] = useState<'inp' | 'out' | null>(null);

  // When Designer signals validation passed, open the Output Requests dialog
  useEffect(() => {
    if (pendingGenerateMode) {
      setGenerateDialogMode(pendingGenerateMode);
      setShowOutputDialog(true);
    }
  }, [pendingGenerateMode]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);
  const {
    addNode,
    clearNetwork,
    nodes,
    edges,
    computationalParams,
    updateComputationalParams,
    outputRequests,
    addOutputRequest,
    removeOutputRequest,
    snapshotTimes,
    addSnapshotTime,
    removeSnapshotTime,
    projectName,
    setProjectName,
    projectNameError,
    setProjectNameError,
    undo,
    redo,
    history,
    loadedFileHandle,
    globalUnit,
    setGlobalUnit,
    showHoverData,
    setShowHoverData,
  } = useNetworkStore();

  const [localParams, setLocalParams] = useState(computationalParams);
  const [selectedElementId, setSelectedElementId] = useState<string>("");
  const [selectedVars, setSelectedVars] = useState<string[]>([]);
  const [requestType, setRequestType] = useState<
    "HISTORY" | "PLOT" | "SPREADSHEET" | "SNAPSHOT"
  >("HISTORY");
  const [snapshotTimeInput, setSnapshotTimeInput] = useState<string>("0");

  useEffect(() => {
    setLocalParams(computationalParams);
  }, [computationalParams]);

  const handleAddRequest = () => {
    if (!selectedElementId || selectedVars.length === 0) return;

    const [mode, id] = selectedElementId.includes(':') 
      ? selectedElementId.split(':') 
      : [null, selectedElementId];
    
    const actualId = id || selectedElementId;
    const node = nodes.find((n) => n.id === actualId);
    const type = node ? "node" : "edge";

    const allTypes: ("HISTORY" | "PLOT" | "SPREADSHEET")[] = ["HISTORY", "PLOT", "SPREADSHEET"];
    allTypes.forEach(reqType => {
      const alreadyExists = outputRequests.some(
        req => req.elementId === actualId && req.requestType === reqType && req.isElement === (mode === 'element')
      );
      if (!alreadyExists) {
        addOutputRequest({
          elementId: actualId,
          elementType: type,
          isElement: mode === 'element',
          requestType: reqType,
          variables: selectedVars,
        });
      }
    });
    toast({
      title: "Request Added",
      description: "Output request added to History, Plot, and Spreadsheet.",
    });
  };

  const selectedActualId = selectedElementId.includes(':') ? selectedElementId.split(':')[1] : selectedElementId;
  const selectedNode = nodes.find(n => n.id === selectedActualId);
  const selectedEdge = edges.find(e => e.id === selectedActualId);
  const isTurbineSelected =
    (selectedNode && (selectedNode.type === 'turbine' || selectedNode.data?.type === 'turbine')) ||
    (selectedEdge && selectedEdge.data?.type === 'turbine');
  const availableVars = isTurbineSelected
    ? ["Q", "HEAD", "SPEED", "POWER"]
    : ["Q", "HEAD", "ELEV", "VEL", "PRESS", "PIEZHEAD"];

  const handleGenerateOutDirectly = async (fileName?: string) => {
    try {
      // 1. Generate INP content from current state
      const { generateInpFile } = await import("@/lib/inp-generator");
      const inpContent = generateInpFile(nodes, edges, false);

      // 2. Send to backend to run WHAMO
      const response = await fetch("/api/run-whamo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inpContent }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "WHAMO simulation failed.");
      }

      const data = await response.json();
      
      // Handle both array and object formats for maximum compatibility
      const filesToDownload = Array.isArray(data.files) 
        ? data.files 
        : Object.entries(data.files || {}).map(([key, content]) => ({
            name: `network.${key}`,
            content: content as string,
            type: "text/plain"
          }));

      if (filesToDownload.length === 0) {
        throw new Error("No output files received from server");
      }

      filesToDownload.forEach((file: { name: string; content: string; type?: string }) => {
        const byteCharacters = atob(file.content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: file.type || "text/plain" });
        
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        const downloadName = (projectName && projectName !== "Untitled Network") ? projectName : "network";
        const extension = file.name.split('.').pop();
        link.download = `${downloadName}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      });

      toast({
        title: "Success",
        description: "WHAMO output files generated and downloaded.",
      });
    } catch (error: any) {
      console.error("WHAMO Error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    if (!projectName.trim() || projectName === "Untitled Network") {
      setProjectNameError("Please enter a file name");
      toast({
        title: "Validation Error",
        description: "Please enter a specific project name before downloading.",
        variant: "destructive",
      });
      return;
    }
    // Runs validation in Designer → if passes, sets pendingGenerateMode → triggers useEffect above
    onExport(projectName);
  };

  const handleOutGenerate = () => {
    if (!projectName.trim() || projectName === "Untitled Network") {
      setProjectNameError("Please enter a file name");
      toast({
        title: "Validation Error",
        description: "Please enter a specific project name before generating .OUT.",
        variant: "destructive",
      });
      return;
    }
    // Runs validation in Designer → if passes, sets pendingGenerateMode → triggers useEffect above
    onGenerateOut();
  };

  const handleConfirmGenerate = () => {
    setShowOutputDialog(false);
    setGenerateDialogMode(null);
    onClearPendingMode();
    if (generateDialogMode === 'inp') {
      // force=true skips re-validation, proceeds directly to file generation
      onExport(true as any);
    } else if (generateDialogMode === 'out') {
      handleGenerateOutDirectly(projectName);
    }
  };

  const handleCloseOutputDialog = (open: boolean) => {
    setShowOutputDialog(open);
    if (!open) {
      setGenerateDialogMode(null);
      onClearPendingMode();
    }
  };

  return (
    <div className="flex flex-col border-b bg-white shadow-sm">

      {/* ── TITLE BAR ── */}
      <div className="flex items-center gap-1 px-3 py-1 border-b border-slate-100 bg-white">
        {/* LEFT: File ops + Undo/Redo */}
        <div className="flex items-center gap-0.5">
          <TitleBarBtn imgSrc={addFileIcon} label="New" onClick={() => { clearNetwork(); }} />
          <TitleBarBtn imgSrc={openFolderIcon} label="Open" onClick={onLoad} />
          <TitleBarBtn imgSrc={floppyDiskIcon} label="Save" onClick={onSave} />
          <TitleBarBtn imgSrc={disketteIcon} label="Save As" onClick={onSaveAs} />
          <div className="w-px bg-slate-200 mx-1 h-5 flex-shrink-0" />
          <TitleBarBtn icon={<Undo2 className="w-[16px] h-[16px]" />} label="Undo" onClick={undo} disabled={history.past.length === 0} />
          <TitleBarBtn icon={<Redo2 className="w-[16px] h-[16px]" />} label="Redo" onClick={redo} disabled={history.future.length === 0} />
        </div>

        {/* CENTER: folder icon + project name */}
        <div className="flex-1 flex justify-center items-center gap-2">
          <img src={folderIcon} alt="Folder" className="w-6 h-6 object-contain flex-shrink-0" />
          <input
            className={`text-sm font-medium text-black bg-transparent border focus:ring-1 focus:ring-blue-500 px-1.5 py-0.5 rounded outline-none hover:bg-slate-50 min-w-[180px] ${projectNameError ? 'border-red-400 ring-1 ring-red-400' : 'border-transparent'}`}
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name..."
          />
          {projectNameError && (
            <div className="flex items-center gap-1 text-[10px] text-yellow-600 font-medium bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">
              <AlertCircle className="w-3 h-3 text-red-500" />
              {projectNameError}
            </div>
          )}
        </div>

        {/* RIGHT: Units pill */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-medium">Units:</span>
          <div className="flex items-center rounded-full border border-slate-300 bg-white overflow-hidden shadow-sm">
            <button
              onClick={() => setGlobalUnit('SI')}
              className={`text-[11px] font-semibold px-3 py-0.5 transition-colors ${globalUnit === 'SI' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >SI</button>
            <button
              onClick={() => setGlobalUnit('FPS')}
              className={`text-[11px] font-semibold px-3 py-0.5 transition-colors ${globalUnit === 'FPS' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >FPS</button>
          </div>
        </div>
      </div>

      {/* ── RIBBON ── */}
      <div className="flex items-stretch bg-[#f3f5f9] border-b border-slate-200 w-full">

        <RibbonGroup label="Insert" flex={8}>
          <InlineRibbonBtn imgSrc={damIcon} label="Reservoir" onClick={() => addNode("reservoir", { x: 100, y: 100 })} />
          <InlineRibbonBtn imgSrc={nodeCircleIcon} label="Node" onClick={() => addNode("node", { x: 150, y: 150 })} />
          <InlineRibbonBtn imgSrc={yIntersectionIcon} label="Junction" onClick={() => addNode("junction", { x: 200, y: 150 })} />
          <InlineRibbonBtn imgSrc={waterTankIcon} label="Surge Tank" onClick={() => addNode("surgeTank", { x: 250, y: 100 })} />
          <InlineRibbonBtn imgSrc={windIcon} label="Flow BC" onClick={() => addNode("flowBoundary", { x: 50, y: 150 })} />
          <InlineRibbonBtn
            imgSrc={waterPumpIcon}
            label="Pump"
            onClick={() => onSetLinkTool?.(activeLinkTool === 'pump' ? null : 'pump')}
            active={activeLinkTool === 'pump'}
            data-testid="ribbon-btn-pump"
          />
          <InlineRibbonBtn
            imgSrc={pipeIcon}
            label="Check Valve"
            onClick={() => onSetLinkTool?.(activeLinkTool === 'checkValve' ? null : 'checkValve')}
            active={activeLinkTool === 'checkValve'}
            data-testid="ribbon-btn-checkvalve"
          />
          <InlineRibbonBtn
            imgSrc={turbineImgIcon}
            label="Turbine"
            onClick={() => onSetLinkTool?.(activeLinkTool === 'turbine' ? null : 'turbine')}
            active={activeLinkTool === 'turbine'}
            data-testid="ribbon-btn-turbine"
          />
        </RibbonGroup>

        <RibbonGroup label="Tools" flex={4}>
          <InlineRibbonBtn imgSrc={networkIcon} label="Diagram" onClick={onShowDiagram} />
          <InlineRibbonBtn
            imgSrc={clickIcon}
            label="Node Sel."
            onClick={() => window.dispatchEvent(new CustomEvent('toggleNodeSelection'))}
          />
          <InlineRibbonBtn
            imgSrc={tabletIcon}
            label="Flex Table"
            onClick={() => setShowFlexTable(true)}
            data-testid="ribbon-btn-flextable"
          />
          <InlineRibbonBtn
            imgSrc={chartIcon}
            label="Visualization"
            onClick={onVisualization}
            data-testid="ribbon-btn-visualization"
          />
        </RibbonGroup>

        <RibbonGroup label="Analysis" flex={2}>
          <InlineRibbonBtn
            imgSrc={settingsWrenchIcon}
            label="Comp. Params"
            onClick={() => setShowCompParams(true)}
          />
          <InlineRibbonBtn
            imgSrc={equalizerIcon}
            label="Output Req."
            onClick={() => { setGenerateDialogMode(null); setShowOutputDialog(true); }}
          />
        </RibbonGroup>

        <RibbonGroup label="Generate" flex={2}>
          <InlineRibbonBtn
            imgSrc={inputIcon}
            label="Generate .INP"
            onClick={handleExport}
            data-testid="ribbon-btn-generate-inp"
          />
          <InlineRibbonBtn
            imgSrc={outputIcon}
            label={isGeneratingOut ? "Processing..." : "Generate .OUT"}
            onClick={handleOutGenerate}
            disabled={isGeneratingOut}
            data-testid="ribbon-btn-generate-out"
          />
        </RibbonGroup>

        <RibbonGroup label="View" flex={2}>
          <InlineRibbonBtn
            imgSrc={gridIcon}
            label="Grid"
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-grid'))}
          />
          <InlineRibbonBtn
            imgSrc={fullscreenIcon}
            label={isFullscreen ? "Exit FS" : "Full Screen"}
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen();
              }
            }}
          />
        </RibbonGroup>

      </div>

      {/* ── COMPUTATION PARAMETERS DIALOG ── */}
      <Dialog open={showCompParams} onOpenChange={setShowCompParams}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Computational Parameters</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Time Stages</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    const newStages = [...computationalParams.stages, { dtcomp: 0.01, dtout: 0.1, tmax: 100 }];
                    updateComputationalParams({ stages: newStages });
                  }}
                >
                  Add Stage
                </Button>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {computationalParams.stages.map((stage, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-md bg-muted/20 relative group">
                    <div className="col-span-3 space-y-1">
                      <Label className="text-[10px]">DTCOMP</Label>
                      <Input
                        type="text" inputMode="decimal"
                        step="0.001"
                        className="h-8 text-xs"
                        value={stage.dtcomp}
                        onChange={e => {
                          const newStages = [...computationalParams.stages];
                          newStages[index] = { ...stage, dtcomp: parseFloat(e.target.value) || 0 };
                          updateComputationalParams({ stages: newStages });
                        }}
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-[10px]">DTOUT</Label>
                      <Input
                        type="text" inputMode="decimal"
                        step="0.01"
                        className="h-8 text-xs"
                        value={stage.dtout}
                        onChange={e => {
                          const newStages = [...computationalParams.stages];
                          newStages[index] = { ...stage, dtout: parseFloat(e.target.value) || 0 };
                          updateComputationalParams({ stages: newStages });
                        }}
                      />
                    </div>
                    <div className="col-span-4 space-y-1">
                      <Label className="text-[10px]">TMAX</Label>
                      <Input
                        type="text" inputMode="decimal"
                        className="h-8 text-xs"
                        value={stage.tmax}
                        onChange={e => {
                          const newStages = [...computationalParams.stages];
                          newStages[index] = { ...stage, tmax: parseFloat(e.target.value) || 0 };
                          updateComputationalParams({ stages: newStages });
                        }}
                      />
                    </div>
                    <div className="col-span-2 pb-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={computationalParams.stages.length === 1}
                        onClick={() => {
                          const newStages = computationalParams.stages.filter((_, i) => i !== index);
                          updateComputationalParams({ stages: newStages });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeAccutest-ribbon"
                  checked={computationalParams.includeAccutest !== false}
                  onCheckedChange={(checked) => updateComputationalParams({ includeAccutest: !!checked })}
                />
                <Label htmlFor="includeAccutest-ribbon" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Include ACCUTEST in .INP
                </Label>
              </div>
              <div className="space-y-2" data-disabled={computationalParams.includeAccutest === false}>
                <Label htmlFor="accutest-ribbon">ACCUTEST Mode</Label>
                <Select
                  disabled={computationalParams.includeAccutest === false}
                  value={computationalParams.accutest || 'NONE'}
                  onValueChange={(v: any) => updateComputationalParams({ accutest: v })}
                >
                  <SelectTrigger id="accutest-ribbon">
                    <SelectValue placeholder="Select accuracy mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL">FULL (High Accuracy)</SelectItem>
                    <SelectItem value="PARTIAL">PARTIAL (Moderate)</SelectItem>
                    <SelectItem value="NONE">NONE (No Checking)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── HELP DIALOG ── */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto text-black">
          <DialogHeader>
            <DialogTitle>How to use this Software</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <section>
              <h4 className="font-semibold text-lg">Introduction</h4>
              <p className="text-sm text-muted-foreground">This hydraulic transient analysis software allows you to design and simulate water networks, analyzing pressure surges and flow changes over time.</p>
            </section>
            <section>
              <h4 className="font-semibold text-base">Designing your Network</h4>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Use the ribbon Insert group to add Reservoirs, Nodes, Junctions, Surge Tanks, and Flow Boundaries.</li>
                <li>Click and drag from a blue dot on one node to another to create a Conduit (pipe).</li>
                <li>Double-click on any element to edit its properties (Elevation, Length, Diameter, etc.) in the sidebar.</li>
              </ul>
            </section>
            <section>
              <h4 className="font-semibold text-base">Simulation &amp; Output</h4>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Set your simulation time and steps in Analysis &gt; Comp. Params.</li>
                <li>Configure which variables you want to track in Analysis &gt; Output Req.</li>
                <li>Use Generate .INP to get the input file or Generate .OUT to run the simulation and get results.</li>
              </ul>
            </section>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowHelp(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Output Requests Dialog — top-level so it stays mounted even when Tools menu is closed */}
      <Dialog open={showOutputDialog} onOpenChange={handleCloseOutputDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Configure Output Requests</DialogTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const types: ("HISTORY" | "PLOT" | "SPREADSHEET")[] = ["HISTORY", "PLOT", "SPREADSHEET"];
                    const variables = ["Q", "HEAD", "ELEV", "VEL", "PRESS", "PIEZHEAD"];
                    nodes.forEach(node => {
                      const isSurgeTank = node.data.type === 'surgeTank';
                      types.forEach(type => {
                        const existsNode = outputRequests.some(req =>
                          req.elementId === node.id &&
                          req.requestType === type &&
                          req.isElement === false
                        );
                        if (!existsNode) {
                          addOutputRequest({ elementId: node.id, elementType: "node", requestType: type, isElement: false, variables: [...variables] });
                        }
                        if (isSurgeTank) {
                          const existsElem = outputRequests.some(req =>
                            req.elementId === node.id &&
                            req.requestType === type &&
                            req.isElement === true
                          );
                          if (!existsElem) {
                            addOutputRequest({ elementId: node.id, elementType: "node", requestType: type, isElement: true, variables: [...variables] });
                          }
                        }
                      });
                    });
                    const uniqueEdges = Array.from(new Map(edges.map(e => [e.data?.label || e.id, e])).values());
                    uniqueEdges.forEach(edge => {
                      types.forEach(type => {
                        const exists = outputRequests.some(req => req.elementId === edge.id && req.requestType === type);
                        if (!exists) {
                          addOutputRequest({ elementId: edge.id, elementType: "edge", requestType: type, isElement: true, variables: [...variables] });
                        }
                      });
                    });
                  }}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { [...outputRequests].forEach(req => removeOutputRequest(req.id)); }}
                  className="text-destructive hover:text-destructive"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {requestType !== "SNAPSHOT" && (
              <div className="grid gap-2">
                <Label>Select Element</Label>
                <Select value={selectedElementId} onValueChange={setSelectedElementId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select element..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_" disabled>Elements</SelectItem>
                    {nodes
                      .filter((n) => n.data.type === "surgeTank" || n.data.type === "pump" || n.data.type === "checkValve" || n.data.type === "turbine" || n.type === "surgeTank" || n.type === "pump" || n.type === "checkValve" || n.type === "turbine")
                      .filter((n) => !outputRequests.some((req) => req.elementId === n.id && req.requestType === requestType && req.isElement))
                      .map((n) => (
                        <SelectItem key={`element-${n.id}`} value={`element:${n.id}`}>{n.data.label}</SelectItem>
                      ))}
                    {Array.from(new Map(
                      edges.filter((e) => e.data?.type === "turbine")
                        .filter((e) => !outputRequests.some((req) => req.elementId === e.id && req.requestType === requestType))
                        .map(e => [e.data?.label || `Edge ${e.id}`, e])
                    ).entries()).map(([label, e]) => (
                      <SelectItem key={`turbine-edge-${e.id}`} value={e.id}>{label}</SelectItem>
                    ))}
                    <SelectItem value="__" disabled>Nodes</SelectItem>
                    {nodes
                      .filter((n) => !outputRequests.some((req) => req.elementId === n.id && req.requestType === requestType && !req.isElement))
                      .map((n) => (
                        <SelectItem key={`node-${n.id}`} value={`node:${n.id}`}>{String(n.data.nodeNumber)}</SelectItem>
                      ))}
                    <SelectItem value="___" disabled>Conduits</SelectItem>
                    {Array.from(new Map(
                      edges.filter((e) => e.data?.type === "conduit")
                        .filter((e) => !outputRequests.some((req) => req.elementId === e.id && req.requestType === requestType))
                        .map(e => [e.data?.label || `Edge ${e.id}`, e])
                    ).entries()).map(([label, e]) => (
                      <SelectItem key={e.id} value={e.id}>{label}</SelectItem>
                    ))}
                    <SelectItem value="____" disabled>Dummy pipe</SelectItem>
                    {Array.from(new Map(
                      edges.filter((e) => e.data?.type === "dummy")
                        .filter((e) => !outputRequests.some((req) => req.elementId === e.id && req.requestType === requestType))
                        .map(e => [e.data?.label || `Edge ${e.id}`, e])
                    ).entries()).map(([label, e]) => (
                      <SelectItem key={e.id} value={e.id}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label>Request Type</Label>
              <Select value={requestType} onValueChange={(v: any) => setRequestType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HISTORY">HISTORY</SelectItem>
                  <SelectItem value="PLOT">PLOT</SelectItem>
                  <SelectItem value="SPREADSHEET">SPREADSHEET</SelectItem>
                  <SelectItem value="SNAPSHOT">SNAPSHOT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {requestType === "SNAPSHOT" ? (
              <>
                <div className="grid gap-2">
                  <Label>TIME</Label>
                  <input
                    type="text" inputMode="decimal"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={snapshotTimeInput}
                    onChange={(e) => setSnapshotTimeInput(e.target.value)}
                    placeholder="e.g. 0"
                    data-testid="input-snapshot-time"
                  />
                </div>
                <Button
                  onClick={() => {
                    const t = parseFloat(snapshotTimeInput);
                    if (!isNaN(t)) {
                      addSnapshotTime(t);
                      setSnapshotTimeInput("0");
                      toast({ title: "Snapshot Added", description: `SNAPSHOT TIME ${t} added.` });
                    }
                  }}
                  data-testid="button-add-snapshot"
                >
                  Add Snapshot
                </Button>
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label>Variables</Label>
                  <div className="flex flex-wrap gap-4">
                    {availableVars.map((v) => (
                      <div key={v} className="flex items-center gap-2">
                        <Checkbox
                          id={`header-var-${v}`}
                          checked={selectedVars.includes(v)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedVars([...selectedVars, v]);
                            else setSelectedVars(selectedVars.filter((sv) => sv !== v));
                          }}
                        />
                        <Label htmlFor={`header-var-${v}`}>{v}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={handleAddRequest} data-testid="button-add-request">Add Request</Button>
              </>
            )}
            <Separator />
            <div className="max-h-[200px] overflow-auto">
              <Label className="mb-2 block">Current Requests ({requestType})</Label>
              {requestType === "SNAPSHOT" ? (
                snapshotTimes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No snapshots added yet.</p>
                ) : (
                  snapshotTimes.map((t, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-1 border-b">
                      <span>SNAPSHOT TIME {t}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeSnapshotTime(i)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))
                )
              ) : (
                [...outputRequests]
                  .filter((req) => req.requestType === requestType)
                  .sort((a, b) => {
                    const elA = nodes.find((n) => n.id === a.elementId) || edges.find((e) => e.id === a.elementId);
                    const elB = nodes.find((n) => n.id === b.elementId) || edges.find((e) => e.id === b.elementId);
                    const getSortKey = (el) => {
                      if (!el) return "zzzz";
                      if (el.data?.nodeNumber !== undefined) return `node-${String(el.data.nodeNumber).padStart(10, '0')}`;
                      return `edge-${el.data?.label || el.id}`;
                    };
                    return getSortKey(elA).localeCompare(getSortKey(elB), undefined, { numeric: true });
                  })
                  .map((req) => {
                    const el = nodes.find((n) => n.id === req.elementId) || edges.find((e) => e.id === req.elementId);
                    const isEdgeElem = req.elementType === 'edge';
                    const isSurgeTankElem = req.elementType === 'node' && el?.data?.type === 'surgeTank' && req.isElement;
                    const useElem = isEdgeElem || isSurgeTankElem;
                    const displayLabel = useElem
                      ? (el?.data?.label || req.elementId)
                      : (el?.data?.nodeNumber?.toString() || el?.data?.label || req.elementId);
                    const prefix = useElem ? 'ELEM' : 'NODE';
                    return (
                      <div key={`${req.id}-${req.requestType}`} className="flex items-center justify-between text-sm py-1 border-b">
                        <span>{prefix} {displayLabel} ({req.requestType}): {req.variables.join(", ")}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeOutputRequest(req.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
          {generateDialogMode && (
            <DialogFooter className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mr-auto self-center">
                Review output requests above, then continue to generate the file.
              </p>
              <Button
                onClick={handleConfirmGenerate}
                className="bg-[#1a73e8] hover:bg-[#1557b0] text-white"
                data-testid="button-confirm-generate"
              >
                <Download className="w-4 h-4 mr-2" />
                Generate .{generateDialogMode === 'inp' ? 'INP' : 'OUT'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <FlexTable open={showFlexTable} onClose={() => setShowFlexTable(false)} />
    </div>
  );
}
