"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Wind, Thermometer, Zap, Fan, Activity, Gauge, AlertTriangle,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Legend, Area, ComposedChart,
} from "recharts";
import StatsCard from "@/components/dashboard/StatsCard";
import { ChipSpec } from "@/components/calculator/InputForm";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface Props {
  spec: ChipSpec;
}

// Heat transfer calculations
function calcNaturalConvection(deltaT: number, L: number = 0.1): number {
  // Natural convection: h ≈ 1.32 * (ΔT/L)^0.25 for horizontal plates
  // Simplified: h = 5-25 W/m²K typical range
  const h = 1.32 * Math.pow(Math.abs(deltaT) / L, 0.25);
  return Math.max(5, Math.min(25, h * 2)); // Scale to realistic range
}

function calcForcedConvection(velocity: number, L: number = 0.1): number {
  // Forced convection: h ≈ 10.45 - v + 10√v for air (simplified)
  // More realistic: h = 10 * v^0.8 for turbulent flow over flat plate
  if (velocity <= 0) return calcNaturalConvection(50, L);
  const h = 10 + 12 * Math.pow(velocity, 0.8);
  return Math.min(250, h); // Cap at reasonable max
}

function calcFanPower(flowRate: number, pressureDrop: number, efficiency: number = 0.5): number {
  // P_fan = (Q * ΔP) / η
  // flowRate in m³/s, pressureDrop in Pa
  return (flowRate * pressureDrop) / efficiency;
}

function calcAirFlowRate(fanRPM: number, fanDiameter: number = 0.12): number {
  // Simplified: Q ∝ RPM * D³
  // Typical 120mm fan: 0.5-2 m³/min at 1000-3000 RPM
  const Q = (fanRPM / 1000) * Math.pow(fanDiameter, 3) * 50;
  return Q / 60; // Convert to m³/s
}

function calcPressureDrop(velocity: number, finDensity: number = 10): number {
  // Simplified pressure drop across heatsink
  // ΔP ∝ v² * fin_density
  return 0.5 * 1.2 * velocity * velocity * (1 + finDensity * 0.1);
}

export default function AirCoolingTab({ spec }: Props) {
  // Input parameters
  const [airVelocity, setAirVelocity] = useState(3); // m/s
  const [fanRPM, setFanRPM] = useState(1500);
  const [fanDiameter, setFanDiameter] = useState(120); // mm
  const [heatsinkArea, setHeatsinkArea] = useState(200); // cm²
  const [finDensity, setFinDensity] = useState(12); // fins per inch

  // Calculations
  const heatFlux = useMemo(() => spec.tdp / (spec.chipArea * 0.01), [spec]);

  const naturalH = useMemo(() => calcNaturalConvection(50), []);
  const forcedH = useMemo(() => calcForcedConvection(airVelocity), [airVelocity]);

  const heatsinkAreaM2 = heatsinkArea * 1e-4;

  // Temperature calculations
  const naturalDeltaT = useMemo(() => spec.tdp / (naturalH * heatsinkAreaM2), [spec.tdp, naturalH, heatsinkAreaM2]);
  const forcedDeltaT = useMemo(() => spec.tdp / (forcedH * heatsinkAreaM2), [spec.tdp, forcedH, heatsinkAreaM2]);

  const naturalChipTemp = spec.ambientTemp + naturalDeltaT;
  const forcedChipTemp = spec.ambientTemp + forcedDeltaT;

  // Fan power calculation
  const flowRate = useMemo(() => calcAirFlowRate(fanRPM, fanDiameter / 1000), [fanRPM, fanDiameter]);
  const pressureDrop = useMemo(() => calcPressureDrop(airVelocity, finDensity), [airVelocity, finDensity]);
  const fanPower = useMemo(() => calcFanPower(flowRate, pressureDrop), [flowRate, pressureDrop]);

  // PUE contribution
  const coolingPUE = useMemo(() => {
    if (spec.tdp === 0) return 1;
    return 1 + (fanPower / spec.tdp);
  }, [fanPower, spec.tdp]);

  // Generate performance curve data
  const performanceCurve = useMemo(() => {
    const data = [];
    for (let v = 0; v <= 10; v += 0.5) {
      const h = v === 0 ? calcNaturalConvection(50) : calcForcedConvection(v);
      const deltaT = spec.tdp / (h * heatsinkAreaM2);
      const chipTemp = spec.ambientTemp + deltaT;
      const pDrop = calcPressureDrop(v, finDensity);
      const fRate = calcAirFlowRate(fanRPM * (v / airVelocity), fanDiameter / 1000);
      const fPower = v === 0 ? 0 : calcFanPower(fRate, pDrop);

      data.push({
        velocity: v,
        h: Math.round(h),
        chipTemp: Math.round(chipTemp * 10) / 10,
        fanPower: Math.round(fPower * 10) / 10,
        deltaT: Math.round(deltaT * 10) / 10,
      });
    }
    return data;
  }, [spec, heatsinkAreaM2, finDensity, fanRPM, fanDiameter, airVelocity]);

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: 12,
  };

  const isCritical = forcedChipTemp > 85;
  const isWarning = forcedChipTemp > 70;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Input parameters */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fan & Airflow settings */}
        <div className="p-5 rounded-xl glass border border-border/50 space-y-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Fan className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold">Fan Configuration</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-muted-foreground">Fan RPM</Label>
                <span className="text-sm font-bold tabular-nums">{fanRPM} RPM</span>
              </div>
              <Slider
                value={[fanRPM]}
                onValueChange={([v]) => setFanRPM(v)}
                min={500}
                max={4000}
                step={100}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>500 (Quiet)</span>
                <span>4000 (Max)</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-muted-foreground">Fan Diameter</Label>
                <span className="text-sm font-bold tabular-nums">{fanDiameter} mm</span>
              </div>
              <Slider
                value={[fanDiameter]}
                onValueChange={([v]) => setFanDiameter(v)}
                min={40}
                max={200}
                step={10}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-muted-foreground">Air Velocity</Label>
                <span className="text-sm font-bold tabular-nums">{airVelocity} m/s</span>
              </div>
              <Slider
                value={[airVelocity]}
                onValueChange={([v]) => setAirVelocity(v)}
                min={0}
                max={10}
                step={0.5}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0 (Natural)</span>
                <span>10 m/s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Heatsink settings */}
        <div className="p-5 rounded-xl glass border border-border/50 space-y-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Activity className="h-4 w-4 text-amber-500" />
            </div>
            <h3 className="text-sm font-semibold">Heatsink Configuration</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-muted-foreground">Heatsink Surface Area</Label>
                <span className="text-sm font-bold tabular-nums">{heatsinkArea} cm²</span>
              </div>
              <Slider
                value={[heatsinkArea]}
                onValueChange={([v]) => setHeatsinkArea(v)}
                min={50}
                max={1000}
                step={10}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>50 cm² (Small)</span>
                <span>1000 cm² (Large)</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-muted-foreground">Fin Density</Label>
                <span className="text-sm font-bold tabular-nums">{finDensity} FPI</span>
              </div>
              <Slider
                value={[finDensity]}
                onValueChange={([v]) => setFinDensity(v)}
                min={4}
                max={24}
                step={1}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>4 FPI (Sparse)</span>
                <span>24 FPI (Dense)</span>
              </div>
            </div>

            {/* Calculated values display */}
            <div className="p-3 rounded-lg bg-muted/30 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Flow Rate</span>
                <span className="font-medium">{(flowRate * 60).toFixed(2)} m³/min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pressure Drop</span>
                <span className="font-medium">{pressureDrop.toFixed(1)} Pa</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Results comparison */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Natural h"
          value={Math.round(naturalH)}
          unit="W/m²K"
          icon={Wind}
          variant="default"
        />
        <StatsCard
          title="Forced h"
          value={Math.round(forcedH)}
          unit="W/m²K"
          icon={Fan}
          variant="info"
        />
        <StatsCard
          title="T_chip (Forced)"
          value={Math.round(forcedChipTemp)}
          unit="°C"
          icon={Thermometer}
          variant={isCritical ? "danger" : isWarning ? "warning" : "success"}
        />
        <StatsCard
          title="Fan Power"
          value={fanPower.toFixed(1)}
          unit="W"
          icon={Zap}
          variant="info"
        />
        <StatsCard
          title="Cooling PUE"
          value={coolingPUE.toFixed(3)}
          unit=""
          icon={Gauge}
          variant={coolingPUE > 1.1 ? "warning" : "success"}
          description="1 + P_fan/TDP"
        />
      </motion.div>

      {/* Warning if thermal limit exceeded */}
      {isCritical && (
        <motion.div
          variants={fadeInUp}
          className="p-4 rounded-lg border border-red-500/50 bg-red-500/10 flex items-start gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-red-500">Thermal Limit Exceeded</div>
            <div className="text-sm text-muted-foreground mt-1">
              Chip temperature ({Math.round(forcedChipTemp)}°C) exceeds 85°C limit.
              Consider: larger heatsink, higher airflow, or immersion cooling.
            </div>
          </div>
        </motion.div>
      )}

      {/* Comparison cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Natural Convection */}
        <div className="p-5 rounded-xl glass border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Wind className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold">Natural Convection</h3>
              <p className="text-xs text-muted-foreground">No fan (passive)</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">h</span>
              <span className="font-medium">{Math.round(naturalH)} W/m²K</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ΔT</span>
              <span className="font-medium">{Math.round(naturalDeltaT)} K</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">T_chip</span>
              <span className={cn(
                "font-bold",
                naturalChipTemp > 85 ? "text-red-500" : naturalChipTemp > 70 ? "text-amber-500" : "text-emerald-500"
              )}>
                {Math.round(naturalChipTemp)}°C
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fan Power</span>
              <span className="font-medium text-emerald-500">0 W</span>
            </div>
          </div>
        </div>

        {/* Forced Convection */}
        <div className={cn(
          "p-5 rounded-xl glass border",
          isCritical ? "border-red-500/50" : "border-primary/30 glow-primary"
        )}>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Fan className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Forced Convection</h3>
              <p className="text-xs text-muted-foreground">{airVelocity} m/s @ {fanRPM} RPM</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">h</span>
              <span className="font-medium">{Math.round(forcedH)} W/m²K</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ΔT</span>
              <span className="font-medium">{Math.round(forcedDeltaT)} K</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">T_chip</span>
              <span className={cn(
                "font-bold",
                forcedChipTemp > 85 ? "text-red-500" : forcedChipTemp > 70 ? "text-amber-500" : "text-emerald-500"
              )}>
                {Math.round(forcedChipTemp)}°C
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fan Power</span>
              <span className="font-medium text-primary">{fanPower.toFixed(1)} W</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Performance curves */}
      <motion.div variants={fadeInUp} className="p-5 rounded-xl glass border border-border/50">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Performance vs Air Velocity
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={performanceCurve} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="velocity"
              label={{ value: "Air Velocity (m/s)", position: "insideBottom", offset: -10, fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              stroke="hsl(var(--border))"
            />
            <YAxis
              yAxisId="temp"
              label={{ value: "T_chip (°C)", angle: -90, position: "insideLeft", offset: -5, fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              stroke="hsl(var(--border))"
              domain={[0, 'auto']}
            />
            <YAxis
              yAxisId="power"
              orientation="right"
              label={{ value: "Fan Power (W)", angle: 90, position: "insideRight", offset: -5, fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              stroke="hsl(var(--border))"
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine
              yAxisId="temp"
              y={85}
              stroke="hsl(var(--destructive))"
              strokeDasharray="6 3"
              label={{ value: "T_max 85°C", fill: "hsl(var(--destructive))", fontSize: 10 }}
            />
            <ReferenceLine
              x={airVelocity}
              stroke="hsl(var(--chart-4))"
              strokeDasharray="4 4"
              label={{ value: "Current", fill: "hsl(var(--chart-4))", fontSize: 10 }}
            />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="chipTemp"
              name="Chip Temp (°C)"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="power"
              type="monotone"
              dataKey="fanPower"
              name="Fan Power (W)"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
}
