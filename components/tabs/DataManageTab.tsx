"use client";
import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { BoilingDataset, loadDatasets, deleteDataset } from "@/lib/boiling-data";

const COLORS = ["#0891b2", "#059669", "#db2777", "#ca8a04", "#7c3aed", "#ea580c", "#dc2626", "#2563eb", "#65a30d", "#c026d3"];

export default function DataManageTab() {
  const [datasets, setDatasets] = useState<BoilingDataset[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setDatasets(loadDatasets());
  }, []);

  const refresh = () => setDatasets(loadDatasets());

  const handleDelete = (id: string) => {
    deleteDataset(id);
    refresh();
    setSelected((s) => { const n = new Set(s); n.delete(id); return n; });
    if (expandedId === id) setExpandedId(null);
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

  const renderMeta = (ds: BoilingDataset) => {
    const entries: { label: string; value: string }[] = [];
    if (ds.source === "experiment" && ds.experiment) {
      const m = ds.experiment;
      if (m.date) entries.push({ label: "Date", value: m.date });
      if (m.experimenter) entries.push({ label: "Experimenter", value: m.experimenter });
      if (m.fluid) entries.push({ label: "Fluid", value: m.fluid });
      if (m.subcooling) entries.push({ label: "Subcooling", value: m.subcooling });
      if (m.pressure) entries.push({ label: "Pressure", value: m.pressure });
      if (m.bulkFluidTemp) entries.push({ label: "Bulk Fluid Temp", value: m.bulkFluidTemp });
      if (m.orientation) entries.push({ label: "Orientation", value: m.orientation });
      if (m.flowVelocity) entries.push({ label: "Flow Velocity", value: m.flowVelocity });
      if (m.heaterMaterial) entries.push({ label: "Heater Material", value: m.heaterMaterial });
      if (m.heaterSize) entries.push({ label: "Heater Size", value: m.heaterSize });
      if (m.heaterGeometry) entries.push({ label: "Heater Geometry", value: m.heaterGeometry });
      if (m.baseSurface) entries.push({ label: "Base Surface", value: m.baseSurface });
      if (m.ra) entries.push({ label: "Ra (μm)", value: m.ra });
      if (m.rz) entries.push({ label: "Rz (μm)", value: m.rz });
      if (m.contactAngle) entries.push({ label: "Contact Angle", value: m.contactAngle });
      if (m.surfaceModification) entries.push({ label: "Modification", value: m.surfaceModification });
      if (m.patternAreaRatio) entries.push({ label: "Pattern Area Ratio", value: m.patternAreaRatio });
      if (m.patternSpacing) entries.push({ label: "Pattern Spacing", value: m.patternSpacing });
      if (m.patternThickness) entries.push({ label: "Pattern Thickness", value: m.patternThickness });
      if (m.structureHeight) entries.push({ label: "Structure Height", value: m.structureHeight });
      if (m.porosity) entries.push({ label: "Porosity", value: m.porosity });
      if (m.coatingMaterial) entries.push({ label: "Coating Material", value: m.coatingMaterial });
      if (m.coatingThickness) entries.push({ label: "Coating Thickness", value: m.coatingThickness });
      if (m.wickingHeight) entries.push({ label: "Wicking Height", value: m.wickingHeight });
      if (m.nucleationSiteDensity) entries.push({ label: "Nucleation Site Density", value: m.nucleationSiteDensity });
      if (m.notes) entries.push({ label: "Notes", value: m.notes });
    } else if (ds.source === "literature" && ds.literature) {
      const m = ds.literature;
      if (m.title) entries.push({ label: "Title", value: m.title });
      if (m.authors) entries.push({ label: "Authors", value: m.authors });
      if (m.year) entries.push({ label: "Year", value: m.year });
      if (m.journal) entries.push({ label: "Journal", value: m.journal });
      if (m.doi) entries.push({ label: "DOI", value: m.doi });
      if (m.fluid) entries.push({ label: "Fluid", value: m.fluid });
      if (m.surfaceType) entries.push({ label: "Surface Type", value: m.surfaceType });
      if (m.surfaceRoughness) entries.push({ label: "Surface Roughness", value: m.surfaceRoughness });
      if (m.heaterGeometry) entries.push({ label: "Heater Geometry", value: m.heaterGeometry });
      if (m.heaterSize) entries.push({ label: "Heater Size", value: m.heaterSize });
      if (m.orientation) entries.push({ label: "Orientation", value: m.orientation });
      if (m.pressure) entries.push({ label: "Pressure", value: m.pressure });
      if (m.subcooling) entries.push({ label: "Subcooling", value: m.subcooling });
      if (m.flowVelocity) entries.push({ label: "Flow Velocity", value: m.flowVelocity });
      if (m.notes) entries.push({ label: "Notes", value: m.notes });
    }
    return entries;
  };

  return (
    <div className="space-y-6">
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
              const meta = renderMeta(ds);
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
                      {/* Metadata */}
                      {meta.length > 0 && (
                        <div>
                          <div className={`${lbl} mb-2`}>Metadata</div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1">
                            {meta.map((m) => (
                              <div key={m.label} className="flex gap-1 font-mono text-xs">
                                <span className="text-gray-400 shrink-0">{m.label}:</span>
                                <span className="text-gray-700 truncate">{m.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Data table */}
                      <div>
                        <div className={`${lbl} mb-2`}>Data Points ({ds.data.length})</div>
                        <div className="rounded-lg border border-gray-200 overflow-hidden max-h-60 overflow-y-auto">
                          <table className="w-full">
                            <thead className="sticky top-0 z-10">
                              <tr className="bg-gray-50">
                                <th className="px-3 py-1.5 text-center font-mono text-[10px] text-gray-400 uppercase w-12 border-b border-r border-gray-200">#</th>
                                <th className="px-3 py-1.5 text-center font-mono text-[10px] text-cyan-600 uppercase border-b border-r border-gray-200">T_surf (°C)</th>
                                <th className="px-3 py-1.5 text-center font-mono text-[10px] text-cyan-600 uppercase border-b border-gray-200">q'' (kW/m²)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...ds.data].sort((a, b) => a.tSurf - b.tSurf).map((p, i) => (
                                <tr key={i} className="border-b border-gray-100">
                                  <td className="px-3 py-1 text-center font-mono text-[10px] text-gray-400 border-r border-gray-100">{i + 1}</td>
                                  <td className="px-3 py-1 text-center font-mono text-sm text-gray-700">{p.tSurf}</td>
                                  <td className="px-3 py-1 text-center font-mono text-sm text-gray-700">{p.qFlux}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Single dataset chart */}
                      <div>
                        <div className={`${lbl} mb-2`}>Boiling Curve</div>
                        <ResponsiveContainer width="100%" height={280}>
                          <LineChart data={[...ds.data].sort((a, b) => a.tSurf - b.tSurf)} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="tSurf" label={{ value: "T_surf (°C)", position: "insideBottom", offset: -10, fill: "#6b7280", fontSize: 12 }} tick={{ fill: "#6b7280", fontSize: 11 }} stroke="#d1d5db" />
                            <YAxis label={{ value: "q'' (kW/m²)", angle: -90, position: "insideLeft", offset: -5, fill: "#6b7280", fontSize: 12 }} tick={{ fill: "#6b7280", fontSize: 11 }} stroke="#d1d5db" />
                            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontFamily: "monospace", fontSize: 12 }} />
                            <Line type="monotone" dataKey="qFlux" stroke="#0891b2" strokeWidth={2} dot={{ fill: "#0891b2", r: 4 }} />
                          </LineChart>
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
      {chartData && selectedDs.length >= 1 && (
        <div className="p-5 rounded-xl border bg-white border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-cyan-600 font-mono tracking-wider mb-4">
            {">"} {selectedDs.length === 1 ? "SELECTED PLOT" : `COMPARISON (${selectedDs.length} datasets)`}
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="tSurf" label={{ value: "T_surf (°C)", position: "insideBottom", offset: -10, fill: "#6b7280", fontSize: 12 }} tick={{ fill: "#6b7280", fontSize: 11 }} stroke="#d1d5db" />
              <YAxis label={{ value: "q'' (kW/m²)", angle: -90, position: "insideLeft", offset: -5, fill: "#6b7280", fontSize: 12 }} tick={{ fill: "#6b7280", fontSize: 11 }} stroke="#d1d5db" />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontFamily: "monospace", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 11 }} />
              {selectedDs.map((ds, i) => (
                <Line
                  key={ds.id}
                  type="monotone"
                  dataKey={ds.id}
                  name={ds.name}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={{ fill: COLORS[i % COLORS.length], r: 3 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
