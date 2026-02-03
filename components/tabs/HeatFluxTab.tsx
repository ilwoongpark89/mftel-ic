"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Cpu, Thermometer, Zap, Flame, Calculator, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { chipPresets } from "@/data/chips";
import { cn } from "@/lib/utils";
import { ChipSpec } from "@/components/calculator/InputForm";
import { fadeInUp, staggerContainer } from "@/lib/animations";

interface Props {
  spec: ChipSpec;
  onSpecChange: (spec: ChipSpec) => void;
}

export default function HeatFluxTab({ spec, onSpecChange }: Props) {
  const [selectedChip, setSelectedChip] = useState(chipPresets[0].name);
  const [tdp, setTdp] = useState(spec.tdp);
  const [chipArea, setChipArea] = useState(spec.chipArea);
  const [ambientTemp, setAmbientTemp] = useState(spec.ambientTemp);

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
    onSpecChange({ tdp, chipArea, ambientTemp });
  }, [tdp, chipArea, ambientTemp, onSpecChange]);

  const heatFlux = useMemo(() => tdp / (chipArea * 0.01), [tdp, chipArea]);
  const heatFluxKW = useMemo(() => (tdp / (chipArea * 1e-6)) / 1000, [tdp, chipArea]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Main calculation panel */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input controls */}
        <div className="p-6 rounded-xl glass border border-border/50 space-y-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calculator className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold tracking-wide">
              Chip Specification
            </h2>
          </div>

          {/* Preset selector */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              GPU / Chip Preset
            </Label>
            <Select value={selectedChip} onValueChange={handlePresetChange}>
              <SelectTrigger className="glass">
                <SelectValue placeholder="Select a chip" />
              </SelectTrigger>
              <SelectContent>
                {chipPresets.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    {c.name} {c.category !== "Custom" ? `(${c.tdp}W)` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* TDP slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs flex items-center gap-1.5 text-primary font-semibold">
                <Zap className="h-3.5 w-3.5" />
                MAX POWER — TDP
              </Label>
              <span className="text-sm font-bold tabular-nums">{tdp} W</span>
            </div>
            <Slider
              value={[tdp]}
              onValueChange={([v]) => {
                setTdp(v);
                switchToCustom();
              }}
              min={10}
              max={3000}
              step={10}
              className="py-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>10W</span>
              <span>3000W</span>
            </div>
          </div>

          {/* Die area slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs flex items-center gap-1.5 text-primary font-semibold">
                <Cpu className="h-3.5 w-3.5" />
                DIE AREA
              </Label>
              <span className="text-sm font-bold tabular-nums">{chipArea} mm²</span>
            </div>
            <Slider
              value={[chipArea]}
              onValueChange={([v]) => {
                setChipArea(v);
                switchToCustom();
              }}
              min={50}
              max={1500}
              step={10}
              className="py-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>50mm²</span>
              <span>1500mm²</span>
            </div>
          </div>

          {/* Ambient temperature */}
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider">
              <Thermometer className="h-3.5 w-3.5" />
              Ambient Temperature
            </Label>
            <div className="relative">
              <Input
                type="number"
                value={ambientTemp}
                onChange={(e) => setAmbientTemp(Number(e.target.value))}
                className="pr-8 glass"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                °C
              </span>
            </div>
          </div>
        </div>

        {/* Right: Heat flux result */}
        <div className="space-y-6">
          {/* Heat flux big display */}
          <motion.div
            key={heatFlux.toFixed(1)}
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "p-8 rounded-xl glass border text-center",
              heatFlux > 100
                ? "border-amber-500/50 bg-amber-500/5"
                : "border-primary/30 bg-primary/5"
            )}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Flame className={cn("h-6 w-6", heatFlux > 100 ? "text-amber-500" : "text-primary")} />
              <span className="text-lg font-semibold text-muted-foreground">
                Heat Flux (q&quot;)
              </span>
            </div>
            <div
              className={cn(
                "text-5xl font-bold tabular-nums mb-2",
                heatFlux > 100 ? "text-amber-500" : "text-primary"
              )}
            >
              {heatFlux.toFixed(1)}
            </div>
            <div className="text-xl text-muted-foreground">W/cm²</div>
            <div className="mt-4 text-sm text-muted-foreground">
              = {heatFluxKW.toFixed(1)} kW/m²
            </div>
          </motion.div>

          {/* Formula explanation */}
          <div className="p-5 rounded-xl glass border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Formula</span>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg font-mono text-sm">
              q&quot; = TDP / A<sub>die</sub>
            </div>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>TDP (Thermal Design Power)</span>
                <span className="font-medium text-foreground">{tdp} W</span>
              </div>
              <div className="flex justify-between">
                <span>Die Area</span>
                <span className="font-medium text-foreground">{chipArea} mm² = {(chipArea * 0.01).toFixed(3)} cm²</span>
              </div>
              <div className="flex justify-between border-t border-border/50 pt-1 mt-1">
                <span>Heat Flux</span>
                <span className="font-medium text-primary">{tdp} / {(chipArea * 0.01).toFixed(3)} = {heatFlux.toFixed(1)} W/cm²</span>
              </div>
            </div>
          </div>

          {/* Warning if high heat flux */}
          {heatFlux > 100 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border border-amber-500/50 bg-amber-500/10"
            >
              <div className="flex items-start gap-3">
                <Flame className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-500 text-sm">High Heat Flux</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    q&quot; &gt; 100 W/cm² typically requires advanced cooling solutions.
                    Air cooling may not be sufficient — consider immersion cooling.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Reference table */}
      <motion.div variants={fadeInUp} className="p-5 rounded-xl glass border border-border/50">
        <h3 className="text-sm font-semibold mb-4">Typical Heat Flux Ranges by Cooling Method</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Cooling Method</th>
                <th className="text-center py-2 px-3 text-muted-foreground font-medium">Heat Flux Range</th>
                <th className="text-center py-2 px-3 text-muted-foreground font-medium">Current q&quot;</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              <tr className={cn(heatFlux <= 5 && "bg-primary/5")}>
                <td className="py-2 px-3">Natural Convection (Air)</td>
                <td className="py-2 px-3 text-center text-muted-foreground">0.1 – 5 W/cm²</td>
                <td className="py-2 px-3 text-center">
                  {heatFlux <= 5 ? (
                    <span className="text-emerald-500 font-medium">✓ OK</span>
                  ) : (
                    <span className="text-red-500">✗ Exceeds</span>
                  )}
                </td>
              </tr>
              <tr className={cn(heatFlux <= 50 && heatFlux > 5 && "bg-primary/5")}>
                <td className="py-2 px-3">Forced Convection (Air + Fan)</td>
                <td className="py-2 px-3 text-center text-muted-foreground">5 – 50 W/cm²</td>
                <td className="py-2 px-3 text-center">
                  {heatFlux <= 50 ? (
                    <span className="text-emerald-500 font-medium">✓ OK</span>
                  ) : (
                    <span className="text-red-500">✗ Exceeds</span>
                  )}
                </td>
              </tr>
              <tr className={cn(heatFlux <= 200 && heatFlux > 50 && "bg-primary/5")}>
                <td className="py-2 px-3">Single-Phase Immersion</td>
                <td className="py-2 px-3 text-center text-muted-foreground">10 – 100 W/cm²</td>
                <td className="py-2 px-3 text-center">
                  {heatFlux <= 100 ? (
                    <span className="text-emerald-500 font-medium">✓ OK</span>
                  ) : (
                    <span className="text-amber-500 font-medium">△ Marginal</span>
                  )}
                </td>
              </tr>
              <tr className={cn(heatFlux > 100 && "bg-primary/5")}>
                <td className="py-2 px-3 font-medium text-primary">Two-Phase Immersion (Boiling)</td>
                <td className="py-2 px-3 text-center text-muted-foreground">50 – 500+ W/cm²</td>
                <td className="py-2 px-3 text-center">
                  <span className="text-emerald-500 font-medium">✓ OK</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
