"use client";
import { CoolingResult } from "@/lib/thermal-calc";

interface Props {
  result: CoolingResult;
}

export default function ResultCard({ result }: Props) {
  const items = [
    { label: "Chip Temperature", value: `${result.chipTemp} °C`, warn: result.chipTemp > 85 },
    { label: "ΔT", value: `${result.deltaT} K` },
    { label: "h (HTC)", value: `${result.h.toLocaleString()} W/m²K` },
    { label: "Heat Flux", value: `${result.heatFlux} W/cm²` },
    { label: "Cooling Power", value: `${result.coolingPower} W` },
  ];

  return (
    <div className="p-5 rounded-xl border bg-[#16213e] border-[#0f3460]">
      <h3 className="text-sm font-bold mb-3 text-cyan-400 font-mono">
        {">"} {result.method.toUpperCase()}
      </h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between items-center">
            <span className="text-xs text-gray-400">{item.label}</span>
            <span
              className={`text-sm font-semibold font-mono ${
                item.warn ? "text-red-400" : "text-green-400"
              }`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
