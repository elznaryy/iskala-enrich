import { NextRequest, NextResponse } from 'next/server';
import { pollEnrichmentResult } from '@/utils/betterContactApi';
import { createServerSupabaseClient } from '@/lib/supabase';
import { updateEnrichmentRequest, saveBulkResults, incrementUserCredits } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Polling BetterContact API for request ID:', requestId);

    // Poll BetterContact API for results
    const result = await pollEnrichmentResult(requestId, process.env.BETTERCONTACT_API_KEY);

    console.log('📊 BetterContact API response:', result);

    // If we got results, save them to database and update status
    if (result.status === 'terminated' && result.data && result.data.length > 0) {
      console.log('✅ Terminated with results, saving to database...');
      try {
        const supabase = createServerSupabaseClient();
        
        // Get the enrichment request to find user_id
        const { data: request } = await supabase
          .from('enrichment_requests')
          .select('user_id, enrichment_type')
          .eq('request_id', requestId)
          .single();

        if (request) {
          // Save results to database
          const { error: saveError } = await saveBulkResults(result.data, requestId, request.user_id);
          
          if (!saveError) {
            console.log('✅ Results saved to database successfully');
            // Update request status to completed
            await updateEnrichmentRequest(requestId, { 
              status: 'completed'
            });

            // Update user credits based on enrichment type
            const creditsUsed = request.enrichment_type === 'both' ? 11 : 
                              request.enrichment_type === 'phone' ? 10 : 1;
            
            await incrementUserCredits(request.user_id, creditsUsed);
          } else {
            console.error('❌ Error saving results to database:', saveError);
          }
        }
      } catch (dbError) {
        console.error('❌ Database update error:', dbError);
      }
    } else if (result.status === 'failed') {
      console.log('❌ Request failed, updating status...');
      // Update request status to failed
      await updateEnrichmentRequest(requestId, { 
        status: 'failed'
      });
    } else {
      console.log('⏳ Request still in progress:', result.status);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Results polling error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrichment results' },
      { status: 500 }
    );
  }
} 