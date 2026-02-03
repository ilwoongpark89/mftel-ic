import { supabase } from './supabase';

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
  trialNumber?: string;
  // Heater
  heaterMaterial?: string;
  heaterSize?: string;
  heaterGeometry?: string;
  // Surface — base reference
  baseSurface?: string;
  contactAngle?: string;
  ra?: string;
  rz?: string;
  // Surface — modification (LIG etc.)
  surfaceModification?: string;
  surfaceFraction?: string;
  wettability?: string;
  structureWidth?: string;
  structureSpacing?: string;
  structureHeight?: string;
  patternAreaRatio?: string;
  patternSpacing?: string;
  patternThickness?: string;
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

export interface DataBackup {
  id: string;
  name: string;
  createdAt: string;
  datasets: BoilingDataset[];
  datasetCount: number;
}

// ============ Supabase Functions ============

export async function loadDatasets(): Promise<BoilingDataset[]> {
  try {
    const { data, error } = await supabase
      .from('boiling_datasets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading datasets:', error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      source: row.source as DataSource,
      data: row.data as BoilingDataPoint[],
      createdAt: row.created_at,
      experiment: row.experiment_meta as ExperimentMeta | undefined,
      literature: row.literature_meta as LiteratureMeta | undefined,
    }));
  } catch (err) {
    console.error('Error loading datasets:', err);
    return [];
  }
}

export async function saveDataset(ds: BoilingDataset): Promise<void> {
  try {
    const { error } = await supabase.from('boiling_datasets').insert({
      id: ds.id,
      name: ds.name,
      source: ds.source,
      data: ds.data,
      created_at: ds.createdAt,
      experiment_meta: ds.experiment || null,
      literature_meta: ds.literature || null,
    });

    if (error) {
      console.error('Error saving dataset:', error);
      throw error;
    }
  } catch (err) {
    console.error('Error saving dataset:', err);
    throw err;
  }
}

export async function deleteDataset(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('boiling_datasets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting dataset:', error);
      throw error;
    }
  } catch (err) {
    console.error('Error deleting dataset:', err);
    throw err;
  }
}

export async function updateDataset(id: string, updates: Partial<BoilingDataset>): Promise<void> {
  try {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.source !== undefined) dbUpdates.source = updates.source;
    if (updates.data !== undefined) dbUpdates.data = updates.data;
    if (updates.experiment !== undefined) dbUpdates.experiment_meta = updates.experiment;
    if (updates.literature !== undefined) dbUpdates.literature_meta = updates.literature;

    const { error } = await supabase
      .from('boiling_datasets')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating dataset:', error);
      throw error;
    }
  } catch (err) {
    console.error('Error updating dataset:', err);
    throw err;
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

// ============ Backup Functions (Supabase) ============

export async function loadBackups(): Promise<DataBackup[]> {
  try {
    const { data, error } = await supabase
      .from('boiling_backups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading backups:', error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      createdAt: row.created_at,
      datasets: row.datasets as BoilingDataset[],
      datasetCount: row.dataset_count,
    }));
  } catch (err) {
    console.error('Error loading backups:', err);
    return [];
  }
}

export async function createBackup(name?: string): Promise<DataBackup> {
  const datasets = await loadDatasets();
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-");

  const backup: DataBackup = {
    id: `backup-${Date.now()}`,
    name: name || `Backup ${dateStr} ${timeStr}`,
    createdAt: now.toISOString(),
    datasets: datasets,
    datasetCount: datasets.length,
  };

  const { error } = await supabase.from('boiling_backups').insert({
    id: backup.id,
    name: backup.name,
    created_at: backup.createdAt,
    datasets: backup.datasets,
    dataset_count: backup.datasetCount,
  });

  if (error) {
    console.error('Error creating backup:', error);
    throw error;
  }

  return backup;
}

export async function restoreBackup(backupId: string): Promise<boolean> {
  try {
    const { data: backupData, error: fetchError } = await supabase
      .from('boiling_backups')
      .select('*')
      .eq('id', backupId)
      .single();

    if (fetchError || !backupData) {
      console.error('Error fetching backup:', fetchError);
      return false;
    }

    // Delete all existing datasets
    const { error: deleteError } = await supabase
      .from('boiling_datasets')
      .delete()
      .neq('id', '');

    if (deleteError) {
      console.error('Error deleting existing datasets:', deleteError);
      return false;
    }

    // Insert backup datasets
    const datasets = backupData.datasets as BoilingDataset[];
    for (const ds of datasets) {
      await saveDataset(ds);
    }

    return true;
  } catch (err) {
    console.error('Error restoring backup:', err);
    return false;
  }
}

export async function deleteBackup(backupId: string): Promise<void> {
  const { error } = await supabase
    .from('boiling_backups')
    .delete()
    .eq('id', backupId);

  if (error) {
    console.error('Error deleting backup:', error);
    throw error;
  }
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
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const backup = JSON.parse(content) as DataBackup;
        if (backup.datasets && Array.isArray(backup.datasets)) {
          // Generate new ID to avoid conflicts
          backup.id = `backup-${Date.now()}`;
          backup.name = `Imported: ${backup.name}`;

          const { error } = await supabase.from('boiling_backups').insert({
            id: backup.id,
            name: backup.name,
            created_at: backup.createdAt,
            datasets: backup.datasets,
            dataset_count: backup.datasetCount,
          });

          if (error) {
            console.error('Error importing backup:', error);
            resolve(null);
          } else {
            resolve(backup);
          }
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
