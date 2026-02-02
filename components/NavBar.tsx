"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "DESIGN", desc: "Cooling Analysis & Simulation" },
  { href: "/input", label: "DATA INPUT", desc: "Boiling Experiment Data Entry" },
  { href: "/manage", label: "DATA MANAGE", desc: "View & Compare Saved Data" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-[#1a1a2e] border-b border-[#0f3460]">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-cyan-400 font-mono">
            {">"} COOLDECIDE_v1.0
          </h1>
          <p className="text-sm mt-1 text-gray-500 font-mono">
            // Chip Cooling Thermal Analysis
          </p>
        </div>
        <div className="flex gap-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 px-4 py-3 rounded-lg border font-mono text-sm transition text-center ${
                  active
                    ? "bg-cyan-500/15 border-cyan-500 text-cyan-300"
                    : "bg-[#16213e] border-[#0f3460] text-gray-500 hover:border-gray-500"
                }`}
              >
                <div className="font-bold">{item.label}</div>
                <div className="text-[10px] opacity-60 mt-0.5">{item.desc}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
