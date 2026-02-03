"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cpu, Thermometer, Zap, Flame } from "lucide-react";
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

  const heatFlux = tdp / (chipArea * 0.01);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl glass border border-border/50 space-y-6"
    >
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <Cpu className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-sm font-semibold tracking-wide">
          General Design
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

      {/* Heat flux readout */}
      <motion.div
        key={heatFlux.toFixed(1)}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className={cn(
          "p-4 rounded-lg glass border",
          heatFlux > 100
            ? "border-amber-500/50 bg-amber-500/5"
            : "border-border/50"
        )}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Flame className={cn("h-4 w-4", heatFlux > 100 && "text-amber-500")} />
            <span className="text-xs">Heat Flux (q&quot;)</span>
          </div>
          <span
            className={cn(
              "text-lg font-bold tabular-nums",
              heatFlux > 100 ? "text-amber-500" : "text-primary"
            )}
          >
            {heatFlux.toFixed(1)} W/cm²
          </span>
        </div>
      </motion.div>

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
    </motion.div>
  );
}
