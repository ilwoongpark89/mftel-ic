"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Thermometer,
  Zap,
  Activity,
} from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import HeatFluxTab from "@/components/tabs/HeatFluxTab";
import ImmersionTab from "@/components/tabs/ImmersionTab";
import { chipPresets } from "@/data/chips";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { ChipSpec } from "@/components/calculator/InputForm";

export default function DashboardPage() {
  const [spec, setSpec] = useState<ChipSpec>({
    tdp: chipPresets[0].tdp,
    chipArea: chipPresets[0].area,
    ambientTemp: 35,
  });

  const heatFlux = useMemo(() => {
    return (spec.tdp / (spec.chipArea * 0.01)).toFixed(1);
  }, [spec.tdp, spec.chipArea]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold">Immersion Cooling</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Calculate heat flux and analyze boiling heat transfer
            </p>
          </div>
        </motion.div>

        {/* Stats cards - always visible at top */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <motion.div variants={fadeInUp}>
            <StatsCard
              title="TDP"
              value={spec.tdp}
              unit="W"
              icon={Zap}
              variant="info"
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <StatsCard
              title="Die Area"
              value={spec.chipArea}
              unit="mm²"
              icon={Cpu}
              variant="default"
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <StatsCard
              title="Heat Flux"
              value={heatFlux}
              unit="W/cm²"
              icon={Activity}
              variant={Number(heatFlux) > 100 ? "warning" : "success"}
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <StatsCard
              title="Ambient"
              value={spec.ambientTemp}
              unit="°C"
              icon={Thermometer}
              variant="default"
            />
          </motion.div>
        </motion.div>

        {/* Heat Flux Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <HeatFluxTab spec={spec} onSpecChange={setSpec} />
        </motion.div>

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
