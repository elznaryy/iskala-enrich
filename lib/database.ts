import { supabase } from './supabase'
import { EnrichmentRequest, EnrichmentResult, UserCredits } from './supabase'

// Enrichment Requests
export async function createEnrichmentRequest(data: {
  user_id: string
  request_id: string
  request_type: 'individual' | 'file'
  enrichment_type: 'email' | 'phone' | 'both'
  input_data: any
}) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Supabase is not configured')
    }

    const { data: request, error } = await supabase
      .from('enrichment_requests')
      .insert({
        user_id: data.user_id,
        request_id: data.request_id,
        request_type: data.request_type,
        enrichment_type: data.enrichment_type,
        input_data: data.input_data,
        status: 'pending'
      })
      .select()
      .single()

    return { data: request, error }
  } catch (error) {
    console.error('Database error in createEnrichmentRequest:', error)
    return { data: null, error }
  }
}

export async function updateEnrichmentRequest(requestId: string, updates: Partial<EnrichmentRequest>) {
  const { data, error } = await supabase
    .from('enrichment_requests')
    .update(updates)
    .eq('request_id', requestId)
    .select()
    .single()

  return { data, error }
}

export async function getUserEnrichmentRequests(userId: string) {
  try {
    const { data, error } = await supabase
      .from('enrichment_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return { data, error }
  } catch (error) {
    console.error('Exception in getUserEnrichmentRequests:', error);
    return { data: null, error }
  }
}

// Enrichment Results
export async function createEnrichmentResult(data: {
  request_id: string
  user_id: string
  first_name?: string
  last_name?: string
  company?: string
  company_domain?: string
  linkedin_url?: string
  email_address?: string
  phone_number?: string
  contact_email_address?: string
  contact_phone_number?: string
  source?: string
  enriched: boolean
}) {
  const { data: result, error } = await supabase
    .from('enrichment_results')
    .insert(data)
    .select()
    .single()

  return { data: result, error }
}

export async function getEnrichmentResults(requestId: string) {
  try {
    console.log('🔍 Database: Fetching results for request ID:', requestId);
    
    const { data, error } = await supabase
      .from('enrichment_results')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('❌ Database error in getEnrichmentResults:', error);
    } else {
      console.log('✅ Database: Found', data?.length || 0, 'results for request', requestId);
    }

    return { data, error }
  } catch (error) {
    console.error('❌ Exception in getEnrichmentResults:', error);
    return { data: null, error }
  }
}

export async function getUserResults(userId: string) {
  const { data, error } = await supabase
    .from('enrichment_results')
    .select(`
      *,
      enrichment_requests (
        request_id,
        request_type,
        enrichment_type,
        status,
        created_at
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data, error }
}

// User Credits
export async function getUserCredits(userId: string) {
  const { data, error } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single()

  return { data, error }
}

export async function updateUserCredits(userId: string, creditsUsed: number) {
  const { data, error } = await supabase
    .from('user_credits')
    .update({ used_credits: creditsUsed })
    .eq('user_id', userId)
    .select()
    .single()

  return { data, error }
}

export async function incrementUserCredits(userId: string, creditsToAdd: number) {
  // First get current credits
  const { data: currentCredits, error: fetchError } = await supabase
    .from('user_credits')
    .select('used_credits')
    .eq('user_id', userId)
    .single()

  if (fetchError) {
    return { data: null, error: fetchError }
  }

  // Update with new total
  const { data, error } = await supabase
    .from('user_credits')
    .update({ used_credits: (currentCredits.used_credits || 0) + creditsToAdd })
    .eq('user_id', userId)
    .select()
    .single()

  return { data, error }
}

// Bulk operations
export async function saveBulkResults(results: any[], requestId: string, userId: string) {
  const enrichedResults = results.map(result => ({
    request_id: requestId,
    user_id: userId,
    first_name: result.first_name || null,
    last_name: result.last_name || null,
    company: result.company || null,
    company_domain: result.company_domain || null,
    linkedin_url: result.linkedin_url || null,
    email_address: result.email_address || null,
    phone_number: result.phone_number || null,
    contact_email_address: result.contact_email_address || null,
    contact_phone_number: result.contact_phone_number || null,
    source: result.source || null,
    enriched: result.enriched || false
  }))

  const { data, error } = await supabase
    .from('enrichment_results')
    .insert(enrichedResults)
    .select()

  return { data, error }
}

// Analytics
export async function getUserStats(userId: string) {
  const { data: requests, error: requestsError } = await supabase
    .from('enrichment_requests')
    .select('status, enrichment_type, credits_used')
    .eq('user_id', userId)

  const { data: credits, error: creditsError } = await supabase
    .from('user_credits')
    .select('total_credits, used_credits')
    .eq('user_id', userId)
    .single()

  if (requestsError || creditsError) {
    return { data: null, error: requestsError || creditsError }
  }

  const stats = {
    totalRequests: requests?.length || 0,
    completedRequests: requests?.filter(r => r.status === 'completed').length || 0,
    pendingRequests: requests?.filter(r => r.status === 'pending').length || 0,
    totalCredits: credits?.total_credits || 0,
    usedCredits: credits?.used_credits || 0,
    remainingCredits: (credits?.total_credits || 0) - (credits?.used_credits || 0)
  }

  return { data: stats, error: null }
} 