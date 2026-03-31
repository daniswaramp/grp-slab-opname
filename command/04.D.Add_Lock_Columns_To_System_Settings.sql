-- ==============================================================================
-- Migration: Add lock columns to system_settings
-- Created: 2026-04-01
-- Description: Adds lock_mode, locked_at, locked_by columns to system_settings
--              table to support the admin lock feature.
-- Project: mqwpgqvyzrjfsitvrmgh (slab_opname_database)
-- ==============================================================================

-- Add lock columns
ALTER TABLE public.system_settings 
ADD COLUMN IF NOT EXISTS lock_mode BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS locked_by TEXT;

-- ==============================================================================
-- Rollback (if needed):
-- ALTER TABLE public.system_settings 
-- DROP COLUMN IF EXISTS lock_mode,
-- DROP COLUMN IF EXISTS locked_at,
-- DROP COLUMN IF EXISTS locked_by;
-- ==============================================================================
