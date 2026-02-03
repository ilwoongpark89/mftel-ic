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
  natural: "hsl(var(--chart-3))",
  forced: "hsl(var(--primary))",
  immersion: "hsl(var(--chart-2))",
};

export default function CoolingChart({
  chipArea,
  maxTdp,
  ambientTemp,
  methods,
  immersionParams,
  immersionLabel,
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
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: 12,
  };

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">
          q&quot; vs Chip Temperature
        </h4>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={curveData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="qCm2"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              label={{
                value: "q'' (W/cm²)",
                position: "insideBottomRight",
                offset: -5,
                fill: "hsl(var(--muted-foreground))",
                fontSize: 11,
              }}
              stroke="hsl(var(--border))"
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              label={{
                value: "T_chip (°C)",
                angle: -90,
                position: "insideLeft",
                offset: 10,
                fill: "hsl(var(--muted-foreground))",
                fontSize: 11,
              }}
              stroke="hsl(var(--border))"
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine
              y={85}
              stroke="hsl(var(--destructive))"
              strokeDasharray="6 3"
              label={{
                value: "T_max 85°C",
                fill: "hsl(var(--destructive))",
                fontSize: 10,
              }}
            />
            <ReferenceLine
              x={Math.round(currentQ * 10) / 10}
              stroke="hsl(var(--chart-4))"
              strokeDasharray="4 4"
              label={{
                value: "current q''",
                fill: "hsl(var(--chart-4))",
                fontSize: 10,
              }}
            />
            {methods.map((m) => (
              <Line
                key={m}
                type="monotone"
                dataKey={m}
                name={lineLabels[m]}
                stroke={LINE_COLORS[m]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">
          q&quot; vs Cooling Power Consumption
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={powerData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="qCm2"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              label={{
                value: "q'' (W/cm²)",
                position: "insideBottomRight",
                offset: -5,
                fill: "hsl(var(--muted-foreground))",
                fontSize: 11,
              }}
              stroke="hsl(var(--border))"
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              label={{
                value: "Power (W)",
                angle: -90,
                position: "insideLeft",
                offset: 10,
                fill: "hsl(var(--muted-foreground))",
                fontSize: 11,
              }}
              stroke="hsl(var(--border))"
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine
              x={Math.round(currentQ * 10) / 10}
              stroke="hsl(var(--chart-4))"
              strokeDasharray="4 4"
            />
            {methods.map((m) => (
              <Line
                key={m}
                type="monotone"
                dataKey={m}
                name={lineLabels[m]}
                stroke={LINE_COLORS[m]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
