-- Fix RLS policies to allow service role access
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own requests" ON public.enrichment_requests;
DROP POLICY IF EXISTS "Users can view own requests" ON public.enrichment_requests;
DROP POLICY IF EXISTS "Users can update own requests" ON public.enrichment_requests;

-- Create new policies that allow service role
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

-- Do the same for enrichment_results
DROP POLICY IF EXISTS "Users can insert own results" ON public.enrichment_results;
DROP POLICY IF EXISTS "Users can view own results" ON public.enrichment_results;

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