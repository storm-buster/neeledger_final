-- ==============================================================================
-- NeeLedger — Phase 0 Pre-Migration Security Diagnostics (READ-ONLY)
-- ==============================================================================
-- PURPOSE:
-- Execute these read-only inspection queries in the Supabase SQL Editor BEFORE
-- applying any schema or RLS changes.
--
-- STRICT OPERATIONAL RULES:
-- 1. This script is strictly READ-ONLY. It contains no DDL, DML, or GRANT statements.
-- 2. If Query 1 returns ANY user with a role not in ('Project Developer',
--    'Project Proponent', 'Trader') or NULL, the migration will halt.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Inspect existing role values, distributions, and illegal strings
-- ------------------------------------------------------------------------------
-- Identifies legacy role strings (e.g., 'Admin', 'admin', lowercase strings,
-- or NULLs) that will trigger the migration pre-check exception.
SELECT 
    COALESCE(role, '<NULL>') AS role_value,
    COUNT(*) AS user_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage
FROM public.users
GROUP BY role
ORDER BY user_count DESC;

-- Identify exact user accounts with invalid or NULL roles:
SELECT id, email, name, role, member_since
FROM public.users
WHERE role IS NULL 
   OR role NOT IN ('Project Developer', 'Project Proponent', 'Trader')
ORDER BY member_since ASC;


-- ------------------------------------------------------------------------------
-- 2. Inspect existing columns, nullability, and constraints on public.users
-- ------------------------------------------------------------------------------
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- Check existing constraints:
SELECT 
    conname AS constraint_name, 
    contype AS constraint_type, 
    pg_get_constraintdef(c.oid) AS definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE n.nspname = 'public' 
  AND conrelid = 'public.users'::regclass;


-- ------------------------------------------------------------------------------
-- 3. Catalog ALL active RLS policies on public.users and public.projects
-- ------------------------------------------------------------------------------
-- Identifies all policies that will be dropped by the dynamic policy cleanup.
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual AS using_expression,
    with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'projects')
ORDER BY tablename, cmd, policyname;


-- ------------------------------------------------------------------------------
-- 4. Inspect current table-level and column-level privileges
-- ------------------------------------------------------------------------------
-- Verifies whether anon or authenticated currently hold broad table-level UPDATE.
SELECT 
    grantee, 
    table_schema, 
    table_name, 
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'projects')
  AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY table_name, grantee, privilege_type;

-- Inspect existing column-level privileges:
SELECT 
    grantee, 
    table_name, 
    column_name, 
    privilege_type
FROM information_schema.column_privileges
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'projects')
  AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, column_name;


-- ------------------------------------------------------------------------------
-- 5. Inspect project status distribution and ownership integrity
-- ------------------------------------------------------------------------------
-- Verifies that project statuses conform to expected workflow strings:
-- ('pending', 'Active', 'Completed', 'under_validation', 'sanctioned',
--  'under_verification', 'verification_in_progress', 'credits_released')
SELECT 
    COALESCE(status, '<NULL>') AS project_status,
    COUNT(*) AS count
FROM public.projects
GROUP BY status
ORDER BY count DESC;

-- Check for orphaned project records (user_id IS NULL or invalid):
SELECT 
    COUNT(*) AS total_projects,
    COUNT(user_id) AS projects_with_owner,
    COUNT(*) - COUNT(user_id) AS orphaned_projects
FROM public.projects;


-- ------------------------------------------------------------------------------
-- 6. Potential admin candidates
-- ------------------------------------------------------------------------------
SELECT id, email, name, role, member_since
FROM public.users
WHERE email ILIKE '%admin%' 
   OR email ILIKE '%spearsh%'
ORDER BY member_since ASC;
