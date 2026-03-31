-- ==============================================================================
-- Migration: Add missing RLS policies for all tables
-- Created: 2026-04-01
-- Description: Fixes issue where app shows empty data due to RLS being enabled
--              without policies. RLS blocks anonymous access by default when
--              no policies exist.
-- Project: mqwpgqvyzrjfsitvrmgh (slab_opname_database)
-- ==============================================================================

-- sap_stock: Allow all operations
CREATE POLICY "Enable read access for all users" ON public.sap_stock FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.sap_stock FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.sap_stock FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.sap_stock FOR DELETE USING (true);

-- mother_slab_stock: Allow all operations
CREATE POLICY "Enable read access for all users" ON public.mother_slab_stock FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.mother_slab_stock FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.mother_slab_stock FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.mother_slab_stock FOR DELETE USING (true);

-- cut_slab_stock: Allow all operations
CREATE POLICY "Enable read access for all users" ON public.cut_slab_stock FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.cut_slab_stock FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.cut_slab_stock FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.cut_slab_stock FOR DELETE USING (true);

-- opname_records: Allow all operations
CREATE POLICY "Enable read access for all users" ON public.opname_records FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.opname_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.opname_records FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.opname_records FOR DELETE USING (true);

-- locations: Allow all operations
CREATE POLICY "Enable read access for all users" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.locations FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.locations FOR DELETE USING (true);

-- users_online: Allow all operations
CREATE POLICY "Enable read access for all users" ON public.users_online FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.users_online FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.users_online FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.users_online FOR DELETE USING (true);

-- opname_backups: Add missing UPDATE policy
CREATE POLICY "Enable update for all users" ON public.opname_backups FOR UPDATE USING (true);

-- ==============================================================================
-- Rollback (if needed):
-- DROP POLICY IF EXISTS "Enable read access for all users" ON public.sap_stock;
-- DROP POLICY IF EXISTS "Enable insert for all users" ON public.sap_stock;
-- DROP POLICY IF EXISTS "Enable update for all users" ON public.sap_stock;
-- DROP POLICY IF EXISTS "Enable delete for all users" ON public.sap_stock;
-- (repeat for each table)
-- ==============================================================================
