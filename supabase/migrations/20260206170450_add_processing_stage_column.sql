/*
  # Add processing stage column

  1. Changes
    - Adds `processing_stage` column to track the current stage of processing
    - Adds `processing_started_at` and `processing_completed_at` timestamps

  2. Purpose
    - Enable more granular progress tracking in the UI
    - Track processing duration for analytics
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'processing_stage'
  ) THEN
    ALTER TABLE projects ADD COLUMN processing_stage text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'processing_started_at'
  ) THEN
    ALTER TABLE projects ADD COLUMN processing_started_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'processing_completed_at'
  ) THEN
    ALTER TABLE projects ADD COLUMN processing_completed_at timestamptz;
  END IF;
END $$;