-- Blue Carbon MRV Backend - Supabase Database Schema
-- Run this in Supabase Dashboard → SQL Editor

-- ==================== PROJECTS TABLE ====================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    region TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist (for existing tables)
DO $$ 
BEGIN
    -- Add region column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects' 
        AND column_name = 'region'
    ) THEN
        -- Add as nullable first
        ALTER TABLE public.projects ADD COLUMN region TEXT;
        -- Set default value for existing rows
        UPDATE public.projects SET region = 'Unknown' WHERE region IS NULL;
        -- Now make it NOT NULL (only if no NULL values remain)
        ALTER TABLE public.projects ALTER COLUMN region SET NOT NULL;
        ALTER TABLE public.projects ALTER COLUMN region SET DEFAULT 'Unknown';
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.projects ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        -- Set existing rows to created_at value
        UPDATE public.projects SET updated_at = COALESCE(created_at, NOW()) WHERE updated_at IS NULL;
    END IF;
END $$;

-- ==================== SUBMISSIONS TABLE ====================
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'uploaded', -- uploaded, processing, verified, rejected, error
    metadata JSONB DEFAULT '{}',
    
    -- ML Model Results
    mangrove_score DOUBLE PRECISION,
    temporal_score DOUBLE PRECISION,
    biomass_estimate DOUBLE PRECISION,
    biomass_lower_bound DOUBLE PRECISION,
    biomass_upper_bound DOUBLE PRECISION,
    carbon_estimate DOUBLE PRECISION,
    co2_equivalent DOUBLE PRECISION,
    confidence_interval DOUBLE PRECISION,
    model_version TEXT,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- ==================== TEMPORAL HISTORY TABLE ====================
CREATE TABLE IF NOT EXISTS public.temporal_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    previous_submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    current_submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    growth_detected BOOLEAN NOT NULL,
    growth_score DOUBLE PRECISION NOT NULL,
    change_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== MODEL REGISTRY TABLE ====================
CREATE TABLE IF NOT EXISTS public.model_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name TEXT NOT NULL,
    version TEXT NOT NULL,
    hash TEXT NOT NULL,
    deployment_date TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    UNIQUE(model_name, version)
);

-- ==================== INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_submissions_project_id ON public.submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_timestamp ON public.submissions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_temporal_history_project_id ON public.temporal_history(project_id);
CREATE INDEX IF NOT EXISTS idx_temporal_history_current_submission ON public.temporal_history(current_submission_id);

-- ==================== ROW LEVEL SECURITY ====================
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temporal_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_registry ENABLE ROW LEVEL SECURITY;

-- Permissive policies for authenticated users
CREATE POLICY "Allow authenticated users to read projects" ON public.projects
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to create projects" ON public.projects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update own projects" ON public.projects
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read submissions" ON public.submissions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to create submissions" ON public.submissions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update submissions" ON public.submissions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read temporal history" ON public.temporal_history
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to create temporal history" ON public.temporal_history
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read model registry" ON public.model_registry
    FOR SELECT USING (true);

CREATE POLICY "Allow service role to manage model registry" ON public.model_registry
    FOR ALL USING (auth.role() = 'service_role');

-- ==================== STORAGE BUCKET ====================
-- Create storage bucket for project submissions
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-submissions', 'project-submissions', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Allow authenticated uploads" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'project-submissions' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Allow public reads" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'project-submissions'
    );

-- ==================== FUNCTIONS ====================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== VIEWS ====================
-- View for verified submissions with project info
CREATE OR REPLACE VIEW verified_submissions_view AS
SELECT 
    s.id,
    s.project_id,
    p.name as project_name,
    p.region,
    s.image_url,
    s.timestamp,
    s.mangrove_score,
    s.biomass_estimate,
    s.carbon_estimate,
    s.co2_equivalent,
    s.model_version,
    s.processed_at
FROM public.submissions s
JOIN public.projects p ON s.project_id = p.id
WHERE s.status = 'verified';
