-- Fix RLS policies to allow service role access
-- Run this in your Supabase SQL Editor

-- QUICK FIX: Disable RLS for profiles table temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits DISABLE ROW LEVEL SECURITY;

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

-- Add RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id OR 
  auth.role() = 'service_role'
);

CREATE POLICY "Users can insert own profile" ON public.profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() = id OR 
  auth.role() = 'service_role'
);

CREATE POLICY "Users can update own profile" ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = id OR 
  auth.role() = 'service_role'
);

-- Add RLS policies for user_credits table
DROP POLICY IF EXISTS "Users can view own credits" ON public.user_credits;
DROP POLICY IF EXISTS "Users can insert own credits" ON public.user_credits;
DROP POLICY IF EXISTS "Users can update own credits" ON public.user_credits;

CREATE POLICY "Users can view own credits" ON public.user_credits 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  auth.role() = 'service_role'
);

CREATE POLICY "Users can insert own credits" ON public.user_credits 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  auth.role() = 'service_role'
);

CREATE POLICY "Users can update own credits" ON public.user_credits 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  auth.role() = 'service_role'
); 