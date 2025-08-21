import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (for API routes)
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Database types
export interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  stripe_customer_id: string | null;
  current_period_end: number | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnrichmentRequest {
  id: string;
  user_id: string;
  request_id: string;
  request_type: 'individual' | 'file';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  enrichment_type: 'email' | 'phone' | 'both';
  input_data: any;
  results: any;
  credits_used: number;
  created_at: string;
  updated_at: string;
}

export interface EnrichmentResult {
  id: string;
  request_id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  company_domain: string | null;
  linkedin_url: string | null;
  email_address: string | null;
  phone_number: string | null;
  contact_email_address: string | null;
  contact_phone_number: string | null;
  source: string | null;
  enriched: boolean;
  created_at: string;
}

export interface UserCredits {
  id: string;
  user_id: string;
  total_credits: number;
  used_credits: number;
  created_at: string;
  updated_at: string;
}
