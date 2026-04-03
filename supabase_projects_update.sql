-- Update projects table with new columns
-- Run this in Supabase SQL Editor

-- Add new columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS coordinates TEXT,
ADD COLUMN IF NOT EXISTS state_name TEXT,
ADD COLUMN IF NOT EXISTS project_docs TEXT[];

-- Optional: Drop old columns if they're not needed
-- ALTER TABLE public.projects DROP COLUMN IF EXISTS latitude;
-- ALTER TABLE public.projects DROP COLUMN IF EXISTS longitude;
-- ALTER TABLE public.projects DROP COLUMN IF EXISTS region;
-- ALTER TABLE public.projects DROP COLUMN IF EXISTS country;

-- Update RLS policy to allow users to read all projects and write their own
DROP POLICY IF EXISTS "Users can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

CREATE POLICY "Anyone can view projects" ON public.projects
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
    FOR DELETE USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
