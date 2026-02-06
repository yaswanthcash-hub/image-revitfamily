/*
  # Revit Family Generation System

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable for now - will add auth later)
      - `name` (text)
      - `image_url` (text) - uploaded image
      - `status` (text) - pending, processing, completed, failed
      - `furniture_category` (text)
      - `dimensions` (jsonb) - extracted or user-provided dimensions
      - `mesh_url` (text, nullable) - generated 3D mesh file
      - `revit_family_url` (text, nullable) - final .rfa file
      - `processing_data` (jsonb) - API responses, metadata
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `processing_jobs`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key)
      - `job_type` (text) - image_to_3d, dimension_extraction, revit_generation
      - `status` (text) - queued, processing, completed, failed
      - `api_provider` (text) - meshy, tripo3d, triposr, etc.
      - `api_job_id` (text, nullable)
      - `result` (jsonb)
      - `error` (text, nullable)
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz, nullable)

  2. Storage Buckets
    - `project-images` - uploaded furniture images
    - `generated-meshes` - 3D model files
    - `revit-families` - final .rfa files

  3. Security
    - Enable RLS on all tables
    - For MVP: Allow public access for testing
    - TODO: Add proper auth later
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  image_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  furniture_category text NOT NULL DEFAULT 'chair',
  dimensions jsonb DEFAULT '{}',
  mesh_url text,
  revit_family_url text,
  processing_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create processing_jobs table
CREATE TABLE IF NOT EXISTS processing_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  job_type text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  api_provider text,
  api_job_id text,
  result jsonb DEFAULT '{}',
  error text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_project_id ON processing_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON processing_jobs(status);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;

-- For MVP: Allow all operations (we'll add auth later)
CREATE POLICY "Allow all access to projects"
  ON projects
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to processing_jobs"
  ON processing_jobs
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Storage buckets (will be created via Supabase dashboard or API)
-- bucket: project-images (public)
-- bucket: generated-meshes (public)
-- bucket: revit-families (public)

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
