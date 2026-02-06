/*
  # Storage Policies for Public Access

  1. Storage Policies
    - Allow public upload and read access to project-images bucket
    - Allow public upload and read access to generated-meshes bucket
    - Allow public upload and read access to revit-families bucket
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access to project-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to generated-meshes" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to revit-families" ON storage.objects;

-- Create policies for public access
CREATE POLICY "Public Access to project-images"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'project-images')
WITH CHECK (bucket_id = 'project-images');

CREATE POLICY "Public Access to generated-meshes"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'generated-meshes')
WITH CHECK (bucket_id = 'generated-meshes');

CREATE POLICY "Public Access to revit-families"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'revit-families')
WITH CHECK (bucket_id = 'revit-families');
