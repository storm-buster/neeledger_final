-- ==============================================================================
-- NeeLedger — Hardened Phase 0 Migration (v2 - Final Security Revision)
-- ==============================================================================
-- TARGET: Supabase PostgreSQL
-- STATUS: DRAFT FOR REVIEW (DO NOT EXECUTE WITHOUT HUMAN APPROVAL)
-- PREREQUISITE:
-- 1. Execute `supabase_phase0_diagnostic.sql` first.
-- 2. Verify all user accounts possess approved roles ('Project Developer',
--    'Project Proponent', 'Trader'). If any record has NULL or an unknown role,
--    Step 2 of this migration will intentionally halt the transaction.
--
-- SECURITY ARCHITECTURE:
-- 1. Unexposed Admin Helper: `internal.is_admin()` lives in a non-exposed
--    `internal` schema, preventing direct RPC execution over PostgREST while
--    serving PostgreSQL RLS policies safely.
-- 2. Search Path Sanitization: Fixed empty `search_path = ''` with fully qualified
--    schema references (`public.users`, `auth.uid()`) to eliminate CWE-426.
-- 3. Dynamic RLS Sanitization: Explicitly queries `pg_policies` to drop 100% of
--    pre-existing policies on `users` and `projects`, eliminating permissive OR
--    chaining bypasses.
-- 4. Defense-in-Depth Column Lockdown: Explicitly revokes table-level UPDATE and
--    sensitive column UPDATE from `authenticated` and `anon`. Selective column
--    grants are given ONLY on non-sensitive, user-managed attributes.
-- 5. Non-Destructive Constraint Safety: Halts safely via an assertion check if
--    unverified legacy role strings exist, preventing silent data corruption.
-- 6. Strictly Scoped Project Visibility: Private by default. Anonymous users have
--    zero read access. Authenticated users only see published marketplace rows
--    ('Active', 'Completed', 'credits_released'). Workflow rows remain private.
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- STEP 1: Add Columns with Safe Backfill & NOT NULL Enforcement
-- ==============================================================================

-- 1.1 Add columns if not present
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN DEFAULT false;

-- 1.2 Backfill existing rows (guarantee zero NULLs before setting NOT NULL)
UPDATE public.users 
SET is_admin = false 
WHERE is_admin IS NULL;

UPDATE public.users 
SET is_disabled = false 
WHERE is_disabled IS NULL;

-- 1.3 Enforce NOT NULL constraints and defaults
ALTER TABLE public.users 
  ALTER COLUMN is_admin SET NOT NULL,
  ALTER COLUMN is_admin SET DEFAULT false,
  ALTER COLUMN is_disabled SET NOT NULL,
  ALTER COLUMN is_disabled SET DEFAULT false;


-- ==============================================================================
-- STEP 2: Strict Pre-Check & Role Constraint Validation (Zero Silent Rewrite)
-- ==============================================================================

-- 2.1 Pre-check assertion: Halt transaction if unapproved or NULL roles exist.
-- DO NOT silently rewrite unknown legacy data.
DO $$
DECLARE
    invalid_count INTEGER;
    invalid_samples TEXT;
BEGIN
    SELECT COUNT(*), string_agg(DISTINCT quote_literal(COALESCE(role, '<NULL>')), ', ')
    INTO invalid_count, invalid_samples
    FROM public.users
    WHERE role IS NULL 
       OR role NOT IN ('Project Developer', 'Project Proponent', 'Trader');

    IF invalid_count > 0 THEN
        RAISE EXCEPTION 
            'MIGRATION HALTED: Found % user record(s) with invalid role values (%). Review supabase_phase0_diagnostic.sql and resolve with stakeholders before re-running.',
            invalid_count, invalid_samples;
    END IF;
END $$;

-- 2.2 Drop existing check constraint if present
ALTER TABLE public.users 
  DROP CONSTRAINT IF EXISTS users_role_check;

-- 2.3 Attach constraint using NOT VALID pattern, then validate
ALTER TABLE public.users 
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('Project Developer', 'Project Proponent', 'Trader'))
  NOT VALID;

ALTER TABLE public.users 
  VALIDATE CONSTRAINT users_role_check;


-- ==============================================================================
-- STEP 3: Hardened Authorization Function in Private Schema
-- ==============================================================================

-- 3.1 Create internal schema (isolated from PostgREST API exposure)
CREATE SCHEMA IF NOT EXISTS internal;

-- Ensure schema permissions are locked down
REVOKE ALL ON SCHEMA internal FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA internal TO postgres, service_role, authenticated;

-- 3.2 Create internal.is_admin() with empty search_path
CREATE OR REPLACE FUNCTION internal.is_admin()
RETURNS boolean 
LANGUAGE sql 
SECURITY DEFINER 
STABLE 
SET search_path = ''
AS $$
  SELECT COALESCE(
    (
      SELECT u.is_admin 
      FROM public.users AS u 
      WHERE u.id = auth.uid() 
        AND u.is_disabled = false
    ),
    false
  );
$$;

-- 3.3 Assign ownership to database superuser
ALTER FUNCTION internal.is_admin() OWNER TO postgres;

-- 3.4 Restrict function execution
REVOKE ALL ON FUNCTION internal.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION internal.is_admin() TO authenticated, service_role;

COMMENT ON FUNCTION internal.is_admin() IS 
  'Private RLS helper. Evaluates true only for active, non-disabled admin records in public.users. Not exposed to PostgREST HTTP API.';


-- ==============================================================================
-- STEP 4: Comprehensive Dynamic Policy Cleanup (Eliminate Permissive OR Hazards)
-- ==============================================================================

-- 4.1 Dynamically drop every existing policy on public.users and public.projects.
-- This guarantees no legacy policy remains to combine with OR and bypass security.
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename IN ('users', 'projects')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Ensure RLS remains enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;


-- ==============================================================================
-- STEP 5: Table-Level & Column-Level Privilege Lockdown on public.users
-- ==============================================================================

-- 5.1 Revoke ALL table-level UPDATE and DELETE privileges
REVOKE UPDATE, DELETE ON TABLE public.users FROM PUBLIC, anon, authenticated;
REVOKE INSERT ON TABLE public.users FROM PUBLIC, anon;

-- 5.2 Explicitly remove any prior column-level grants on sensitive columns
REVOKE UPDATE (
  id, 
  email, 
  role, 
  credits, 
  kyc_status, 
  is_admin, 
  is_disabled, 
  member_since
) ON TABLE public.users FROM PUBLIC, anon, authenticated;

-- 5.3 Grant table-level SELECT and INSERT to authenticated
GRANT SELECT, INSERT ON TABLE public.users TO authenticated;

-- 5.4 Grant column-level UPDATE ONLY on verified user-managed fields.
-- Business account type (role), credits, kyc_status, and admin flags are EXCLUDED.
GRANT UPDATE (
  name, 
  full_name, 
  wallet_address, 
  kyc_document, 
  additional_data
) ON TABLE public.users TO authenticated;


-- ==============================================================================
-- STEP 6: Hardened Row Level Security Policies for public.users
-- ==============================================================================

-- 6.1 SELECT: User reads their own profile; Admin reads all profiles (KYC review)
CREATE POLICY "users_select_policy" ON public.users
  FOR SELECT 
  USING (
    auth.uid() = id 
    OR internal.is_admin()
  );

-- 6.2 INSERT: User creates own profile during signup.
-- is_admin and is_disabled must evaluate to false.
CREATE POLICY "users_insert_policy" ON public.users
  FOR INSERT 
  WITH CHECK (
    auth.uid() = id 
    AND (is_admin = false OR is_admin IS NULL)
    AND (is_disabled = false OR is_disabled IS NULL)
  );

-- 6.3 UPDATE (Regular User): Can update own row if not disabled.
CREATE POLICY "users_update_own_policy" ON public.users
  FOR UPDATE 
  USING (
    auth.uid() = id 
    AND is_disabled = false
  )
  WITH CHECK (
    auth.uid() = id 
    AND is_admin = false
  );

-- 6.4 ALL (Admins): System administrators have full management access.
CREATE POLICY "users_admin_manage_policy" ON public.users
  FOR ALL 
  USING (internal.is_admin())
  WITH CHECK (internal.is_admin());


-- ==============================================================================
-- STEP 7: Hardened Row Level Security Policies for public.projects
-- ==============================================================================

-- 7.1 SELECT: Strict private-by-default access.
-- - Project Proponent reads their own projects (including draft, pending, workflow).
-- - Admins read all projects (validation, verification, sanctioning).
-- - Authenticated users ONLY read published marketplace rows:
--   ('Active', 'Completed', 'credits_released').
-- - Anonymous visitors have ZERO read access.
CREATE POLICY "projects_select_policy" ON public.projects
  FOR SELECT 
  USING (
    -- Owner access (private)
    auth.uid() = user_id 
    -- Administrative access (workflow audit)
    OR internal.is_admin() 
    -- Public marketplace access (authenticated only, published statuses only)
    OR (
      auth.role() = 'authenticated' 
      AND status IN ('Active', 'Completed', 'credits_released')
    )
  );

-- 7.2 INSERT: Authenticated users can only create projects assigned to their own ID.
CREATE POLICY "projects_insert_policy" ON public.projects
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id 
    AND auth.role() = 'authenticated'
  );

-- 7.3 UPDATE (Owner): Proponents can update their own project records.
CREATE POLICY "projects_update_owner_policy" ON public.projects
  FOR UPDATE 
  USING (
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() = user_id
  );

-- 7.4 UPDATE (Admin): Admins can update workflow fields across all projects.
CREATE POLICY "projects_update_admin_policy" ON public.projects
  FOR UPDATE 
  USING (
    internal.is_admin()
  )
  WITH CHECK (
    internal.is_admin()
  );

-- 7.5 DELETE: Owners can delete own projects; Admins can delete any project.
CREATE POLICY "projects_delete_policy" ON public.projects
  FOR DELETE 
  USING (
    auth.uid() = user_id 
    OR internal.is_admin()
  );


-- ==============================================================================
-- STEP 8: Administrative Provisioning Procedure (Instructional Reference)
-- ==============================================================================
-- Admin credentials must NEVER be provisioned via frontend or client API.
-- Execute manually in the Supabase SQL Editor with a verified email:
--
-- UPDATE public.users 
-- SET is_admin = true 
-- WHERE email = 'verified.admin@neeledger.com';
-- ==============================================================================

COMMIT;
