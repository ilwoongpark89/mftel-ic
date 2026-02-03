export interface BoilingDataPoint {
  tSurf: number;
  qFlux: number;
}

export type DataSource = "experiment" | "literature";

export interface ExperimentMeta {
  // General
  date?: string;
  experimenter?: string;
  fluid?: string;
  subcooling?: string;
  pressure?: string;
  bulkFluidTemp?: string;
  orientation?: string;
  flowVelocity?: string;
  // Heater
  heaterMaterial?: string;
  heaterSize?: string;
  heaterGeometry?: string;
  // Surface — base reference
  baseSurface?: string;
  // Surface — modification (LIG etc.)
  surfaceModification?: string;
  patternAreaRatio?: string;
  patternSpacing?: string;
  patternThickness?: string;
  structureHeight?: string;
  contactAngle?: string;
  ra?: string;
  rz?: string;
  porosity?: string;
  coatingMaterial?: string;
  coatingThickness?: string;
  wickingHeight?: string;
  nucleationSiteDensity?: string;
  // Additional
  notes?: string;
}

export interface LiteratureMeta {
  // Paper info
  title?: string;
  authors?: string;
  year?: string;
  journal?: string;
  doi?: string;
  // Experimental conditions (same as ExperimentMeta except date/experimenter)
  fluid?: string;
  subcooling?: string;
  pressure?: string;
  bulkFluidTemp?: string;
  orientation?: string;
  flowVelocity?: string;
  // Heater
  heaterMaterial?: string;
  heaterSize?: string;
  heaterGeometry?: string;
  // Surface — base
  baseSurface?: string;
  ra?: string;
  rz?: string;
  contactAngle?: string;
  // Surface — modification
  surfaceModification?: string;
  patternAreaRatio?: string;
  patternSpacing?: string;
  patternThickness?: string;
  structureHeight?: string;
  porosity?: string;
  coatingMaterial?: string;
  coatingThickness?: string;
  wickingHeight?: string;
  nucleationSiteDensity?: string;
  // Legacy fields (for backward compatibility)
  surfaceType?: string;
  surfaceRoughness?: string;
  // Notes
  notes?: string;
}

export interface BoilingDataset {
  id: string;
  name: string;
  source: DataSource;
  data: BoilingDataPoint[];
  createdAt: string;
  experiment?: ExperimentMeta;
  literature?: LiteratureMeta;
}

const STORAGE_KEY = "cooldecide-boiling-datasets";
const BACKUP_KEY = "cooldecide-boiling-backups";

export interface DataBackup {
  id: string;
  name: string;
  createdAt: string;
  datasets: BoilingDataset[];
  datasetCount: number;
}

export function loadDatasets(): BoilingDataset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDataset(ds: BoilingDataset): void {
  const all = loadDatasets();
  all.push(ds);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function deleteDataset(id: string): void {
  const all = loadDatasets().filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function updateDataset(id: string, updates: Partial<BoilingDataset>): void {
  const all = loadDatasets();
  const idx = all.findIndex((d) => d.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }
}

export function parseCSV(text: string): BoilingDataPoint[] {
  const lines = text.trim().split("\n");
  const points: BoilingDataPoint[] = [];
  for (const line of lines) {
    const parts = line.split(/[,\t;]+/).map((s) => s.trim());
    if (parts.length < 2) continue;
    const tSurf = parseFloat(parts[0]);
    const qFlux = parseFloat(parts[1]);
    if (!isNaN(tSurf) && !isNaN(qFlux)) points.push({ tSurf, qFlux });
  }
  return points;
}

// Backup functions
export function loadBackups(): DataBackup[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function createBackup(name?: string): DataBackup {
  const datasets = loadDatasets();
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS

  const backup: DataBackup = {
    id: `backup-${Date.now()}`,
    name: name || `Backup ${dateStr} ${timeStr}`,
    createdAt: now.toISOString(),
    datasets: datasets,
    datasetCount: datasets.length,
  };

  const backups = loadBackups();
  backups.unshift(backup); // Add to beginning (newest first)
  localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));

  return backup;
}

export function restoreBackup(backupId: string): boolean {
  const backups = loadBackups();
  const backup = backups.find((b) => b.id === backupId);
  if (!backup) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(backup.datasets));
  return true;
}

export function deleteBackup(backupId: string): void {
  const backups = loadBackups().filter((b) => b.id !== backupId);
  localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));
}

export function downloadBackup(backup: DataBackup): void {
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${backup.name.replace(/[^a-z0-9]/gi, "_")}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function importBackup(file: File): Promise<DataBackup | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backup = JSON.parse(content) as DataBackup;
        if (backup.datasets && Array.isArray(backup.datasets)) {
          // Generate new ID to avoid conflicts
          backup.id = `backup-${Date.now()}`;
          backup.name = `Imported: ${backup.name}`;

          const backups = loadBackups();
          backups.unshift(backup);
          localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));
          resolve(backup);
        } else {
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsText(file);
  });
}
