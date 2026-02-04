"use client";

import { useState, useMemo, memo, useDeferredValue } from "react";
import { motion } from "framer-motion";
import {
  Scale,
  Thermometer,
  Zap,
  Droplets,
  Wind,
  Fan,
  Cpu,
  Activity,
  Info,
  CheckCircle2,
  XCircle,
  Lightbulb,
  AlertTriangle,
  Leaf,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import AppShell from "@/components/layout/AppShell";
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

// ============================================================================
// DATA & CALCULATIONS
// ============================================================================

interface CoolingMethod {
  id: string;
  name: string;
  shortName: string;
  category: "air" | "cold-plate" | "immersion" | "passive";
  icon: "wind" | "fan" | "droplets";
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  // Thermal properties
  heatTransferCoeff: number; // W/m²K
  thermalResistance: number; // K/W (system level)
  // Energy properties
  basePower: number; // Base cooling infrastructure power (W)
  powerPerWattTDP: number; // Additional power per watt of TDP
  chillerRequired: boolean;
  chillerCOP: number; // Coefficient of Performance
  // Constraints
  maxHeatFlux: number; // W/cm² - maximum heat flux this method can handle
  notes: string[];
}

const COOLING_METHODS: CoolingMethod[] = [
  {
    id: "natural-air",
    name: "Natural Air Convection",
    shortName: "Natural Air",
    category: "air",
    icon: "wind",
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
    description: "Passive cooling with no fans - heat dissipates naturally through air movement",
    heatTransferCoeff: 15,
    thermalResistance: 0.5,
    basePower: 0,
    powerPerWattTDP: 0,
    chillerRequired: false,
    chillerCOP: 1,
    maxHeatFlux: 5,
    notes: [
      "Zero energy consumption",
      "Silent operation",
      "Very limited cooling capacity",
      "Only suitable for low-power devices (<50W)",
    ],
  },
  {
    id: "forced-air",
    name: "Forced Air Cooling (Fans + Heatsink)",
    shortName: "Forced Air",
    category: "air",
    icon: "fan",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    description: "Active cooling using fans to blow air over heatsinks - the most common cooling method",
    heatTransferCoeff: 150,
    thermalResistance: 0.15,
    basePower: 5,
    powerPerWattTDP: 0.05, // ~5% of TDP for fan power
    chillerRequired: false,
    chillerCOP: 1,
    maxHeatFlux: 30,
    notes: [
      "Most widely used and mature technology",
      "Relatively low cost",
      "Generates noise from fans",
      "Limited by air's low thermal conductivity",
      "Struggles with high-density computing",
    ],
  },
  {
    id: "cold-plate-1p-20",
    name: "단상 수냉 Cold Plate (20°C)",
    shortName: "단상 20°C",
    category: "cold-plate",
    icon: "droplets",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    description: "단상(물) 수냉 - 칠러로 20°C 냉각수 공급. 현열 전달만 이용.",
    heatTransferCoeff: 5000,
    thermalResistance: 0.05,
    basePower: 50, // Pump power
    powerPerWattTDP: 0.25, // Chiller power ~25% of TDP at COP 4
    chillerRequired: true,
    chillerCOP: 4,
    maxHeatFlux: 100,
    notes: [
      "물의 높은 비열 활용 (4.18 kJ/kg·K)",
      "칠러 필요 - 에너지 소비 높음",
      "하이퍼스케일러 현재 주력 기술",
      "20°C 냉각수로 넓은 열적 여유",
      "시스템 단순 (펌프 + 열교환기)",
    ],
  },
  {
    id: "cold-plate-1p-45",
    name: "단상 수냉 Cold Plate (45°C)",
    shortName: "단상 45°C",
    category: "cold-plate",
    icon: "droplets",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    description: "단상(물) 수냉 - NVIDIA Blackwell 권장. Free Cooling 가능.",
    heatTransferCoeff: 4500,
    thermalResistance: 0.055,
    basePower: 45,
    powerPerWattTDP: 0.08, // Much lower - often free cooling possible
    chillerRequired: false, // Can use dry cooler
    chillerCOP: 10, // Effectively very high with free cooling
    maxHeatFlux: 80,
    notes: [
      "NVIDIA Blackwell 권장 온도 (45°C)",
      "Free Cooling 가능 - 에너지 90% 절감",
      "열적 여유 감소 - 설계 주의 필요",
      "대부분 기후에서 칠러 불필요",
      "현재 가장 효율적인 단상 수냉",
    ],
  },
  {
    id: "cold-plate-2p",
    name: "이상 수냉 Cold Plate (Pumped 2-Phase)",
    shortName: "이상 수냉",
    category: "cold-plate",
    icon: "droplets",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    description: "이상(냉매 비등) 수냉 - Cold Plate 내부에서 R134a 등 냉매가 비등하며 잠열 흡수.",
    heatTransferCoeff: 20000, // Much higher due to boiling
    thermalResistance: 0.025,
    basePower: 60, // Pump + condenser fan
    powerPerWattTDP: 0.05, // Lower due to latent heat efficiency
    chillerRequired: false, // Uses condenser, not chiller
    chillerCOP: 15,
    maxHeatFlux: 200, // CHF limit
    notes: [
      "비등 열전달 - 단상 대비 5~10배 효율",
      "CHF 한계: ~200 W/cm² (설계 마진 필요)",
      "냉매: R134a, R1234ze, CO₂ 등",
      "컨덴서 필요 (칠러 불필요)",
      "차세대 초고밀도 냉각 기술",
    ],
  },
  {
    id: "immersion-20",
    name: "Two-Phase Immersion (Condenser 20°C)",
    shortName: "Immersion 20°C",
    category: "immersion",
    icon: "droplets",
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/30",
    description: "2상 침수냉각 - 컨덴서 냉각수 온도 20°C (칠러 필요)",
    heatTransferCoeff: 15000,
    thermalResistance: 0.02,
    basePower: 20, // Minimal pump power
    powerPerWattTDP: 0.15, // Chiller needed for 20°C condenser water
    chillerRequired: true,
    chillerCOP: 4,
    maxHeatFlux: 200,
    notes: [
      "비등 열전달로 초고효율 냉각",
      "컨덴서에 20°C 냉각수 공급 필요",
      "칠러 운전으로 에너지 비용 증가",
      "높은 과냉도로 안정적 운전",
      "유전성 냉매 - 전기적 단락 위험 없음",
    ],
  },
  {
    id: "immersion-40",
    name: "Two-Phase Immersion (Condenser 40°C)",
    shortName: "Immersion 40°C",
    category: "immersion",
    icon: "droplets",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    description: "2상 침수냉각 - 컨덴서 냉각수 온도 40°C (Free Cooling 가능)",
    heatTransferCoeff: 15000, // Similar boiling HTC
    thermalResistance: 0.02,
    basePower: 15,
    powerPerWattTDP: 0.02, // Minimal - free cooling via dry cooler
    chillerRequired: false,
    chillerCOP: 20, // Effectively free cooling
    maxHeatFlux: 200,
    notes: [
      "최고 수준의 에너지 효율 (PUE 1.02~1.08)",
      "드라이쿨러로 Free Cooling 가능",
      "냉각 에너지 90% 이상 절감",
      "AI/HPC 고밀도 워크로드에 최적",
      "NVIDIA 권장 방식과 유사",
    ],
  },
  {
    id: "passive-thermosyphon",
    name: "Passive Thermosyphon (Heat Pipe Condenser)",
    shortName: "Passive",
    category: "passive",
    icon: "droplets",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    description: "패시브 써모사이폰 - 히트파이프/중력순환으로 펌프 없이 냉각 (한랭 기후 최적)",
    heatTransferCoeff: 12000, // Slightly lower than active immersion
    thermalResistance: 0.025,
    basePower: 5, // Only auxiliary fans if any
    powerPerWattTDP: 0.01, // Nearly zero - passive system
    chillerRequired: false,
    chillerCOP: 50, // Effectively infinite - no active cooling
    maxHeatFlux: 150, // Limited by passive heat rejection capacity
    notes: [
      "펌프/압축기 불필요 - 전력 소모 최소화",
      "중력 순환으로 냉매 자연 순환",
      "히트파이프: 모세관 작용 활용",
      "한랭 기후(T_amb < 30°C)에서 최적",
      "PUE 1.01~1.05 달성 가능",
      "유지보수 최소 - 움직이는 부품 없음",
    ],
  },
];

// Calculate results for a cooling method
function calculateResults(
  method: CoolingMethod,
  tdp: number,
  chipArea: number,
  ambientTemp: number,
  tjMax: number
) {
  const safeChipArea = chipArea > 0 ? chipArea : 1;
  const heatFlux = tdp / (safeChipArea * 0.01); // W/cm²

  // Determine coolant/air temperature based on method
  let coolantTemp = ambientTemp;
  if (method.id === "cold-plate-1p-20" || method.id === "immersion-20") {
    coolantTemp = 20;
  } else if (method.id === "cold-plate-1p-45" || method.id === "immersion-40") {
    coolantTemp = 45; // Updated to 45°C for NVIDIA Blackwell recommendation
  } else if (method.id === "cold-plate-2p") {
    // Two-phase cold plate: refrigerant saturation temp (e.g., R134a ~26°C at 6.7 bar)
    coolantTemp = 30;
  } else if (method.id === "passive-thermosyphon") {
    // Passive thermosyphon uses working fluid T_sat (~49°C for Novec 649)
    // Effective when ambient < T_sat - approach temp
    coolantTemp = 49; // Novec 649 saturation temperature
  }

  // Calculate junction temperature
  // For air cooling: T_j = T_ambient + TDP * R_th
  // For liquid: T_j = T_coolant + TDP * R_th
  const baseTemp = method.category === "air" ? ambientTemp :
    (method.category === "passive" ? Math.max(coolantTemp, ambientTemp + 5) : coolantTemp);
  const tJunction = baseTemp + tdp * method.thermalResistance;

  // Calculate cooling power
  let coolingPower = method.basePower + tdp * method.powerPerWattTDP;

  // For chiller-based systems, account for ambient temp
  if (method.chillerRequired && ambientTemp > coolantTemp) {
    // More chiller work needed when ambient is hot
    const tempLift = ambientTemp - coolantTemp + 10; // +10 for heat exchanger delta
    const adjustedCOP = Math.max(2, method.chillerCOP * (1 - tempLift / 50));
    coolingPower = method.basePower + (tdp / adjustedCOP);
  }

  // For free cooling systems, check if ambient allows it
  if (!method.chillerRequired && method.category !== "air" && method.category !== "passive") {
    if (ambientTemp > coolantTemp - 5) {
      // Need some active cooling
      coolingPower = method.basePower + tdp * 0.1;
    }
  }

  // For passive thermosyphon, efficiency depends entirely on ambient temp
  if (method.id === "passive-thermosyphon") {
    const tSat = 49; // Novec 649 saturation temp
    if (ambientTemp >= tSat - 5) {
      // Passive system cannot reject heat - very inefficient or fails
      coolingPower = method.basePower + tdp * 0.5; // Needs backup active cooling
    } else if (ambientTemp >= tSat - 15) {
      // Marginal operation - some auxiliary fans needed
      coolingPower = method.basePower + tdp * 0.02;
    } else {
      // Optimal passive operation - minimal to zero power
      coolingPower = method.basePower; // Just auxiliary fans (~5W)
    }
  }

  // Calculate PUE
  const pue = tdp > 0 ? (tdp + coolingPower) / tdp : 1;

  // Safety checks
  const thermalHeadroom = tjMax - tJunction;
  const isThermalSafe = thermalHeadroom > 0;
  const isHeatFluxSafe = heatFlux <= method.maxHeatFlux;
  const isSafe = isThermalSafe && isHeatFluxSafe;

  // Calculate scores (0-100) for radar chart
  const efficiencyScore = Math.max(0, Math.min(100, (2 - pue) * 100));
  const thermalScore = Math.max(0, Math.min(100, thermalHeadroom * 3));
  const capacityScore = Math.max(0, Math.min(100, (method.maxHeatFlux / 2.5)));
  const costScore = method.category === "air" ? 90 : method.category === "cold-plate" ? 50 : 30;
  const noiseScore = method.category === "air" ? (method.id === "natural-air" ? 100 : 40) : 95;

  return {
    method,
    heatFlux: Math.round(heatFlux * 10) / 10,
    coolantTemp,
    tJunction: Math.round(tJunction * 10) / 10,
    thermalHeadroom: Math.round(thermalHeadroom),
    coolingPower: Math.round(coolingPower),
    pue: Math.round(pue * 1000) / 1000,
    isThermalSafe,
    isHeatFluxSafe,
    isSafe,
    scores: {
      efficiency: efficiencyScore,
      thermal: thermalScore,
      capacity: capacityScore,
      cost: costScore,
      noise: noiseScore,
    },
  };
}

// ============================================================================
// COMPONENTS
// ============================================================================

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  color = "text-primary"
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  color?: string;
}) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className={cn("p-3 rounded-xl", color === "text-primary" ? "bg-primary/10" : "bg-current/10")}>
        <Icon className={cn("h-6 w-6", color)} />
      </div>
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

function InfoCard({
  title,
  children,
  className
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("p-5 rounded-xl bg-card border border-border/50 shadow-sm", className)}>
      {title && <h3 className="font-semibold mb-3">{title}</h3>}
      {children}
    </div>
  );
}

function MethodIcon({ type, className }: { type: "wind" | "fan" | "droplets"; className?: string }) {
  if (type === "wind") return <Wind className={className} />;
  if (type === "fan") return <Fan className={className} />;
  return <Droplets className={className} />;
}

// Tooltip style - defined outside component to prevent recreation
const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: 12,
};

// Category colors for consistent grouping
const CATEGORY_COLORS: Record<string, string> = {
  "air": "#f97316",       // Orange for air cooling
  "cold-plate": "#3b82f6", // Blue for cold plate
  "immersion": "#14b8a6",  // Teal for immersion
  "passive": "#a855f7",    // Purple for passive
};

// Memoized chart component to prevent infinite re-renders
interface ChartData {
  name: string;
  pue: number;
  coolingPower: number;
  safe: boolean;
  color: string;
}

const PUEChart = memo(function PUEChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 20, right: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          type="number"
          domain={[1, 2.5]}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
        />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="pue" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});

const CoolingPowerChart = memo(function CoolingPowerChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 20, right: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          type="number"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
        />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="coolingPower" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.7} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});

// Heat Transfer Coefficient Chart
interface HTCChartData {
  name: string;
  htc: number;
  color: string;
  category: string;
}

const HTCChart = memo(function HTCChart({ data }: { data: HTCChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 20, right: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          type="number"
          scale="log"
          domain={[10, 100000]}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) => [`${Number(value).toLocaleString()} W/m²K`, "열전달 계수"]}
        />
        <Bar dataKey="htc" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});

// Max Heat Flux Chart
interface HeatFluxChartData {
  name: string;
  maxHeatFlux: number;
  color: string;
  category: string;
}

const MaxHeatFluxChart = memo(function MaxHeatFluxChart({ data }: { data: HeatFluxChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 20, right: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          type="number"
          domain={[0, 250]}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) => [`${value} W/cm²`, "최대 Heat Flux"]}
        />
        <Bar dataKey="maxHeatFlux" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function ComparisonPage() {
  // Input state
  const [selectedChip, setSelectedChip] = useState(chipPresets[0].name);
  const [tdp, setTdp] = useState(chipPresets[0].tdp);
  const [chipArea, setChipArea] = useState(chipPresets[0].area);
  const [ambientTemp, setAmbientTemp] = useState(35);
  const [tjMax, setTjMax] = useState(85);

  const handlePresetChange = (name: string) => {
    setSelectedChip(name);
    const preset = chipPresets.find((c) => c.name === name);
    if (preset) {
      setTdp(preset.tdp);
      setChipArea(preset.area);
    }
  };

  // Calculate results for all methods
  const results = useMemo(() => {
    return COOLING_METHODS.map((method) =>
      calculateResults(method, tdp, chipArea, ambientTemp, tjMax)
    );
  }, [tdp, chipArea, ambientTemp, tjMax]);

  const heatFlux = useMemo(() => {
    if (chipArea <= 0) return 0;
    return tdp / (chipArea * 0.01);
  }, [tdp, chipArea]);

  // Find best options
  const safeResults = results.filter((r) => r.isSafe);
  const bestEfficiency = safeResults.length > 0
    ? safeResults.reduce((a, b) => (a.pue < b.pue ? a : b))
    : null;
  const bestThermal = safeResults.length > 0
    ? safeResults.reduce((a, b) => (a.thermalHeadroom > b.thermalHeadroom ? a : b))
    : null;

  // Baseline for energy savings (forced air)
  const forcedAirResult = results.find((r) => r.method.id === "forced-air");

  // Category order for consistent visual grouping
  const categoryOrder: Record<string, number> = {
    "air": 0,
    "cold-plate": 1,
    "immersion": 2,
    "passive": 3
  };

  // Sorted results by category for display
  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) =>
      (categoryOrder[a.method.category] ?? 99) - (categoryOrder[b.method.category] ?? 99)
    );
  }, [results]);

  // Chart data - memoized and sorted by category for visual grouping
  const pueChartData = useMemo(() => {
    return sortedResults.map((r) => ({
      name: r.method.shortName,
      pue: Math.min(r.pue, 2.5), // Cap for chart display
      coolingPower: r.coolingPower,
      safe: r.isSafe,
      category: r.method.category,
      // Use consistent category colors
      color: CATEGORY_COLORS[r.method.category] || "#6b7280",
    }));
  }, [sortedResults]);

  // HTC chart data
  const htcChartData = useMemo(() => {
    return sortedResults.map((r) => ({
      name: r.method.shortName,
      htc: r.method.heatTransferCoeff,
      category: r.method.category,
      color: CATEGORY_COLORS[r.method.category] || "#6b7280",
    }));
  }, [sortedResults]);

  // Max Heat Flux chart data
  const maxHeatFluxChartData = useMemo(() => {
    return sortedResults.map((r) => ({
      name: r.method.shortName,
      maxHeatFlux: r.method.maxHeatFlux,
      category: r.method.category,
      color: CATEGORY_COLORS[r.method.category] || "#6b7280",
    }));
  }, [sortedResults]);

  // Deferred chart data to prevent recharts Redux infinite loop during rapid updates
  const deferredChartData = useDeferredValue(pueChartData);
  const deferredHTCData = useDeferredValue(htcChartData);
  const deferredHeatFluxData = useDeferredValue(maxHeatFluxChartData);

  return (
    <AppShell showFooter={false}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* ================================================================== */}
        {/* HERO SECTION */}
        {/* ================================================================== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Scale className="h-4 w-4" />
            Cooling Method Comparison Tool
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            어떤 냉각 방식이 적합할까요?
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            공랭, 수냉(Cold Plate), 침수냉각(Immersion)을 비교하여<br />
            최적의 냉각 솔루션을 찾아보세요.
          </p>
        </motion.section>

        {/* ================================================================== */}
        {/* STEP 1: INPUT SECTION */}
        {/* ================================================================== */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
              1
            </div>
            <h2 className="text-xl font-bold">칩 사양 입력</h2>
          </div>

          <motion.div variants={fadeInUp}>
            <InfoCard className="bg-gradient-to-br from-card to-muted/30">
              {/* Chip Preset - Full Width */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
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

                {/* Tj Max */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    최대 허용 온도 (T<sub>j,max</sub>)
                  </Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[tjMax]}
                      onValueChange={([v]) => setTjMax(v)}
                      min={70}
                      max={105}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm font-bold tabular-nums w-16 text-right">{tjMax}°C</span>
                  </div>
                </div>
              </div>

              {/* Current Heat Flux Display */}
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
            </InfoCard>
          </motion.div>
        </motion.section>

        {/* ================================================================== */}
        {/* STEP 2: COOLING METHODS OVERVIEW */}
        {/* ================================================================== */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
              2
            </div>
            <h2 className="text-xl font-bold">냉각 방식 이해하기</h2>
          </div>

          {/* Category Headers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Air Cooling */}
            <motion.div variants={fadeInUp}>
              <InfoCard className="h-full border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-transparent">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Wind className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-orange-500">공랭 (Air Cooling)</h3>
                    <p className="text-xs text-muted-foreground">전통적인 냉각 방식</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  공기를 매체로 열을 방출합니다. 구현이 간단하고 비용이 낮지만,
                  공기의 낮은 열전달 계수로 인해 고발열 환경에서는 한계가 있습니다.
                </p>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">열전달 계수 (h)</span>
                    <span className="font-medium">10~150 W/m²K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">최대 Heat Flux</span>
                    <span className="font-medium">~30 W/cm²</span>
                  </div>
                </div>
              </InfoCard>
            </motion.div>

            {/* Cold Plate */}
            <motion.div variants={fadeInUp}>
              <InfoCard className="h-full border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-transparent">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Droplets className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-500">수냉 (Cold Plate)</h3>
                    <p className="text-xs text-muted-foreground">액체 냉각판 방식</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  냉각수가 흐르는 금속판을 칩에 부착합니다. 공랭보다 훨씬 효율적이며,
                  냉각수 온도에 따라 에너지 효율이 크게 달라집니다.
                </p>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">열전달 계수 (h)</span>
                    <span className="font-medium">4,000~5,000 W/m²K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">최대 Heat Flux</span>
                    <span className="font-medium">~100 W/cm²</span>
                  </div>
                </div>
              </InfoCard>
            </motion.div>

            {/* Immersion */}
            <motion.div variants={fadeInUp}>
              <InfoCard className="h-full border-teal-500/30 bg-gradient-to-br from-teal-500/5 to-transparent">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-teal-500/10">
                    <Droplets className="h-5 w-5 text-teal-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-teal-500">침수냉각 (Immersion)</h3>
                    <p className="text-xs text-muted-foreground">2상 비등 열전달</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  전자 부품을 유전성 냉매에 완전히 담급니다. 비등을 통한 초고효율 열전달로
                  AI/HPC 등 고밀도 컴퓨팅에 최적입니다.
                </p>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">열전달 계수 (h)</span>
                    <span className="font-medium">15,000~20,000 W/m²K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">최대 Heat Flux</span>
                    <span className="font-medium">~250 W/cm²</span>
                  </div>
                </div>
              </InfoCard>
            </motion.div>
          </div>
        </motion.section>

        {/* ================================================================== */}
        {/* STEP 3: DETAILED COMPARISON */}
        {/* ================================================================== */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
              3
            </div>
            <h2 className="text-xl font-bold">상세 비교 결과</h2>
            <span className="text-sm text-muted-foreground ml-2">
              TDP {tdp}W 기준
            </span>
          </div>

          {/* Comparison Cards - sorted by category */}
          <div className="space-y-4">
            {sortedResults.map((result, idx) => (
              <motion.div
                key={result.method.id}
                variants={fadeInUp}
                className={cn(
                  "p-5 rounded-xl border-2 transition-all",
                  result.isSafe
                    ? result.method.borderColor
                    : "border-red-500/50 bg-red-500/5"
                )}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Method Info */}
                  <div className="flex items-start gap-4 lg:w-80">
                    <div className={cn("p-3 rounded-xl", result.method.bgColor)}>
                      <MethodIcon type={result.method.icon} className={cn("h-6 w-6", result.method.color)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{result.method.name}</h3>
                        {!result.isSafe && (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-xs font-medium">
                            부적합
                          </span>
                        )}
                        {result.isSafe && bestEfficiency?.method.id === result.method.id && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">
                            최고 효율
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.method.description}
                      </p>
                    </div>
                  </div>

                  {/* Results Grid */}
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* Junction Temp */}
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <div className="text-xs text-muted-foreground mb-1">칩 온도</div>
                      <div className={cn(
                        "text-xl font-bold",
                        !result.isThermalSafe ? "text-red-500" :
                        result.tJunction > tjMax - 10 ? "text-amber-500" : "text-emerald-500"
                      )}>
                        {result.tJunction > 200 ? ">200" : result.tJunction}°C
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {result.thermalHeadroom < -100 ? (
                          <span className="text-red-500">한계 초과</span>
                        ) : (
                          <>여유: {result.thermalHeadroom > 0 ? "+" : ""}{result.thermalHeadroom}°C</>
                        )}
                      </div>
                    </div>

                    {/* Cooling Power */}
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <div className="text-xs text-muted-foreground mb-1">냉각 전력</div>
                      <div className="text-xl font-bold">
                        {result.coolingPower}W
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {forcedAirResult && forcedAirResult.coolingPower > 0 && result.coolingPower < forcedAirResult.coolingPower ? (
                          <span className="text-emerald-500">
                            -{Math.round((1 - result.coolingPower / forcedAirResult.coolingPower) * 100)}%
                          </span>
                        ) : result.method.id === "forced-air" ? (
                          <span className="text-muted-foreground">기준</span>
                        ) : null}
                      </div>
                    </div>

                    {/* PUE */}
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <div className="text-xs text-muted-foreground mb-1">PUE</div>
                      <div className={cn(
                        "text-xl font-bold",
                        result.pue < 1.1 ? "text-emerald-500" :
                        result.pue < 1.3 ? "text-amber-500" : "text-red-500"
                      )}>
                        {result.pue.toFixed(3)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {result.pue < 1.1 ? "우수" : result.pue < 1.3 ? "양호" : "개선 필요"}
                      </div>
                    </div>

                    {/* Heat Flux Capacity */}
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <div className="text-xs text-muted-foreground mb-1">Heat Flux 용량</div>
                      <div className={cn(
                        "text-xl font-bold",
                        result.isHeatFluxSafe ? "text-foreground" : "text-red-500"
                      )}>
                        {result.method.maxHeatFlux}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        W/cm² (현재: {result.heatFlux})
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {result.isSafe && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex flex-wrap gap-2">
                      {result.method.notes.slice(0, 3).map((note, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 text-xs text-muted-foreground"
                        >
                          <Info className="h-3 w-3" />
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warning for unsafe */}
                {!result.isSafe && (
                  <div className="mt-4 pt-4 border-t border-red-500/30">
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <XCircle className="h-4 w-4" />
                      {!result.isThermalSafe && (
                        <span>칩 온도({result.tJunction}°C)가 최대 허용 온도({tjMax}°C)를 초과합니다.</span>
                      )}
                      {!result.isHeatFluxSafe && result.isThermalSafe && (
                        <span>Heat Flux({result.heatFlux} W/cm²)가 이 방식의 한계({result.method.maxHeatFlux} W/cm²)를 초과합니다.</span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ================================================================== */}
        {/* STEP 4: VISUALIZATIONS */}
        {/* ================================================================== */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
              4
            </div>
            <h2 className="text-xl font-bold">시각적 비교</h2>
          </div>

          {/* Category Legend */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 rounded-lg bg-muted/30">
            <span className="text-sm font-medium">카테고리:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: CATEGORY_COLORS["air"] }} />
              <span className="text-sm">공랭 (Air)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: CATEGORY_COLORS["cold-plate"] }} />
              <span className="text-sm">수냉 (Cold Plate)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: CATEGORY_COLORS["immersion"] }} />
              <span className="text-sm">침수냉각 (Immersion)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: CATEGORY_COLORS["passive"] }} />
              <span className="text-sm">패시브 (Passive)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PUE Bar Chart */}
            <motion.div variants={fadeInUp}>
              <InfoCard title="PUE 비교 (낮을수록 효율적)">
                <PUEChart data={deferredChartData} />
                <div className="mt-4 text-xs text-muted-foreground">
                  <strong>PUE (Power Usage Effectiveness)</strong> = (IT전력 + 냉각전력) / IT전력
                  <br />
                  PUE 1.0 = 모든 전력이 IT 장비에 사용됨 (이상적)
                </div>
              </InfoCard>
            </motion.div>

            {/* Cooling Power Chart */}
            <motion.div variants={fadeInUp}>
              <InfoCard title="냉각 전력 소비량 (W)">
                <CoolingPowerChart data={deferredChartData} />
                <div className="mt-4 text-xs text-muted-foreground">
                  TDP {tdp}W를 냉각하는 데 필요한 추가 전력량입니다.
                </div>
              </InfoCard>
            </motion.div>

            {/* Heat Transfer Coefficient Chart */}
            <motion.div variants={fadeInUp}>
              <InfoCard title="열전달 계수 (h) 비교 - 로그 스케일">
                <HTCChart data={deferredHTCData} />
                <div className="mt-4 text-xs text-muted-foreground">
                  <strong>열전달 계수(h)</strong>가 높을수록 같은 온도차에서 더 많은 열을 전달.
                  <br />
                  비등 열전달(침수/이상수냉)은 강제대류 대비 10~100배 높음.
                </div>
              </InfoCard>
            </motion.div>

            {/* Max Heat Flux Chart */}
            <motion.div variants={fadeInUp}>
              <InfoCard title="최대 Heat Flux 용량 (W/cm²)">
                <MaxHeatFluxChart data={deferredHeatFluxData} />
                <div className="mt-4 text-xs text-muted-foreground">
                  각 냉각 방식이 처리할 수 있는 <strong>최대 열유속</strong>.
                  <br />
                  현재 칩: <strong className={heatFlux > 100 ? "text-red-500" : heatFlux > 30 ? "text-amber-500" : "text-emerald-500"}>{heatFlux.toFixed(1)} W/cm²</strong>
                </div>
              </InfoCard>
            </motion.div>
          </div>
        </motion.section>

        {/* ================================================================== */}
        {/* STEP 5: RECOMMENDATION */}
        {/* ================================================================== */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
              5
            </div>
            <h2 className="text-xl font-bold">추천 결과</h2>
          </div>

          {safeResults.length === 0 ? (
            <motion.div variants={fadeInUp}>
              <InfoCard className="border-red-500/50 bg-red-500/5">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-red-500/10">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-500 text-lg mb-2">적합한 냉각 방식이 없습니다</h3>
                    <p className="text-muted-foreground">
                      현재 설정(TDP {tdp}W, 주변온도 {ambientTemp}°C)에서 T<sub>j,max</sub> {tjMax}°C를
                      만족하는 냉각 방식이 없습니다.
                    </p>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">해결 방법:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• T<sub>j,max</sub> 한계를 높이거나 (칩 사양 확인 필요)</li>
                        <li>• TDP를 낮추거나 (전력 제한 적용)</li>
                        <li>• 주변 온도를 낮추세요 (공조 시스템 개선)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </InfoCard>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Best Efficiency */}
              {bestEfficiency && (
                <motion.div variants={fadeInUp}>
                  <InfoCard className="h-full border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 to-transparent">
                    <div className="flex items-center gap-2 mb-4">
                      <Leaf className="h-5 w-5 text-emerald-500" />
                      <h3 className="font-bold text-emerald-500">에너지 효율 최우선</h3>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={cn("p-3 rounded-xl", bestEfficiency.method.bgColor)}>
                        <MethodIcon
                          type={bestEfficiency.method.icon}
                          className={cn("h-8 w-8", bestEfficiency.method.color)}
                        />
                      </div>
                      <div>
                        <div className="text-xl font-bold">{bestEfficiency.method.name}</div>
                        <div className="text-sm text-muted-foreground">PUE {bestEfficiency.pue}</div>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between p-2 rounded bg-muted/30">
                        <span className="text-muted-foreground">칩 온도</span>
                        <span className="font-medium">{bestEfficiency.tJunction}°C (여유 +{bestEfficiency.thermalHeadroom}°C)</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-muted/30">
                        <span className="text-muted-foreground">냉각 전력</span>
                        <span className="font-medium">{bestEfficiency.coolingPower}W</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-emerald-500/10">
                        <span className="text-emerald-600 dark:text-emerald-400">공랭 대비 절감</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {forcedAirResult && forcedAirResult.coolingPower > 0
                            ? Math.max(0, Math.round((1 - bestEfficiency.coolingPower / forcedAirResult.coolingPower) * 100))
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </InfoCard>
                </motion.div>
              )}

              {/* Best Thermal */}
              {bestThermal && bestThermal.method.id !== bestEfficiency?.method.id && (
                <motion.div variants={fadeInUp}>
                  <InfoCard className="h-full border-blue-500/50 bg-gradient-to-br from-blue-500/10 to-transparent">
                    <div className="flex items-center gap-2 mb-4">
                      <Thermometer className="h-5 w-5 text-blue-500" />
                      <h3 className="font-bold text-blue-500">열적 안정성 최우선</h3>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={cn("p-3 rounded-xl", bestThermal.method.bgColor)}>
                        <MethodIcon
                          type={bestThermal.method.icon}
                          className={cn("h-8 w-8", bestThermal.method.color)}
                        />
                      </div>
                      <div>
                        <div className="text-xl font-bold">{bestThermal.method.name}</div>
                        <div className="text-sm text-muted-foreground">여유 +{bestThermal.thermalHeadroom}°C</div>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between p-2 rounded bg-muted/30">
                        <span className="text-muted-foreground">칩 온도</span>
                        <span className="font-medium text-blue-500">{bestThermal.tJunction}°C</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-muted/30">
                        <span className="text-muted-foreground">PUE</span>
                        <span className="font-medium">{bestThermal.pue}</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-muted/30">
                        <span className="text-muted-foreground">냉각 전력</span>
                        <span className="font-medium">{bestThermal.coolingPower}W</span>
                      </div>
                    </div>
                  </InfoCard>
                </motion.div>
              )}

              {/* If same recommendation, show summary */}
              {bestThermal && bestThermal.method.id === bestEfficiency?.method.id && (
                <motion.div variants={fadeInUp}>
                  <InfoCard className="h-full border-primary/50 bg-gradient-to-br from-primary/10 to-transparent">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <h3 className="font-bold text-primary">종합 최적 솔루션</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      <strong>{bestEfficiency.method.name}</strong>이(가) 에너지 효율과 열적 안정성
                      모두에서 가장 우수한 선택입니다.
                    </p>
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{bestEfficiency.pue}</div>
                          <div className="text-xs text-muted-foreground">PUE</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-500">+{bestEfficiency.thermalHeadroom}°C</div>
                          <div className="text-xs text-muted-foreground">열적 여유</div>
                        </div>
                      </div>
                    </div>
                  </InfoCard>
                </motion.div>
              )}
            </div>
          )}
        </motion.section>

        {/* ================================================================== */}
        {/* EDUCATIONAL SECTION */}
        {/* ================================================================== */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Lightbulb className="h-5 w-5 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold">알아두면 좋은 정보</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={fadeInUp}>
              <InfoCard title="PUE란?">
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Power Usage Effectiveness</strong>는 데이터센터 에너지 효율을 나타내는 지표입니다.
                </p>
                <div className="p-3 rounded-lg bg-muted/50 font-mono text-sm text-center mb-4">
                  PUE = (총 시설 전력) / (IT 장비 전력)
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>PUE 1.0~1.2: 매우 효율적 (침수냉각)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>PUE 1.2~1.5: 효율적 (최신 수냉)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>PUE 1.5~2.0: 일반적 (전통 공랭)</span>
                  </div>
                </div>
              </InfoCard>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <InfoCard title="20°C vs 40°C 냉각수">
                <p className="text-sm text-muted-foreground mb-4">
                  냉각수 온도는 에너지 효율에 큰 영향을 미칩니다.
                </p>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="font-medium text-blue-500 mb-1">20°C 냉각수</div>
                    <p className="text-xs text-muted-foreground">
                      주변 온도보다 낮으므로 <strong>칠러가 필수</strong>입니다.
                      칠러는 COP 3~4로 운영되어 상당한 전력을 소비합니다.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="font-medium text-emerald-500 mb-1">40°C 냉각수</div>
                    <p className="text-xs text-muted-foreground">
                      주변 온도보다 높으면 <strong>Free Cooling</strong>이 가능합니다.
                      드라이 쿨러만으로 열을 외부로 방출할 수 있어 에너지 절감이 큽니다.
                    </p>
                  </div>
                </div>
              </InfoCard>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <InfoCard title="침수냉각의 장점">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>초고효율 열전달:</strong> 비등 열전달로 공랭 대비 100배 이상의 열전달 계수</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>에너지 절감:</strong> 냉각 에너지 최대 95% 절감 (PUE 1.02~1.05)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>무소음:</strong> 팬이 없어 소음 제로</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>고밀도 컴퓨팅:</strong> AI/HPC용 고발열 GPU에 최적</span>
                  </li>
                </ul>
              </InfoCard>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <InfoCard title="Heat Flux 이해하기">
                <p className="text-sm text-muted-foreground mb-4">
                  Heat Flux(열유속)는 단위 면적당 열 전달량입니다.
                </p>
                <div className="p-3 rounded-lg bg-muted/50 font-mono text-sm text-center mb-4">
                  q&quot; = TDP / 칩 면적 [W/cm²]
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded bg-slate-500/10">
                    <span>일반 CPU/GPU</span>
                    <span className="font-medium">10~50 W/cm²</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-amber-500/10">
                    <span>고성능 GPU (A100, H100)</span>
                    <span className="font-medium">50~100 W/cm²</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-red-500/10">
                    <span>차세대 AI 칩</span>
                    <span className="font-medium">100~200+ W/cm²</span>
                  </div>
                </div>
              </InfoCard>
            </motion.div>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground pt-8 border-t border-border/50"
        >
          <p>MFTEL Lab // Inha University // Prof. Il Woong Park</p>
          <p className="mt-1">Multiphase Flow and Thermal Engineering Laboratory</p>
        </motion.footer>
      </div>
    </AppShell>
  );
}
