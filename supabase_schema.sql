CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    wallet_address TEXT,
    credits INTEGER DEFAULT 0,
    role TEXT DEFAULT 'Project Proponent',
    kyc_status TEXT DEFAULT 'Pending',
    kyc_document TEXT,
    member_since TIMESTAMPTZ DEFAULT NOW(),
    additional_data JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    country TEXT DEFAULT 'India',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    region TEXT DEFAULT 'Unknown',
    additional_data JSONB DEFAULT '{}',
    documents JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
    file_urls TEXT[] DEFAULT '{}',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    detections JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT DEFAULT 'uploaded',
    metadata JSONB DEFAULT '{}',
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    count INTEGER,
    read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    credits INTEGER,
    status TEXT DEFAULT 'pending',
    additional_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
