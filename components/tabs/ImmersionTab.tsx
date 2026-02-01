"use client";
import { useState, useMemo } from "react";
import ResultCard from "@/components/calculator/ResultCard";
import CoolingChart from "@/components/charts/CoolingChart";
import { ChipSpec } from "@/components/calculator/InputForm";
import {
  calcImmersion,
  ImmersionParams,
  CoolingMethod,
} from "@/lib/thermal-calc";
import { fluids, fluidKeys, surfaces, surfaceKeys } from "@/data/fluids";

interface Props {
  spec: ChipSpec;
}

const ANGLE_PRESETS = [
  { value: 0, label: "0° (Horizontal Up)" },
  { value: 30, label: "30°" },
  { value: 45, label: "45°" },
  { value: 60, label: "60°" },
  { value: 90, label: "90° (Vertical)" },
  { value: 135, label: "135°" },
  { value: 180, label: "180° (Horizontal Down)" },
];

const METHODS: CoolingMethod[] = ["forced", "immersion"];

export default function ImmersionTab({ spec }: Props) {
  const [fluidKey, setFluidKey] = useState("novec-7100");
  const [surfaceKey, setSurfaceKey] = useState("plain");
  const [fluidTemp, setFluidTemp] = useState(50);
  const [angle, setAngle] = useState(0);
  const [flowVelocity, setFlowVelocity] = useState(0);

  const fluid = fluids[fluidKey];
  const surface = surfaces[surfaceKey];

  const immersionParams: ImmersionParams = useMemo(() => ({
    fluidKey, surfaceKey, fluidTemp, angle, flowVelocity,
  }), [fluidKey, surfaceKey, fluidTemp, angle, flowVelocity]);

  const immersion = useMemo(
    () => calcImmersion(spec.tdp, spec.chipArea, immersionParams),
    [spec.tdp, spec.chipArea, immersionParams]
  );

  // Forced conv baseline for comparison
  const forcedH = 80;
  const forcedQPP = spec.tdp / (spec.chipArea * 1e-6);
  const forcedDT = forcedQPP / forcedH;
  const forcedChipTemp = Math.round((spec.ambientTemp + forcedDT) * 10) / 10;
  const forcedPower = Math.round(spec.tdp * 0.04 + 15);

  const savingsW = forcedPower - immersion.coolingPower;
  const savingsPct = forcedPower > 0 ? Math.round((savingsW / forcedPower) * 100) : 0;

  const inp = "w-full mt-1 px-3 py-2 bg-[#1a1a2e] border border-[#0f3460] text-cyan-100 rounded font-mono text-sm focus:outline-none focus:border-cyan-400";
  const lbl = "text-gray-400 text-[10px] font-mono uppercase tracking-wider";

  return (
    <div className="space-y-6">
      {/* Parameter controls */}
      <div className="p-5 rounded-xl border bg-[#16213e] border-[#0f3460]">
        <h3 className="text-sm font-bold text-cyan-400 font-mono tracking-wider mb-4">
          {">"} IMMERSION PARAMETERS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Fluid */}
          <div>
            <label className={lbl}>Coolant Fluid</label>
            <select className={inp} value={fluidKey} onChange={(e) => {
              setFluidKey(e.target.value);
              const f = fluids[e.target.value];
              if (fluidTemp >= f.T_sat) setFluidTemp(f.T_sat - 10);
            }}>
              {fluidKeys.map((k) => (
                <option key={k} value={k}>
                  {fluids[k].name} (T_sat {fluids[k].T_sat}°C)
                </option>
              ))}
            </select>
          </div>

          {/* Surface */}
          <div>
            <label className={lbl}>Surface Type</label>
            <select className={inp} value={surfaceKey} onChange={(e) => setSurfaceKey(e.target.value)}>
              {surfaceKeys.map((k) => (
                <option key={k} value={k}>
                  {surfaces[k].name} ({surfaces[k].hMultiplier}x)
                </option>
              ))}
            </select>
          </div>

          {/* Fluid temperature */}
          <div>
            <div className="flex justify-between items-center">
              <label className={lbl}>Fluid Temperature</label>
              <span className="text-cyan-100 font-mono text-xs">{fluidTemp}°C</span>
            </div>
            <input type="range" min={10} max={fluid.T_sat - 1} step={1} value={fluidTemp}
              onChange={(e) => setFluidTemp(Number(e.target.value))}
              className="w-full h-1.5 mt-2 rounded-lg appearance-none cursor-pointer accent-cyan-500 bg-[#0f3460]" />
            <div className="flex justify-between text-[9px] text-gray-600 font-mono mt-0.5">
              <span>10°C</span>
              <span>T_sat {fluid.T_sat}°C</span>
            </div>
          </div>

          {/* Surface angle */}
          <div>
            <div className="flex justify-between items-center">
              <label className={lbl}>Surface Angle</label>
              <span className="text-cyan-100 font-mono text-xs">{angle}°</span>
            </div>
            <input type="range" min={0} max={180} step={5} value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full h-1.5 mt-2 rounded-lg appearance-none cursor-pointer accent-cyan-500 bg-[#0f3460]" />
            <div className="flex justify-between text-[9px] text-gray-600 font-mono mt-0.5">
              <span>0° (up)</span>
              <span>90° (vert)</span>
              <span>180° (down)</span>
            </div>
          </div>

          {/* Flow velocity */}
          <div>
            <div className="flex justify-between items-center">
              <label className={lbl}>External Flow Velocity</label>
              <span className="text-cyan-100 font-mono text-xs">{flowVelocity.toFixed(1)} m/s</span>
            </div>
            <input type="range" min={0} max={2} step={0.1} value={flowVelocity}
              onChange={(e) => setFlowVelocity(Number(e.target.value))}
              className="w-full h-1.5 mt-2 rounded-lg appearance-none cursor-pointer accent-cyan-500 bg-[#0f3460]" />
            <div className="flex justify-between text-[9px] text-gray-600 font-mono mt-0.5">
              <span>0 (pool)</span>
              <span>2.0 m/s</span>
            </div>
          </div>

          {/* Computed h display */}
          <div className="flex flex-col justify-center p-3 rounded-lg bg-[#1a1a2e] border border-green-800/40">
            <span className="text-gray-400 text-[10px] font-mono uppercase">Effective h</span>
            <span className="text-green-400 font-mono text-xl font-bold">
              {immersion.h.toLocaleString()} W/m²K
            </span>
          </div>
        </div>
      </div>

      {/* Headline stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border bg-[#16213e] border-[#0f3460] flex flex-col items-center justify-center">
          <span className="text-gray-400 text-xs font-mono mb-1">CHIP TEMP</span>
          <span className={`text-3xl font-mono font-bold ${immersion.chipTemp > 85 ? "text-red-400" : "text-green-400"}`}>
            {immersion.chipTemp}°C
          </span>
          <span className="text-gray-500 text-xs font-mono mt-1">
            vs {forcedChipTemp}°C (fan)
          </span>
        </div>
        <div className="p-5 rounded-xl border bg-[#16213e] border-[#0f3460] flex flex-col items-center justify-center">
          <span className="text-gray-400 text-xs font-mono mb-1">COOLING POWER SAVED</span>
          <span className="text-3xl font-mono font-bold text-green-400">{savingsPct}%</span>
          <span className="text-gray-500 text-xs font-mono mt-1">{savingsW}W saved per chip</span>
        </div>
        <div className="p-5 rounded-xl border bg-[#16213e] border-[#0f3460] flex flex-col items-center justify-center">
          <span className="text-gray-400 text-xs font-mono mb-1">ΔT (SUPERHEAT)</span>
          <span className="text-3xl font-mono font-bold text-cyan-400">{immersion.deltaT} K</span>
          <span className="text-gray-500 text-xs font-mono mt-1">
            above T_sat {fluid.T_sat}°C ({fluid.name})
          </span>
        </div>
      </div>

      {/* Fluid properties */}
      <div className="p-5 rounded-xl border bg-[#0d1b3e] border-[#0f3460]">
        <h3 className="text-sm font-bold text-cyan-400 font-mono mb-3">
          {">"} {fluid.name.toUpperCase()} — PROPERTIES (@ 1 atm)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Formula", value: fluid.formula },
            { label: "T_sat", value: `${fluid.T_sat} °C` },
            { label: "ρ_liquid", value: `${fluid.rho_l.toLocaleString()} kg/m³` },
            { label: "ρ_vapor", value: `${fluid.rho_v} kg/m³` },
            { label: "h_fg", value: `${fluid.h_fg} kJ/kg` },
            { label: "k_liquid", value: `${fluid.k_l} W/mK` },
            { label: "μ_liquid", value: `${(fluid.mu_l * 1000).toFixed(2)} mPa·s` },
            { label: "c_p", value: `${fluid.c_pl.toLocaleString()} J/kgK` },
            { label: "σ", value: `${(fluid.sigma * 1000).toFixed(1)} mN/m` },
            { label: "Pr_liquid", value: `${fluid.Pr_l}` },
            { label: "GWP", value: `${fluid.GWP.toLocaleString()}` },
            { label: "Surface", value: `${surface.name} (${surface.hMultiplier}x)` },
          ].map((p) => (
            <div key={p.label} className="flex flex-col">
              <span className="text-gray-500 text-[10px] font-mono uppercase">{p.label}</span>
              <span className="text-gray-200 text-xs font-mono font-semibold">{p.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison table */}
      <div className="rounded-xl border bg-[#16213e] border-[#0f3460] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#1a1a2e]">
              <th className="px-4 py-3 text-left text-xs font-mono text-cyan-400 uppercase border-b border-[#0f3460]">Metric</th>
              <th className="px-4 py-3 text-left text-xs font-mono text-cyan-400 uppercase border-b border-[#0f3460]">Forced Conv.</th>
              <th className="px-4 py-3 text-left text-xs font-mono text-cyan-400 uppercase border-b border-[#0f3460]">Immersion ({fluid.name})</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: "h (W/m²K)", a: forcedH.toLocaleString(), b: immersion.h.toLocaleString() },
              { label: "ΔT (K)", a: Math.round(forcedDT * 10) / 10, b: immersion.deltaT },
              { label: "T_chip (°C)", a: forcedChipTemp, b: immersion.chipTemp },
              { label: "q'' (W/cm²)", a: immersion.heatFlux, b: immersion.heatFlux },
              { label: "Cooling Power (W)", a: forcedPower, b: immersion.coolingPower },
              { label: "Energy Savings", a: "—", b: `${savingsPct}% (${savingsW}W)` },
            ].map((row) => (
              <tr key={row.label}>
                <td className="px-4 py-2.5 text-sm font-mono text-gray-300 border-b border-[#0f3460] font-medium">{row.label}</td>
                <td className="px-4 py-2.5 text-sm font-mono text-gray-200 border-b border-[#0f3460]">{row.a}</td>
                <td className="px-4 py-2.5 text-sm font-mono text-green-400 border-b border-[#0f3460]">{row.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Charts */}
      <div className="p-6 rounded-xl border bg-[#16213e] border-[#0f3460]">
        <CoolingChart
          chipArea={spec.chipArea}
          maxTdp={spec.tdp}
          ambientTemp={spec.ambientTemp}
          methods={METHODS}
          immersionParams={immersionParams}
          immersionLabel={`Immersion (${fluid.name})`}
        />
      </div>
    </div>
  );
}
