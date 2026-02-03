import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DbBoilingDataset {
  id: string;
  name: string;
  source: 'experiment' | 'literature';
  data: { tSurf: number; qFlux: number }[];
  created_at: string;
  experiment_meta?: Record<string, string>;
  literature_meta?: Record<string, string>;
}
