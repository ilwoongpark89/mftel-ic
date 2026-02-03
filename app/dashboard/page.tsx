"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  Thermometer,
  Zap,
  Droplets,
  Wind,
  Activity,
  Calculator,
} from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import HeatFluxTab from "@/components/tabs/HeatFluxTab";
import AirCoolingTab from "@/components/tabs/AirCoolingTab";
import ImmersionTab from "@/components/tabs/ImmersionTab";
import { chipPresets } from "@/data/chips";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { ChipSpec } from "@/components/calculator/InputForm";

type TabId = "heatflux" | "air" | "immersion";

const tabs = [
  { id: "heatflux" as TabId, label: "Heat Flux", icon: Calculator, color: "blue" },
  { id: "air" as TabId, label: "Air Cooling", icon: Wind, color: "orange" },
  { id: "immersion" as TabId, label: "Immersion", icon: Droplets, color: "teal" },
];

const colorClasses = {
  blue: {
    bg: "bg-blue-600",
    text: "text-blue-600",
    hover: "hover:bg-blue-50 dark:hover:bg-blue-950/30",
    ring: "ring-blue-600/20",
  },
  orange: {
    bg: "bg-orange-500",
    text: "text-orange-500",
    hover: "hover:bg-orange-50 dark:hover:bg-orange-950/30",
    ring: "ring-orange-500/20",
  },
  teal: {
    bg: "bg-teal-600",
    text: "text-teal-600",
    hover: "hover:bg-teal-50 dark:hover:bg-teal-950/30",
    ring: "ring-teal-600/20",
  },
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("heatflux");
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
            <h1 className="text-2xl font-bold">Cooling Analysis</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Calculate heat flux and compare cooling methods
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

        {/* Custom Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Tab Buttons */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-2 shadow-lg border border-gray-200 dark:border-gray-800">
            <div className="flex gap-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const colors = colorClasses[tab.color as keyof typeof colorClasses];
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl
                      font-semibold text-base transition-all duration-200 cursor-pointer
                      ${isActive
                        ? `${colors.bg} text-white shadow-lg ring-4 ${colors.ring}`
                        : `text-gray-600 dark:text-gray-400 ${colors.hover} hover:text-gray-900 dark:hover:text-white`
                      }
                    `}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabBg"
                        className={`absolute inset-0 ${colors.bg} rounded-xl`}
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                      <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${isActive ? "text-white" : colors.text}`} />
                      <span className="text-sm sm:text-base">{tab.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "heatflux" && (
                <HeatFluxTab spec={spec} onSpecChange={setSpec} />
              )}
              {activeTab === "air" && (
                <AirCoolingTab spec={spec} />
              )}
              {activeTab === "immersion" && (
                <ImmersionTab spec={spec} />
              )}
            </motion.div>
          </AnimatePresence>
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
