"use client";
import { ComparisonResult, energySavingsPercent } from "@/lib/thermal-calc";

interface Props {
  results: ComparisonResult;
}

export default function ComparisonTable({ results }: Props) {
  const { results: items } = results;
  const baseline = items.find((r) => r.coolingPower > 0) || items[0];

  const metrics = [
    { label: "h (W/m²K)", get: (r: typeof items[0]) => r.h.toLocaleString() },
    { label: "ΔT (K)", get: (r: typeof items[0]) => r.deltaT },
    { label: "Chip Temp (°C)", get: (r: typeof items[0]) => r.chipTemp },
    { label: "Heat Flux (W/cm²)", get: (r: typeof items[0]) => r.heatFlux },
    { label: "Cooling Power (W)", get: (r: typeof items[0]) => r.coolingPower },
  ];

  const th = "px-4 py-3 text-left text-xs font-mono text-cyan-400 uppercase border-b border-[#0f3460]";
  const td = "px-4 py-3 text-sm font-mono text-gray-200 border-b border-[#0f3460]";

  return (
    <div className="rounded-xl border overflow-hidden bg-[#16213e] border-[#0f3460]">
      <table className="w-full">
        <thead>
          <tr className="bg-[#1a1a2e]">
            <th className={th}>Metric</th>
            {items.map((r) => (
              <th key={r.key} className={th}>{r.method}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m.label}>
              <td className={`${td} font-medium`}>{m.label}</td>
              {items.map((r) => (
                <td key={r.key} className={td}>{m.get(r)}</td>
              ))}
            </tr>
          ))}
          <tr>
            <td className={`${td} font-medium`}>Energy Savings (%)</td>
            {items.map((r) => (
              <td key={r.key} className={td}>
                {r.key === baseline?.key
                  ? "—"
                  : baseline && baseline.coolingPower > 0
                  ? `${energySavingsPercent(baseline, r)}%`
                  : "—"}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
