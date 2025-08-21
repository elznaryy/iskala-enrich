import { supabase } from './supabase';
import { EnrichmentRequest, EnrichmentResult, UserCredits } from './supabase';

// Enrichment Requests
export async function createEnrichmentRequest(data: {
  user_id: string;
  request_id: string;
  request_type: 'individual' | 'file';
  enrichment_type: 'email' | 'phone' | 'both';
  input_data: any;
}) {
  try {
    // Check if Supabase is configured
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      throw new Error('Supabase is not configured');
    }

    const { data: request, error } = await supabase
      .from('enrichment_requests')
      .insert({
        user_id: data.user_id,
        request_id: data.request_id,
        request_type: data.request_type,
        enrichment_type: data.enrichment_type,
        input_data: data.input_data,
        status: 'pending',
      })
      .select()
      .single();

    return { data: request, error };
  } catch (error) {
    console.error('Database error in createEnrichmentRequest:', error);
    return { data: null, error };
  }
}

export async function updateEnrichmentRequest(
  requestId: string,
  updates: Partial<EnrichmentRequest>
) {
  const { data, error } = await supabase
    .from('enrichment_requests')
    .update(updates)
    .eq('request_id', requestId)
    .select()
    .single();

  return { data, error };
}

export async function getUserEnrichmentRequests(userId: string) {
  console.log('Database: getUserEnrichmentRequests called for user:', userId);

  try {
    // Add timeout to prevent hanging
    const queryPromise = supabase
      .from('enrichment_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error('Query timeout after 5 seconds')),
        5000
      );
    });

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

    if (error) {
      console.error('Database: Error in getUserEnrichmentRequests:', error);
      // Return empty array instead of error to prevent infinite retries
      return { data: [], error: null };
    } else {
      console.log(
        'Database: getUserEnrichmentRequests completed successfully:',
        data?.length || 0,
        'requests'
      );
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Database: Exception in getUserEnrichmentRequests:', error);
    // Return empty array instead of error to prevent infinite retries
    return { data: [], error: null };
  }
}

// Enrichment Results
export async function createEnrichmentResult(data: {
  request_id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  company_domain?: string;
  linkedin_url?: string;
  email_address?: string;
  phone_number?: string;
  contact_email_address?: string;
  contact_phone_number?: string;
  source?: string;
  enriched: boolean;
}) {
  const { data: result, error } = await supabase
    .from('enrichment_results')
    .insert(data)
    .select()
    .single();

  return { data: result, error };
}

export async function getEnrichmentResults(requestId: string) {
  try {
    console.log('🔍 Database: Fetching results for request ID:', requestId);

    const { data, error } = await supabase
      .from('enrichment_results')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Database error in getEnrichmentResults:', error);
    } else {
      console.log(
        '✅ Database: Found',
        data?.length || 0,
        'results for request',
        requestId
      );
      if (data && data.length > 0) {
        console.log('📊 Database result fields:', Object.keys(data[0]));
        console.log('📊 First result data:', data[0]);
      }
    }

    return { data, error };
  } catch (error) {
    console.error('❌ Exception in getEnrichmentResults:', error);
    return { data: null, error };
  }
}

export async function getUserResults(userId: string) {
  const { data, error } = await supabase
    .from('enrichment_results')
    .select(
      `
      *,
      enrichment_requests (
        request_id,
        request_type,
        enrichment_type,
        status,
        created_at
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}

// User Credits
export async function getUserCredits(userId: string) {
  const { data, error } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
}

export async function updateUserCredits(userId: string, creditsUsed: number) {
  const { data, error } = await supabase
    .from('user_credits')
    .update({ used_credits: creditsUsed })
    .eq('user_id', userId)
    .select()
    .single();

  return { data, error };
}

export async function incrementUserCredits(
  userId: string,
  creditsToAdd: number
) {
  // First get current credits
  const { data: currentCredits, error: fetchError } = await supabase
    .from('user_credits')
    .select('used_credits')
    .eq('user_id', userId)
    .single();

  if (fetchError) {
    return { data: null, error: fetchError };
  }

  // Update with new total
  const { data, error } = await supabase
    .from('user_credits')
    .update({ used_credits: (currentCredits.used_credits || 0) + creditsToAdd })
    .eq('user_id', userId)
    .select()
    .single();

  return { data, error };
}

// Credit validation function
export async function checkUserCredits(
  userId: string,
  requiredCredits: number
) {
  try {
    const { data: credits, error } = await getUserCredits(userId);

    if (error) {
      console.error('Error fetching user credits:', error);
      return { hasEnoughCredits: false, error: 'Failed to fetch user credits' };
    }

    if (!credits) {
      console.error('No credits record found for user:', userId);
      return { hasEnoughCredits: false, error: 'No credits record found' };
    }

    const totalCredits = credits.total_credits || 0;
    const usedCredits = credits.used_credits || 0;
    const remainingCredits = totalCredits - usedCredits;

    console.log(
      `Credit check for user ${userId}: ${remainingCredits} remaining, ${requiredCredits} required`
    );

    return {
      hasEnoughCredits: remainingCredits >= requiredCredits,
      remainingCredits,
      requiredCredits,
      error: null,
    };
  } catch (error) {
    console.error('Exception in checkUserCredits:', error);
    return { hasEnoughCredits: false, error: 'Credit check failed' };
  }
}

// Bulk operations
export async function saveBulkResults(
  results: any[],
  requestId: string,
  userId: string
) {
  console.log('🔍 saveBulkResults called with:', {
    requestId,
    userId,
    resultsCount: results.length,
  });

  const enrichedResults = results.map((result) => {
    const mappedResult = {
      request_id: requestId,
      user_id: userId,
      first_name: result.contact_first_name || null,
      last_name: result.contact_last_name || null,
      company: result.company_name || null,
      company_domain: result.company_domain || null,
      linkedin_url: result.contact_linkedin_profile_url || null,
      email_address: result.contact_email_address || null,
      phone_number: result.contact_phone_number || null,
      contact_email_address: result.contact_email_address || null,
      contact_phone_number: result.contact_phone_number || null,
      company_website: result.company_domain || null,
      source: result.source || null,
      enriched: result.enriched || false,
    };

    console.log('📊 Mapped result:', {
      original: {
        contact_first_name: result.contact_first_name,
        contact_last_name: result.contact_last_name,
        company_name: result.company_name,
        company_domain: result.company_domain,
        contact_email_address: result.contact_email_address,
      },
      mapped: {
        first_name: mappedResult.first_name,
        last_name: mappedResult.last_name,
        company: mappedResult.company,
        company_website: mappedResult.company_website,
        email_address: mappedResult.email_address,
      },
    });

    return mappedResult;
  });

  const { data, error } = await supabase
    .from('enrichment_results')
    .insert(enrichedResults)
    .select();

  return { data, error };
}

// Analytics
export async function getUserStats(userId: string) {
  try {
    console.log('Database: Fetching user stats for:', userId);

    // Fetch user credits
    const { data: credits, error: creditsError } = await getUserCredits(userId);
    if (creditsError) {
      console.error('Database: Error fetching credits:', creditsError);
    }

    // Fetch enrichment requests count with timeout
    const requestsPromise = supabase
      .from('enrichment_requests')
      .select('status', { count: 'exact' })
      .eq('user_id', userId);

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Stats query timeout')), 5000);
    });

    let totalRequests = 0;
    let completedRequests = 0;
    let pendingRequests = 0;

    try {
      const {
        data: requests,
        error: requestsError,
        count,
      } = await Promise.race([requestsPromise, timeoutPromise]);

      if (!requestsError && requests) {
        totalRequests = count || 0;
        completedRequests = requests.filter(
          (r) => r.status === 'completed'
        ).length;
        pendingRequests = requests.filter(
          (r) => r.status === 'pending' || r.status === 'processing'
        ).length;
      }
    } catch (error) {
      console.warn('Database: Requests stats fetch timed out, using defaults');
    }

    const stats = {
      totalRequests,
      completedRequests,
      pendingRequests,
      totalCredits: credits?.total_credits || 50,
      usedCredits: credits?.used_credits || 0,
      remainingCredits:
        (credits?.total_credits || 50) - (credits?.used_credits || 0),
    };

    console.log('Database: getUserStats completed:', stats);
    return { data: stats, error: null };
  } catch (error) {
    console.error('Database: Exception in getUserStats:', error);

    // Return default stats on error
    const defaultStats = {
      totalRequests: 0,
      completedRequests: 0,
      pendingRequests: 0,
      totalCredits: 50,
      usedCredits: 0,
      remainingCredits: 50,
    };

    return { data: defaultStats, error: null };
  }
}

/**
 * Handle subscription renewal - reset credits and update billing period
 */
export async function handleSubscriptionRenewal(
  userId: string,
  planCredits: number,
  currentPeriodEnd: number,
  stripeCustomerId: string,
  planType: string
) {
  try {
    // Update user credits - reset to plan credits and clear used credits
    const { data: creditsUpdate, error: creditsError } = await supabase
      .from('user_credits')
      .update({
        total_credits: planCredits,
        used_credits: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (creditsError) {
      console.error('Failed to update user credits:', creditsError);
      return { data: null, error: creditsError };
    }

    // Check if Stripe customer ID already exists in profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Failed to fetch existing profile:', fetchError);
      return { data: null, error: fetchError };
    }

    // Update profile with current period end and Stripe customer ID (if not already set)
    const profileUpdates: any = {
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    };

    // Only add Stripe customer ID if it doesn't already exist
    if (!existingProfile.stripe_customer_id) {
      profileUpdates.stripe_customer_id = stripeCustomerId;
      console.log(
        `🔗 Adding Stripe customer ID to profile: ${stripeCustomerId}`
      );
    } else {
      console.log(
        `ℹ️ Stripe customer ID already exists: ${existingProfile.stripe_customer_id}`
      );
    }

    const { data: profileUpdate, error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (profileError) {
      console.error('Failed to update profile:', profileError);
      return { data: null, error: profileError };
    }

    console.log(
      `🔄 Subscription renewed for user ${userId}: ${planCredits} credits allocated`
    );

    // Add metadata to auth user using service role
    try {
      // Create admin client with service role key
      const { createClient } = await import('@supabase/supabase-js');
      const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      const { error: authMetaError } =
        await adminSupabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            stripe_customer_id: stripeCustomerId,
            current_period_end: currentPeriodEnd,
            plan_type: planType,
            subscription_status: 'active',
          },
        });

      if (authMetaError) {
        console.error('Failed to update auth user metadata:', authMetaError);
      } else {
        console.log(`🔑 Updated auth metadata for user ${userId}`);
      }
    } catch (err) {
      console.error('Exception updating auth metadata:', err);
    }

    // The profile table already contains the necessary subscription data
    return {
      data: {
        credits: creditsUpdate,
        profile: profileUpdate,
      },
      error: null,
    };
  } catch (error) {
    console.error('Exception in handleSubscriptionRenewal:', error);
    return { data: null, error };
  }
}

// Trial Management Functions
export async function startUserTrial(userId: string) {
  try {
    console.log('🎯 Starting trial for user:', userId);

    // Calculate trial end date (30 days from now)
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 30);

    // Update profile with trial end date
    const { data: profileUpdate, error: profileError } = await supabase
      .from('profiles')
      .update({
        trial_ends_at: trialEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (profileError) {
      console.error('❌ Failed to update profile with trial:', profileError);
      return { data: null, error: profileError };
    }

    // Give 50 trial credits
    const { data: creditsUpdate, error: creditsError } = await supabase
      .from('user_credits')
      .update({
        total_credits: 50,
        used_credits: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (creditsError) {
      console.error('❌ Failed to update trial credits:', creditsError);
      return { data: null, error: creditsError };
    }

    console.log('✅ Trial started successfully for user:', userId);
    console.log('📅 Trial ends at:', trialEnd.toISOString());
    console.log('💰 Trial credits: 50');

    return {
      data: {
        profile: profileUpdate,
        credits: creditsUpdate,
        trialEndsAt: trialEnd,
      },
      error: null,
    };
  } catch (error) {
    console.error('❌ Exception in startUserTrial:', error);
    return { data: null, error };
  }
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}

export async function isTrialEligible(userId: string) {
  try {
    const { data: profile, error } = await getUserProfile(userId);

    if (error || !profile) {
      return { eligible: false, reason: 'Profile not found' };
    }

    // User is eligible if they haven't used trial and never subscribed
    const hasUsedTrial = !!profile.trial_ends_at;
    const hasEverSubscribed = !!profile.stripe_customer_id;

    if (hasUsedTrial) {
      return { eligible: false, reason: 'Trial already used' };
    }

    if (hasEverSubscribed) {
      return {
        eligible: false,
        reason: 'Not eligible - previous subscription',
      };
    }

    return { eligible: true, reason: 'Eligible for trial' };
  } catch (error) {
    console.error('Exception in isTrialEligible:', error);
    return { eligible: false, reason: 'Error checking eligibility' };
  }
}
