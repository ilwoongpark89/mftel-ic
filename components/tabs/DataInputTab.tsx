"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Beaker, FileText, ChevronDown, ChevronUp, Upload, Image, Trash2,
  RotateCcw, Check, Sparkles, FlaskConical, Thermometer, Gauge,
} from "lucide-react";
import {
  BoilingDataPoint, BoilingDataset, DataSource, ExperimentMeta, LiteratureMeta,
  saveDataset, parseCSV,
} from "@/lib/boiling-data";

interface Props {
  onSaved: () => void;
}

const T_UNITS = [
  { key: "C", label: "°C", toC: (v: number) => v },
  { key: "K", label: "K", toC: (v: number) => v - 273.15 },
  { key: "F", label: "°F", toC: (v: number) => (v - 32) * 5 / 9 },
] as const;

const Q_UNITS = [
  { key: "kW/m2", label: "kW/m²", toKWm2: (v: number) => v },
  { key: "W/m2", label: "W/m²", toKWm2: (v: number) => v / 1000 },
  { key: "W/cm2", label: "W/cm²", toKWm2: (v: number) => v * 10 },
] as const;

type TUnit = typeof T_UNITS[number]["key"];
type QUnit = typeof Q_UNITS[number]["key"];

interface FieldDef {
  key: string;
  label: string;
  placeholder: string;
  type?: string;
  hint?: string;
  computed?: boolean;
}

interface SectionDef {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  fields: FieldDef[];
}

// Working fluid options
const FLUID_OPTIONS = [
  { key: "novec7100", label: "Novec 7100", tSat: 61 },
  { key: "novec649", label: "Novec 649", tSat: 49 },
  { key: "fc72", label: "FC-72", tSat: 56 },
  { key: "fc77", label: "FC-77", tSat: 97 },
  { key: "water", label: "Water", tSat: 100 },
  { key: "hfe7100", label: "HFE-7100", tSat: 61 },
  { key: "r134a", label: "R-134a", tSat: -26 },
  { key: "other", label: "Other", tSat: null },
];

// Collapsible sections config
const EXPERIMENT_SECTIONS: SectionDef[] = [
  {
    id: "conditions",
    title: "Experimental Conditions",
    icon: FlaskConical,
    color: "blue",
    fields: [
      { key: "pressure", label: "Pressure", placeholder: "1 atm", type: "text" },
      { key: "subcooling", label: "Subcooling (K)", placeholder: "0", type: "number" },
      { key: "orientation", label: "Angle (°)", placeholder: "0", type: "number" },
      { key: "trialNumber", label: "Trial #", placeholder: "1", type: "number" },
    ],
  },
  {
    id: "heater",
    title: "Heater Info",
    icon: Thermometer,
    color: "orange",
    fields: [
      { key: "heaterMaterial", label: "Material", placeholder: "Si", type: "text" },
      { key: "heaterSize", label: "Size (mm)", placeholder: "15 × 20", type: "text" },
    ],
  },
  {
    id: "surface",
    title: "Surface Properties",
    icon: Gauge,
    color: "purple",
    fields: [
      { key: "baseSurface", label: "Base Surface", placeholder: "Polished Si", type: "text" },
      { key: "ra", label: "Ra (μm)", placeholder: "0.5", type: "text" },
      { key: "contactAngle", label: "Contact Angle (°)", placeholder: "85", type: "text" },
    ],
  },
  {
    id: "modification",
    title: "Surface Modification",
    icon: Sparkles,
    color: "teal",
    fields: [
      { key: "surfaceModification", label: "Method", placeholder: "LIG (Graphene)", type: "text" },
      { key: "structureWidth", label: "Structure Width (μm)", placeholder: "100", type: "number" },
      { key: "structureSpacing", label: "Structure Spacing (μm)", placeholder: "200", type: "number" },
      { key: "surfaceFraction", label: "Surface Fraction (%)", placeholder: "Auto", type: "text", computed: true },
      { key: "structureHeight", label: "Structure Height (μm)", placeholder: "30", type: "text" },
      { key: "wettability", label: "Wettability", placeholder: "Hydrophilic", type: "text" },
    ],
  },
];

const LITERATURE_FIELDS = [
  { key: "title", label: "Paper Title", placeholder: "Pool boiling heat transfer..." },
  { key: "authors", label: "Authors", placeholder: "Kim J., Park I.W." },
  { key: "year", label: "Year", placeholder: "2024" },
  { key: "journal", label: "Journal", placeholder: "Int. J. Heat Mass Transfer" },
  { key: "doi", label: "DOI", placeholder: "10.1016/..." },
];

const INITIAL_ROWS = 15;

function emptyRows(n: number): BoilingDataPoint[] {
  return Array.from({ length: n }, () => ({ tSurf: 0, qFlux: 0 }));
}

// Default values
const DEFAULT_EXP_META: ExperimentMeta = {
  date: new Date().toISOString().split("T")[0],
  fluid: "novec7100",
  subcooling: "0",
  pressure: "1 atm",
  orientation: "0",
  trialNumber: "1",
  heaterMaterial: "Si",
  heaterSize: "15 × 20",
  baseSurface: "Polished Si",
  ra: "0.5",
  contactAngle: "85",
  surfaceModification: "LIG (Graphene)",
  surfaceFraction: "50",
  wettability: "Hydrophilic",
  structureWidth: "100",
  structureSpacing: "200",
  structureHeight: "30",
};

const SAMPLE_DATA: BoilingDataPoint[] = [
  { tSurf: 62, qFlux: 5 },
  { tSurf: 65, qFlux: 15 },
  { tSurf: 68, qFlux: 35 },
  { tSurf: 71, qFlux: 60 },
  { tSurf: 74, qFlux: 95 },
  { tSurf: 77, qFlux: 140 },
  { tSurf: 80, qFlux: 190 },
  { tSurf: 83, qFlux: 250 },
  { tSurf: 85, qFlux: 300 },
  { tSurf: 87, qFlux: 350 },
];

export default function DataInputTab({ onSaved }: Props) {
  const [source, setSource] = useState<DataSource>("experiment");
  const [name, setName] = useState("");
  const [rows, setRows] = useState<BoilingDataPoint[]>(emptyRows(INITIAL_ROWS));
  const [expMeta, setExpMeta] = useState<ExperimentMeta>(DEFAULT_EXP_META);
  const [literature, setLiterature] = useState<LiteratureMeta>({});
  const [checked, setChecked] = useState(false);
  const [chartData, setChartData] = useState<BoilingDataPoint[] | null>(null);
  const [tUnit, setTUnit] = useState<TUnit>("C");
  const [qUnit, setQUnit] = useState<QUnit>("kW/m2");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>(["conditions", "modification"]);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  // Auto-calculate surface fraction from width and spacing
  const calculatedFraction = useMemo(() => {
    const width = parseFloat(expMeta.structureWidth || "0");
    const spacing = parseFloat(expMeta.structureSpacing || "0");
    if (width > 0 && spacing > 0) {
      // 1D pattern: fraction = width / (width + spacing)
      const fraction = (width / (width + spacing)) * 100;
      return fraction.toFixed(1);
    }
    return null;
  }, [expMeta.structureWidth, expMeta.structureSpacing]);

  // Auto-generate dataset name suggestion
  const suggestedName = useMemo(() => {
    if (source === "literature") {
      const author = literature.authors?.split(",")[0]?.split(" ")[0] || "";
      const year = literature.year || "";
      const fluid = literature.fluid || "";
      return author && year ? `${author}${year}-${fluid}`.replace(/\s+/g, "") : "";
    }

    const fluid = FLUID_OPTIONS.find(f => f.key === expMeta.fluid)?.label || "";
    const mod = expMeta.surfaceModification?.split(" ")[0] || "Plain";
    const frac = calculatedFraction || expMeta.surfaceFraction;
    const fracStr = frac ? `${frac}%` : "";
    const trial = expMeta.trialNumber && expMeta.trialNumber !== "1" ? `-T${expMeta.trialNumber}` : "";

    return `${mod}${fracStr}-${fluid}${trial}`.replace(/\s+/g, "");
  }, [source, expMeta, literature, calculatedFraction]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const resetForm = (clearAll = false) => {
    setRows(emptyRows(INITIAL_ROWS));
    setName("");
    setChecked(false);
    setChartData(null);
    setImagePreview(null);
    if (clearAll) {
      setExpMeta({});
      setLiterature({});
    } else {
      // Keep default metadata, but clear data
      setExpMeta(DEFAULT_EXP_META);
      setLiterature({});
    }
  };

  const invalidate = () => { setChecked(false); setChartData(null); };

  const updateRow = useCallback((i: number, field: keyof BoilingDataPoint, val: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: val === "" ? 0 : Number(val) };
      const filledCount = next.filter((r) => r.tSurf !== 0 || r.qFlux !== 0).length;
      if (filledCount >= next.length - 1) {
        return [...next, ...emptyRows(5)];
      }
      return next;
    });
    invalidate();
  }, []);

  const handleCellKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, field: "tSurf" | "qFlux") => {
    const colIndex = field === "tSurf" ? 0 : 1;
    let targetRow = rowIndex;
    let targetCol = colIndex;

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        targetRow = Math.max(0, rowIndex - 1);
        break;
      case "ArrowDown":
      case "Enter":
        e.preventDefault();
        targetRow = rowIndex + 1;
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (colIndex === 0) {
          targetRow = Math.max(0, rowIndex - 1);
          targetCol = 1;
        } else {
          targetCol = 0;
        }
        break;
      case "ArrowRight":
        e.preventDefault();
        if (colIndex === 1) {
          targetRow = rowIndex + 1;
          targetCol = 0;
        } else {
          targetCol = 1;
        }
        break;
      case "Tab":
        return;
      default:
        return;
    }

    const targetField = targetCol === 0 ? "tSurf" : "qFlux";
    const targetInput = document.querySelector(
      `input[data-row="${targetRow}"][data-field="${targetField}"]`
    ) as HTMLInputElement | null;
    if (targetInput) {
      targetInput.focus();
      targetInput.select();
    }
  }, []);

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const points = parseCSV(reader.result as string);
      if (points.length > 0) { setRows([...points, ...emptyRows(5)]); invalidate(); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text");
    const points = parseCSV(text);
    if (points.length >= 2) {
      e.preventDefault();
      setRows([...points, ...emptyRows(5)]);
      invalidate();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCheck = () => {
    const tConv = T_UNITS.find((u) => u.key === tUnit)!.toC;
    const qConv = Q_UNITS.find((u) => u.key === qUnit)!.toKWm2;
    const valid = rows
      .filter((r) => r.tSurf !== 0 || r.qFlux !== 0)
      .map((r) => ({ tSurf: Math.round(tConv(r.tSurf) * 100) / 100, qFlux: Math.round(qConv(r.qFlux) * 1000) / 1000 }));
    if (valid.length < 2) return;
    setChartData([...valid].sort((a, b) => a.tSurf - b.tSurf));
    setChecked(true);
    // Auto-fill name if empty
    if (!name && suggestedName) {
      setName(suggestedName);
    }
  };

  const handleSave = () => {
    if (!checked || !chartData || !name.trim()) return;
    const ds: BoilingDataset = {
      id: crypto.randomUUID(),
      name: name.trim(),
      source,
      data: chartData,
      createdAt: new Date().toISOString(),
      ...(source === "experiment" ? { experiment: expMeta } : { literature }),
    };
    saveDataset(ds);
    setName("");
    setExpMeta({});
    setLiterature({});
    resetForm();
    onSaved();
  };

  const updateExp = (key: keyof ExperimentMeta, val: string) => {
    setExpMeta((prev) => ({ ...prev, [key]: val || undefined }));
  };

  const updateLit = (key: keyof LiteratureMeta, val: string) => {
    setLiterature((prev) => ({ ...prev, [key]: val || undefined }));
  };

  const filledRows = rows.filter((r) => r.tSurf !== 0 || r.qFlux !== 0).length;

  return (
    <div className="space-y-6">
      {/* Header with source toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Add New Dataset</h2>
          <p className="text-sm text-gray-500 mt-1">Enter your boiling curve data</p>
        </div>

        {/* Source toggle - pill style */}
        <div className="flex p-1 bg-gray-100 rounded-full">
          {([
            { key: "experiment" as const, label: "Experiment", icon: Beaker },
            { key: "literature" as const, label: "Literature", icon: FileText },
          ]).map((s) => (
            <button
              key={s.key}
              onClick={() => { setSource(s.key); resetForm(); }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                source === s.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout - 2 columns on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column - Metadata (2/5) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Working Fluid selector (for experiment) */}
          {source === "experiment" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100"
            >
              <label className="flex items-center gap-2 text-sm font-semibold text-blue-700 mb-3">
                <Beaker className="h-4 w-4" />
                Working Fluid
              </label>
              <select
                value={expMeta.fluid || "novec7100"}
                onChange={(e) => updateExp("fluid", e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-blue-200 text-gray-900 rounded-xl text-base font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
              >
                {FLUID_OPTIONS.map((f) => (
                  <option key={f.key} value={f.key}>
                    {f.label} {f.tSat !== null ? `(T_sat: ${f.tSat}°C)` : ""}
                  </option>
                ))}
              </select>
            </motion.div>
          )}

          {/* Literature paper info */}
          {source === "literature" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm"
            >
              <h3 className="flex items-center gap-2 text-sm font-semibold text-pink-600 mb-4">
                <FileText className="h-4 w-4" />
                Paper Information
              </h3>
              <div className="space-y-3">
                {LITERATURE_FIELDS.map((f) => (
                  <div key={f.key}>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">{f.label}</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg text-sm focus:outline-none focus:border-pink-400 focus:bg-white transition-all"
                      placeholder={f.placeholder}
                      value={literature[f.key as keyof LiteratureMeta] || ""}
                      onChange={(e) => updateLit(f.key as keyof LiteratureMeta, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Collapsible sections */}
          {EXPERIMENT_SECTIONS.map((section, idx) => {
            const isExpanded = expandedSections.includes(section.id);
            const Icon = section.icon;
            const colorMap = {
              blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600", ring: "ring-blue-500/20" },
              orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-600", ring: "ring-orange-500/20" },
              purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-600", ring: "ring-purple-500/20" },
              teal: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-600", ring: "ring-teal-500/20" },
            };
            const colors = colorMap[section.color as keyof typeof colorMap];

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colors.bg}`}>
                      <Icon className={`h-4 w-4 ${colors.text}`} />
                    </div>
                    <span className="font-semibold text-gray-900">{section.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                        {section.fields.map((f) => {
                          // Check if this is the computed surfaceFraction field
                          const isComputedFraction = f.key === "surfaceFraction" && f.computed;
                          const computedValue = isComputedFraction && calculatedFraction ? calculatedFraction : null;

                          return (
                            <div key={f.key}>
                              <label className="text-xs font-medium text-gray-500 mb-1 block truncate" title={f.hint || ""}>
                                {f.label}
                              </label>
                              {isComputedFraction ? (
                                <div className="relative">
                                  <input
                                    type="text"
                                    className={`w-full px-3 py-2 border border-gray-200 text-gray-900 rounded-lg text-sm focus:outline-none transition-all ${
                                      computedValue ? "bg-teal-50 border-teal-300" : "bg-gray-50 focus:border-blue-400 focus:bg-white"
                                    }`}
                                    placeholder={f.placeholder}
                                    value={computedValue || (source === "experiment" ? (expMeta.surfaceFraction || "") : "")}
                                    onChange={(e) => updateExp("surfaceFraction", e.target.value)}
                                    readOnly={!!computedValue}
                                  />
                                  {computedValue && (
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-teal-600 font-medium">
                                      Auto
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <input
                                  type={f.type || "text"}
                                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                                  placeholder={f.placeholder}
                                  value={source === "experiment"
                                    ? (expMeta[f.key as keyof ExperimentMeta] || "")
                                    : (literature[f.key as keyof LiteratureMeta] || "")}
                                  onChange={(e) => source === "experiment"
                                    ? updateExp(f.key as keyof ExperimentMeta, e.target.value)
                                    : updateLit(f.key as keyof LiteratureMeta, e.target.value)}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* Reference image */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Image className="h-4 w-4" />
                Reference Image
              </span>
              {!imagePreview ? (
                <button
                  onClick={() => imgRef.current?.click()}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg transition-colors"
                >
                  Upload
                </button>
              ) : (
                <button
                  onClick={() => setImagePreview(null)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-lg transition-colors"
                >
                  Remove
                </button>
              )}
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            {imagePreview ? (
              <img src={imagePreview} alt="Reference" className="rounded-lg w-full object-cover max-h-40" />
            ) : (
              <div className="h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                Optional: Upload chart image
              </div>
            )}
          </motion.div>
        </div>

        {/* Right column - Data entry (3/5) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Data entry card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
          >
            {/* Header with units and import */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500">T_surf:</span>
                    <select
                      className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500"
                      value={tUnit}
                      onChange={(e) => { setTUnit(e.target.value as TUnit); invalidate(); }}
                    >
                      {T_UNITS.map((u) => <option key={u.key} value={u.key}>{u.label}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500">q&apos;&apos;:</span>
                    <select
                      className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500"
                      value={qUnit}
                      onChange={(e) => { setQUnit(e.target.value as QUnit); invalidate(); }}
                    >
                      {Q_UNITS.map((u) => <option key={u.key} value={u.key}>{u.label}</option>)}
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 hover:border-blue-400 text-gray-600 text-sm font-medium rounded-lg transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Import CSV
                </button>
                <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={handleCSV} />
              </div>
            </div>

            {/* Table */}
            <div className="max-h-[400px] overflow-y-auto" onPaste={handlePaste}>
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-400 uppercase w-16 border-b border-r border-gray-200">#</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-blue-600 uppercase border-b border-r border-gray-200">
                      T_surf ({T_UNITS.find((u) => u.key === tUnit)!.label})
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-blue-600 uppercase border-b border-gray-200">
                      q&apos;&apos; ({Q_UNITS.find((u) => u.key === qUnit)!.label})
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const hasValue = row.tSurf !== 0 || row.qFlux !== 0;
                    return (
                      <tr
                        key={i}
                        className={`border-b border-gray-100 transition-colors ${hasValue ? "bg-blue-50/30" : "hover:bg-gray-50"}`}
                      >
                        <td className="px-4 py-1 text-center text-xs font-medium text-gray-400 border-r border-gray-100">
                          {i + 1}
                        </td>
                        <td className="px-2 py-1 border-r border-gray-100">
                          <input
                            type="number"
                            className="w-full px-3 py-2 bg-transparent border-0 text-gray-900 text-sm text-center focus:outline-none focus:bg-blue-100 rounded transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={row.tSurf || ""}
                            onChange={(e) => updateRow(i, "tSurf", e.target.value)}
                            onKeyDown={(e) => handleCellKeyDown(e, i, "tSurf")}
                            data-row={i}
                            data-field="tSurf"
                            placeholder="—"
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input
                            type="number"
                            className="w-full px-3 py-2 bg-transparent border-0 text-gray-900 text-sm text-center focus:outline-none focus:bg-blue-100 rounded transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={row.qFlux || ""}
                            onChange={(e) => updateRow(i, "qFlux", e.target.value)}
                            onKeyDown={(e) => handleCellKeyDown(e, i, "qFlux")}
                            data-row={i}
                            data-field="qFlux"
                            placeholder="—"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer with count and actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{filledRows}</span> data points entered
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => resetForm(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </button>
                <button
                  onClick={() => resetForm(false)}
                  className="flex items-center gap-1.5 px-3 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
            </div>
          </motion.div>

          {/* Preview button */}
          <button
            onClick={handleCheck}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-blue-500 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
          >
            <Check className="h-5 w-5" />
            Preview Data
          </button>

          {/* Chart preview & Save section */}
          <AnimatePresence>
            {chartData && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="space-y-4"
              >
                {/* Chart */}
                <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">
                    Boiling Curve Preview
                    <span className="ml-2 text-xs font-normal text-gray-500">({chartData.length} points)</span>
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="tSurf"
                        label={{ value: "T_surf (°C)", position: "insideBottom", offset: -10, fill: "#6b7280", fontSize: 12 }}
                        tick={{ fill: "#6b7280", fontSize: 11 }}
                        stroke="#d1d5db"
                      />
                      <YAxis
                        label={{ value: "q'' (kW/m²)", angle: -90, position: "insideLeft", offset: -5, fill: "#6b7280", fontSize: 12 }}
                        tick={{ fill: "#6b7280", fontSize: 11 }}
                        stroke="#d1d5db"
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, fontSize: 12, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                        labelFormatter={(v) => `T_surf: ${v}°C`}
                        formatter={(v) => [`${v} kW/m²`, "q''"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="qFlux"
                        stroke={source === "experiment" ? "#3b82f6" : "#ec4899"}
                        strokeWidth={3}
                        dot={{ fill: source === "experiment" ? "#3b82f6" : "#ec4899", r: 5, strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 8, strokeWidth: 2, stroke: "#fff" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Dataset name & Save - shown after preview */}
                <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                  <label className="flex items-center gap-2 text-sm font-semibold text-green-700 mb-3">
                    <Sparkles className="h-4 w-4" />
                    Dataset Name
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white border-2 border-green-200 text-gray-900 rounded-xl text-base font-medium focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                        placeholder="Enter dataset name..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      {suggestedName && !name && (
                        <button
                          onClick={() => setName(suggestedName)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded-lg transition-colors"
                        >
                          Use: {suggestedName}
                        </button>
                      )}
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={!name.trim()}
                      className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all ${
                        name.trim()
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <Sparkles className="h-5 w-5" />
                      Save
                    </button>
                  </div>
                  {suggestedName && (
                    <p className="text-xs text-green-600 mt-2">
                      Suggested: <span className="font-mono font-medium">{suggestedName}</span>
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
