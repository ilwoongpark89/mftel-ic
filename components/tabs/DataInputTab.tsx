"use client";
import { useState, useRef, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  BoilingDataPoint, BoilingDataset, DataSource, ExperimentMeta, LiteratureMeta,
  saveDataset, parseCSV,
} from "@/lib/boiling-data";

interface Props {
  onSaved: () => void;
}

// ── Unit options ──
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

// ── Experiment condition fields (grouped) ──
type ExpFieldDef = { key: keyof ExperimentMeta; label: string; placeholder: string; type?: "date" | "text" };
type ExpGroup = { title: string; fields: ExpFieldDef[] };

const EXPERIMENT_GROUPS: ExpGroup[] = [
  {
    title: "GENERAL",
    fields: [
      { key: "date", label: "Date", placeholder: "", type: "date" },
      { key: "experimenter", label: "Experimenter", placeholder: "e.g. 홍길동" },
      { key: "fluid", label: "Working Fluid", placeholder: "e.g. Novec 7100, FC-72, Water" },
      { key: "subcooling", label: "Subcooling (ΔT_sub)", placeholder: "e.g. 0 K, 10 K" },
      { key: "pressure", label: "System Pressure", placeholder: "e.g. 1 atm, 101.3 kPa" },
      { key: "bulkFluidTemp", label: "Bulk Fluid Temp", placeholder: "e.g. 50 °C" },
      { key: "orientation", label: "Orientation", placeholder: "e.g. Horizontal Up, Vertical, 45°" },
      { key: "flowVelocity", label: "Flow Velocity", placeholder: "e.g. 0 m/s (pool), 0.5 m/s" },
    ],
  },
  {
    title: "HEATER",
    fields: [
      { key: "heaterMaterial", label: "Heater Material", placeholder: "e.g. Copper, Silicon, Stainless Steel" },
      { key: "heaterSize", label: "Heater Size", placeholder: "e.g. 10 × 10 mm²" },
      { key: "heaterGeometry", label: "Heater Geometry", placeholder: "e.g. Flat plate, Cylinder, Chip-scale" },
    ],
  },
  {
    title: "SURFACE — BASE",
    fields: [
      { key: "baseSurface", label: "Base Surface", placeholder: "e.g. Plain polished copper, Sandblasted Cu" },
      { key: "ra", label: "Ra (μm)", placeholder: "e.g. 0.5" },
      { key: "rz", label: "Rz (μm)", placeholder: "e.g. 3.2" },
      { key: "contactAngle", label: "Contact Angle (°)", placeholder: "e.g. 85" },
    ],
  },
  {
    title: "SURFACE — MODIFICATION",
    fields: [
      { key: "surfaceModification", label: "Modification Method", placeholder: "e.g. LIG, Sintering, Etching, Coating, CNC micro-milling" },
      { key: "patternAreaRatio", label: "Pattern Area Ratio (%)", placeholder: "e.g. 50" },
      { key: "patternSpacing", label: "Pattern Spacing (μm)", placeholder: "e.g. 200" },
      { key: "patternThickness", label: "Pattern Thickness (μm)", placeholder: "e.g. 30" },
      { key: "structureHeight", label: "Structure Height (μm)", placeholder: "e.g. 100" },
      { key: "porosity", label: "Porosity (%)", placeholder: "e.g. 40" },
      { key: "coatingMaterial", label: "Coating Material", placeholder: "e.g. Graphene, TiO₂, SiO₂, PTFE" },
      { key: "coatingThickness", label: "Coating Thickness (μm)", placeholder: "e.g. 5" },
      { key: "wickingHeight", label: "Wicking Height (mm)", placeholder: "e.g. 15" },
      { key: "nucleationSiteDensity", label: "Nucleation Site Density (cm⁻²)", placeholder: "e.g. 50" },
    ],
  },
  {
    title: "NOTES",
    fields: [
      { key: "notes", label: "Notes / Remarks", placeholder: "Any additional info" },
    ],
  },
];

const LITERATURE_FIELDS: { key: keyof LiteratureMeta; label: string; placeholder: string }[] = [
  { key: "title", label: "Paper Title", placeholder: "e.g. Pool boiling heat transfer on micro-structured surfaces" },
  { key: "authors", label: "Authors", placeholder: "e.g. Kim J., Park I.W., et al." },
  { key: "year", label: "Year", placeholder: "e.g. 2023" },
  { key: "journal", label: "Journal / Conference", placeholder: "e.g. International Journal of Heat and Mass Transfer" },
  { key: "doi", label: "DOI", placeholder: "e.g. 10.1016/j.ijheatmasstransfer.2023.xxxxx" },
  { key: "fluid", label: "Working Fluid", placeholder: "e.g. Novec 7100, FC-72, Water, HFE-7200" },
  { key: "surfaceType", label: "Surface Type", placeholder: "e.g. Plain copper, Microporous, Nanostructured, Finned" },
  { key: "surfaceRoughness", label: "Surface Roughness", placeholder: "e.g. Ra = 0.5 μm" },
  { key: "heaterGeometry", label: "Heater Geometry", placeholder: "e.g. Flat plate, Cylinder, Chip-scale" },
  { key: "heaterSize", label: "Heater Size", placeholder: "e.g. 10 × 10 mm², D = 5 mm" },
  { key: "orientation", label: "Orientation / Angle", placeholder: "e.g. Horizontal upward, Vertical, 45°" },
  { key: "pressure", label: "System Pressure", placeholder: "e.g. 1 atm, 101.3 kPa" },
  { key: "subcooling", label: "Subcooling (ΔT_sub)", placeholder: "e.g. 0 K (saturated), 10 K" },
  { key: "flowVelocity", label: "Flow Velocity", placeholder: "e.g. 0 m/s (pool), 0.5 m/s" },
  { key: "notes", label: "Notes / Remarks", placeholder: "Any additional info about the data" },
];

const INITIAL_ROWS = 15;

function emptyRows(n: number): BoilingDataPoint[] {
  return Array.from({ length: n }, () => ({ tSurf: 0, qFlux: 0 }));
}

export default function DataInputTab({ onSaved }: Props) {
  const [source, setSource] = useState<DataSource>("experiment");
  const [name, setName] = useState("");
  const [rows, setRows] = useState<BoilingDataPoint[]>(emptyRows(INITIAL_ROWS));
  const [expMeta, setExpMeta] = useState<ExperimentMeta>({});
  const [literature, setLiterature] = useState<LiteratureMeta>({});
  const [checked, setChecked] = useState(false);
  const [chartData, setChartData] = useState<BoilingDataPoint[] | null>(null);
  const [tUnit, setTUnit] = useState<TUnit>("C");
  const [qUnit, setQUnit] = useState<QUnit>("kW/m2");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setRows(emptyRows(INITIAL_ROWS));
    setChecked(false);
    setChartData(null);
    setImagePreview(null);
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

  const inp = "w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded font-mono text-sm focus:outline-none focus:border-cyan-500";
  const lbl = "text-gray-500 text-[10px] font-mono uppercase tracking-wider";
  const cellInp = "w-full px-2 py-1.5 bg-transparent border-0 text-gray-900 font-mono text-sm focus:outline-none focus:bg-cyan-50 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <div className="space-y-6">
      {/* Source toggle */}
      <div className="flex gap-2">
        {([
          { key: "experiment" as const, label: "EXPERIMENT", desc: "Our Lab Data" },
          { key: "literature" as const, label: "LITERATURE", desc: "Published Paper Data" },
        ]).map((s) => (
          <button
            key={s.key}
            onClick={() => { setSource(s.key); resetForm(); }}
            className={`flex-1 px-4 py-3 rounded-lg border font-mono text-sm transition ${
              source === s.key
                ? "bg-cyan-500/15 border-cyan-500 text-cyan-700"
                : "bg-gray-50 border-gray-300 text-gray-500 hover:border-gray-400"
            }`}
          >
            <div className="font-bold">{s.label}</div>
            <div className="text-[10px] opacity-60 mt-0.5">{s.desc}</div>
          </button>
        ))}
      </div>

      {/* Conditions panel */}
      <div className="p-5 rounded-xl border bg-white border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-cyan-600 font-mono tracking-wider mb-4">
          {">"} {source === "experiment" ? "EXPERIMENT CONDITIONS" : "LITERATURE INFO"}
        </h3>

        {/* Dataset name */}
        <div className="mb-4">
          <label className={lbl}>Dataset Name</label>
          <input
            type="text"
            className={`${inp} mt-1`}
            placeholder={source === "experiment" ? "e.g. LIG-50%-200μm-Novec7100" : "e.g. Kim2023 - FC72 Microporous"}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Experiment metadata (grouped) */}
        {source === "experiment" && EXPERIMENT_GROUPS.map((g) => (
          <div key={g.title} className="mb-4">
            <div className="text-[10px] font-bold text-cyan-600/60 font-mono tracking-wider mb-2 border-b border-gray-200 pb-1">
              {g.title}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {g.fields.map((f) => (
                <div key={f.key} className={f.key === "notes" ? "col-span-full" : ""}>
                  <label className={lbl}>{f.label}</label>
                  {f.key === "notes" ? (
                    <textarea
                      className={`${inp} mt-1 h-14 resize-none`}
                      placeholder={f.placeholder}
                      value={expMeta[f.key] || ""}
                      onChange={(e) => updateExp(f.key, e.target.value)}
                    />
                  ) : (
                    <input
                      type={f.type === "date" ? "date" : "text"}
                      className={`${inp} mt-1`}
                      placeholder={f.placeholder}
                      value={expMeta[f.key] || ""}
                      onChange={(e) => updateExp(f.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Literature metadata */}
        {source === "literature" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {LITERATURE_FIELDS.map((f) => (
              <div key={f.key} className={f.key === "title" || f.key === "notes" ? "md:col-span-2" : ""}>
                <label className={lbl}>{f.label}</label>
                {f.key === "notes" ? (
                  <textarea
                    className={`${inp} mt-1 h-16 resize-none`}
                    placeholder={f.placeholder}
                    value={literature[f.key] || ""}
                    onChange={(e) => updateLit(f.key, e.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    className={`${inp} mt-1`}
                    placeholder={f.placeholder}
                    value={literature[f.key] || ""}
                    onChange={(e) => updateLit(f.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data entry panel */}
      <div className="p-5 rounded-xl border bg-white border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-cyan-600 font-mono tracking-wider mb-4">
          {">"} DATA POINTS
        </h3>

        {/* Image upload */}
        <div className="mb-4">
          <div className="flex gap-3 items-center mb-2">
            <span className={lbl}>Reference Image (optional)</span>
            <button
              onClick={() => imgRef.current?.click()}
              className="px-3 py-1 rounded border border-gray-300 bg-gray-50 text-cyan-700 font-mono text-xs hover:border-cyan-500 transition"
            >
              Upload Image
            </button>
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            {imagePreview && (
              <button onClick={() => setImagePreview(null)} className="text-red-500 hover:text-red-400 font-mono text-xs">Remove</button>
            )}
          </div>
          {imagePreview && (
            <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50 p-2 mb-4">
              <img src={imagePreview} alt="Reference" className="max-h-64 mx-auto rounded" />
            </div>
          )}
        </div>

        {/* Import tools + unit selectors */}
        <div className="flex gap-3 mb-3 items-center flex-wrap">
          <button
            onClick={() => fileRef.current?.click()}
            className="px-3 py-1 rounded border border-gray-300 bg-gray-50 text-cyan-700 font-mono text-xs hover:border-cyan-500 transition"
          >
            Upload CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={handleCSV} />
          <span className="text-gray-400 font-mono text-[10px]">or paste into table</span>
          <div className="ml-auto flex gap-2 items-center">
            <span className={lbl}>T unit:</span>
            <select className="px-2 py-1 bg-white border border-gray-300 text-gray-900 rounded font-mono text-xs focus:outline-none focus:border-cyan-500"
              value={tUnit} onChange={(e) => { setTUnit(e.target.value as TUnit); invalidate(); }}>
              {T_UNITS.map((u) => <option key={u.key} value={u.key}>{u.label}</option>)}
            </select>
            <span className={lbl}>q&apos;&apos; unit:</span>
            <select className="px-2 py-1 bg-white border border-gray-300 text-gray-900 rounded font-mono text-xs focus:outline-none focus:border-cyan-500"
              value={qUnit} onChange={(e) => { setQUnit(e.target.value as QUnit); invalidate(); }}>
              {Q_UNITS.map((u) => <option key={u.key} value={u.key}>{u.label}</option>)}
            </select>
          </div>
        </div>

        {/* Spreadsheet table */}
        <div className="rounded-lg border border-gray-200 overflow-hidden max-h-[500px] overflow-y-auto" onPaste={handlePaste}>
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-center font-mono text-[10px] text-gray-400 uppercase w-12 border-b border-r border-gray-200">#</th>
                <th className="px-3 py-2 text-center font-mono text-[10px] text-cyan-600 uppercase border-b border-r border-gray-200">
                  T_surf ({T_UNITS.find((u) => u.key === tUnit)!.label})
                </th>
                <th className="px-3 py-2 text-center font-mono text-[10px] text-cyan-600 uppercase border-b border-gray-200">
                  q&apos;&apos; ({Q_UNITS.find((u) => u.key === qUnit)!.label})
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-cyan-50/30 transition">
                  <td className="px-3 py-0 text-center font-mono text-[10px] text-gray-400 border-r border-gray-100">{i + 1}</td>
                  <td className="px-0 py-0 border-r border-gray-100">
                    <input
                      type="number"
                      className={cellInp}
                      value={row.tSurf || ""}
                      onChange={(e) => updateRow(i, "tSurf", e.target.value)}
                      tabIndex={i * 2 + 1}
                    />
                  </td>
                  <td className="px-0 py-0">
                    <input
                      type="number"
                      className={cellInp}
                      value={row.qFlux || ""}
                      onChange={(e) => updateRow(i, "qFlux", e.target.value)}
                      tabIndex={i * 2 + 2}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleCheck}
            className="px-4 py-2 rounded border border-cyan-500 bg-cyan-500/10 text-cyan-700 font-mono text-sm hover:bg-cyan-500/20 transition"
          >
            Check
          </button>
          <button
            onClick={handleSave}
            disabled={!checked || !name.trim()}
            className={`px-4 py-2 rounded border font-mono text-sm transition ${
              checked && name.trim()
                ? "border-green-500 bg-green-500/10 text-green-700 hover:bg-green-500/20"
                : "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Save
          </button>
          <button
            onClick={resetForm}
            className="px-4 py-2 rounded border border-gray-300 bg-gray-50 text-gray-500 font-mono text-sm hover:border-gray-400 transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Chart preview */}
      {chartData && (
        <div className="p-5 rounded-xl border bg-white border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-cyan-600 font-mono tracking-wider mb-4">
            {">"} BOILING CURVE PREVIEW
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="tSurf"
                label={{ value: "T_surf (°C)", position: "insideBottom", offset: -10, fill: "#6b7280", fontSize: 12 }}
                tick={{ fill: "#6b7280", fontSize: 11 }} stroke="#d1d5db" />
              <YAxis
                label={{ value: "q'' (kW/m²)", angle: -90, position: "insideLeft", offset: -5, fill: "#6b7280", fontSize: 12 }}
                tick={{ fill: "#6b7280", fontSize: 11 }} stroke="#d1d5db" />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontFamily: "monospace", fontSize: 12 }}
                labelFormatter={(v) => `T_surf: ${v}°C`}
                formatter={(v) => [`${v} kW/m²`, "q''"]}
              />
              <Line type="monotone" dataKey="qFlux"
                stroke={source === "experiment" ? "#22d3ee" : "#f472b6"} strokeWidth={2}
                dot={{ fill: source === "experiment" ? "#22d3ee" : "#f472b6", r: 4 }}
                activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
