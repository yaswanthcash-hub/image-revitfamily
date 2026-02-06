/*
  # Add Processing Fields to Projects Table

  1. Changes
    - Add `processing_provider` column to track which AI model is being used
    - Add `processed_image_url` for preprocessed images (background removed)
    - Add `estimated_dimensions` for AI-estimated dimensions
    - Add `error_message` for error tracking
    - Add `processing_progress` for progress percentage

  2. Notes
    - All new columns are nullable to maintain backwards compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'processing_provider'
  ) THEN
    ALTER TABLE projects ADD COLUMN processing_provider text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'processed_image_url'
  ) THEN
    ALTER TABLE projects ADD COLUMN processed_image_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'estimated_dimensions'
  ) THEN
    ALTER TABLE projects ADD COLUMN estimated_dimensions jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'error_message'
  ) THEN
    ALTER TABLE projects ADD COLUMN error_message text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'processing_progress'
  ) THEN
    ALTER TABLE projects ADD COLUMN processing_progress integer DEFAULT 0;
  END IF;
END $$;
