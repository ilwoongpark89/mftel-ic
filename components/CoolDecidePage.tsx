"use client";
import { useState } from "react";
import InputForm, { ChipSpec } from "@/components/calculator/InputForm";
import AirCoolingTab from "@/components/tabs/AirCoolingTab";
import ImmersionTab from "@/components/tabs/ImmersionTab";
import { chipPresets } from "@/data/chips";

type DesignTab = "air" | "immersion";

const designTabs: { key: DesignTab; label: string; desc: string }[] = [
  { key: "air", label: "AIR COOLING", desc: "Natural & Forced Convection" },
  { key: "immersion", label: "IMMERSION", desc: "Data-Driven · Two-Phase Boiling" },
];

export default function CoolDecidePage() {
  const [activeDesignTab, setActiveDesignTab] = useState<DesignTab>("immersion");
  const [spec, setSpec] = useState<ChipSpec>({
    tdp: chipPresets[0].tdp,
    chipArea: chipPresets[0].area,
    ambientTemp: 35,
  });

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <InputForm onChange={setSpec} />
          </div>
          <div className="lg:col-span-9 space-y-6">
            {/* Sub-tab bar */}
            <div className="flex gap-2">
              {designTabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveDesignTab(t.key)}
                  className={`flex-1 px-4 py-3 rounded-lg border font-mono text-sm transition ${
                    activeDesignTab === t.key
                      ? "bg-cyan-500/15 border-cyan-500 text-cyan-300"
                      : "bg-[#16213e] border-[#0f3460] text-gray-500 hover:border-gray-500"
                  }`}
                >
                  <div className="font-bold">{t.label}</div>
                  <div className="text-[10px] opacity-60 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
            {activeDesignTab === "air" && <AirCoolingTab spec={spec} />}
            {activeDesignTab === "immersion" && <ImmersionTab spec={spec} />}
          </div>
        </div>

        <p className="text-xs text-gray-600 mt-8 text-center font-mono">
          MFTEL Lab // Inha University // Prof. Il Woong Park
        </p>
      </div>
    </div>
  );
}
