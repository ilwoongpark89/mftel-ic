"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Thermometer,
  Zap,
  Droplets,
} from "lucide-react";
import ImmersionTab from "@/components/tabs/ImmersionTab";
import { chipPresets } from "@/data/chips";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DashboardPage() {
  const [selectedChip, setSelectedChip] = useState(chipPresets[0].name);
  const [tdp, setTdp] = useState(chipPresets[0].tdp);
  const [chipArea, setChipArea] = useState(chipPresets[0].area);
  const [ambientTemp, setAmbientTemp] = useState(35);

  const handlePresetChange = (name: string) => {
    setSelectedChip(name);
    const preset = chipPresets.find((c) => c.name === name);
    if (preset) {
      setTdp(preset.tdp);
      setChipArea(preset.area);
    }
  };

  const heatFlux = useMemo(() => {
    if (chipArea <= 0) return 0;
    return tdp / (chipArea * 0.01);
  }, [tdp, chipArea]);

  const spec = useMemo(() => ({
    tdp,
    chipArea,
    ambientTemp,
  }), [tdp, chipArea, ambientTemp]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-teal-500/10">
              <Droplets className="h-6 w-6 text-teal-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Immersion Cooling</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Calculate heat flux and analyze boiling heat transfer
              </p>
            </div>
          </div>
        </motion.div>

        {/* Chip Input Section */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={fadeInUp}>
            <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm bg-gradient-to-br from-card to-muted/30">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                칩 사양 입력
              </h2>

              {/* Chip Preset */}
              <div className="mb-6">
                <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  칩 프리셋
                </Label>
                <Select value={selectedChip} onValueChange={handlePresetChange}>
                  <SelectTrigger className="bg-card max-w-md">
                    <SelectValue placeholder="Select a chip" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-card border shadow-lg">
                    {chipPresets.map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        {c.name} {c.category !== "Custom" ? `(${c.tdp}W)` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 2x2 Grid for Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                {/* TDP */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    TDP (발열량)
                  </Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[tdp]}
                      onValueChange={([v]) => {
                        setTdp(v);
                        setSelectedChip("Custom");
                      }}
                      min={10}
                      max={3000}
                      step={10}
                      className="flex-1"
                    />
                    <span className="text-sm font-bold tabular-nums w-20 text-right">{tdp}W</span>
                  </div>
                </div>

                {/* Die Area */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-blue-500" />
                    칩 면적 (Die Area)
                  </Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[chipArea]}
                      onValueChange={([v]) => {
                        setChipArea(v);
                        setSelectedChip("Custom");
                      }}
                      min={100}
                      max={1500}
                      step={10}
                      className="flex-1"
                    />
                    <span className="text-sm font-bold tabular-nums w-20 text-right">{chipArea}mm²</span>
                  </div>
                </div>

                {/* Ambient Temp */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-red-500" />
                    주변 온도
                  </Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[ambientTemp]}
                      onValueChange={([v]) => setAmbientTemp(v)}
                      min={15}
                      max={50}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm font-bold tabular-nums w-16 text-right">{ambientTemp}°C</span>
                  </div>
                </div>
              </div>

              {/* Heat Flux Display */}
              <div className="mt-6 pt-6 border-t border-border/50">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">계산된 Heat Flux</div>
                    <div className={cn(
                      "text-3xl font-bold",
                      heatFlux > 100 ? "text-red-500" : heatFlux > 30 ? "text-amber-500" : "text-emerald-500"
                    )}>
                      {heatFlux.toFixed(1)} <span className="text-lg font-normal text-muted-foreground">W/cm²</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-sm text-muted-foreground mb-2">Heat Flux 수준</div>
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          heatFlux > 100 ? "bg-red-500" : heatFlux > 30 ? "bg-amber-500" : "bg-emerald-500"
                        )}
                        style={{ width: `${Math.min(100, (heatFlux / 250) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0</span>
                      <span className="text-amber-500">30 (공랭 한계)</span>
                      <span className="text-red-500">100+</span>
                      <span>250</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Immersion Cooling Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ImmersionTab spec={spec} />
        </motion.div>

        {/* Footer credit */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-muted-foreground mt-8 text-center"
        >
          MFTEL Lab // Inha University // Prof. Il Woong Park
        </motion.p>
      </div>
    </div>
  );
}
