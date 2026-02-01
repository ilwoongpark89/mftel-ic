"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  CoolingMethod,
  ImmersionParams,
  generateCurveData,
  generatePowerCurve,
} from "@/lib/thermal-calc";

interface Props {
  chipArea: number;
  maxTdp: number;
  ambientTemp: number;
  methods: CoolingMethod[];
  immersionParams?: ImmersionParams;
  immersionLabel?: string;
}

const LINE_COLORS: Record<CoolingMethod, string> = {
  natural: "#f59e0b",
  forced: "#06b6d4",
  immersion: "#00ff88",
};

export default function CoolingChart({
  chipArea, maxTdp, ambientTemp, methods,
  immersionParams, immersionLabel,
}: Props) {
  const curveData = generateCurveData(chipArea, maxTdp, ambientTemp, methods, immersionParams);
  const powerData = generatePowerCurve(chipArea, maxTdp, methods, immersionParams?.flowVelocity);
  const currentQ = maxTdp / (chipArea * 0.01);

  const lineLabels: Record<CoolingMethod, string> = {
    natural: "Natural Conv.",
    forced: "Forced Conv.",
    immersion: immersionLabel || "Immersion",
  };

  const tooltipStyle = {
    backgroundColor: "#16213e",
    border: "1px solid #0f3460",
    color: "#e0e0e0",
    fontSize: 12,
    fontFamily: "monospace",
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold mb-3 text-cyan-400 font-mono">
          {">"} q&quot; vs CHIP TEMPERATURE
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={curveData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#0f3460" />
            <XAxis
              dataKey="qCm2"
              tick={{ fill: "#e0e0e0", fontSize: 11, fontFamily: "monospace" }}
              label={{ value: "q'' (W/cm²)", position: "insideBottomRight", offset: -5, fill: "#9ca3af", fontSize: 11, fontFamily: "monospace" }}
            />
            <YAxis
              tick={{ fill: "#e0e0e0", fontSize: 11, fontFamily: "monospace" }}
              label={{ value: "T_chip (°C)", angle: -90, position: "insideLeft", offset: 10, fill: "#9ca3af", fontSize: 11, fontFamily: "monospace" }}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: "monospace" }} />
            <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="6 3"
              label={{ value: "T_max 85°C", fill: "#ef4444", fontSize: 10, fontFamily: "monospace" }} />
            <ReferenceLine x={Math.round(currentQ * 10) / 10} stroke="#8b5cf6" strokeDasharray="4 4"
              label={{ value: "current q''", fill: "#8b5cf6", fontSize: 10, fontFamily: "monospace" }} />
            {methods.map((m) => (
              <Line key={m} type="monotone" dataKey={m} name={lineLabels[m]}
                stroke={LINE_COLORS[m]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-sm font-bold mb-3 text-cyan-400 font-mono">
          {">"} q&quot; vs COOLING POWER CONSUMPTION
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={powerData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#0f3460" />
            <XAxis dataKey="qCm2"
              tick={{ fill: "#e0e0e0", fontSize: 11, fontFamily: "monospace" }}
              label={{ value: "q'' (W/cm²)", position: "insideBottomRight", offset: -5, fill: "#9ca3af", fontSize: 11, fontFamily: "monospace" }} />
            <YAxis tick={{ fill: "#e0e0e0", fontSize: 11, fontFamily: "monospace" }}
              label={{ value: "Power (W)", angle: -90, position: "insideLeft", offset: 10, fill: "#9ca3af", fontSize: 11, fontFamily: "monospace" }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: "monospace" }} />
            <ReferenceLine x={Math.round(currentQ * 10) / 10} stroke="#8b5cf6" strokeDasharray="4 4" />
            {methods.map((m) => (
              <Line key={m} type="monotone" dataKey={m} name={lineLabels[m]}
                stroke={LINE_COLORS[m]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
