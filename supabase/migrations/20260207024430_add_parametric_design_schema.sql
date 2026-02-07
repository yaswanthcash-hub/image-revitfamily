/*
  # Enhanced Parametric Design Schema
  
  This migration extends the database to support full conceptual design workflows
  including parametric relationships, materials, assemblies, and design history.

  1. New Tables
    - `design_parameters` - Custom parameter definitions with formulas
    - `parameter_constraints` - Design rules and validation constraints
    - `design_versions` - Version history for design iterations
    - `assemblies` - Component hierarchies and relationships
    - `materials` - Material library with appearance and physical properties
    - `connectors` - MEP connector definitions
    - `design_intent` - Design rationale and decision documentation

  2. Security
    - Enable RLS on all new tables
    - Policies allow public access for MVP (matching existing projects table)
*/

-- Design Parameters table
CREATE TABLE IF NOT EXISTS design_parameters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  label text NOT NULL,
  data_type text NOT NULL DEFAULT 'number',
  group_name text NOT NULL DEFAULT 'Dimensions',
  formula text,
  default_value jsonb,
  min_value numeric,
  max_value numeric,
  unit text DEFAULT 'in',
  is_instance boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_data_type CHECK (data_type IN ('number', 'text', 'boolean', 'angle', 'material', 'url')),
  CONSTRAINT valid_group CHECK (group_name IN ('Dimensions', 'Identity', 'Appearance', 'Structural', 'MEP', 'Other'))
);

ALTER TABLE design_parameters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to design_parameters"
  ON design_parameters FOR ALL TO anon
  USING (true) WITH CHECK (true);

-- Parameter Constraints table
CREATE TABLE IF NOT EXISTS parameter_constraints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  constraint_type text NOT NULL DEFAULT 'formula',
  expression text NOT NULL,
  parameters jsonb DEFAULT '[]'::jsonb,
  severity text DEFAULT 'warning',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_constraint_type CHECK (constraint_type IN ('formula', 'range', 'equality', 'reference', 'conditional')),
  CONSTRAINT valid_severity CHECK (severity IN ('error', 'warning', 'info'))
);

ALTER TABLE parameter_constraints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to parameter_constraints"
  ON parameter_constraints FOR ALL TO anon
  USING (true) WITH CHECK (true);

-- Design Versions table
CREATE TABLE IF NOT EXISTS design_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  name text,
  description text,
  snapshot_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  parent_version_id uuid REFERENCES design_versions(id),
  is_current boolean DEFAULT false,
  created_by text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE design_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to design_versions"
  ON design_versions FOR ALL TO anon
  USING (true) WITH CHECK (true);

-- Assemblies table
CREATE TABLE IF NOT EXISTS assemblies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  parent_assembly_id uuid REFERENCES assemblies(id),
  component_type text DEFAULT 'host',
  transform jsonb DEFAULT '{"position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}'::jsonb,
  parameters jsonb DEFAULT '{}'::jsonb,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_component_type CHECK (component_type IN ('host', 'nested', 'shared', 'linked'))
);

ALTER TABLE assemblies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to assemblies"
  ON assemblies FOR ALL TO anon
  USING (true) WITH CHECK (true);

-- Materials table
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Generic',
  appearance jsonb DEFAULT '{"color": "#808080", "roughness": 0.5, "metalness": 0.0}'::jsonb,
  physical_properties jsonb DEFAULT '{}'::jsonb,
  identity_data jsonb DEFAULT '{}'::jsonb,
  texture_url text,
  is_library boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_category CHECK (category IN ('Wood', 'Metal', 'Glass', 'Fabric', 'Concrete', 'Stone', 'Plastic', 'Ceramic', 'Paint', 'Generic'))
);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to materials"
  ON materials FOR ALL TO anon
  USING (true) WITH CHECK (true);

-- Connectors table
CREATE TABLE IF NOT EXISTS connectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  assembly_id uuid REFERENCES assemblies(id) ON DELETE CASCADE,
  name text NOT NULL,
  connector_type text NOT NULL DEFAULT 'pipe',
  system_type text,
  shape text DEFAULT 'round',
  dimensions jsonb DEFAULT '{"diameter": 4}'::jsonb,
  position jsonb DEFAULT '{"x": 0, "y": 0, "z": 0}'::jsonb,
  direction jsonb DEFAULT '{"x": 0, "y": 0, "z": 1}'::jsonb,
  flow_direction text DEFAULT 'bidirectional',
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_connector_type CHECK (connector_type IN ('pipe', 'duct', 'conduit', 'cable_tray', 'fitting')),
  CONSTRAINT valid_shape CHECK (shape IN ('round', 'rectangular', 'oval')),
  CONSTRAINT valid_flow_direction CHECK (flow_direction IN ('in', 'out', 'bidirectional'))
);

ALTER TABLE connectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to connectors"
  ON connectors FOR ALL TO anon
  USING (true) WITH CHECK (true);

-- Design Intent table
CREATE TABLE IF NOT EXISTS design_intent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_id uuid REFERENCES design_versions(id) ON DELETE SET NULL,
  intent_type text NOT NULL DEFAULT 'note',
  title text NOT NULL,
  description text,
  related_parameters jsonb DEFAULT '[]'::jsonb,
  related_assemblies jsonb DEFAULT '[]'::jsonb,
  tags jsonb DEFAULT '[]'::jsonb,
  created_by text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_intent_type CHECK (intent_type IN ('decision', 'requirement', 'note', 'constraint_reason', 'change_rationale'))
);

ALTER TABLE design_intent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to design_intent"
  ON design_intent FOR ALL TO anon
  USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_design_parameters_project ON design_parameters(project_id);
CREATE INDEX IF NOT EXISTS idx_parameter_constraints_project ON parameter_constraints(project_id);
CREATE INDEX IF NOT EXISTS idx_design_versions_project ON design_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_design_versions_current ON design_versions(project_id, is_current) WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_assemblies_project ON assemblies(project_id);
CREATE INDEX IF NOT EXISTS idx_assemblies_parent ON assemblies(parent_assembly_id);
CREATE INDEX IF NOT EXISTS idx_materials_project ON materials(project_id);
CREATE INDEX IF NOT EXISTS idx_materials_library ON materials(is_library) WHERE is_library = true;
CREATE INDEX IF NOT EXISTS idx_connectors_project ON connectors(project_id);
CREATE INDEX IF NOT EXISTS idx_connectors_assembly ON connectors(assembly_id);
CREATE INDEX IF NOT EXISTS idx_design_intent_project ON design_intent(project_id);

-- Insert default library materials
INSERT INTO materials (name, category, appearance, physical_properties, is_library) VALUES
  ('Oak Wood', 'Wood', '{"color": "#8B7355", "roughness": 0.7, "metalness": 0.0}', '{"density": 750, "thermalConductivity": 0.17}', true),
  ('Walnut Wood', 'Wood', '{"color": "#5C4033", "roughness": 0.65, "metalness": 0.0}', '{"density": 650, "thermalConductivity": 0.15}', true),
  ('Maple Wood', 'Wood', '{"color": "#C4A77D", "roughness": 0.7, "metalness": 0.0}', '{"density": 700, "thermalConductivity": 0.16}', true),
  ('Brushed Steel', 'Metal', '{"color": "#708090", "roughness": 0.4, "metalness": 0.9}', '{"density": 7850, "thermalConductivity": 50}', true),
  ('Polished Chrome', 'Metal', '{"color": "#C0C0C0", "roughness": 0.1, "metalness": 1.0}', '{"density": 7190, "thermalConductivity": 94}', true),
  ('Brushed Brass', 'Metal', '{"color": "#B5A642", "roughness": 0.35, "metalness": 0.85}', '{"density": 8500, "thermalConductivity": 109}', true),
  ('Clear Glass', 'Glass', '{"color": "#E8F4F8", "roughness": 0.0, "metalness": 0.0, "opacity": 0.3}', '{"density": 2500, "thermalConductivity": 1.0}', true),
  ('Frosted Glass', 'Glass', '{"color": "#F5F5F5", "roughness": 0.6, "metalness": 0.0, "opacity": 0.5}', '{"density": 2500, "thermalConductivity": 1.0}', true),
  ('Linen Fabric', 'Fabric', '{"color": "#F5F5DC", "roughness": 0.9, "metalness": 0.0}', '{"density": 80}', true),
  ('Leather Brown', 'Fabric', '{"color": "#8B4513", "roughness": 0.5, "metalness": 0.0}', '{"density": 900}', true),
  ('Velvet Blue', 'Fabric', '{"color": "#5BA3C9", "roughness": 0.95, "metalness": 0.0}', '{"density": 350}', true),
  ('Concrete Gray', 'Concrete', '{"color": "#A0A0A0", "roughness": 0.85, "metalness": 0.0}', '{"density": 2400, "thermalConductivity": 1.7}', true),
  ('Polished Concrete', 'Concrete', '{"color": "#B0B0B0", "roughness": 0.3, "metalness": 0.0}', '{"density": 2400, "thermalConductivity": 1.7}', true),
  ('Marble White', 'Stone', '{"color": "#F5F5F5", "roughness": 0.2, "metalness": 0.0}', '{"density": 2700, "thermalConductivity": 2.8}', true),
  ('Granite Dark', 'Stone', '{"color": "#404040", "roughness": 0.4, "metalness": 0.0}', '{"density": 2750, "thermalConductivity": 2.9}', true),
  ('White Paint', 'Paint', '{"color": "#FFFFFF", "roughness": 0.3, "metalness": 0.0}', '{}', true),
  ('Matte Black', 'Paint', '{"color": "#1a1a1a", "roughness": 0.9, "metalness": 0.0}', '{}', true),
  ('Ceramic White', 'Ceramic', '{"color": "#F8F8F8", "roughness": 0.15, "metalness": 0.0}', '{"density": 2400}', true)
ON CONFLICT DO NOTHING;
