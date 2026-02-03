"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Legend, Area, ComposedChart,
} from "recharts";
import { Droplets, Thermometer, Zap, Filter, Database, Layers, Info } from "lucide-react";
import { ChipSpec } from "@/components/calculator/InputForm";
import { BoilingDataset, BoilingDataPoint, loadDatasets } from "@/lib/boiling-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import StatsCard from "@/components/dashboard/StatsCard";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/lib/animations";

interface Props {
  spec: ChipSpec;
}

// Condition options
const FLUID_OPTIONS = [
  { key: "novec7100", label: "Novec 7100", tSat: 61 },
  { key: "fc72", label: "FC-72", tSat: 56 },
  { key: "hfe7200", label: "HFE-7200", tSat: 76 },
  { key: "water", label: "Water", tSat: 100 },
];

const PRESSURE_OPTIONS = [
  { key: "1atm", label: "1 atm (101.3 kPa)" },
  { key: "sub", label: "Sub-atmospheric" },
  { key: "elevated", label: "Elevated (> 1 atm)" },
];

const SUBCOOLING_OPTIONS = [
  { key: "0", label: "Saturated (0 K)", value: 0 },
  { key: "5", label: "5 K", value: 5 },
  { key: "10", label: "10 K", value: 10 },
  { key: "20", label: "20 K", value: 20 },
];

const ORIENTATION_OPTIONS = [
  { key: "0", label: "Horizontal Up (0°)", value: 0 },
  { key: "90", label: "Vertical (90°)", value: 90 },
  { key: "180", label: "Horizontal Down (180°)", value: 180 },
];

// Example surface data with bands (min/max ranges)
interface SurfaceData {
  name: string;
  description: string;
  color: string;
  // Data varies by condition, so we store base data and apply modifiers
  baseData: { tSurf: number; qFluxMin: number; qFluxMax: number; qFluxAvg: number }[];
  chfRange: [number, number]; // CHF range in kW/m²
  hRange: [number, number]; // h range in W/m²K
  references: string[];
}

// Base data is for Novec 7100 at 1 atm, saturated, horizontal up
// Data is stored as deltaT from T_sat (not absolute T_surf)
const SURFACE_DATABASE: Record<string, SurfaceData> = {
  plain: {
    name: "Plain Copper",
    description: "Polished or lightly roughened copper surface",
    color: "hsl(var(--chart-5))",
    baseData: [
      { tSurf: 0, qFluxMin: 0, qFluxMax: 0, qFluxAvg: 0 },
      { tSurf: 4, qFluxMin: 5, qFluxMax: 12, qFluxAvg: 8 },
      { tSurf: 9, qFluxMin: 18, qFluxMax: 35, qFluxAvg: 25 },
      { tSurf: 14, qFluxMin: 40, qFluxMax: 70, qFluxAvg: 55 },
      { tSurf: 19, qFluxMin: 75, qFluxMax: 120, qFluxAvg: 95 },
      { tSurf: 24, qFluxMin: 110, qFluxMax: 170, qFluxAvg: 140 },
      { tSurf: 29, qFluxMin: 140, qFluxMax: 220, qFluxAvg: 180 },
      { tSurf: 34, qFluxMin: 160, qFluxMax: 260, qFluxAvg: 210 },
    ],
    chfRange: [180, 280],
    hRange: [2000, 5000],
    references: ["El-Genk & Ali (2010)", "Rainey et al. (2003)"],
  },
  microporous: {
    name: "Microporous Coating",
    description: "Sintered powder or spray-coated porous layer",
    color: "hsl(var(--chart-2))",
    baseData: [
      { tSurf: 0, qFluxMin: 0, qFluxMax: 0, qFluxAvg: 0 },
      { tSurf: 2, qFluxMin: 10, qFluxMax: 25, qFluxAvg: 15 },
      { tSurf: 5, qFluxMin: 35, qFluxMax: 60, qFluxAvg: 45 },
      { tSurf: 9, qFluxMin: 80, qFluxMax: 130, qFluxAvg: 100 },
      { tSurf: 13, qFluxMin: 140, qFluxMax: 210, qFluxAvg: 170 },
      { tSurf: 17, qFluxMin: 210, qFluxMax: 300, qFluxAvg: 250 },
      { tSurf: 21, qFluxMin: 280, qFluxMax: 380, qFluxAvg: 320 },
      { tSurf: 25, qFluxMin: 330, qFluxMax: 420, qFluxAvg: 370 },
    ],
    chfRange: [350, 500],
    hRange: [8000, 15000],
    references: ["Chang & You (1997)", "You et al. (2003)"],
  },
  finned: {
    name: "Finned / Pin-Fin Array",
    description: "Micro-pin fins or extended surfaces for enhanced area",
    color: "hsl(var(--primary))",
    baseData: [
      { tSurf: 0, qFluxMin: 0, qFluxMax: 0, qFluxAvg: 0 },
      { tSurf: 3, qFluxMin: 12, qFluxMax: 30, qFluxAvg: 20 },
      { tSurf: 7, qFluxMin: 45, qFluxMax: 85, qFluxAvg: 65 },
      { tSurf: 11, qFluxMin: 100, qFluxMax: 160, qFluxAvg: 130 },
      { tSurf: 15, qFluxMin: 170, qFluxMax: 260, qFluxAvg: 210 },
      { tSurf: 19, qFluxMin: 250, qFluxMax: 380, qFluxAvg: 300 },
      { tSurf: 23, qFluxMin: 340, qFluxMax: 480, qFluxAvg: 400 },
      { tSurf: 27, qFluxMin: 420, qFluxMax: 580, qFluxAvg: 490 },
      { tSurf: 31, qFluxMin: 480, qFluxMax: 650, qFluxAvg: 560 },
    ],
    chfRange: [500, 750],
    hRange: [10000, 25000],
    references: ["Wei & Joshi (2003)", "Kandlikar & Bapat (2007)", "Chu et al. (2012)"],
  },
  nanostructured: {
    name: "Nanostructured Surface",
    description: "CNT, nanowires, or nanocoatings for nucleation enhancement",
    color: "hsl(var(--chart-4))",
    baseData: [
      { tSurf: 0, qFluxMin: 0, qFluxMax: 0, qFluxAvg: 0 },
      { tSurf: 1, qFluxMin: 8, qFluxMax: 20, qFluxAvg: 14 },
      { tSurf: 3, qFluxMin: 30, qFluxMax: 55, qFluxAvg: 40 },
      { tSurf: 6, qFluxMin: 70, qFluxMax: 120, qFluxAvg: 90 },
      { tSurf: 9, qFluxMin: 130, qFluxMax: 200, qFluxAvg: 160 },
      { tSurf: 12, qFluxMin: 200, qFluxMax: 290, qFluxAvg: 240 },
      { tSurf: 15, qFluxMin: 280, qFluxMax: 400, qFluxAvg: 330 },
      { tSurf: 18, qFluxMin: 360, qFluxMax: 500, qFluxAvg: 420 },
      { tSurf: 21, qFluxMin: 420, qFluxMax: 580, qFluxAvg: 490 },
    ],
    chfRange: [450, 650],
    hRange: [12000, 30000],
    references: ["Ahn et al. (2010)", "Chen et al. (2009)"],
  },
  lig: {
    name: "Laser-Induced Graphene (LIG)",
    description: "Porous graphene pattern created by laser ablation",
    color: "hsl(var(--chart-1))",
    baseData: [
      { tSurf: 0, qFluxMin: 0, qFluxMax: 0, qFluxAvg: 0 },
      { tSurf: 2, qFluxMin: 15, qFluxMax: 35, qFluxAvg: 25 },
      { tSurf: 5, qFluxMin: 50, qFluxMax: 90, qFluxAvg: 70 },
      { tSurf: 8, qFluxMin: 110, qFluxMax: 170, qFluxAvg: 140 },
      { tSurf: 11, qFluxMin: 180, qFluxMax: 270, qFluxAvg: 220 },
      { tSurf: 14, qFluxMin: 260, qFluxMax: 380, qFluxAvg: 310 },
      { tSurf: 17, qFluxMin: 350, qFluxMax: 490, qFluxAvg: 410 },
      { tSurf: 20, qFluxMin: 430, qFluxMax: 590, qFluxAvg: 500 },
      { tSurf: 23, qFluxMin: 500, qFluxMax: 680, qFluxAvg: 580 },
    ],
    chfRange: [550, 800],
    hRange: [15000, 35000],
    references: ["MFTEL Lab (2024)", "Choi et al. (2022)"],
  },
};

const SURFACE_OPTIONS = Object.keys(SURFACE_DATABASE);

// Apply condition modifiers to base data
function applyConditions(
  baseData: SurfaceData["baseData"],
  tSat: number,
  subcooling: number,
  orientation: number
): { tSurf: number; qFluxMin: number; qFluxMax: number; qFluxAvg: number }[] {
  // Subcooling effect: higher subcooling → higher CHF, lower wall superheat needed
  const subcoolFactor = 1 + subcooling * 0.02; // 2% increase per K subcooling

  // Orientation effect: horizontal down (180°) reduces CHF ~30%, vertical ~10% reduction
  let orientFactor = 1;
  if (orientation === 180) orientFactor = 0.7;
  else if (orientation === 90) orientFactor = 0.9;

  return baseData.map((d) => ({
    tSurf: tSat + d.tSurf - subcooling * 0.3, // Adjust wall temp for subcooling
    qFluxMin: Math.round(d.qFluxMin * subcoolFactor * orientFactor),
    qFluxMax: Math.round(d.qFluxMax * subcoolFactor * orientFactor),
    qFluxAvg: Math.round(d.qFluxAvg * subcoolFactor * orientFactor),
  }));
}

function interpolateT(data: { tSurf: number; qFluxAvg: number }[], qFlux: number): number | null {
  const sorted = [...data].sort((a, b) => a.qFluxAvg - b.qFluxAvg);
  if (sorted.length < 2) return null;
  if (qFlux <= sorted[0].qFluxAvg) return sorted[0].tSurf;
  if (qFlux >= sorted[sorted.length - 1].qFluxAvg) return sorted[sorted.length - 1].tSurf;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (qFlux >= sorted[i].qFluxAvg && qFlux <= sorted[i + 1].qFluxAvg) {
      const frac = (qFlux - sorted[i].qFluxAvg) / (sorted[i + 1].qFluxAvg - sorted[i].qFluxAvg);
      return sorted[i].tSurf + frac * (sorted[i + 1].tSurf - sorted[i].tSurf);
    }
  }
  return null;
}

export default function ImmersionTab({ spec }: Props) {
  const [datasets, setDatasets] = useState<BoilingDataset[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showUserData, setShowUserData] = useState(false);

  // Filter conditions
  const [selectedSurface, setSelectedSurface] = useState<string>("finned");
  const [selectedFluid, setSelectedFluid] = useState<string>("novec7100");
  const [selectedPressure, setSelectedPressure] = useState<string>("1atm");
  const [selectedSubcooling, setSelectedSubcooling] = useState<string>("0");
  const [selectedOrientation, setSelectedOrientation] = useState<string>("0");

  useEffect(() => {
    setDatasets(loadDatasets());
  }, []);

  // Get current fluid's T_sat
  const currentFluid = FLUID_OPTIONS.find((f) => f.key === selectedFluid) || FLUID_OPTIONS[0];
  const tSat = currentFluid.tSat;
  const subcoolingValue = SUBCOOLING_OPTIONS.find((s) => s.key === selectedSubcooling)?.value || 0;
  const orientationValue = ORIENTATION_OPTIONS.find((o) => o.key === selectedOrientation)?.value || 0;

  const toggleDataset = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Current operating point
  const currentQFlux = useMemo(() => {
    const A = spec.chipArea * 1e-6; // mm² to m²
    return spec.tdp / A / 1000; // kW/m²
  }, [spec.tdp, spec.chipArea]);

  // Get selected surface data with conditions applied
  const surfaceData = SURFACE_DATABASE[selectedSurface];

  // Apply conditions to get actual curve data
  const conditionedData = useMemo(() => {
    if (!surfaceData) return [];
    return applyConditions(surfaceData.baseData, tSat, subcoolingValue, orientationValue);
  }, [surfaceData, tSat, subcoolingValue, orientationValue]);

  // Interpolate temperature from surface data
  const interpolatedTemp = useMemo(() => {
    if (conditionedData.length < 2) return null;
    return interpolateT(conditionedData, currentQFlux);
  }, [conditionedData, currentQFlux]);

  // Calculate effective h
  const effectiveH = useMemo(() => {
    if (!interpolatedTemp || interpolatedTemp <= spec.ambientTemp) return null;
    return (currentQFlux * 1000) / (interpolatedTemp - spec.ambientTemp);
  }, [currentQFlux, interpolatedTemp, spec.ambientTemp]);

  // Build chart data with band (using conditioned data)
  const chartData = useMemo(() => {
    if (conditionedData.length === 0) return [];
    return conditionedData.map((d) => ({
      tSurf: d.tSurf,
      qFluxMin: d.qFluxMin,
      qFluxMax: d.qFluxMax,
      qFluxAvg: d.qFluxAvg,
      bandRange: [d.qFluxMin, d.qFluxMax],
    }));
  }, [conditionedData]);

  // Adjust CHF range based on conditions
  const adjustedChfRange = useMemo(() => {
    if (!surfaceData) return [0, 0];
    const subcoolFactor = 1 + subcoolingValue * 0.02;
    let orientFactor = 1;
    if (orientationValue === 180) orientFactor = 0.7;
    else if (orientationValue === 90) orientFactor = 0.9;
    return [
      Math.round(surfaceData.chfRange[0] * subcoolFactor * orientFactor),
      Math.round(surfaceData.chfRange[1] * subcoolFactor * orientFactor),
    ];
  }, [surfaceData, subcoolingValue, orientationValue]);

  // Check if within CHF limit
  const withinCHF = adjustedChfRange[1] > 0 ? currentQFlux <= adjustedChfRange[1] : true;

  // Merge user data if selected
  const userChartData = useMemo(() => {
    if (!showUserData || selectedIds.length === 0) return null;
    const selectedDs = datasets.filter((d) => selectedIds.includes(d.id));
    const pts: { tSurf: number; qFlux: number; name: string }[] = [];
    for (const ds of selectedDs) {
      for (const p of ds.data) pts.push({ tSurf: p.tSurf, qFlux: p.qFlux, name: ds.name });
    }
    return pts;
  }, [showUserData, selectedIds, datasets]);

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: 12,
  };

  const hasUserData = datasets.length > 0;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Condition filters - simple native selects for reliability */}
      <motion.div variants={fadeInUp} className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Filter className="h-5 w-5 text-teal-500" />
          <h3 className="font-bold text-base">Experimental Conditions</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Fluid */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Working Fluid</label>
            <select
              value={selectedFluid}
              onChange={(e) => setSelectedFluid(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
            >
              {FLUID_OPTIONS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label} ({f.tSat}°C)
                </option>
              ))}
            </select>
          </div>

          {/* Pressure */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Pressure</label>
            <select
              value={selectedPressure}
              onChange={(e) => setSelectedPressure(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
            >
              {PRESSURE_OPTIONS.map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Subcooling */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Subcooling</label>
            <select
              value={selectedSubcooling}
              onChange={(e) => setSelectedSubcooling(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
            >
              {SUBCOOLING_OPTIONS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Orientation */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Orientation</label>
            <select
              value={selectedOrientation}
              onChange={(e) => setSelectedOrientation(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
            >
              {ORIENTATION_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Surface Type */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Surface Type</label>
            <select
              value={selectedSurface}
              onChange={(e) => setSelectedSurface(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
            >
              {SURFACE_OPTIONS.map((key) => (
                <option key={key} value={key}>{SURFACE_DATABASE[key].name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected condition summary */}
        {surfaceData && (
          <div className="mt-5 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: surfaceData.color }} />
              <span className="font-bold text-sm">{surfaceData.name}</span>
              <span className="text-gray-500 text-xs">— {surfaceData.description}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs rounded bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">{currentFluid.label}</span>
              <span className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700">T_sat = {tSat}°C</span>
              <span className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700">ΔT_sub = {subcoolingValue} K</span>
              <span className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700">{ORIENTATION_OPTIONS.find(o => o.key === selectedOrientation)?.label}</span>
              <span className="px-2 py-1 text-xs rounded bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 font-medium">CHF: {adjustedChfRange[0]}–{adjustedChfRange[1]} kW/m²</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Operating point results */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Current q''"
          value={currentQFlux.toFixed(1)}
          unit="kW/m²"
          icon={Zap}
          variant="info"
        />
        <StatsCard
          title="Est. T_surf"
          value={interpolatedTemp ? Math.round(interpolatedTemp * 10) / 10 : "—"}
          unit="°C"
          icon={Thermometer}
          variant={
            !interpolatedTemp
              ? "default"
              : interpolatedTemp > 85
              ? "danger"
              : interpolatedTemp > 75
              ? "warning"
              : "success"
          }
          description={surfaceData?.name}
        />
        <StatsCard
          title="Effective h"
          value={effectiveH ? Math.round(effectiveH).toLocaleString() : "—"}
          unit="W/m²K"
          icon={Droplets}
          variant="success"
        />
        <StatsCard
          title="CHF Margin"
          value={adjustedChfRange[1] > 0 ? Math.round((1 - currentQFlux / adjustedChfRange[1]) * 100) : "—"}
          unit="%"
          icon={Filter}
          variant={
            adjustedChfRange[1] === 0
              ? "default"
              : currentQFlux > adjustedChfRange[1]
              ? "danger"
              : currentQFlux > adjustedChfRange[0]
              ? "warning"
              : "success"
          }
          description={withinCHF ? "Safe" : "Exceeds CHF!"}
        />
      </motion.div>

      {/* Boiling curve chart with band */}
      <motion.div variants={fadeInUp} className="p-5 rounded-xl glass border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Droplets className="h-4 w-4 text-primary" />
            Boiling Curve — {surfaceData?.name}
          </h3>
          <Badge variant="outline" className="text-xs">
            Band shows typical data scatter
          </Badge>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={surfaceData?.color || "hsl(var(--primary))"} stopOpacity={0.3} />
                <stop offset="100%" stopColor={surfaceData?.color || "hsl(var(--primary))"} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="tSurf"
              type="number"
              domain={["dataMin - 2", "dataMax + 2"]}
              label={{ value: "T_surf (°C)", position: "insideBottom", offset: -10, fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              stroke="hsl(var(--border))"
            />
            <YAxis
              label={{ value: "q'' (kW/m²)", angle: -90, position: "insideLeft", offset: -5, fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              stroke="hsl(var(--border))"
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />

            {/* Reference lines */}
            <ReferenceLine
              y={adjustedChfRange[0]}
              stroke="hsl(var(--chart-4))"
              strokeDasharray="4 4"
              label={{ value: "CHF min", fill: "hsl(var(--chart-4))", fontSize: 9 }}
            />
            <ReferenceLine
              y={adjustedChfRange[1]}
              stroke="hsl(var(--destructive))"
              strokeDasharray="6 3"
              label={{ value: "CHF max", fill: "hsl(var(--destructive))", fontSize: 9 }}
            />

            {/* Current operating point */}
            {interpolatedTemp && (
              <ReferenceLine
                x={interpolatedTemp}
                stroke="hsl(var(--chart-4))"
                strokeDasharray="4 4"
                label={{ value: `T=${Math.round(interpolatedTemp)}°C`, fill: "hsl(var(--chart-4))", fontSize: 10 }}
              />
            )}
            <ReferenceLine
              y={currentQFlux}
              stroke="hsl(var(--primary))"
              strokeDasharray="4 4"
              label={{ value: `q''=${currentQFlux.toFixed(0)}`, fill: "hsl(var(--primary))", fontSize: 10 }}
            />

            {/* Band area (min to max) */}
            <Area
              type="monotone"
              dataKey="qFluxMax"
              stroke="none"
              fill="url(#bandGradient)"
              name="Max"
              legendType="none"
            />
            <Area
              type="monotone"
              dataKey="qFluxMin"
              stroke="none"
              fill="hsl(var(--background))"
              name="Min"
              legendType="none"
            />

            {/* Average line */}
            <Line
              type="monotone"
              dataKey="qFluxAvg"
              name={`${surfaceData?.name} (avg)`}
              stroke={surfaceData?.color || "hsl(var(--primary))"}
              strokeWidth={3}
              dot={{ fill: surfaceData?.color || "hsl(var(--primary))", r: 4 }}
            />

            {/* Min/Max lines */}
            <Line
              type="monotone"
              dataKey="qFluxMin"
              name="Min"
              stroke={surfaceData?.color || "hsl(var(--primary))"}
              strokeWidth={1}
              strokeDasharray="4 4"
              dot={false}
              opacity={0.5}
            />
            <Line
              type="monotone"
              dataKey="qFluxMax"
              name="Max"
              stroke={surfaceData?.color || "hsl(var(--primary))"}
              strokeWidth={1}
              strokeDasharray="4 4"
              dot={false}
              opacity={0.5}
            />

            {/* User data overlay */}
            {userChartData && (
              <Line
                data={userChartData}
                type="linear"
                dataKey="qFlux"
                name="Your Data"
                stroke="hsl(var(--chart-3))"
                strokeWidth={0}
                dot={{ fill: "hsl(var(--chart-3))", r: 4 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Surface info and references */}
      {surfaceData && (
        <motion.div variants={fadeInUp} className="p-5 rounded-xl glass border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Surface Details & References</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Surface Type</span>
                <span className="font-medium">{surfaceData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Working Fluid</span>
                <span className="font-medium">{currentFluid.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">T_sat</span>
                <span className="font-medium">{tSat}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subcooling</span>
                <span className="font-medium">{subcoolingValue} K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CHF Range (adjusted)</span>
                <span className="font-medium">{adjustedChfRange[0]} – {adjustedChfRange[1]} kW/m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">HTC Range</span>
                <span className="font-medium">{surfaceData.hRange[0].toLocaleString()} – {surfaceData.hRange[1].toLocaleString()} W/m²K</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-2">References:</div>
              <ul className="text-xs space-y-1">
                {surfaceData.references.map((ref, i) => (
                  <li key={i} className="text-muted-foreground">• {ref}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* User datasets overlay option */}
      {hasUserData && (
        <motion.div variants={fadeInUp} className="p-5 rounded-xl glass border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Overlay Your Data</h3>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showUserData}
                onChange={(e) => setShowUserData(e.target.checked)}
                className="accent-primary"
              />
              <span className="text-sm">Show on chart</span>
            </label>
          </div>
          {showUserData && (
            <ScrollArea className="h-48">
              <div className="space-y-2 pr-4">
                {datasets.map((ds) => {
                  const isSelected = selectedIds.includes(ds.id);
                  return (
                    <motion.label
                      key={ds.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        isSelected
                          ? "bg-primary/10 border-primary/50"
                          : "bg-card/50 border-border/50 hover:border-primary/30"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleDataset(ds.id)}
                        className="accent-primary w-4 h-4"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{ds.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {ds.data.length} points
                        </div>
                      </div>
                    </motion.label>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
