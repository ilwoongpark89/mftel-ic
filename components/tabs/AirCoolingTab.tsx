"use client";
import { useMemo } from "react";
import ResultCard from "@/components/calculator/ResultCard";
import CoolingChart from "@/components/charts/CoolingChart";
import { ChipSpec } from "@/components/calculator/InputForm";
import { calculateSelected, CoolingMethod } from "@/lib/thermal-calc";

interface Props {
  spec: ChipSpec;
}

const METHODS: CoolingMethod[] = ["natural", "forced"];

export default function AirCoolingTab({ spec }: Props) {
  const results = useMemo(
    () =>
      calculateSelected({
        ...spec,
        selectedMethods: METHODS,
      }),
    [spec]
  );

  const natural = results.results.find((r) => r.key === "natural")!;
  const forced = results.results.find((r) => r.key === "forced")!;

  return (
    <div className="space-y-6">
      {/* Result cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResultCard result={natural} />
        <ResultCard result={forced} />
      </div>

      {/* Comparison summary */}
      <div className="rounded-xl border bg-[#16213e] border-[#0f3460] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#1a1a2e]">
              <th className="px-4 py-3 text-left text-xs font-mono text-cyan-400 uppercase border-b border-[#0f3460]">Metric</th>
              <th className="px-4 py-3 text-left text-xs font-mono text-cyan-400 uppercase border-b border-[#0f3460]">Natural Conv.</th>
              <th className="px-4 py-3 text-left text-xs font-mono text-cyan-400 uppercase border-b border-[#0f3460]">Forced Conv.</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: "h (W/m²K)", a: natural.h.toLocaleString(), b: forced.h.toLocaleString() },
              { label: "ΔT (K)", a: natural.deltaT, b: forced.deltaT },
              { label: "T_chip (°C)", a: natural.chipTemp, b: forced.chipTemp },
              { label: "q'' (W/cm²)", a: natural.heatFlux, b: forced.heatFlux },
              { label: "Fan Power (W)", a: natural.coolingPower, b: forced.coolingPower },
            ].map((row) => (
              <tr key={row.label}>
                <td className="px-4 py-2.5 text-sm font-mono text-gray-300 border-b border-[#0f3460] font-medium">{row.label}</td>
                <td className="px-4 py-2.5 text-sm font-mono text-gray-200 border-b border-[#0f3460]">{row.a}</td>
                <td className="px-4 py-2.5 text-sm font-mono text-gray-200 border-b border-[#0f3460]">{row.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chart */}
      <div className="p-6 rounded-xl border bg-[#16213e] border-[#0f3460]">
        <CoolingChart
          chipArea={spec.chipArea}
          maxTdp={spec.tdp}
          ambientTemp={spec.ambientTemp}
          methods={METHODS}
        />
      </div>
    </div>
  );
}
