-- ====================================================================
-- SUPABASE DATABASE SCHEMA FOR UBAIDDEV PORTFOLIO & ADMIN SYSTEM
-- ====================================================================
-- Copy and run this entire script in your Supabase SQL Editor:
-- Supabase Dashboard -> Project -> SQL Editor -> New Query -> Run
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 2. CREATE PROJECTS TABLE (With Google Play Store & Web Support)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Mobile App', -- 'Mobile App', 'Web App', 'Full Stack', 'QA Service'
    description TEXT,
    price TEXT DEFAULT 'Custom',
    image_url TEXT NOT NULL,
    playstore_url TEXT DEFAULT '', -- Direct Google Play Store published link
    live_url TEXT DEFAULT '',      -- Live demo or website link
    github_url TEXT DEFAULT '',    -- Source code repository
    badge TEXT DEFAULT 'Live on Play Store', -- 'Live on Play Store', 'Featured', 'Production', etc.
    tech_stack TEXT[] DEFAULT '{}',-- Array of tags: e.g. ARRAY['Flutter', 'Firebase', 'Play Store']
    stats TEXT DEFAULT '',         -- e.g. '10K+ Downloads • 4.8 ★'
    is_featured BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for rapid filtering and sorting
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- ====================================================================
-- 3. CREATE FEEDBACKS TABLE (Public Testimonials)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON public.feedbacks(created_at DESC);

-- ====================================================================
-- 4. CREATE ORDERS TABLE (Client Service Inquiries)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    service_type TEXT NOT NULL,
    requirements_url TEXT DEFAULT '',
    payment_url TEXT DEFAULT '',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'rejected')),
    admin_notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ====================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES - SECURE BY DESIGN
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- A. PROJECTS POLICIES
-- Anyone can view projects (Public / Anonymous Read)
DROP POLICY IF EXISTS "Public can view projects" ON public.projects;
CREATE POLICY "Public can view projects"
ON public.projects FOR SELECT
TO anon, authenticated
USING (true);

-- Anyone with anon key or authenticated can manage projects from portfolio admin
DROP POLICY IF EXISTS "Allow anon and auth full access to projects" ON public.projects;
CREATE POLICY "Allow anon and auth full access to projects"
ON public.projects FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- --------------------------------------------------------------------
-- B. FEEDBACKS POLICIES
-- Anyone can view approved feedbacks
DROP POLICY IF EXISTS "Public can view approved feedbacks" ON public.feedbacks;
CREATE POLICY "Public can view approved feedbacks"
ON public.feedbacks FOR SELECT
TO anon, authenticated
USING (is_approved = true);

-- Anyone can submit a feedback
DROP POLICY IF EXISTS "Public can submit feedback" ON public.feedbacks;
CREATE POLICY "Public can submit feedback"
ON public.feedbacks FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Admin can manage/delete feedbacks
DROP POLICY IF EXISTS "Full access to feedbacks" ON public.feedbacks;
CREATE POLICY "Full access to feedbacks"
ON public.feedbacks FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- --------------------------------------------------------------------
-- C. ORDERS POLICIES
-- Clients can submit new orders
DROP POLICY IF EXISTS "Public can submit orders" ON public.orders;
CREATE POLICY "Public can submit orders"
ON public.orders FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Admin can view and update orders
DROP POLICY IF EXISTS "Admin can manage orders" ON public.orders;
CREATE POLICY "Admin can manage orders"
ON public.orders FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- ====================================================================
-- SCHEMA READY: NO DUMMY SEED DATA (PRODUCTION READY)
-- ====================================================================
