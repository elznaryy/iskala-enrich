-- Complete database setup and fix script
-- Run this in your Supabase SQL Editor

-- 1. Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can insert own requests" ON public.enrichment_requests;
DROP POLICY IF EXISTS "Users can view own requests" ON public.enrichment_requests;
DROP POLICY IF EXISTS "Users can update own requests" ON public.enrichment_requests;
DROP POLICY IF EXISTS "Users can insert own results" ON public.enrichment_results;
DROP POLICY IF EXISTS "Users can view own results" ON public.enrichment_results;

-- 2. Create new policies that allow service role access
CREATE POLICY "Users can insert own requests" ON public.enrichment_requests 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  auth.role() = 'service_role'
);

CREATE POLICY "Users can view own requests" ON public.enrichment_requests 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  auth.role() = 'service_role'
);

CREATE POLICY "Users can update own requests" ON public.enrichment_requests 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  auth.role() = 'service_role'
);

CREATE POLICY "Users can insert own results" ON public.enrichment_results 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  auth.role() = 'service_role'
);

CREATE POLICY "Users can view own results" ON public.enrichment_results 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  auth.role() = 'service_role'
);

-- 3. Make sure RLS is enabled on all tables
ALTER TABLE public.enrichment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrichment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Add policies for user_credits and profiles
DROP POLICY IF EXISTS "Users can view own credits" ON public.user_credits;
DROP POLICY IF EXISTS "Users can update own credits" ON public.user_credits;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own credits" ON public.user_credits 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  auth.role() = 'service_role'
);

CREATE POLICY "Users can update own credits" ON public.user_credits 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  auth.role() = 'service_role'
);

CREATE POLICY "Users can view own profile" ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id OR 
  auth.role() = 'service_role'
);

CREATE POLICY "Users can update own profile" ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = id OR 
  auth.role() = 'service_role'
);

-- 5. Verify the tables exist and have correct structure
-- This will show the current table structure
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('enrichment_requests', 'enrichment_results', 'user_credits', 'profiles')
ORDER BY table_name, ordinal_position; 