-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_img TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tags TEXT[] NOT NULL, -- Array of technology tags
    status TEXT DEFAULT 'active',
    link TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all projects
CREATE POLICY "Allow public read access" 
    ON public.projects 
    FOR SELECT 
    USING (true);

-- Policy: Allow authenticated users to insert their own projects
CREATE POLICY "Allow authenticated users to insert" 
    ON public.projects 
    FOR INSERT 
    WITH CHECK (auth.uid() = created_by);

-- Policy: Allow users to update their own projects
CREATE POLICY "Allow users to update own projects" 
    ON public.projects 
    FOR UPDATE 
    USING (auth.uid() = created_by);

-- Policy: Allow users to delete their own projects
CREATE POLICY "Allow users to delete own projects" 
    ON public.projects 
    FOR DELETE 
    USING (auth.uid() = created_by);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_tags ON public.projects USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);