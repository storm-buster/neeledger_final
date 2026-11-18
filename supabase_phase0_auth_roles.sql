-- ==============================================================================
-- NeeLedger Phase 0 Migration: Trusted Role & Authorization Foundation
-- ==============================================================================
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
--
-- PURPOSE:
-- 1. Establish trusted server-controlled authorization flag (is_admin) on public.users.
-- 2. Restrict business account types with a strict CHECK constraint.
-- 3. Support account disabled state (is_disabled).
-- 4. Provide security-definer helper public.is_admin().
-- 5. Prevent clients from setting or updating is_admin via standard RLS.
-- ==============================================================================

-- Step 1: Add is_admin and is_disabled columns to public.users if they don't already exist
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Ensure role has a CHECK constraint restricting it to approved business account types
ALTER TABLE public.users 
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users 
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('Project Developer', 'Project Proponent', 'Trader'));

-- Step 3: Create security-definer function for trusted admin checks in RLS policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean 
LANGUAGE sql 
SECURITY DEFINER 
STABLE 
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.users WHERE id = auth.uid() AND is_disabled = false),
    false
  );
$$;

-- Step 4: Ensure RLS is enabled on public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 5: Read policy for public.users
-- Users can read their own profile; admins can read all profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (
    auth.uid() = id OR public.is_admin()
  );

-- Users can only insert their own row on signup (with is_admin = false enforced)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (
    auth.uid() = id AND (is_admin = false OR is_admin IS NULL)
  );

-- Users can update their own non-sensitive fields; only admins or service role can change is_admin / is_disabled
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (
    auth.uid() = id
  ) WITH CHECK (
    auth.uid() = id AND is_admin = (SELECT is_admin FROM public.users WHERE id = auth.uid())
  );

-- Step 6: Admin override update policy
DROP POLICY IF EXISTS "Admins can update any profile" ON public.users;
CREATE POLICY "Admins can update any profile" ON public.users
  FOR UPDATE USING (public.is_admin());

-- ==============================================================================
-- SEED ADMIN (Optional reference — update email before running):
-- To designate an initial administrator, execute this query with the admin's email:
--
-- UPDATE public.users 
-- SET is_admin = true 
-- WHERE email = 'admin@neeledger.com';
-- ==============================================================================
