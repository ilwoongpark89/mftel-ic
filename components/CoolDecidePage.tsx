"use client";
import { useState } from "react";
import InputForm, { ChipSpec } from "@/components/calculator/InputForm";
import AirCoolingTab from "@/components/tabs/AirCoolingTab";
import ImmersionTab from "@/components/tabs/ImmersionTab";
import { chipPresets } from "@/data/chips";

type Tab = "air" | "immersion";

const tabs: { key: Tab; label: string; desc: string }[] = [
  { key: "air", label: "AIR COOLING", desc: "Natural & Forced Convection" },
  { key: "immersion", label: "IMMERSION", desc: "Novec 7100 · Two-Phase Boiling" },
];

export default function CoolDecidePage() {
  const [activeTab, setActiveTab] = useState<Tab>("immersion");
  const [spec, setSpec] = useState<ChipSpec>({
    tdp: chipPresets[0].tdp,
    chipArea: chipPresets[0].area,
    ambientTemp: 35,
  });

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-cyan-400 font-mono">
            {">"} COOLDECIDE_v1.0
          </h1>
          <p className="text-sm mt-1 text-gray-500 font-mono">
            // Chip Cooling Thermal Analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: chip spec input */}
          <div className="lg:col-span-3">
            <InputForm onChange={setSpec} />
          </div>

          {/* Right: tabbed results */}
          <div className="lg:col-span-9 space-y-6">
            {/* Tab bar */}
            <div className="flex gap-2">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex-1 px-4 py-3 rounded-lg border font-mono text-sm transition ${
                    activeTab === t.key
                      ? "bg-cyan-500/15 border-cyan-500 text-cyan-300"
                      : "bg-[#16213e] border-[#0f3460] text-gray-500 hover:border-gray-500"
                  }`}
                >
                  <div className="font-bold">{t.label}</div>
                  <div className="text-[10px] opacity-60 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === "air" && <AirCoolingTab spec={spec} />}
            {activeTab === "immersion" && <ImmersionTab spec={spec} />}
          </div>
        </div>

        <p className="text-xs text-gray-600 mt-8 text-center font-mono">
          MFTEL Lab // Inha University // Prof. Il Woong Park
        </p>
      </div>
    </div>
  );
}
