-- ==============================================================================
-- NeeLedger — Phase 0 Hardened Rollback Script (v2)
-- ==============================================================================
-- PURPOSE:
-- Safely reverts Phase 0 v2 migration without reintroducing security vulnerabilities.
--
-- SECURITY CONSTRAINTS:
-- 1. NO CASCADE SHORTCUTS: Every dependent policy is explicitly dropped by name.
-- 2. NO BROAD PROJECT EXPOSURE: Reverts to strictly owner-scoped project access.
--    Does NOT restore `USING (true)` or broad authenticated project viewing.
-- 3. NO PRIVILEGE ESCALATION: Table-level UPDATE remains REVOKED on public.users.
--    Only column-level update on safe profile fields remains active.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. Explicitly drop all Phase 0 v2 policies by name (NO CASCADE)
-- ------------------------------------------------------------------------------
-- Drop public.users policies:
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_own_policy" ON public.users;
DROP POLICY IF EXISTS "users_admin_manage_policy" ON public.users;

-- Drop public.projects policies:
DROP POLICY IF EXISTS "projects_select_policy" ON public.projects;
DROP POLICY IF EXISTS "projects_insert_policy" ON public.projects;
DROP POLICY IF EXISTS "projects_update_owner_policy" ON public.projects;
DROP POLICY IF EXISTS "projects_update_admin_policy" ON public.projects;
DROP POLICY IF EXISTS "projects_delete_policy" ON public.projects;


-- ------------------------------------------------------------------------------
-- 2. Drop internal function and schema without CASCADE
-- ------------------------------------------------------------------------------
-- Since all dependent policies were explicitly dropped above, CASCADE is not needed.
DROP FUNCTION IF EXISTS internal.is_admin();
DROP SCHEMA IF EXISTS internal;


-- ------------------------------------------------------------------------------
-- 3. Restore secure baseline policies (strictly owner-scoped)
-- ------------------------------------------------------------------------------
-- Users can only read and update their own profile:
CREATE POLICY "users_read_own_rollback" ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "users_insert_own_rollback" ON public.users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own_rollback" ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Projects: STRICTLY owner-scoped. Zero anonymous exposure, zero cross-user snooping.
CREATE POLICY "projects_read_owner_rollback" ON public.projects 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "projects_insert_owner_rollback" ON public.projects 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects_update_owner_rollback" ON public.projects 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects_delete_owner_rollback" ON public.projects 
  FOR DELETE 
  USING (auth.uid() = user_id);


-- ------------------------------------------------------------------------------
-- 4. Maintain privilege lockdown (Do NOT grant broad table-level UPDATE)
-- ------------------------------------------------------------------------------
-- Keeps table-level UPDATE revoked from authenticated and anon
REVOKE UPDATE ON TABLE public.users FROM PUBLIC, anon, authenticated;

-- Grants column-level update ONLY on safe user attributes
GRANT UPDATE (
  name, 
  full_name, 
  wallet_address, 
  kyc_document, 
  additional_data
) ON TABLE public.users TO authenticated;


-- ------------------------------------------------------------------------------
-- 5. Drop role check constraint if needed
-- ------------------------------------------------------------------------------
ALTER TABLE public.users 
  DROP CONSTRAINT IF EXISTS users_role_check;

-- Columns is_admin and is_disabled are left dormant (safe DEFAULT false) to avoid
-- destructive data deletion during emergency rollback.

COMMIT;
