-- Fix users table: Add full_name column
-- Run this in Supabase SQL Editor

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Optionally copy existing name to full_name
UPDATE public.users SET full_name = name WHERE full_name IS NULL;
