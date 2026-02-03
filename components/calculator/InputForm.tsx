"use client";
import { useState, useEffect } from "react";
import { chipPresets } from "@/data/chips";

export interface ChipSpec {
  tdp: number;
  chipArea: number;
  ambientTemp: number;
}

interface Props {
  onChange: (spec: ChipSpec) => void;
}

export default function InputForm({ onChange }: Props) {
  const [selectedChip, setSelectedChip] = useState(chipPresets[0].name);
  const [tdp, setTdp] = useState(chipPresets[0].tdp);
  const [chipArea, setChipArea] = useState(chipPresets[0].area);
  const [ambientTemp, setAmbientTemp] = useState(35);

  const handlePresetChange = (name: string) => {
    setSelectedChip(name);
    const preset = chipPresets.find((c) => c.name === name);
    if (preset && preset.category !== "Custom") {
      setTdp(preset.tdp);
      setChipArea(preset.area);
    }
  };

  const switchToCustom = () => {
    setSelectedChip("Custom");
  };

  useEffect(() => {
    onChange({ tdp, chipArea, ambientTemp });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tdp, chipArea, ambientTemp]);

  const inp =
    "w-full mt-1 px-3 py-2 bg-[#1a1a2e] border border-[#0f3460] text-cyan-100 rounded font-mono text-sm focus:outline-none focus:border-cyan-400";

  return (
    <div className="p-5 rounded-xl border bg-[#16213e] border-[#0f3460] space-y-5">
      <h2 className="text-sm font-bold text-cyan-400 font-mono tracking-wider">
        {">"} GENERAL DESIGN
      </h2>

      {/* Preset */}
      <div>
        <label className="text-gray-400 text-xs font-mono uppercase tracking-wider">
          GPU / Chip Preset
        </label>
        <select
          className={inp}
          value={selectedChip}
          onChange={(e) => handlePresetChange(e.target.value)}
        >
          {chipPresets.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name} {c.category !== "Custom" ? `(${c.tdp}W, ${c.area}mm²)` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* TDP slider */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-cyan-400 text-xs font-mono font-bold">MAX POWER — TDP</label>
          <span className="text-cyan-100 font-mono text-sm font-bold">{tdp} W</span>
        </div>
        <input
          type="range" min={10} max={3000} step={10} value={tdp}
          onChange={(e) => { setTdp(Number(e.target.value)); switchToCustom(); }}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-cyan-500 bg-[#0f3460]"
        />
        <div className="flex justify-between text-[10px] text-gray-600 font-mono mt-0.5">
          <span>10W</span><span>3000W</span>
        </div>
      </div>

      {/* Die area slider */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-cyan-400 text-xs font-mono font-bold">DIE AREA</label>
          <span className="text-cyan-100 font-mono text-sm font-bold">{chipArea} mm²</span>
        </div>
        <input
          type="range" min={50} max={1500} step={10} value={chipArea}
          onChange={(e) => { setChipArea(Number(e.target.value)); switchToCustom(); }}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-cyan-500 bg-[#0f3460]"
        />
        <div className="flex justify-between text-[10px] text-gray-600 font-mono mt-0.5">
          <span>50mm²</span><span>1500mm²</span>
        </div>
      </div>

      {/* q'' readout */}
      <div className="p-3 rounded-lg bg-[#1a1a2e] border border-[#0f3460]">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-xs font-mono">q&quot; (heat flux)</span>
          <span className="text-yellow-400 font-mono text-sm font-bold">
            {(tdp / (chipArea * 0.01)).toFixed(1)} W/cm²
          </span>
        </div>
      </div>

      {/* Ambient temp */}
      <div>
        <label className="text-gray-400 text-xs font-mono uppercase tracking-wider">
          Ambient Temperature (°C)
        </label>
        <input
          type="number" className={inp} value={ambientTemp}
          onChange={(e) => setAmbientTemp(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
