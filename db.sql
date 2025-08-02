-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.enrichment_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  request_id text NOT NULL UNIQUE,
  request_type text NOT NULL CHECK (request_type = ANY (ARRAY['individual'::text, 'file'::text])),
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text])),
  enrichment_type text NOT NULL CHECK (enrichment_type = ANY (ARRAY['email'::text, 'phone'::text, 'both'::text])),
  input_data jsonb NOT NULL,
  results jsonb,
  credits_used integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT enrichment_requests_pkey PRIMARY KEY (id),
  CONSTRAINT enrichment_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.enrichment_results (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  request_id text NOT NULL,
  user_id uuid NOT NULL,
  first_name text,
  last_name text,
  company text,
  company_domain text,
  linkedin_url text,
  email_address text,
  phone_number text,
  contact_email_address text,
  contact_phone_number text,
  source text,
  enriched boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT enrichment_results_pkey PRIMARY KEY (id),
  CONSTRAINT enrichment_results_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.enrichment_requests(request_id),
  CONSTRAINT enrichment_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  first_name text,
  last_name text,
  company text,
  stripe_customer_id text,
  stripe_current_period_end timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_credits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  total_credits integer DEFAULT 50,
  used_credits integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_credits_pkey PRIMARY KEY (id),
  CONSTRAINT user_credits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);