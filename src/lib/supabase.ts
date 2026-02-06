import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Project {
  id: string;
  user_id?: string;
  name: string;
  image_url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  furniture_category: string;
  dimensions: {
    height?: number;
    width?: number;
    depth?: number;
    seat_height?: number;
  };
  mesh_url?: string;
  revit_family_url?: string;
  processing_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProcessingJob {
  id: string;
  project_id: string;
  job_type: 'image_to_3d' | 'dimension_extraction' | 'revit_generation';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  api_provider?: string;
  api_job_id?: string;
  result: Record<string, any>;
  error?: string;
  created_at: string;
  completed_at?: string;
}
