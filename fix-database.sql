-- Fix database schema mismatch for request_id
-- This script fixes the enrichment_results table to use text instead of uuid for request_id

-- Drop the existing foreign key constraint
ALTER TABLE public.enrichment_results 
DROP CONSTRAINT IF EXISTS enrichment_results_request_id_fkey;

-- Change the request_id column from uuid to text
ALTER TABLE public.enrichment_results 
ALTER COLUMN request_id TYPE text;

-- Add the foreign key constraint back, referencing the request_id column instead of id
ALTER TABLE public.enrichment_results 
ADD CONSTRAINT enrichment_results_request_id_fkey 
FOREIGN KEY (request_id) REFERENCES public.enrichment_requests(request_id);

-- Add an index on request_id for better performance
CREATE INDEX IF NOT EXISTS idx_enrichment_results_request_id 
ON public.enrichment_results(request_id); 