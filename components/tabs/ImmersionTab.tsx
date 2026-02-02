"use client";
import { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Legend, ScatterChart, Scatter, ZAxis,
} from "recharts";
import { ChipSpec } from "@/components/calculator/InputForm";
import { BoilingDataset, BoilingDataPoint, loadDatasets } from "@/lib/boiling-data";

interface Props {
  spec: ChipSpec;
}

// ── Filter options ──
const FLUID_OPTIONS = ["All", "Novec 7100", "FC-72", "HFE-7200", "HFE-7100", "Water", "R-113", "R-134a", "Other"];
const SURFACE_OPTIONS = ["All", "Plain", "Microporous", "Nanostructured", "Finned", "Sintered", "Coated", "LIG", "Other"];
const SUBCOOLING_OPTIONS = ["All", "Saturated (0 K)", "0–5 K", "5–15 K", "15–30 K", "> 30 K"];
const PRESSURE_OPTIONS = ["All", "1 atm", "Sub-atmospheric", "Elevated (> 1 atm)"];

// ── Demo boiling curves ──
const DEMO_CURVES: { name: string; color: string; data: BoilingDataPoint[] }[] = [
  {
    name: "Novec 7100 — Plain Cu",
    color: "#22d3ee",
    data: [
      { tSurf: 61, qFlux: 0 }, { tSurf: 65, qFlux: 8 }, { tSurf: 70, qFlux: 25 },
      { tSurf: 75, qFlux: 55 }, { tSurf: 80, qFlux: 95 }, { tSurf: 85, qFlux: 140 },
      { tSurf: 90, qFlux: 180 }, { tSurf: 95, qFlux: 210 },
    ],
  },
  {
    name: "Novec 7100 — Microporous",
    color: "#34d399",
    data: [
      { tSurf: 61, qFlux: 0 }, { tSurf: 63, qFlux: 15 }, { tSurf: 66, qFlux: 45 },
      { tSurf: 70, qFlux: 100 }, { tSurf: 74, qFlux: 170 }, { tSurf: 78, qFlux: 250 },
      { tSurf: 82, qFlux: 320 }, { tSurf: 86, qFlux: 370 },
    ],
  },
  {
    name: "FC-72 — Plain Cu",
    color: "#f472b6",
    data: [
      { tSurf: 56, qFlux: 0 }, { tSurf: 60, qFlux: 5 }, { tSurf: 65, qFlux: 18 },
      { tSurf: 70, qFlux: 42 }, { tSurf: 75, qFlux: 80 }, { tSurf: 80, qFlux: 120 },
      { tSurf: 85, qFlux: 155 }, { tSurf: 90, qFlux: 175 },
    ],
  },
];

/** Merge all selected data points, sort by tSurf, and produce a single averaged curve */
function mergeBoilingData(datasets: BoilingDataset[]): BoilingDataPoint[] {
  // Collect all points
  const allPoints: BoilingDataPoint[] = [];
  for (const ds of datasets) {
    for (const p of ds.data) allPoints.push(p);
  }
  if (allPoints.length === 0) return [];

  // Sort by tSurf
  allPoints.sort((a, b) => a.tSurf - b.tSurf);

  // Bin by tSurf (round to nearest 0.5°C) and average qFlux
  const bins = new Map<number, { sum: number; count: number }>();
  for (const p of allPoints) {
    const key = Math.round(p.tSurf * 2) / 2; // 0.5°C bins
    const bin = bins.get(key);
    if (bin) { bin.sum += p.qFlux; bin.count++; }
    else bins.set(key, { sum: p.qFlux, count: 1 });
  }

  const merged: BoilingDataPoint[] = [];
  for (const [tSurf, { sum, count }] of bins) {
    merged.push({ tSurf, qFlux: Math.round((sum / count) * 1000) / 1000 });
  }
  merged.sort((a, b) => a.tSurf - b.tSurf);
  return merged;
}

/** Interpolate qFlux at a given tSurf from a sorted curve */
function interpolateQ(curve: BoilingDataPoint[], tSurf: number): number | null {
  if (curve.length < 2) return null;
  if (tSurf <= curve[0].tSurf) return curve[0].qFlux;
  if (tSurf >= curve[curve.length - 1].tSurf) return curve[curve.length - 1].qFlux;
  for (let i = 0; i < curve.length - 1; i++) {
    if (tSurf >= curve[i].tSurf && tSurf <= curve[i + 1].tSurf) {
      const frac = (tSurf - curve[i].tSurf) / (curve[i + 1].tSurf - curve[i].tSurf);
      return curve[i].qFlux + frac * (curve[i + 1].qFlux - curve[i].qFlux);
    }
  }
  return null;
}

/** Interpolate tSurf at a given qFlux from a sorted-by-qFlux curve */
function interpolateT(curve: BoilingDataPoint[], qFlux: number): number | null {
  const sorted = [...curve].sort((a, b) => a.qFlux - b.qFlux);
  if (sorted.length < 2) return null;
  if (qFlux <= sorted[0].qFlux) return sorted[0].tSurf;
  if (qFlux >= sorted[sorted.length - 1].qFlux) return sorted[sorted.length - 1].tSurf;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (qFlux >= sorted[i].qFlux && qFlux <= sorted[i + 1].qFlux) {
      const frac = (qFlux - sorted[i].qFlux) / (sorted[i + 1].qFlux - sorted[i].qFlux);
      return sorted[i].tSurf + frac * (sorted[i + 1].tSurf - sorted[i].tSurf);
    }
  }
  return null;
}

export default function ImmersionTab({ spec }: Props) {
  const [datasets, setDatasets] = useState<BoilingDataset[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filters
  const [filterFluid, setFilterFluid] = useState("All");
  const [filterSurface, setFilterSurface] = useState("All");
  const [filterSubcooling, setFilterSubcooling] = useState("All");
  const [filterOrientation, setFilterOrientation] = useState(0); // 0-180 slider
  const [filterPressure, setFilterPressure] = useState("All");

  useEffect(() => {
    setDatasets(loadDatasets());
  }, []);

  const toggleDataset = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Filter datasets (metadata-based, best-effort)
  const filteredDatasets = useMemo(() => {
    return datasets.filter((ds) => {
      const meta = ds.experiment || ds.literature;
      if (!meta) return true; // no metadata = always show
      if (filterFluid !== "All") {
        const fluid = (meta as Record<string, string | undefined>).fluid;
        if (fluid && !fluid.toLowerCase().includes(filterFluid.toLowerCase())) return false;
      }
      if (filterSurface !== "All") {
        const surf = ds.experiment?.surfaceModification || ds.experiment?.baseSurface || (ds.literature as Record<string, string | undefined>)?.surfaceType;
        if (surf && !surf.toLowerCase().includes(filterSurface.toLowerCase())) return false;
      }
      return true;
    });
  }, [datasets, filterFluid, filterSurface]);

  // Current operating point
  const currentQFlux = useMemo(() => {
    const A = spec.chipArea * 1e-6;
    return spec.tdp / A / 1000; // kW/m²
  }, [spec.tdp, spec.chipArea]);

  const selectedDs = filteredDatasets.filter((d) => selectedIds.includes(d.id));
  const hasUserData = datasets.length > 0;
  const hasSelection = selectedDs.length > 0;

  // Merged single boiling curve from all selected datasets
  const mergedCurve = useMemo(() => {
    if (!hasSelection) return [];
    return mergeBoilingData(selectedDs);
  }, [selectedDs, hasSelection]);

  // All raw scatter points for overlay
  const scatterPoints = useMemo(() => {
    const pts: { tSurf: number; qFlux: number; name: string }[] = [];
    for (const ds of selectedDs) {
      for (const p of ds.data) pts.push({ ...p, name: ds.name });
    }
    return pts;
  }, [selectedDs]);

  // Interpolate T_surf at current q'' from merged curve
  const interpolatedTemp = useMemo(() => {
    if (mergedCurve.length < 2) return null;
    const t = interpolateT(mergedCurve, currentQFlux);
    return t !== null ? Math.round(t * 10) / 10 : null;
  }, [mergedCurve, currentQFlux]);

  // Chart data for merged curve
  const chartData = useMemo(() => {
    if (mergedCurve.length === 0) return null;
    return mergedCurve.map((p) => ({ tSurf: p.tSurf, qFlux: p.qFlux }));
  }, [mergedCurve]);

  // Demo chart data
  const demoChartData = useMemo(() => {
    const tSet = new Set<number>();
    for (const c of DEMO_CURVES) for (const p of c.data) tSet.add(p.tSurf);
    const sorted = [...tSet].sort((a, b) => a - b);
    return sorted.map((t) => {
      const point: Record<string, number> = { tSurf: t };
      for (const c of DEMO_CURVES) {
        const match = c.data.find((p) => p.tSurf === t);
        if (match) point[c.name] = match.qFlux;
      }
      return point;
    });
  }, []);

  const inp = "w-full px-3 py-2 bg-[#1a1a2e] border border-[#0f3460] text-cyan-100 rounded font-mono text-sm focus:outline-none focus:border-cyan-400";
  const lbl = "text-gray-400 text-[10px] font-mono uppercase tracking-wider";

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="p-5 rounded-xl border bg-[#16213e] border-[#0f3460]">
        <h3 className="text-sm font-bold text-cyan-400 font-mono tracking-wider mb-4">
          {">"} IMMERSION CONDITIONS
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <label className={lbl}>Fluid</label>
            <select className={`${inp} mt-1`} value={filterFluid} onChange={(e) => setFilterFluid(e.target.value)}>
              {FLUID_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Surface</label>
            <select className={`${inp} mt-1`} value={filterSurface} onChange={(e) => setFilterSurface(e.target.value)}>
              {SURFACE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Subcooling</label>
            <select className={`${inp} mt-1`} value={filterSubcooling} onChange={(e) => setFilterSubcooling(e.target.value)}>
              {SUBCOOLING_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Orientation (°)</label>
            <input type="number" min={0} max={180} step={1} value={filterOrientation}
              onChange={(e) => setFilterOrientation(Math.min(180, Math.max(0, Number(e.target.value) || 0)))}
              className={`${inp} mt-1`}
              placeholder="0–180"
            />
            <div className="text-[9px] text-gray-600 font-mono mt-0.5">
              0° = up, 90° = vert, 180° = down
            </div>
          </div>
          <div>
            <label className={lbl}>Pressure</label>
            <select className={`${inp} mt-1`} value={filterPressure} onChange={(e) => setFilterPressure(e.target.value)}>
              {PRESSURE_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Dataset selector */}
      {hasUserData && (
        <div className="p-5 rounded-xl border bg-[#16213e] border-[#0f3460]">
          <h3 className="text-sm font-bold text-cyan-400 font-mono tracking-wider mb-4">
            {">"} SELECT DATASETS ({filteredDatasets.length})
          </h3>
          {filteredDatasets.length === 0 ? (
            <p className="text-gray-500 font-mono text-sm">No datasets match current filters.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredDatasets.map((ds) => {
                const meta = ds.experiment || ds.literature;
                const fluid = (meta as Record<string, string | undefined>)?.fluid;
                const surf = ds.experiment?.surfaceModification || ds.experiment?.baseSurface || (ds.literature as Record<string, string | undefined>)?.surfaceType;
                return (
                  <label
                    key={ds.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      selectedIds.includes(ds.id)
                        ? "bg-cyan-500/10 border-cyan-500"
                        : "bg-[#1a1a2e] border-[#0f3460] hover:border-gray-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(ds.id)}
                      onChange={() => toggleDataset(ds.id)}
                      className="accent-cyan-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-cyan-200 font-mono text-sm font-semibold truncate">{ds.name}</div>
                      <div className="text-gray-500 font-mono text-[10px]">
                        {ds.data.length} pts
                        {fluid && ` · ${fluid}`}
                        {surf && ` · ${surf}`}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Operating point cards */}
      {hasSelection && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border bg-[#16213e] border-[#0f3460] flex flex-col items-center justify-center">
            <span className={lbl}>CURRENT q&apos;&apos;</span>
            <span className="text-3xl font-mono font-bold text-cyan-400 mt-1">{currentQFlux.toFixed(1)}</span>
            <span className="text-gray-500 text-xs font-mono mt-1">kW/m²</span>
          </div>
          {interpolatedTemp !== null && (
            <div className="p-5 rounded-xl border bg-[#16213e] border-[#0f3460] flex flex-col items-center justify-center">
              <span className={lbl}>ESTIMATED T_surf</span>
              <span className={`text-3xl font-mono font-bold mt-1 ${interpolatedTemp > 85 ? "text-red-400" : "text-green-400"}`}>
                {interpolatedTemp}°C
              </span>
              <span className="text-gray-500 text-xs font-mono mt-1">from merged curve</span>
            </div>
          )}
          {interpolatedTemp !== null && (
            <div className="p-5 rounded-xl border bg-[#16213e] border-[#0f3460] flex flex-col items-center justify-center">
              <span className={lbl}>EFFECTIVE h</span>
              <span className="text-3xl font-mono font-bold text-green-400 mt-1">
                {interpolatedTemp > spec.ambientTemp
                  ? Math.round((currentQFlux * 1000) / (interpolatedTemp - spec.ambientTemp)).toLocaleString()
                  : "—"}
              </span>
              <span className="text-gray-500 text-xs font-mono mt-1">W/m²K</span>
            </div>
          )}
        </div>
      )}

      {/* Merged boiling curve chart */}
      {chartData && (
        <div className="p-5 rounded-xl border bg-[#16213e] border-[#0f3460]">
          <h3 className="text-sm font-bold text-cyan-400 font-mono tracking-wider mb-4">
            {">"} MERGED BOILING CURVE ({selectedDs.length} datasets, {scatterPoints.length} points)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f3460" />
              <XAxis dataKey="tSurf" type="number" domain={["dataMin", "dataMax"]}
                label={{ value: "T_surf (°C)", position: "insideBottom", offset: -10, fill: "#9ca3af", fontSize: 12 }}
                tick={{ fill: "#9ca3af", fontSize: 11 }} stroke="#0f3460"
                allowDuplicatedCategory={false} />
              <YAxis
                label={{ value: "q'' (kW/m²)", angle: -90, position: "insideLeft", offset: -5, fill: "#9ca3af", fontSize: 12 }}
                tick={{ fill: "#9ca3af", fontSize: 11 }} stroke="#0f3460" />
              <Tooltip contentStyle={{ backgroundColor: "#16213e", border: "1px solid #0f3460", borderRadius: 8, fontFamily: "monospace", fontSize: 12 }} />
              {/* T_max reference */}
              <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="6 3"
                label={{ value: "T_max 85°C", fill: "#ef4444", fontSize: 10, fontFamily: "monospace" }} />
              {/* Current q'' */}
              {interpolatedTemp !== null && (
                <ReferenceLine x={interpolatedTemp} stroke="#8b5cf6" strokeDasharray="6 3"
                  label={{ value: `T=${interpolatedTemp}°C`, fill: "#8b5cf6", fontSize: 10, fontFamily: "monospace" }} />
              )}
              {/* Raw data scatter */}
              <Line data={scatterPoints} dataKey="qFlux" type="linear" stroke="none"
                dot={{ fill: "#9ca3af", r: 2, opacity: 0.4 }} name="Raw data" legendType="circle" />
              {/* Merged curve */}
              <Line data={chartData} dataKey="qFlux" type="monotone"
                stroke="#22d3ee" strokeWidth={3}
                dot={false} name="Merged curve" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Demo chart — when no selection */}
      {!hasSelection && (
        <div className="p-5 rounded-xl border bg-[#16213e] border-[#0f3460]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-cyan-400 font-mono tracking-wider">
              {">"} TYPICAL BOILING CURVES (REFERENCE)
            </h3>
            {!hasUserData && (
              <span className="text-[10px] font-mono text-gray-500 border border-[#0f3460] rounded px-2 py-1">
                Add your data via DATA INPUT
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={demoChartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f3460" />
              <XAxis dataKey="tSurf"
                label={{ value: "T_surf (°C)", position: "insideBottom", offset: -10, fill: "#9ca3af", fontSize: 12 }}
                tick={{ fill: "#9ca3af", fontSize: 11 }} stroke="#0f3460" />
              <YAxis
                label={{ value: "q'' (kW/m²)", angle: -90, position: "insideLeft", offset: -5, fill: "#9ca3af", fontSize: 12 }}
                tick={{ fill: "#9ca3af", fontSize: 11 }} stroke="#0f3460" />
              <Tooltip contentStyle={{ backgroundColor: "#16213e", border: "1px solid #0f3460", borderRadius: 8, fontFamily: "monospace", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 11 }} />
              <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="6 3"
                label={{ value: "T_max 85°C", fill: "#ef4444", fontSize: 10, fontFamily: "monospace" }} />
              {DEMO_CURVES.map((c) => (
                <Line key={c.name} type="monotone" dataKey={c.name} name={c.name}
                  stroke={c.color} strokeWidth={2} dot={{ fill: c.color, r: 3 }} connectNulls />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
