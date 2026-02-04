"use client";
import { useState, useEffect, useRef } from "react";
import {
  ComposedChart, Scatter, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ZAxis,
} from "recharts";
import {
  BoilingDataset, BoilingDataPoint, ExperimentMeta, LiteratureMeta, DataBackup,
  loadDatasets, deleteDataset, updateDataset,
  loadBackups, createBackup, restoreBackup, deleteBackup, downloadBackup, importBackup
} from "@/lib/boiling-data";

const COLORS = ["#0891b2", "#059669", "#db2777", "#ca8a04", "#7c3aed", "#ea580c", "#dc2626", "#2563eb", "#65a30d", "#c026d3"];

// Custom line renderer that draws lines in data entry order (not sorted by x)
interface OrderedLineProps {
  data: { tSurf: number; qFlux: number }[];
  xAxisMap?: Record<string, { scale: (v: number) => number }>;
  yAxisMap?: Record<string, { scale: (v: number) => number }>;
  stroke: string;
  strokeWidth?: number;
}

function OrderedLine({ data, xAxisMap, yAxisMap, stroke, strokeWidth = 2 }: OrderedLineProps) {
  if (!data || data.length < 2 || !xAxisMap || !yAxisMap) return null;

  const xScale = xAxisMap[0]?.scale || xAxisMap["0"]?.scale;
  const yScale = yAxisMap[0]?.scale || yAxisMap["0"]?.scale;

  if (!xScale || !yScale) return null;

  const pathD = data.map((point, i) => {
    const x = xScale(point.tSurf);
    const y = yScale(point.qFlux);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return <path d={pathD} stroke={stroke} strokeWidth={strokeWidth} fill="none" />;
}

export default function DataManageTab() {
  const [datasets, setDatasets] = useState<BoilingDataset[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Edit mode states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editMeta, setEditMeta] = useState<ExperimentMeta | LiteratureMeta>({});
  const [editData, setEditData] = useState<BoilingDataPoint[]>([]);
  const [newPoint, setNewPoint] = useState<{ tSurf: string; qFlux: string }>({ tSurf: "", qFlux: "" });
  const [saveStatus, setSaveStatus] = useState<"" | "saved" | "error">("");

  // Backup states
  const [backups, setBackups] = useState<DataBackup[]>([]);
  const [showBackups, setShowBackups] = useState(false);
  const [backupName, setBackupName] = useState("");
  const [backupStatus, setBackupStatus] = useState<"" | "created" | "restored" | "error">("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [ds, bk] = await Promise.all([loadDatasets(), loadBackups()]);
      setDatasets(ds);
      setBackups(bk);
      setLoading(false);
    };
    fetchData();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const [ds, bk] = await Promise.all([loadDatasets(), loadBackups()]);
    setDatasets(ds);
    setBackups(bk);
    setLoading(false);
  };

  // Backup functions
  const handleCreateBackup = async () => {
    try {
      await createBackup(backupName || undefined);
      setBackupName("");
      const bk = await loadBackups();
      setBackups(bk);
      setBackupStatus("created");
      setTimeout(() => setBackupStatus(""), 2000);
    } catch {
      setBackupStatus("error");
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (confirm("현재 데이터를 이 백업으로 복원하시겠습니까? 현재 데이터는 덮어씌워집니다.")) {
      const success = await restoreBackup(backupId);
      if (success) {
        await refresh();
        setBackupStatus("restored");
        setTimeout(() => setBackupStatus(""), 2000);
      } else {
        setBackupStatus("error");
      }
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (confirm("이 백업을 삭제하시겠습니까?")) {
      await deleteBackup(backupId);
      const bk = await loadBackups();
      setBackups(bk);
    }
  };

  const handleDownloadBackup = (backup: DataBackup) => {
    downloadBackup(backup);
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await importBackup(file);
    if (result) {
      const bk = await loadBackups();
      setBackups(bk);
      setBackupStatus("created");
      setTimeout(() => setBackupStatus(""), 2000);
    } else {
      setBackupStatus("error");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDataset(id);
    await refresh();
    setSelected((s) => { const n = new Set(s); n.delete(id); return n; });
    if (expandedId === id) setExpandedId(null);
    if (editingId === id) cancelEdit();
  };

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const selectAll = () => {
    if (selected.size === datasets.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(datasets.map((d) => d.id)));
    }
  };

  // Start editing a dataset
  const startEdit = (ds: BoilingDataset) => {
    setEditingId(ds.id);
    setEditName(ds.name);
    setEditMeta(ds.source === "experiment" ? { ...ds.experiment } : { ...ds.literature });
    setEditData([...ds.data]);
    setNewPoint({ tSurf: "", qFlux: "" });
    setSaveStatus("");
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditMeta({});
    setEditData([]);
    setNewPoint({ tSurf: "", qFlux: "" });
    setSaveStatus("");
  };

  // Save edited dataset
  const saveEdit = async (ds: BoilingDataset) => {
    try {
      const updates: Partial<BoilingDataset> = {
        name: editName,
        data: editData,
      };
      if (ds.source === "experiment") {
        updates.experiment = editMeta as ExperimentMeta;
      } else {
        updates.literature = editMeta as LiteratureMeta;
      }
      await updateDataset(ds.id, updates);
      await refresh();
      setSaveStatus("saved");
      setTimeout(() => {
        cancelEdit();
      }, 800);
    } catch {
      setSaveStatus("error");
    }
  };

  // Update metadata field
  const updateMetaField = (key: string, value: string) => {
    setEditMeta((prev) => ({ ...prev, [key]: value }));
  };

  // Update data point
  const updateDataPoint = (index: number, field: "tSurf" | "qFlux", value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setEditData((prev) => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [field]: num };
      return newData;
    });
  };

  // Delete data point
  const deleteDataPoint = (index: number) => {
    setEditData((prev) => prev.filter((_, i) => i !== index));
  };

  // Add new data point
  const addDataPoint = () => {
    const tSurf = parseFloat(newPoint.tSurf);
    const qFlux = parseFloat(newPoint.qFlux);
    if (isNaN(tSurf) || isNaN(qFlux)) return;
    setEditData((prev) => [...prev, { tSurf, qFlux }]);
    setNewPoint({ tSurf: "", qFlux: "" });
  };

  // Export to CSV
  const exportCSV = (ds: BoilingDataset) => {
    const header = "T_surf (°C),q'' (kW/m²)\n";
    const rows = ds.data
      .map((p) => `${p.tSurf},${p.qFlux}`)
      .join("\n"); // 입력 순서 유지
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${ds.name.replace(/[^a-z0-9]/gi, "_")}_data.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export to JSON
  const exportJSON = (ds: BoilingDataset) => {
    const json = JSON.stringify(ds, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${ds.name.replace(/[^a-z0-9]/gi, "_")}_dataset.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const expandedDs = expandedId ? datasets.find((d) => d.id === expandedId) : null;
  const selectedDs = datasets.filter((d) => selected.has(d.id));

  // Build chart data for 1+ selected datasets
  const chartData = (() => {
    if (selectedDs.length === 0) return null;
    const tSurfSet = new Set<number>();
    for (const ds of selectedDs) for (const p of ds.data) tSurfSet.add(p.tSurf);
    const sorted = [...tSurfSet].sort((a, b) => a - b);
    const allPoints: { tSurf: number; [key: string]: number }[] = [];
    for (const t of sorted) {
      const point: Record<string, number> = { tSurf: t };
      for (const ds of selectedDs) {
        const match = ds.data.find((p) => p.tSurf === t);
        if (match) point[ds.id] = match.qFlux;
      }
      allPoints.push(point as { tSurf: number });
    }
    return allPoints;
  })();

  const lbl = "text-gray-500 text-[10px] font-mono uppercase tracking-wider";

  const getMetaFields = (ds: BoilingDataset): { key: string; label: string; value: string }[] => {
    const entries: { key: string; label: string; value: string }[] = [];
    if (ds.source === "experiment" && ds.experiment) {
      const m = ds.experiment;
      entries.push({ key: "date", label: "Date", value: m.date || "" });
      entries.push({ key: "experimenter", label: "Experimenter", value: m.experimenter || "" });
      entries.push({ key: "fluid", label: "Fluid", value: m.fluid || "" });
      entries.push({ key: "subcooling", label: "Subcooling", value: m.subcooling || "" });
      entries.push({ key: "pressure", label: "Pressure", value: m.pressure || "" });
      entries.push({ key: "bulkFluidTemp", label: "Bulk Fluid Temp", value: m.bulkFluidTemp || "" });
      entries.push({ key: "orientation", label: "Orientation", value: m.orientation || "" });
      entries.push({ key: "flowVelocity", label: "Flow Velocity", value: m.flowVelocity || "" });
      entries.push({ key: "heaterMaterial", label: "Heater Material", value: m.heaterMaterial || "" });
      entries.push({ key: "heaterSize", label: "Heater Size", value: m.heaterSize || "" });
      entries.push({ key: "heaterGeometry", label: "Heater Geometry", value: m.heaterGeometry || "" });
      entries.push({ key: "baseSurface", label: "Base Surface", value: m.baseSurface || "" });
      entries.push({ key: "ra", label: "Ra (μm)", value: m.ra || "" });
      entries.push({ key: "rz", label: "Rz (μm)", value: m.rz || "" });
      entries.push({ key: "contactAngle", label: "Contact Angle", value: m.contactAngle || "" });
      entries.push({ key: "surfaceModification", label: "Modification", value: m.surfaceModification || "" });
      entries.push({ key: "patternAreaRatio", label: "Pattern Area Ratio", value: m.patternAreaRatio || "" });
      entries.push({ key: "patternSpacing", label: "Pattern Spacing", value: m.patternSpacing || "" });
      entries.push({ key: "patternThickness", label: "Pattern Thickness", value: m.patternThickness || "" });
      entries.push({ key: "structureHeight", label: "Structure Height", value: m.structureHeight || "" });
      entries.push({ key: "porosity", label: "Porosity", value: m.porosity || "" });
      entries.push({ key: "coatingMaterial", label: "Coating Material", value: m.coatingMaterial || "" });
      entries.push({ key: "coatingThickness", label: "Coating Thickness", value: m.coatingThickness || "" });
      entries.push({ key: "wickingHeight", label: "Wicking Height", value: m.wickingHeight || "" });
      entries.push({ key: "nucleationSiteDensity", label: "Nucleation Site Density", value: m.nucleationSiteDensity || "" });
      entries.push({ key: "notes", label: "Notes", value: m.notes || "" });
    } else if (ds.source === "literature" && ds.literature) {
      const m = ds.literature;
      entries.push({ key: "title", label: "Title", value: m.title || "" });
      entries.push({ key: "authors", label: "Authors", value: m.authors || "" });
      entries.push({ key: "year", label: "Year", value: m.year || "" });
      entries.push({ key: "journal", label: "Journal", value: m.journal || "" });
      entries.push({ key: "doi", label: "DOI", value: m.doi || "" });
      entries.push({ key: "fluid", label: "Fluid", value: m.fluid || "" });
      entries.push({ key: "surfaceType", label: "Surface Type", value: m.surfaceType || "" });
      entries.push({ key: "surfaceRoughness", label: "Surface Roughness", value: m.surfaceRoughness || "" });
      entries.push({ key: "heaterGeometry", label: "Heater Geometry", value: m.heaterGeometry || "" });
      entries.push({ key: "heaterSize", label: "Heater Size", value: m.heaterSize || "" });
      entries.push({ key: "orientation", label: "Orientation", value: m.orientation || "" });
      entries.push({ key: "pressure", label: "Pressure", value: m.pressure || "" });
      entries.push({ key: "subcooling", label: "Subcooling", value: m.subcooling || "" });
      entries.push({ key: "flowVelocity", label: "Flow Velocity", value: m.flowVelocity || "" });
      entries.push({ key: "notes", label: "Notes", value: m.notes || "" });
    }
    return entries;
  };

  const renderMeta = (ds: BoilingDataset) => {
    return getMetaFields(ds).filter((m) => m.value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-500 font-mono text-sm">Loading datasets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Backup Section */}
      <div className="p-5 rounded-xl border bg-white border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-amber-600 font-mono tracking-wider">
            {">"} DATA BACKUP ({backups.length})
          </h3>
          <button
            onClick={() => setShowBackups(!showBackups)}
            className="px-3 py-1 rounded border border-amber-400 bg-amber-50 text-amber-700 font-mono text-xs hover:bg-amber-100 transition"
          >
            {showBackups ? "Hide" : "Show"} Backups
          </button>
        </div>

        {/* Quick backup controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            value={backupName}
            onChange={(e) => setBackupName(e.target.value)}
            placeholder="Backup name (optional)"
            className="px-3 py-1.5 rounded border border-gray-200 font-mono text-xs focus:border-amber-400 focus:outline-none w-48"
          />
          <button
            onClick={handleCreateBackup}
            disabled={datasets.length === 0}
            className="px-3 py-1.5 rounded border border-amber-500 bg-amber-500 text-white font-mono text-xs hover:bg-amber-600 transition disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed"
          >
            Create Backup
          </button>
          <input
            type="file"
            accept=".json"
            onChange={handleImportBackup}
            ref={fileInputRef}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded border border-violet-400 bg-violet-50 text-violet-700 font-mono text-xs hover:bg-violet-100 transition"
          >
            Import Backup
          </button>
          {backupStatus === "created" && (
            <span className="text-emerald-600 font-mono text-xs">Backup created!</span>
          )}
          {backupStatus === "restored" && (
            <span className="text-amber-600 font-mono text-xs">Data restored!</span>
          )}
          {backupStatus === "error" && (
            <span className="text-red-500 font-mono text-xs">Error</span>
          )}
        </div>

        {/* Backup list */}
        {showBackups && (
          <div className="mt-4 space-y-2">
            {backups.length === 0 ? (
              <p className="text-gray-400 font-mono text-sm">No backups yet.</p>
            ) : (
              backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-amber-50/50 border-amber-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-800 font-mono text-sm font-semibold truncate">
                      {backup.name}
                    </div>
                    <div className="text-gray-400 font-mono text-[10px]">
                      {backup.datasetCount} datasets · {new Date(backup.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleRestoreBackup(backup.id)}
                      className="px-2 py-1 rounded border border-emerald-400 bg-emerald-50 text-emerald-700 font-mono text-[10px] hover:bg-emerald-100 transition"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handleDownloadBackup(backup)}
                      className="px-2 py-1 rounded border border-cyan-400 bg-cyan-50 text-cyan-700 font-mono text-[10px] hover:bg-cyan-100 transition"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDeleteBackup(backup.id)}
                      className="text-red-500 hover:text-red-400 font-mono text-xs px-2"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Dataset list */}
      <div className="p-5 rounded-xl border bg-white border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-cyan-600 font-mono tracking-wider">
            {">"} SAVED DATASETS ({datasets.length})
          </h3>
          <div className="flex gap-2">
            {datasets.length > 0 && (
              <button
                onClick={selectAll}
                className="px-3 py-1 rounded border border-cyan-400 bg-cyan-50 text-cyan-700 font-mono text-xs hover:bg-cyan-100 transition"
              >
                {selected.size === datasets.length ? "Deselect All" : "Select All"}
              </button>
            )}
            <button onClick={refresh} className="px-3 py-1 rounded border border-gray-300 bg-gray-50 text-gray-500 font-mono text-xs hover:border-gray-400 transition">
              Refresh
            </button>
          </div>
        </div>
        {datasets.length === 0 ? (
          <p className="text-gray-400 font-mono text-sm">No datasets saved yet.</p>
        ) : (
          <div className="space-y-2">
            {datasets.map((ds) => {
              const isExpanded = expandedId === ds.id;
              const isEditing = editingId === ds.id;
              const meta = renderMeta(ds);
              const metaFields = getMetaFields(ds);
              return (
                <div key={ds.id}>
                  <div
                    className={`flex items-center gap-3 p-3 rounded-lg border transition cursor-pointer ${
                      isExpanded
                        ? "bg-cyan-50 border-cyan-400 rounded-b-none"
                        : "bg-gray-50 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(ds.id)}
                      onChange={() => toggleSelect(ds.id)}
                      className="accent-cyan-500 shrink-0"
                    />
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => setExpandedId(isExpanded ? null : ds.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs font-mono">{isExpanded ? "▼" : "▶"}</span>
                        <span className="text-gray-800 font-mono text-sm font-semibold truncate">{ds.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                          ds.source === "literature"
                            ? "bg-pink-100 text-pink-600 border border-pink-200"
                            : "bg-cyan-100 text-cyan-600 border border-cyan-200"
                        }`}>
                          {ds.source === "literature" ? "LIT" : "EXP"}
                        </span>
                      </div>
                      <div className="text-gray-400 font-mono text-[10px] ml-5">
                        {ds.data.length} points · {new Date(ds.createdAt).toLocaleString()}
                        {ds.experiment?.fluid && ` · ${ds.experiment.fluid}`}
                        {ds.literature?.fluid && ` · ${ds.literature.fluid}`}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(ds.id); }}
                      className="text-red-500 hover:text-red-400 font-mono text-sm px-2 shrink-0"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border border-t-0 border-cyan-400 rounded-b-lg bg-white p-4 space-y-4">
                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {!isEditing ? (
                          <>
                            <button
                              onClick={() => startEdit(ds)}
                              className="px-3 py-1.5 rounded border border-cyan-400 bg-cyan-50 text-cyan-700 font-mono text-xs hover:bg-cyan-100 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => exportCSV(ds)}
                              className="px-3 py-1.5 rounded border border-emerald-400 bg-emerald-50 text-emerald-700 font-mono text-xs hover:bg-emerald-100 transition"
                            >
                              Export CSV
                            </button>
                            <button
                              onClick={() => exportJSON(ds)}
                              className="px-3 py-1.5 rounded border border-violet-400 bg-violet-50 text-violet-700 font-mono text-xs hover:bg-violet-100 transition"
                            >
                              Export JSON
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => saveEdit(ds)}
                              className="px-3 py-1.5 rounded border border-emerald-500 bg-emerald-500 text-white font-mono text-xs hover:bg-emerald-600 transition"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1.5 rounded border border-gray-300 bg-gray-50 text-gray-600 font-mono text-xs hover:bg-gray-100 transition"
                            >
                              Cancel
                            </button>
                            {saveStatus === "saved" && (
                              <span className="text-emerald-600 font-mono text-xs">Saved!</span>
                            )}
                            {saveStatus === "error" && (
                              <span className="text-red-500 font-mono text-xs">Error saving</span>
                            )}
                          </>
                        )}
                      </div>

                      {/* Dataset name (editable) */}
                      {isEditing && (
                        <div>
                          <div className={`${lbl} mb-2`}>Dataset Name</div>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full max-w-md px-3 py-2 rounded border border-gray-300 font-mono text-sm focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                      )}

                      {/* Metadata */}
                      {(meta.length > 0 || isEditing) && (
                        <div>
                          <div className={`${lbl} mb-2`}>Metadata</div>
                          {!isEditing ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1">
                              {meta.map((m) => (
                                <div key={m.label} className="flex gap-1 font-mono text-xs">
                                  <span className="text-gray-400 shrink-0">{m.label}:</span>
                                  <span className="text-gray-700 truncate">{m.value}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {metaFields.map((field) => (
                                <div key={field.key} className="flex flex-col gap-1">
                                  <label className="text-gray-400 font-mono text-[10px] uppercase">{field.label}</label>
                                  <input
                                    type="text"
                                    value={(editMeta as Record<string, string>)[field.key] || ""}
                                    onChange={(e) => updateMetaField(field.key, e.target.value)}
                                    className="px-2 py-1 rounded border border-gray-200 font-mono text-xs focus:border-cyan-400 focus:outline-none"
                                    placeholder={field.label}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Data table */}
                      <div>
                        <div className={`${lbl} mb-2`}>Data Points ({isEditing ? editData.length : ds.data.length})</div>
                        <div className="rounded-lg border border-gray-200 overflow-hidden max-h-60 overflow-y-auto">
                          <table className="w-full">
                            <thead className="sticky top-0 z-10">
                              <tr className="bg-gray-50">
                                <th className="px-3 py-1.5 text-center font-mono text-[10px] text-gray-400 uppercase w-12 border-b border-r border-gray-200">#</th>
                                <th className="px-3 py-1.5 text-center font-mono text-[10px] text-cyan-600 uppercase border-b border-r border-gray-200">T_surf (°C)</th>
                                <th className="px-3 py-1.5 text-center font-mono text-[10px] text-cyan-600 uppercase border-b border-gray-200">q'' (kW/m²)</th>
                                {isEditing && (
                                  <th className="px-3 py-1.5 text-center font-mono text-[10px] text-gray-400 uppercase w-16 border-b border-l border-gray-200">Action</th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {(isEditing ? editData : ds.data).map((p, i) => (
                                <tr key={i} className="border-b border-gray-100">
                                  <td className="px-3 py-1 text-center font-mono text-[10px] text-gray-400 border-r border-gray-100">{i + 1}</td>
                                  {isEditing ? (
                                    <>
                                      <td className="px-1 py-1 text-center border-r border-gray-100">
                                        <input
                                          type="number"
                                          value={p.tSurf}
                                          onChange={(e) => updateDataPoint(i, "tSurf", e.target.value)}
                                          className="w-full px-2 py-0.5 rounded border border-gray-200 font-mono text-sm text-center focus:border-cyan-400 focus:outline-none"
                                        />
                                      </td>
                                      <td className="px-1 py-1 text-center">
                                        <input
                                          type="number"
                                          value={p.qFlux}
                                          onChange={(e) => updateDataPoint(i, "qFlux", e.target.value)}
                                          className="w-full px-2 py-0.5 rounded border border-gray-200 font-mono text-sm text-center focus:border-cyan-400 focus:outline-none"
                                        />
                                      </td>
                                      <td className="px-1 py-1 text-center border-l border-gray-100">
                                        <button
                                          onClick={() => deleteDataPoint(i)}
                                          className="text-red-500 hover:text-red-400 font-mono text-xs"
                                        >
                                          ×
                                        </button>
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td className="px-3 py-1 text-center font-mono text-sm text-gray-700">{p.tSurf}</td>
                                      <td className="px-3 py-1 text-center font-mono text-sm text-gray-700">{p.qFlux}</td>
                                    </>
                                  )}
                                </tr>
                              ))}
                              {/* Add new point row (only in edit mode) */}
                              {isEditing && (
                                <tr className="border-b border-gray-100 bg-cyan-50/50">
                                  <td className="px-3 py-1 text-center font-mono text-[10px] text-cyan-600 border-r border-gray-100">+</td>
                                  <td className="px-1 py-1 text-center border-r border-gray-100">
                                    <input
                                      type="number"
                                      value={newPoint.tSurf}
                                      onChange={(e) => setNewPoint((prev) => ({ ...prev, tSurf: e.target.value }))}
                                      placeholder="T_surf"
                                      className="w-full px-2 py-0.5 rounded border border-cyan-200 font-mono text-sm text-center focus:border-cyan-400 focus:outline-none bg-white"
                                    />
                                  </td>
                                  <td className="px-1 py-1 text-center">
                                    <input
                                      type="number"
                                      value={newPoint.qFlux}
                                      onChange={(e) => setNewPoint((prev) => ({ ...prev, qFlux: e.target.value }))}
                                      placeholder="q''"
                                      className="w-full px-2 py-0.5 rounded border border-cyan-200 font-mono text-sm text-center focus:border-cyan-400 focus:outline-none bg-white"
                                    />
                                  </td>
                                  <td className="px-1 py-1 text-center border-l border-gray-100">
                                    <button
                                      onClick={addDataPoint}
                                      disabled={!newPoint.tSurf || !newPoint.qFlux}
                                      className="text-cyan-600 hover:text-cyan-500 font-mono text-xs disabled:text-gray-300 disabled:cursor-not-allowed"
                                    >
                                      Add
                                    </button>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Single dataset chart */}
                      <div>
                        <div className={`${lbl} mb-2`}>Boiling Curve</div>
                        <ResponsiveContainer width="100%" height={280}>
                          <ComposedChart data={isEditing ? editData : ds.data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis type="number" dataKey="tSurf" name="T_surf" unit="°C" label={{ value: "T_surf (°C)", position: "insideBottom", offset: -10, fill: "#6b7280", fontSize: 12 }} tick={{ fill: "#6b7280", fontSize: 11 }} stroke="#d1d5db" domain={['dataMin', 'dataMax']} />
                            <YAxis type="number" dataKey="qFlux" name="q''" unit=" kW/m²" label={{ value: "q'' (kW/m²)", angle: -90, position: "insideLeft", offset: -5, fill: "#6b7280", fontSize: 12 }} tick={{ fill: "#6b7280", fontSize: 11 }} stroke="#d1d5db" domain={['dataMin', 'dataMax']} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontFamily: "monospace", fontSize: 12 }} />
                            <Line type="linear" dataKey="qFlux" stroke="#0891b2" strokeWidth={2} dot={false} isAnimationActive={false} />
                            <Scatter dataKey="qFlux" fill="#0891b2" />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Combined plot for selected datasets (1+) */}
      {selectedDs.length >= 1 && (
        <div className="p-5 rounded-xl border bg-white border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-cyan-600 font-mono tracking-wider mb-4">
            {">"} {selectedDs.length === 1 ? "SELECTED PLOT" : `COMPARISON (${selectedDs.length} datasets)`}
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={selectedDs[0]?.data || []} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                type="number"
                dataKey="tSurf"
                name="T_surf"
                unit="°C"
                label={{ value: "T_surf (°C)", position: "insideBottom", offset: -10, fill: "#6b7280", fontSize: 12 }}
                tick={{ fill: "#6b7280", fontSize: 11 }}
                stroke="#d1d5db"
                domain={[
                  Math.min(...selectedDs.flatMap(ds => ds.data.map(p => p.tSurf))),
                  Math.max(...selectedDs.flatMap(ds => ds.data.map(p => p.tSurf)))
                ]}
                allowDataOverflow
              />
              <YAxis
                type="number"
                dataKey="qFlux"
                name="q''"
                unit=" kW/m²"
                label={{ value: "q'' (kW/m²)", angle: -90, position: "insideLeft", offset: -5, fill: "#6b7280", fontSize: 12 }}
                tick={{ fill: "#6b7280", fontSize: 11 }}
                stroke="#d1d5db"
                domain={[
                  Math.min(...selectedDs.flatMap(ds => ds.data.map(p => p.qFlux))),
                  Math.max(...selectedDs.flatMap(ds => ds.data.map(p => p.qFlux)))
                ]}
                allowDataOverflow
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontFamily: "monospace", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 11 }} />
              {selectedDs.map((ds, i) => (
                <Line
                  key={`line-${ds.id}`}
                  type="linear"
                  data={ds.data}
                  dataKey="qFlux"
                  name={ds.name}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={{ fill: COLORS[i % COLORS.length], r: 4 }}
                  isAnimationActive={false}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
